import React, { useState, useEffect, useRef } from "react";
import { Howl } from "howler";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Maximize2 } from "lucide-react";

const SongPlayer = ({ playlist, currentTrackIndex, onTrackChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [audioContextStarted, setAudioContextStarted] = useState(false);
  const soundRef = useRef(null);

  useEffect(() => {
    // Only load track if audio context is started and playlist is available
    if (audioContextStarted && playlist && playlist.length > 0) {
      loadTrack(currentTrackIndex);
    }
  }, [currentTrackIndex, audioContextStarted, playlist]);

  // Initialize audio context if suspended
  const initializeAudioContext = () => {
    if (Howler.ctx && Howler.ctx.state === "suspended") {
      Howler.ctx.resume().then(() => {
        setAudioContextStarted(true);
        loadTrack(currentTrackIndex);
      });
    } else {
      setAudioContextStarted(true);
      loadTrack(currentTrackIndex);
    }
  };

  const loadTrack = (index) => {
    if (!playlist || playlist.length === 0 || !playlist[index]) {
      return; // Prevent loading if the playlist is empty or the track is invalid
    }

    if (soundRef.current) {
      soundRef.current.unload();
    }

    const sound = new Howl({
      src: [playlist[index].url],
      volume: volume / 100,
      html5: true, // This can help with some browser autoplay policies
      onload: () => {
        setDuration(sound.duration());
        if (audioContextStarted) {
          sound.play();
          setIsPlaying(true);
        }
      },
      onplay: () => {
        setIsPlaying(true);
      },
      onpause: () => {
        setIsPlaying(false);
      },
      onend: () => {
        handleNext();
      },
      onseek: () => {
        setElapsedTime(sound.seek());
      },
      onloaderror: (id, error) => {
        console.error("Error loading audio:", error);
      },
    });

    soundRef.current = sound;
  };

  const togglePlayPause = () => {
    if (!audioContextStarted) {
      initializeAudioContext();
      return;
    }

    if (soundRef.current) {
      if (isPlaying) {
        soundRef.current.pause(); // Pause if it's playing
      } else {
        soundRef.current.play(); // Play if it's paused
      }
      setIsPlaying(!isPlaying); // Toggle playing state
    }
  };

  const handlePrevious = () => {
    onTrackChange(currentTrackIndex > 0 ? currentTrackIndex - 1 : playlist.length - 1);
  };

  const handleNext = () => {
    onTrackChange(currentTrackIndex < playlist.length - 1 ? currentTrackIndex + 1 : 0);
  };

  const handleSeekChange = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (soundRef.current) {
      soundRef.current.seek(seekTime);
      setElapsedTime(seekTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (soundRef.current) {
      soundRef.current.volume(newVolume / 100);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60) || 0;
    const seconds = Math.floor(time % 60) || 0;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    const updateElapsedTime = () => {
      if (soundRef.current && isPlaying) {
        setElapsedTime(soundRef.current.seek());
      }
    };

    const timer = setInterval(updateElapsedTime, 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Handle edge cases if playlist or currentTrackIndex is undefined
  const currentTrack = playlist && playlist[currentTrackIndex];

  // Handle spacebar press to toggle play/pause
  const handleKeyPress = (event) => {
    if (event.key === " " || event.keyCode === 32) { // Spacebar key
      event.preventDefault(); // Prevent default action (scrolling)
      togglePlayPause(); // Toggle play/pause on spacebar press
    }
  };

  useEffect(() => {
    // Listen for the spacebar key press
    window.addEventListener("keydown", handleKeyPress);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isPlaying]); // Add dependency on `isPlaying` to ensure the key event is always registered properly

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between w-full px-4 py-2 bg-gray-900 text-white">
        {/* Left section - Album info */}
        <div className="flex items-center space-x-4 w-[240px]">
          {currentTrack && currentTrack.coverArt ? (
            <img
              src={currentTrack.coverArt}
              alt="Album cover"
              className="w-14 h-14 rounded"
            />
          ) : (
            <div className="w-14 h-14 bg-gray-500 rounded"></div> // Fallback if no cover art
          )}
          <div>
            <h2 className="text-sm font-sans">
              {currentTrack ? currentTrack.title : "Loading..."}
            </h2>
            <p className="text-xs text-gray-200">
              {currentTrack ? currentTrack.artist : "Unknown Artist"}
            </p>
          </div>
        </div>

        {/* Center section - Controls and seekbar */}
        <div className="flex-1 flex flex-col items-center max-w-[600px]">
          <div className="flex items-center space-x-4 mb-1">
            <button className="text-gray-400 hover:text-white">
              <Shuffle size={20} />
            </button>
            <button onClick={handlePrevious} className="text-gray-400 hover:text-white">
              <SkipBack size={24} />
            </button>
            <button
              onClick={togglePlayPause}
              className="p-2 bg-white text-black rounded-full hover:scale-105 transition"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button onClick={handleNext} className="text-gray-400 hover:text-white">
              <SkipForward size={24} />
            </button>
            <button className="text-gray-400 hover:text-white">
              <Repeat size={20} />
            </button>
          </div>
          <div className="flex items-center w-full space-x-2">
            <span className="text-xs w-12 text-right">{formatTime(elapsedTime)}</span>
            <input
              type="range"
              min="0"
              max={duration}
              value={elapsedTime}
              onChange={handleSeekChange}
              className="flex-1 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer range-progress:bg-white"
            />
            <span className="text-xs w-12">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right section - Volume controls */}
        <div className="flex items-center space-x-4 w-[240px] justify-end">
          <button className="text-gray-400 hover:text-white">
            <Volume2 size={20} />
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
          />
          <button className="text-gray-400 hover:text-white">
            <Maximize2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SongPlayer;
