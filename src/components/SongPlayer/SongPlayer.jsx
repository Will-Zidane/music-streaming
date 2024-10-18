import React, { useState, useEffect, useRef } from "react";
import { Howl } from "howler";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Maximize2 } from "lucide-react";

const SongPlayer = ({ playlist, currentTrackIndex, onTrackChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const soundRef = useRef(null);

  useEffect(() => {
    loadTrack(currentTrackIndex);
  }, [currentTrackIndex]);

  const loadTrack = (index) => {
    if (soundRef.current) {
      soundRef.current.unload();
    }

    const sound = new Howl({
      src: [playlist[index].url],
      volume: volume / 100,
      onload: () => {
        setDuration(sound.duration());
        sound.play();
        setIsPlaying(true);
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
    });

    soundRef.current = sound;
  };

  const togglePlayPause = () => {
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

  return (
    <div className="flex items-center justify-between w-full px-4 py-2 bg-gray-900 text-white">
      <div className="flex items-center space-x-4">
        <img
          src={playlist[currentTrackIndex].coverArt}
          alt="Album cover"
          className="w-14 h-14 rounded"
        />
        <div>
          <h2 className="text-sm font-semibold">
            {playlist[currentTrackIndex].title}
          </h2>
          <p className="text-xs text-gray-400">
            {playlist[currentTrackIndex].artist}
          </p>
        </div>

      </div>

      <div className="flex flex-col items-center flex-grow mx-4">
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
          <span className="text-xs">{formatTime(elapsedTime)}</span>
          <input
            type="range"
            min="0"
            max={duration}
            value={elapsedTime}
            onChange={handleSeekChange}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="text-gray-400 hover:text-white">
          <Volume2 size={20} />
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
        />
        <button className="text-gray-400 hover:text-white">
          <Maximize2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default SongPlayer;