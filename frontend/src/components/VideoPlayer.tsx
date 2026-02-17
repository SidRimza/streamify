'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiMaximize, FiMinimize, FiSettings, FiLoader } from 'react-icons/fi';

interface VideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
}

interface QualityLevel {
  index: number;
  height: number;
  bitrate: number;
}

export default function VideoPlayer({ src, title, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (src.includes('.m3u8') && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const levels = data.levels.map((level, index) => ({
          index,
          height: level.height,
          bitrate: level.bitrate,
        }));
        setQualityLevels(levels);
        setCurrentQuality(-1); // Auto
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        if (hlsRef.current?.currentLevel === -1) {
          setCurrentQuality(-1);
        } else {
          setCurrentQuality(data.level);
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError('Failed to load stream');
        }
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else {
      video.src = src;
    }
  }, [src]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      if (!showQualityMenu) {
        timeout = setTimeout(() => setShowControls(false), 3000);
      }
    };

    const container = containerRef.current;
    container?.addEventListener('mousemove', handleMouseMove);
    return () => {
      container?.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [showQualityMenu]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setProgress((video.currentTime / video.duration) * 100 || 0);
  };

  const handleProgress = () => {
    const video = videoRef.current;
    if (!video || !video.buffered.length) return;
    const bufferedEnd = video.buffered.end(video.buffered.length - 1);
    setBuffered((bufferedEnd / video.duration) * 100 || 0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * video.duration;
  };

  const [manualQuality, setManualQuality] = useState<number | null>(null);

  const handleQualityChange = (levelIndex: number) => {
    if (!hlsRef.current) return;
    if (levelIndex === -1) {
      hlsRef.current.currentLevel = -1;
      setManualQuality(null);
    } else {
      hlsRef.current.currentLevel = levelIndex;
      setManualQuality(levelIndex);
    }
    setCurrentQuality(levelIndex);
    setShowQualityMenu(false);
  };

  const getDisplayQuality = () => {
    if (manualQuality === null) return 'Auto';
    if (manualQuality === -1) return 'Auto';
    const level = qualityLevels.find(l => l.index === manualQuality);
    return level ? getQualityLabel(level) : 'Auto';
  };

  const getQualityLabel = (level: QualityLevel) => {
    if (level.height >= 1080) return '1080p';
    if (level.height >= 720) return '720p';
    if (level.height >= 480) return '480p';
    if (level.height >= 360) return '360p';
    return `${level.height}p`;
  };

  if (error) {
    return (
      <div className="aspect-video bg-dark-300 rounded-xl flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative aspect-video bg-black rounded-xl overflow-hidden group">
      <video
        ref={videoRef}
        className="w-full h-full"
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onProgress={handleProgress}
        onClick={togglePlay}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onCanPlay={() => setIsBuffering(false)}
        playsInline
      />

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="flex flex-col items-center">
            <FiLoader className="h-12 w-12 text-white animate-spin" />
            <span className="text-white mt-2 text-sm">Buffering...</span>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {title && (
          <div className="absolute top-4 left-4">
            <h3 className="text-white text-lg font-semibold">{title}</h3>
          </div>
        )}

        {/* Center Play Button */}
        {!isBuffering && (
          <button onClick={togglePlay} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary-500/80 hover:bg-primary-500 rounded-full p-4 transition-all" aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <FiPause className="h-8 w-8 text-white" /> : <FiPlay className="h-8 w-8 text-white ml-1" />}
          </button>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress Bar */}
          <div className="h-1 bg-gray-600 rounded-full cursor-pointer mb-3 relative" onClick={handleSeek}>
            <div className="absolute h-full bg-gray-500 rounded-full" style={{ width: `${buffered}%` }} />
            <div className="absolute h-full bg-primary-500 rounded-full" style={{ width: `${progress}%` }} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={togglePlay} className="text-white hover:text-primary-400" aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? <FiPause className="h-5 w-5" /> : <FiPlay className="h-5 w-5" />}
              </button>
              <button onClick={toggleMute} className="text-white hover:text-primary-400" aria-label={isMuted ? 'Unmute' : 'Mute'}>
                {isMuted ? <FiVolumeX className="h-5 w-5" /> : <FiVolume2 className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quality Selector */}
              {qualityLevels.length > 0 && (
                <div className="relative">
                  <button onClick={() => setShowQualityMenu(!showQualityMenu)} className="text-white hover:text-primary-400 flex items-center space-x-1" aria-label="Quality settings">
                    <FiSettings className="h-5 w-5" />
                    <span className="text-sm">{getDisplayQuality()}</span>
                  </button>
                  {showQualityMenu && (
                    <div className="absolute bottom-8 right-0 bg-dark-200 rounded-lg shadow-lg py-2 min-w-[120px]">
                      <button onClick={() => handleQualityChange(-1)} className={`w-full px-4 py-2 text-left text-sm hover:bg-dark-100 ${manualQuality === null || manualQuality === -1 ? 'text-primary-400' : 'text-white'}`}>
                        Auto
                      </button>
                      {qualityLevels.sort((a, b) => b.height - a.height).map((level) => (
                        <button key={level.index} onClick={() => handleQualityChange(level.index)} className={`w-full px-4 py-2 text-left text-sm hover:bg-dark-100 ${manualQuality === level.index ? 'text-primary-400' : 'text-white'}`}>
                          {getQualityLabel(level)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <button onClick={toggleFullscreen} className="text-white hover:text-primary-400" aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                {isFullscreen ? <FiMinimize className="h-5 w-5" /> : <FiMaximize className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
