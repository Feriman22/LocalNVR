const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const VIDEO_DIR = process.env.VIDEO_DIR || '/videos';
const PORT = process.env.PORT || 3000;

// Statikus HTML kiszolgálása
app.use(express.static('public'));

// Kamerák listázása
// Automatikusan felismeri a /videos mappában lévő kamera mappákat
app.get('/api/cameras', (req, res) => {
  try {
    if (!fs.existsSync(VIDEO_DIR)) {
      return res.json([]);
    }
    
    const items = fs.readdirSync(VIDEO_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory());
    
    // Ellenőrizzük, hogy az első mappa év-e (single camera mode)
    const firstItem = items[0];
    if (firstItem && /^\d{4}$/.test(firstItem.name)) {
      // Single camera mode - nincs kamera almappa
      return res.json([{
        id: 'default',
        name: 'Kamera'
      }]);
    }
    
    // Multi-camera mode - minden mappa egy kamera
    const cameras = items
      .filter(dirent => !dirent.name.startsWith('.')) // Rejtett mappák kihagyása
      .map(dirent => ({
        id: dirent.name,
        name: dirent.name
          .replace(/_/g, ' ')  // reolink_front -> reolink front
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))  // Nagybetűs kezdés
          .join(' ')
      }));
    
    res.json(cameras);
  } catch (error) {
    console.error('Error listing cameras:', error);
    res.status(500).json({ error: 'Failed to list cameras' });
  }
});

// Videók listázása dátum és kamera szerint
app.get('/api/videos/:camera/:date', (req, res) => {
  try {
    const { camera, date } = req.params;
    const [year, month, day] = date.split('-');
    
    // Két struktúra támogatása:
    // 1. /videos/camera1/2025/11/23/... (multi-camera)
    // 2. /videos/2025/11/23/... (single camera - camera = "default")
    let dayDir;
    if (camera === 'default') {
      dayDir = path.join(VIDEO_DIR, year, month, day);
    } else {
      dayDir = path.join(VIDEO_DIR, camera, year, month, day);
    }
    
    if (!fs.existsSync(dayDir)) {
      return res.json([]);
    }
    
    const files = fs.readdirSync(dayDir)
      .filter(f => f.match(/\.(mp4|avi|mkv)$/i))
      .map(f => {
        const filePath = path.join(dayDir, f);
        const stat = fs.statSync(filePath);
        
        // Több filename formátum támogatása
        let match;
        
        // Formátum 1: ReolinkDuo2PoE_00_20251123000002.mp4 (Reolink)
        match = f.match(/_(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\./);
        
        // Formátum 2: 2025-11-23_14-30-25.mp4
        if (!match) {
          match = f.match(/(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})/);
          if (match) match = [match[0], match[1], match[2], match[3], match[4], match[5], match[6]];
        }
        
        // Formátum 3: 20251123_143025.mp4
        if (!match) {
          match = f.match(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/);
          if (match) match = [match[0], match[1], match[2], match[3], match[4], match[5], match[6]];
        }
        
        if (!match) return null;
        
        const timestamp = new Date(
          match[1], match[2]-1, match[3],
          match[4], match[5], match[6]
        ).getTime();
        
        // Videó hossz becslése (MB-ból, ~1MB = 8 másodperc @ 1080p)
        const durationEstimate = Math.floor((stat.size / 1024 / 1024) * 8);
        
        return {
          filename: f,
          url: camera === 'default' 
            ? `/video/default/${year}/${month}/${day}/${encodeURIComponent(f)}`
            : `/video/${camera}/${year}/${month}/${day}/${encodeURIComponent(f)}`,
          timestamp: timestamp,
          time: `${match[4]}:${match[5]}:${match[6]}`,
          size: stat.size,
          duration: durationEstimate
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.timestamp - b.timestamp);
    
    res.json(files);
  } catch (error) {
    console.error('Error listing videos:', error);
    res.status(500).json({ error: 'Failed to list videos' });
  }
});

// Videó streaming (range request támogatással)
app.get('/video/:camera/:year/:month/:day/:filename', (req, res) => {
  try {
    const { camera, year, month, day, filename } = req.params;
    
    // Két struktúra támogatása
    let filePath;
    if (camera === 'default') {
      filePath = path.join(VIDEO_DIR, year, month, day, filename);
    } else {
      filePath = path.join(VIDEO_DIR, camera, year, month, day, filename);
    }
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Video not found');
    }
    
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    console.error('Error streaming video:', error);
    res.status(500).send('Error streaming video');
  }
});

// Thumbnail generálás endpoint (opcionális - FFmpeg szükséges)
app.get('/api/thumbnail/:camera/:year/:month/:day/:filename', (req, res) => {
  // TODO: FFmpeg-mel thumbnail generálás
  // Egyelőre placeholder
  res.status(501).send('Thumbnail generation not implemented');
});

app.listen(PORT, () => {
  console.log(`Camera Viewer Server running on http://localhost:${PORT}`);
  console.log(`Video directory: ${VIDEO_DIR}`);
});
