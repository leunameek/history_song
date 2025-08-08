import { useState, useEffect, useRef } from 'react';
import PosterCanvas from './PosterCanvas';

interface Track {
  id: string;
  name: string;
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
}

interface PosterEditorProps {
  album: {
    id: string;
    name: string;
    album_type: string;
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
  onClose: () => void;
}

interface PosterConfig {
  title: string;
  subtitle: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  backgroundImage: string | null;
  fontSize: number;
  layout: 'vertical' | 'horizontal';
  showQRCode: boolean;
  showAlbumInfo: boolean;
  showTracklist: boolean;
}

const PosterEditor = ({ album, onClose }: PosterEditorProps) => {
  const [config, setConfig] = useState<PosterConfig>({
    title: album.name,
    subtitle: album.artists.map(artist => artist.name).join(', '),
    backgroundColor: '#F0E6E6',
    textColor: '#34302D',
    accentColor: '#1db954',
    backgroundImage: null,
    fontSize: 24,
    layout: 'vertical',
    showQRCode: true,
    showAlbumInfo: true,
    showTracklist: true,
  });

  const [isColorPickerActive, setIsColorPickerActive] = useState(false);
  const [selectedColorType, setSelectedColorType] = useState<'text' | 'accent' | 'background'>('text');
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Extract colors from album cover
  useEffect(() => {
    if (album.images[0]?.url) {
      extractColorsFromImage(album.images[0].url);
    }
  }, [album.images]);

  const extractColorsFromImage = (imageUrl: string) => {
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
      setExtractedColors(colors);
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

  const handleColorPick = (color: string) => {
    setConfig(prev => ({
      ...prev,
      [selectedColorType === 'text' ? 'textColor' : 
       selectedColorType === 'accent' ? 'accentColor' : 'backgroundColor']: color
    }));
    setIsColorPickerActive(false);
  };

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!isColorPickerActive) return;
    
    const img = event.currentTarget;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = img.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(x, y, 1, 1);
    const r = imageData.data[0];
    const g = imageData.data[1];
    const b = imageData.data[2];
    
    const color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    handleColorPick(color);
  };

  const formatReleaseDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getAlbumTypeDisplay = (albumType: string): string => {
    switch (albumType.toLowerCase()) {
      case 'album':
        return 'Album';
      case 'single':
        return 'Single';
      case 'compilation':
        return 'Compilation';
      default:
        return albumType.charAt(0).toUpperCase() + albumType.slice(1);
    }
  };

  const downloadPoster = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${album.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_poster.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const printPoster = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${album.name} - Poster</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            img { max-width: 100%; max-height: 100vh; }
          </style>
        </head>
        <body>
          <img src="${canvas.toDataURL()}" alt="${album.name} Poster" />
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Create Album Poster</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Controls */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Poster Settings</h3>
                
                {/* Text Settings */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={config.title}
                      onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                    <input
                      type="text"
                      value={config.subtitle}
                      onChange={(e) => setConfig(prev => ({ ...prev, subtitle: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Color Settings */}
                <div className="space-y-4 mt-6">
                  <h4 className="font-medium text-gray-900">Colors</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={config.textColor}
                          onChange={(e) => setConfig(prev => ({ ...prev, textColor: e.target.value }))}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <button
                          onClick={() => {
                            setSelectedColorType('text');
                            setIsColorPickerActive(true);
                          }}
                          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                        >
                          Pick
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={config.accentColor}
                          onChange={(e) => setConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <button
                          onClick={() => {
                            setSelectedColorType('accent');
                            setIsColorPickerActive(true);
                          }}
                          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                        >
                          Pick
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                    <div className="flex space-x-2">
                      <input
                        type="color"
                        value={config.backgroundColor}
                        onChange={(e) => setConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <button
                        onClick={() => {
                          setSelectedColorType('background');
                          setIsColorPickerActive(true);
                        }}
                        className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                      >
                        Pick
                      </button>
                    </div>
                  </div>
                </div>

                {/* Layout Settings */}
                <div className="space-y-4 mt-6">
                  <h4 className="font-medium text-gray-900">Layout</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Orientation</label>
                    <select
                      value={config.layout}
                      onChange={(e) => setConfig(prev => ({ ...prev, layout: e.target.value as 'vertical' | 'horizontal' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="vertical">Vertical</option>
                      <option value="horizontal">Horizontal</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                    <input
                      type="range"
                      min="12"
                      max="48"
                      value={config.fontSize}
                      onChange={(e) => setConfig(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-500">{config.fontSize}px</span>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-4 mt-6">
                  <h4 className="font-medium text-gray-900">Options</h4>
                  
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.showQRCode}
                        onChange={(e) => setConfig(prev => ({ ...prev, showQRCode: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm">Show Spotify QR Code</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.showAlbumInfo}
                        onChange={(e) => setConfig(prev => ({ ...prev, showAlbumInfo: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm">Show Album Info</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.showTracklist}
                        onChange={(e) => setConfig(prev => ({ ...prev, showTracklist: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm">Show Tracklist</span>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 mt-6">
                  <button
                    onClick={downloadPoster}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                  >
                    Download Poster
                  </button>
                  <button
                    onClick={printPoster}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                  >
                    Print Poster
                  </button>
                </div>
              </div>

              {/* Color Palette from Album */}
              {extractedColors.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Colors from Album Cover</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {extractedColors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => handleColorPick(color)}
                        className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Center Column - Album Cover for Color Picking */}
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-lg font-semibold">Album Cover (Click to Pick Colors)</h3>
              <div className="relative">
                <img
                  ref={imageRef}
                  src={album.images[0]?.url || '/placeholder-album.png'}
                  alt={album.name}
                  className={`w-64 h-64 object-cover rounded-lg shadow-lg ${
                    isColorPickerActive ? 'cursor-crosshair' : 'cursor-pointer'
                  }`}
                  onClick={handleImageClick}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-album.png';
                  }}
                />
                {isColorPickerActive && (
                  <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
                    <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
                      <p className="text-sm font-medium">Click to pick color for {selectedColorType}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {isColorPickerActive && (
                <button
                  onClick={() => setIsColorPickerActive(false)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
                >
                  Cancel Color Picker
                </button>
              )}
            </div>

            {/* Right Column - Poster Preview */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-4">Poster Preview</h3>
              <div className="bg-white border-2 border-gray-300 shadow-lg rounded-lg overflow-hidden">
                <PosterCanvas album={album} config={config} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosterEditor; 