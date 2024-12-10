import React, { useState, useEffect, useRef } from "react";
import { Howl } from "howler";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Maximize2 } from "lucide-react";
import { useMusicContext } from "@/utils/MusicProvider";
import axios from "axios";

const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_BASE_URL;

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

  const incrementListenTime = async (songId) => {
    console.log('Song ID:', songId);

    try {
      // First, fetch the current song data from your local database (Strapi or wherever it's stored)
      const fetchResponse = await fetch(`${STRAPI_BASE_URL}/api/songs/${songId}?populate=*`, {
        method: 'GET',
      });

      if (!fetchResponse.ok) {
        console.error('Fetch Response not OK:', fetchResponse.status, fetchResponse.statusText);
        throw new Error('Failed to fetch song data');
      }

      const songData = await fetchResponse.json();
      console.log('Song Data:', songData);

      // Get current listen time, default to 0 if not exists
      const currentListenTime = Number(songData.data.attributes.listenTime || 0);

      // Update the local database with the incremented listen time
      const updateResponse = await fetch(`${STRAPI_BASE_URL}/api/songs/${songId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            listenTime: currentListenTime + 1,
          },
        }),
      });

      if (!updateResponse.ok) {
        console.error('Update Response not OK:', updateResponse.status, updateResponse.statusText);
        throw new Error('Failed to update local song listen time');
      }

      console.log('Current Listen Time:', currentListenTime + 1);

      // Now, also update the listen time in Recombee via your API endpoint
      const response = await axios.post('/api/recombee/updateListenTime', {
        itemId: songId,  // Pass the songId as itemId for Recombee
        listenTime: currentListenTime + 1,  // Send the updated listen time
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const userId = songData.data.attributes.userId;  // Assuming song data contains userId
      const updatedListenTime = currentListenTime + 1;

      console.log(userId, updatedListenTime);


      if (response.status === 200) {
        console.log('Listen time updated successfully in Recombee');
      } else {
        console.error('Error in updating listen time in Recombee:', response.status);
      }



    } catch (error) {
      console.error('Full error in incrementListenTime:', error);
    }
  };

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
    const currentTrack = currentPlaylist[currentTrackIndex];

    // Try to extract songId from multiple possible locations
    const songId = currentTrack?.songId ||
      currentTrack?.id ||
      (currentTrack?.attributes?.id);

    if (songId) {
      incrementListenTime(songId);
    } else {
      console.error('No track ID found', currentTrack);
    }

    const isLastTrack = currentTrackIndex === currentPlaylist.length - 1;

    if (isLastTrack) {
      if (isRepeatEnabled) {
        handleTrackChange(0);
      } else {
        setIsPlaying(false);
        if (soundRef.current) {
          soundRef.current.stop();
        }
      }
    } else {
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

