import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Ellipsis, PlayCircle, PauseCircle } from 'lucide-react';

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const SongPage = ({
                    songData,
                    strapiBaseUrl,
                    onPlayTrack,
                    isCurrentlyPlaying = false
                  }) => {
  const [audioDuration, setAudioDuration] = useState(null);

  useEffect(() => {
    const fetchAudioDuration = () => {
      const audioSrc = `${strapiBaseUrl}${songData.attributes.src.data.attributes.url}`;
      const audio = new Audio(audioSrc);
      audio.addEventListener('loadedmetadata', () => {
        setAudioDuration(audio.duration);
      });
    };

    fetchAudioDuration();
  }, [strapiBaseUrl, songData]);

  const handleTrackPlay = () => {
    onPlayTrack(songData);
  };

  const {
    name,
    album,
    authors,
    coverArt,
    listenTime,
    lyrics
  } = songData.attributes;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white">
      <div className="p-6 flex items-center bg-gray-300">
        <div className="relative w-32 h-32 rounded-full overflow-hidden">
          {coverArt?.data ? (
            <Image
              src={`${strapiBaseUrl}${coverArt.data.attributes.url}`}
              alt={name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              No Cover Art
            </div>
          )}
        </div>
        <div className="ml-6">
          <h1 className="text-4xl font-bold">{name}</h1>
          <p className="text-white mt-2">
            <Link href={`/artists/${authors.data[0].id}`} className="hover:text-gray-200 mr-2">
              {authors.data[0].attributes.name}
            </Link>

            <Link href={`/albums/${album.data.id}`} className="hover:text-gray-200 mr-2">
              {album.data.attributes.name}
            </Link>
            {audioDuration ? formatDuration(audioDuration) : "Loading..."} {listenTime}
          </p>
        </div>
      </div>

      <div className="bg-gray-900 h-10 my-4 ml-6 flex items-center">
        <button
          className="text-green-300 inline-block p-2 rounded-full"
          onClick={handleTrackPlay}
        >
          {isCurrentlyPlaying ? <PauseCircle /> : <PlayCircle />}
        </button>
        <div className="relative ml-2">
          <button className="inline-block p-2 rounded-full">
            <Ellipsis />
          </button>
        </div>
      </div>

      {/* Lyrics Section */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Lyrics</h2>
        <div className="bg-gray-800 rounded-lg p-4 max-h-80 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-gray-200">{lyrics || "No lyrics available."}</pre>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-gray-900 p-4">
        <div className="flex items-center justify-between">
          <button className="text-white" onClick={handleTrackPlay}>
            Next Track
          </button>
        </div>
      </div>
    </div>
  );
};

export default SongPage;