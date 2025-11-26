# LocalNVR

A lightweight, web-based NVR (Network Video Recorder) interface for browsing and playing back camera recordings. Built with Node.js and vanilla JavaScript, designed to run in Docker with minimal resource usage.

## Features

- Timeline-based video playback with 24-hour view
- Multi-camera support with easy switching
- Variable playback speeds (0.25x to 16x)
- Timeline zoom with mouse wheel
- Drag to scroll timeline
- Jump to specific time
- Video download
- Keyboard shortcuts
- Auto-refresh (detects new recordings every 30 seconds)
- Preloading for seamless playback
- Dark, modern UI

## Requirements

- Docker and Docker Compose
- Camera recordings organized in date-based folder structure

## Folder Structure

LocalNVR expects your recordings to be organized like this:

```
/videos/
├── camera_name/
│   └── YYYY/
│       └── MM/
│           └── DD/
│               ├── video1.mp4
│               ├── video2.mp4
│               └── ...
```

## Filename Format

Currently tested and working with **Reolink cameras**. The expected filename format is:

```
CameraName_XX_YYYYMMDDHHMMSS.mp4
```

Example: `ReolinkDuo2PoE_00_20251126143025.mp4`

If you're using a different camera brand and the filenames don't match this format, please open an issue on GitHub. We can add support for additional formats.

## Installation

### Using Docker Hub (recommended)

```bash
docker run -d \
  --name localnvr \
  -p 3999:3000 \
  -v /path/to/your/recordings:/videos:ro \
  -e TZ=Europe/Budapest \
  --restart unless-stopped \
  feriman25/localnvr:latest
```

### Using Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  localnvr:
    image: feriman25/localnvr:latest
    container_name: localnvr
    restart: unless-stopped
    ports:
      - "3999:3000"
    volumes:
      - /path/to/your/recordings:/videos:ro
    environment:
      - TZ=Europe/Budapest
```

Then run:

```bash
docker-compose up -d
```

### Building from Source

```bash
git clone https://github.com/Feriman22/LocalNVR.git
cd LocalNVR
docker-compose up -d --build
```

## Usage

After starting the container, open your browser and navigate to:

```
http://localhost:3999
```

Or if running on a different machine:

```
http://your-server-ip:3999
```

### Keyboard Shortcuts

- `Space` - Play/Pause
- `←` / `→` - Skip backward/forward 5 seconds
- `↑` / `↓` - Increase/decrease playback speed
- `D` - Download current video

### Timeline Controls

- **Mouse wheel** - Zoom in/out on timeline
- **Click and drag** - Scroll timeline
- **Click on segment** - Jump to that video
- **Click on timeline** - Seek to closest video at that time

## Configuration

### Environment Variables

- `VIDEO_DIR` - Path to recordings directory (default: `/videos`)
- `PORT` - Server port (default: `3000`)
- `TZ` - Timezone for correct timestamps (default: `UTC`)

### Changing the Port

Edit the port mapping in your docker run command or docker-compose.yml:

```yaml
ports:
  - "8080:3000"  # Access on port 8080 instead
```

## Performance

- RAM usage: ~200-300 MB
- CPU usage: Minimal (streaming only)
- No database required
- Supports multiple concurrent users

## Troubleshooting

### No videos showing up

Check if your folder structure matches the expected format:

```bash
docker exec localnvr ls /videos
```

You should see camera folders. Then check inside:

```bash
docker exec localnvr ls /videos/camera_name/2025/11/26
```

### Videos won't play

Make sure your videos are in a browser-compatible format. H.264 (MP4 container) works best. You can convert videos using FFmpeg:

```bash
ffmpeg -i input.avi -c:v libx264 -c:a aac output.mp4
```

### Wrong timestamps

Set your timezone correctly using the `TZ` environment variable:

```yaml
environment:
  - TZ=America/New_York
```

## Links

- GitHub: https://github.com/Feriman22/LocalNVR
- Docker Hub: https://hub.docker.com/r/feriman25/localnvr

## Contributing

Contributions are welcome! If you encounter issues or have suggestions:

1. Check existing issues on GitHub
2. Open a new issue with details about your setup
3. Submit pull requests for bug fixes or new features

## License

MIT License - feel free to use and modify as needed.

## Support

If you find this project useful and want to support its development, you can buy me a coffee:
https://paypal.me/BajzaFerenc
