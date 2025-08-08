import { useEffect, useRef, useState } from 'react';

interface Track {
  id: string;
  name: string;
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
}

interface PosterCanvasProps {
  album: {
    id: string;
    name: string;
    release_date: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
    external_urls: {
      spotify: string;
    };
    artists: Array<{
      name: string;
    }>;
    total_tracks: number;
    label?: string;
    tracks?: {
      items: Track[];
    };
  };
  config: {
    title: string;
    subtitle: string;
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    fontSize: number;
    layout: 'vertical' | 'horizontal';
    showQRCode: boolean;
    showAlbumInfo: boolean;
    showTracklist: boolean;
  };
}

const PosterCanvas = ({ album, config }: PosterCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dominantColors, setDominantColors] = useState<string[]>([]);

  // Extract dominant colors from album cover
  useEffect(() => {
    if (album.images[0]?.url) {
      extractDominantColors(album.images[0].url);
    }
  }, [album.images]);

  const extractDominantColors = (imageUrl: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const colors = getDominantColors(imageData.data, 5);
      setDominantColors(colors);
    };
    img.src = imageUrl;
  };

  const getDominantColors = (imageData: Uint8ClampedArray, count: number): string[] => {
    const colorMap = new Map<string, number>();
    
    for (let i = 0; i < imageData.length; i += 4) {
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      
      // Skip white/black pixels
      if ((r > 250 && g > 250 && b > 250) || (r < 5 && g < 5 && b < 5)) continue;
      
      const color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      colorMap.set(color, (colorMap.get(color) || 0) + 1);
    }

    return Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([color]) => color);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions based on layout
    const isVertical = config.layout === 'vertical';
    canvas.width = isVertical ? 800 : 1000;
    canvas.height = isVertical ? 1200 : 1000; // Made taller

    // Clear canvas and set background
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load and draw album cover
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      drawPoster(ctx, img);
    };
    img.src = album.images[0]?.url || '/placeholder-album.png';
  }, [album, config]);

  const drawPoster = (ctx: CanvasRenderingContext2D, albumImage: HTMLImageElement) => {
    const isVertical = config.layout === 'vertical';
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;

    // Calculate dimensions
    const margin = 40;
    const albumSize = Math.min(width - 2 * margin, 600);
    const albumX = (width - albumSize) / 2;
    const albumY = margin;

    // Draw album cover at the top
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Create rounded rectangle for album cover
    const coverRadius = 20;
    ctx.beginPath();
    ctx.moveTo(albumX + coverRadius, albumY);
    ctx.lineTo(albumX + albumSize - coverRadius, albumY);
    ctx.quadraticCurveTo(albumX + albumSize, albumY, albumX + albumSize, albumY + coverRadius);
    ctx.lineTo(albumX + albumSize, albumY + albumSize - coverRadius);
    ctx.quadraticCurveTo(albumX + albumSize, albumY + albumSize, albumX + albumSize - coverRadius, albumY + albumSize);
    ctx.lineTo(albumX + coverRadius, albumY + albumSize);
    ctx.quadraticCurveTo(albumX, albumY + albumSize, albumX, albumY + albumSize - coverRadius);
    ctx.lineTo(albumX, albumY + coverRadius);
    ctx.quadraticCurveTo(albumX, albumY, albumX + coverRadius, albumY);
    ctx.closePath();
    ctx.clip();
    
    ctx.drawImage(albumImage, albumX, albumY, albumSize, albumSize);
    ctx.restore();

    // Calculate the content area below the album cover
    const contentStartY = albumY + albumSize + margin;
    const contentHeight = height - contentStartY - margin;
    const leftColumnX = margin;
    const rightColumnX = width / 2 + margin / 2;
    const columnWidth = (width - 3 * margin) / 2;

    // LEFT COLUMN - Track list and album info
    if (config.showTracklist && album.tracks?.items) {
      const formatDuration = (ms: number): string => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      };

      // Calculate total album duration
      const totalDuration = album.tracks.items.reduce((total, track) => total + track.duration_ms, 0);
      const totalDurationFormatted = formatDuration(totalDuration);

      // Auto-adjust track height based on number of tracks
      const maxTracks = Math.floor(contentHeight / 25); // Approximate space per track
      const trackHeight = Math.min(25, contentHeight / album.tracks.items.length);
      const tracksToShow = album.tracks.items.slice(0, maxTracks);

      // Draw tracks
      ctx.fillStyle = config.textColor;
      ctx.font = `${config.fontSize * 0.7}px Arial, sans-serif`;
      ctx.textAlign = 'left';
      
      tracksToShow.forEach((track, index) => {
        const trackY = contentStartY + (index * trackHeight);
        const trackName = track.name.length > 25 ? track.name.substring(0, 22) + '...' : track.name;
        const duration = formatDuration(track.duration_ms);
        
        // Track name
        ctx.fillText(trackName, leftColumnX, trackY);
        
        // Duration (right-aligned in left column)
        const durationX = leftColumnX + columnWidth - 50;
        ctx.fillText(duration, durationX, trackY);
      });

      // Show "and X more" if there are additional tracks
      if (album.tracks.items.length > maxTracks) {
        const remainingTracks = album.tracks.items.length - maxTracks;
        const moreTracksY = contentStartY + (maxTracks * trackHeight) + 10;
        ctx.fillStyle = config.accentColor;
        ctx.font = `italic ${config.fontSize * 0.6}px Arial, sans-serif`;
        ctx.fillText(`... and ${remainingTracks} more`, leftColumnX, moreTracksY);
      }

      // Album info at bottom of left column
      const albumInfoY = height - margin - 60;
      ctx.font = `${config.fontSize * 0.8}px Arial, sans-serif`;
      ctx.fillStyle = config.textColor;
      ctx.fillText(`Total Length: ${totalDurationFormatted}`, leftColumnX, albumInfoY);
      
      if (album.label) {
        ctx.fillText(`Label: ${album.label}`, leftColumnX, albumInfoY + 20);
      }
    }

    // RIGHT COLUMN - Colors, Spotify code, title, artist, release date
    const rightColumnStartY = contentStartY + 20;

    // Draw dominant colors (5 colors)
    const colorSize = 40;
    const colorSpacing = 10;
    const colorsStartX = rightColumnX;
    const colorsStartY = rightColumnStartY;
    
    // Use extracted dominant colors or fallback colors
    const colorsToShow = dominantColors.length > 0 ? dominantColors.slice(0, 5) : ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    
    colorsToShow.forEach((color, index) => {
      const colorX = colorsStartX + (index * (colorSize + colorSpacing));
      ctx.fillStyle = color;
      ctx.fillRect(colorX, colorsStartY, colorSize, colorSize);
    });

    // Spotify scannable code
    if (config.showQRCode) {
      // Desired base width of the Spotify code on the canvas
      const qrBaseWidth = 240; // You can increase this even more if needed
      const qrAspectRatio = 640 / 168;
      const qrHeight = qrBaseWidth / qrAspectRatio;
      const qrWidth = qrBaseWidth;
    
      // Position in bottom-right corner with margin
      const qrX = rightColumnX;
      const qrY = colorsStartY + colorSize + 30;
    
      // Spotify URI and scannable code image
      const spotifyUri = `spotify:album:${album.id}`;
      const scannableCodeUrl = `https://scannables.scdn.co/uri/plain/svg/F0E6E6/black/640/${encodeURIComponent(spotifyUri)}?t=${Date.now()}`;
    
      const qrImage = new Image();
      qrImage.crossOrigin = 'anonymous';
    
      qrImage.onload = () => {
        // Draw the image at the desired size and position
        ctx.drawImage(qrImage, qrX, qrY, qrWidth, qrHeight);
      };
    
      qrImage.onerror = () => {
        // Fallback if image fails to load
        ctx.fillStyle = config.textColor;
        ctx.font = 'bold 14px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SPOTIFY', qrX + qrWidth / 2, qrY + qrHeight / 2);
      };
    
      qrImage.src = scannableCodeUrl;
    }

    // Album title
    const titleY = rightColumnStartY + 200;
    ctx.fillStyle = config.textColor;
    ctx.font = `bold ${config.fontSize * 1.2}px Arial, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(config.title, rightColumnX, titleY);

    // Artist name
    const artistY = titleY + 30;
    ctx.font = `${config.fontSize}px Arial, sans-serif`;
    ctx.fillText(config.subtitle, rightColumnX, artistY);

    // Release date at bottom
    const releaseDate = new Date(album.release_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    const releaseDateY = height - margin - 20;
    ctx.font = `${config.fontSize * 0.8}px Arial, sans-serif`;
    ctx.fillText(`Released: ${releaseDate}`, rightColumnX, releaseDateY);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="border border-gray-300 rounded-lg shadow-lg"
        style={{ backgroundColor: config.backgroundColor }}
      />
    </div>
  );
};

export default PosterCanvas; 