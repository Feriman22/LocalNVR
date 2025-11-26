const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const VIDEO_DIR = process.env.VIDEO_DIR || '/videos';
const PORT = process.env.PORT || 3000;

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Static assets
app.use(express.static(__dirname));

// List cameras
app.get('/api/cameras', (req, res) => {
  try {
    if (!fs.existsSync(VIDEO_DIR)) return res.json([]);

    const cameras = fs.readdirSync(VIDEO_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory() && !d.name.startsWith('.'))
      .map(d => ({
        id: d.name,
        name: d.name.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
      }));

    res.json(cameras.length > 0 ? cameras : [{ id: 'default', name: 'Camera' }]);
  } catch (error) {
    console.error('Error listing cameras:', error);
    res.status(500).json({ error: 'Failed to list cameras' });
  }
});

// List videos for camera and date
app.get('/api/videos/:camera/:date', (req, res) => {
  try {
    const { camera, date } = req.params;
    const [year, month, day] = date.split('-');
    const dayDir = path.join(VIDEO_DIR, camera, year, month, day);

    if (!fs.existsSync(dayDir)) return res.json([]);

    const files = fs.readdirSync(dayDir)
      .filter(f => /\.(mp4|avi|mkv)$/i.test(f))
      .map(f => {
        const filePath = path.join(dayDir, f);
        const stat = fs.statSync(filePath);

        // Parse Reolink filename: ReolinkDuo2PoE_00_YYYYMMDDHHMMSS.mp4
        const match = f.match(/_(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\./);
        if (!match) return null;

        const timestamp = new Date(match[1], match[2] - 1, match[3], match[4], match[5], match[6]).getTime();

        return {
          filename: f,
          url: `/video/${camera}/${year}/${month}/${day}/${encodeURIComponent(f)}`,
          timestamp,
          time: `${match[4]}:${match[5]}:${match[6]}`,
          size: stat.size,
          duration: Math.floor((stat.size / 1024 / 1024) * 8)  // Rough estimate
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

// Stream or download video
app.get('/video/:camera/:year/:month/:day/:filename', (req, res) => {
  try {
    const { camera, year, month, day, filename } = req.params;
    const filePath = path.join(VIDEO_DIR, camera, year, month, day, filename);

    if (!fs.existsSync(filePath)) return res.status(404).send('Video not found');

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (req.query.download === 'true') {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      fs.createReadStream(filePath).pipe(res);
    } else if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4'
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4'
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    console.error('Error handling video:', error);
    res.status(500).send('Error handling video');
  }
});

app.listen(PORT, () => {
  console.log(`LocalNVR running on http://localhost:${PORT}`);
  console.log(`Video directory: ${VIDEO_DIR}`);
});
