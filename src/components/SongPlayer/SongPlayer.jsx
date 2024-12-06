import React, { useState, useEffect, useRef } from "react";
import { Howl } from "howler";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Maximize2 } from "lucide-react";
import { useMusicContext } from "@/utils/MusicProvider";

const SongPlayer = () => {
  const {
    playlistData,
    currentTrackIndex,
    handleTrackChange,
    activePlaylist
  } = useMusicContext();

  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [audioContextStarted, setAudioContextStarted] = useState(false);
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(false);
  const soundRef = useRef(null);

  const currentPlaylist = activePlaylist || playlistData;

  useEffect(() => {
    if (audioContextStarted && currentPlaylist && currentPlaylist.length > 0) {
      loadTrack(currentTrackIndex);
    }
  }, [currentTrackIndex, audioContextStarted, currentPlaylist]);

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
    if (!currentPlaylist || currentPlaylist.length === 0 || !currentPlaylist[index]) {
      return;
    }

    if (soundRef.current) {
      soundRef.current.unload();
    }

    const sound = new Howl({
      src: [currentPlaylist[index].url],
      volume: volume / 100,
      html5: true,
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
        handleTrackEnd();
      },
    });

    soundRef.current = sound;
  };

  const handleTrackEnd = () => {
    const isLastTrack = currentTrackIndex === currentPlaylist.length - 1;

    if (isLastTrack) {
      if (isRepeatEnabled) {
        // If repeat is enabled, go back to the first track
        handleTrackChange(0);
      } else {
        // If repeat is disabled, stop playback
        setIsPlaying(false);
        if (soundRef.current) {
          soundRef.current.stop();
        }
      }
    } else {
      // If it's not the last track, play the next track
      handleNext();
    }
  };

  const togglePlayPause = () => {
    if (!audioContextStarted) {
      initializeAudioContext();
      return;
    }

    if (soundRef.current) {
      if (isPlaying) {
        soundRef.current.pause();
      } else {
        soundRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handlePrevious = () => {
    handleTrackChange(
      currentTrackIndex > 0 ? currentTrackIndex - 1 : currentPlaylist.length - 1
    );
  };

  const handleNext = () => {
    handleTrackChange(
      currentTrackIndex < currentPlaylist.length - 1 ? currentTrackIndex + 1 : 0
    );
  };

  const toggleRepeat = () => {
    setIsRepeatEnabled(!isRepeatEnabled);
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

  // Get current track from the active playlist
  const currentTrack = currentPlaylist && currentPlaylist[currentTrackIndex];

  useEffect(() => {
    const handleKeyPress = (event) => {
      const activeElement = document.activeElement;
      const isSearchBarFocused = (
        activeElement.tagName === 'INPUT' &&
        (activeElement.type === 'text' || activeElement.type === 'search')
      );

      if ((event.key === " " || event.keyCode === 32) && !isSearchBarFocused) {
        event.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isPlaying]);

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between w-full px-4 py-2 bg-gray-900 text-white">
        {/* Left section remains the same */}
        <div className="flex items-center space-x-4 w-[240px]">
          {currentTrack && currentTrack.coverArt ? (
            <img
              src={currentTrack.coverArt}
              alt="Album cover"
              className="w-14 h-14 rounded"
            />
          ) : (
            <div className="w-14 h-14 bg-gray-500 rounded"></div>
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

        {/* Center section - Updated with repeat button styling */}
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
            <button
              onClick={toggleRepeat}
              className={`${isRepeatEnabled ? 'text-white' : 'text-gray-400'} hover:text-white`}
            >
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
              className="flex-1 h-1 bg-gray-500 rounded-lg appearance-none cursor-pointer range-progress:bg-white"
            />
            <span className="text-xs w-12">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right section remains the same */}
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
            className="w-24 h-1 bg-gray-500 rounded-lg appearance-none cursor-pointer"
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

