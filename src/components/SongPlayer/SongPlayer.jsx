import React, { useState, useEffect,useRef } from 'react';
import { Howl } from 'howler';
import { playlistData as Playlist } from '../Playlist/Playlist';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Mic2, List, Maximize2, Volume2 } from 'lucide-react';


const SongPlayer = ({ currentTrackIndex, setCurrentTrackIndex, isPlaying, setIsPlaying }) => {
  const [sound, setSound] = useState(null);
  const [volume, setVolume] = useState(100);
  const [duration, setDuration] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const intervalRef = useRef(null);


  useEffect(() => {
    const newSound = new Howl({
      src: [Playlist[currentTrackIndex].url],
      html5: true,
      onload: () => {
        setDuration(newSound.duration());
        if (isPlaying) {
          newSound.play();
        }
      },
      onend: handleNext,
    });

    if (sound) {
      sound.stop();
      sound.unload();
    }

    setSound(newSound);
    setElapsedTime(0); // Reset elapsedTime to 0 on track change

    return () => {
      clearInterval(intervalRef.current);
      newSound.unload();
    };
  }, [currentTrackIndex]);

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (sound && !isSeeking) {
        const currentSeek = sound.seek();
        setElapsedTime(currentSeek);
      }
    }, 1000);
  };


  useEffect(() => {
    if (sound) {
      if (isPlaying) {
        sound.play();
        startTimer();
      } else {
        sound.pause();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    }
  }, [isPlaying]);


  useEffect(() => {
    if (isPlaying && sound) {
      const id = setInterval(() => {
        if (!isSeeking) {
          setElapsedTime(Math.floor(sound.seek() || 0));
        }
      }, 1000);
      setIntervalId(id);
      return () => clearInterval(id);
    } else {
      clearInterval(intervalId);
    }
  }, [isPlaying, sound, isSeeking]);

  const handleNext = () => {
    setCurrentTrackIndex((prevIndex) =>
      prevIndex === Playlist.length - 1 ? 0 : prevIndex + 1
    );
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    setCurrentTrackIndex((prevIndex) =>
      prevIndex === 0 ? Playlist.length - 1 : prevIndex - 1
    );
  };

  const togglePlayPause = () => {
    if (sound) {
      if (isPlaying) {
        sound.pause();
      } else {
        sound.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (sound) {
      sound.volume(newVolume / 100); // Convert volume to 0-1 scale
    }
  };

  const handleSeekChange = (e) => {
    const seekTime = parseFloat(e.target.value);
    setElapsedTime(seekTime);
    if (sound) {
      sound.seek(seekTime);
    }
  };

  const handleSeekMouseDown = () => {
    setIsSeeking(true);
  };

  const handleSeekMouseUp = () => {
    setIsSeeking(false);
    if (sound) {
      sound.seek(elapsedTime); // Set the sound position to the last selected elapsed time
    }
  };


  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-between w-full px-4 py-2 bg-gray-900 text-white">
      {/* Left section: Song info */}
      <div className="flex items-center space-x-4">
        <img src={Playlist[currentTrackIndex].coverArt} alt="Album cover" className="w-14 h-14 rounded" />
        <div>
          <h2 className="text-sm font-semibold">{Playlist[currentTrackIndex].title}</h2>
          <p className="text-xs text-gray-400">{Playlist[currentTrackIndex].artist}</p>
        </div>
        <button className="text-gray-400 hover:text-white">
          <Mic2 size={16} />
        </button>
      </div>

      {/* Center section: Playback controls and seek bar */}
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

      {/* Right section: Additional controls */}
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