// components/SongPlayer/SongPlayer.js
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Mic2, List, Maximize2, Volume2 } from 'lucide-react';
import { playlistData } from '../Playlist/Playlist';
import AudioManager from '../../utils/AudioManager';

const SongPlayer = ({ currentTrackIndex, setCurrentTrackIndex, isPlaying, setIsPlaying }) => {
  const [volume, setVolume] = useState(100);
  const [duration, setDuration] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const sound = AudioManager.init(playlistData[currentTrackIndex], handleNext);

    sound.on('load', () => {
      setDuration(sound.duration());
      if (isPlaying) {
        sound.play();
      }
    });

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [currentTrackIndex]);

  useEffect(() => {
    if (isPlaying) {
      AudioManager.play();
      startTimer();
    } else {
      AudioManager.pause();
      clearInterval(intervalRef.current);
    }
  }, [isPlaying]);

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (AudioManager.currentSound && !isSeeking) {
        const currentSeek = AudioManager.currentSound.seek();
        setElapsedTime(currentSeek);
      }
    }, 1000);
  };

  const handleNext = () => {
    setCurrentTrackIndex((prevIndex) =>
      prevIndex === playlistData.length - 1 ? 0 : prevIndex + 1
    );
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    setCurrentTrackIndex((prevIndex) =>
      prevIndex === 0 ? playlistData.length - 1 : prevIndex - 1
    );
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (AudioManager.currentSound) {
      AudioManager.currentSound.volume(newVolume / 100);
    }
  };

  const handleSeekChange = (e) => {
    const seekTime = parseFloat(e.target.value);
    setElapsedTime(seekTime);
    if (AudioManager.currentSound) {
      AudioManager.currentSound.seek(seekTime);
    }
  };

  const handleSeekMouseDown = () => {
    setIsSeeking(true);
  };

  const handleSeekMouseUp = () => {
    setIsSeeking(false);
    if (AudioManager.currentSound) {
      AudioManager.currentSound.seek(elapsedTime);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-between w-full px-4 py-2 bg-gray-900 text-white">
      <div className="flex items-center space-x-4">
        <img src={playlistData[currentTrackIndex].coverArt} alt="Album cover" className="w-14 h-14 rounded" />
        <div>
          <h2 className="text-sm font-semibold">{playlistData[currentTrackIndex].title}</h2>
          <p className="text-xs text-gray-400">{playlistData[currentTrackIndex].artist}</p>
        </div>
        <button className="text-gray-400 hover:text-white">
          <Mic2 size={16} />
        </button>
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
            onMouseDown={handleSeekMouseDown}
            onMouseUp={handleSeekMouseUp}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="text-gray-400 hover:text-white">
          <List size={20} />
        </button>
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