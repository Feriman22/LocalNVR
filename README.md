# 📹 LocalNVR

A modern, lightweight web-based NVR (Network Video Recorder) interface for browsing camera recordings with a timeline view. Built with Node.js and vanilla JavaScript, designed to run in Docker with minimal resource usage.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)
![Node](https://img.shields.io/badge/node-18+-green.svg)

## ✨ Features

- 🎬 **Interactive Timeline** - Browse recordings with a 24-hour timeline view
- 🔍 **Timeline Zoom** - Zoom in/out (1x-10x) for precise navigation
- 🎥 **Multi-Camera Support** - Switch between multiple cameras easily
- ⚡ **Variable Playback Speed** - From 0.25x to 64x speed
- 🎯 **Precise Time Jump** - Jump to any specific date and time
- 📥 **Video Download** - One-click download of recordings
- 🔄 **Auto-Refresh** - Automatically detects new recordings every 30 seconds
- 🚀 **Next Video Preload** - Preloads the next video for seamless playback
- ⌨️ **Keyboard Shortcuts** - Full keyboard control support
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Modern Dark UI** - Sleek interface inspired by Reolink
- 🐳 **Docker Ready** - Single-command deployment

## 🖼️ Screenshots

*(Add your screenshots here)*

## 🚀 Quick Start

### Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/Feriman22/LocalNVR.git
cd LocalNVR
```

2. Edit `docker-compose.yml` and set your recordings path:
```yaml
volumes:
  - /your/recordings/path:/videos:ro
```

3. Build and run:
```bash
docker-compose up -d
```

4. Open your browser: `http://localhost:3999`

### Using Pre-built Docker Image

```bash
docker run -d \
  --name localnvr \
  -p 3999:3000 \
  -v /your/recordings/path:/videos:ro \
  -e TZ=Europe/Budapest \
  --restart unless-stopped \
  feriman25/localnvr:latest
```

### Using Docker Build

```bash
# Build the image
docker build -t localnvr .

# Run the container
docker run -d \
  --name localnvr \
  -p 3999:3000 \
  -v /your/recordings/path:/videos:ro \
  -e TZ=Europe/Budapest \
  --restart unless-stopped \
  localnvr
```

## 📁 Directory Structure Requirements

LocalNVR expects recordings in the following structure:

```
/videos/
├── camera1/
│   └── YYYY/
│       └── MM/
│           └── DD/
│               ├── video1.mp4
│               ├── video2.mp4
│               └── ...
├── camera2/
│   └── YYYY/MM/DD/...
└── ...
```

### Supported Filename Formats

- `CameraName_XX_YYYYMMDDHHMMSS.mp4` (Reolink format)
- `YYYY-MM-DD_HH-MM-SS.mp4`
- `YYYYMMDD_HHMMSS.mp4`

### Supported Video Formats

MP4, AVI, MKV (H.264 codec recommended for best browser compatibility)

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `←` / `→` | Skip backward/forward 5 seconds |
| `↑` / `↓` | Increase/decrease playback speed |
| `D` | Download current video |

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VIDEO_DIR` | `/videos` | Path to recordings directory |
| `PORT` | `3000` | Server port |
| `TZ` | `UTC` | Timezone (e.g., `Europe/Budapest`) |

### Docker Compose Options

```yaml
services:
  localnvr:
    build: .
    ports:
      - "3999:3000"  # Change external port as needed
    volumes:
      - /your/recordings:/videos:ro  # Read-only recommended
    environment:
      - TZ=America/New_York  # Your timezone
```

## 🎯 Advanced Features

### Timeline Zoom

Use the zoom slider at the bottom to zoom in/out (1x-10x) for easier navigation in busy timelines.

### Auto-Refresh

New recordings are automatically detected and added to the timeline every 30 seconds without page reload.

### Video Preloading

The next video in the timeline is preloaded in the background for seamless playback transitions.

### Memory Optimization

Only the currently playing video is kept in memory. Previous videos are automatically cleaned up to prevent memory leaks.

## 🛠️ Development

### Prerequisites

- Node.js 18+
- Docker (optional)

### Local Development

```bash
# Clone the repository
git clone https://github.com/Feriman22/LocalNVR.git
cd LocalNVR

# Install dependencies
npm install express

# Run the server
node server.js

# Open http://localhost:3000
```

### Project Structure

```
localnvr/
├── server.js           # Backend API server
├── index.html          # Frontend application
├── Dockerfile          # Docker build instructions
├── docker-compose.yml  # Docker Compose configuration
└── README.md           # This file
```

## 📊 Performance

- **RAM Usage:** ~50-100 MB
- **CPU Usage:** Minimal (5-10% during streaming)
- **Disk Usage:** No database required - reads files directly
- **Concurrent Users:** Supports multiple simultaneous viewers

## 🔒 Security

### Recommended Setup

1. **Use Read-Only Volumes:**
   ```yaml
   volumes:
     - /recordings:/videos:ro
   ```

2. **Add Reverse Proxy with HTTPS:**
   Use Nginx Proxy Manager, Traefik, or Caddy:
   ```yaml
   environment:
     - VIRTUAL_HOST=cameras.yourdomain.com
     - LETSENCRYPT_HOST=cameras.yourdomain.com
   ```

3. **Add Authentication:**
   Configure basic auth in your reverse proxy or use an external authentication service.

4. **Network Isolation:**
   Consider using Docker networks to isolate the container.

## 🐛 Troubleshooting

### No videos showing up

1. Check directory structure:
   ```bash
   docker exec localnvr ls -la /videos
   ```

2. Verify file permissions:
   ```bash
   chmod -R 755 /your/recordings/path
   ```

3. Check logs:
   ```bash
   docker-compose logs -f
   ```

### Video won't play

- Ensure videos are in H.264 format (MP4 container)
- Convert if needed:
  ```bash
  ffmpeg -i input.avi -c:v libx264 -c:a aac output.mp4
  ```

### Camera dropdown is empty

- First-level directories in `/videos` become cameras
- Example: `/videos/camera1/` → "Camera1" in dropdown

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**Repository:** https://github.com/Feriman22/LocalNVR

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Reolink's web interface
- Built for home surveillance and security camera management
- Designed to work with any IP camera that saves recordings locally

## 📮 Support

- **Docker Hub:** [feriman25/localnvr](https://hub.docker.com/r/feriman25/localnvr)
- **GitHub:** [Feriman22/LocalNVR](https://github.com/Feriman22/LocalNVR)
- **Issues:** [GitHub Issues](https://github.com/Feriman22/LocalNVR/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Feriman22/LocalNVR/discussions)

## 🗺️ Roadmap

- [ ] Thumbnail preview on timeline hover
- [ ] Motion detection events overlay
- [ ] Multi-grid view (4/9/16 cameras)
- [ ] Export timeline segments
- [ ] Mobile app (PWA)
- [ ] Search by date/time range
- [ ] Bookmark important clips

---

**Made with ❤️ for the home surveillance community**
