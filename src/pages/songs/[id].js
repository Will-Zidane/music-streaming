import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { Ellipsis, PlayCircle, PauseCircle } from 'lucide-react';
import { useMusicContext } from '@/utils/MusicProvider';
import { getFullUrl } from '@/components/Playlist/Playlist';
import DropdownAddToPlaylist from "@/components/DropdownAddToPlaylist/DropdownAddToPlaylist";
const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_BASE_URL;

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const SongPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { handleTrackChange, isPlaying, currentPlayingTrack, loadPlaylist } = useMusicContext();

  const [songData, setSongData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [audioDuration, setAudioDuration] = useState(null);

  useEffect(() => {
    if (!router.isReady || !id) return;

    const fetchSongData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${STRAPI_BASE_URL}/api/songs/${id}?populate=authors,album,coverArt,src`);
        const data = await response.json();

        if (data?.data) {
          setSongData(data.data);
          setIsLoading(false);

          // Fetch audio duration
          const audioSrc = `${STRAPI_BASE_URL}${data.data.attributes.src.data.attributes.url}`;
          fetchAudioDuration(audioSrc);
        } else {
          throw new Error('No song data found');
        }
      } catch (err) {
        console.error('Error fetching song data:', err);
        setError('Failed to fetch song data.');
        setIsLoading(false);
      }
    };

    fetchSongData();
  }, [router.isReady, id]);

  const fetchAudioDuration = (audioSrc) => {
    const audio = new Audio(audioSrc);
    audio.addEventListener('loadedmetadata', () => {
      setAudioDuration(audio.duration);
    });
  };

  const handleTrackChangeFromPage = () => {
    if (!songData) return;

    const newPlaylist = [
      {
        songId: songData.id,
        title: songData.attributes.name,
        artist: songData.attributes.authors.data[0].attributes.name,
        album: songData.attributes.album.data.attributes.name,
        url: songData.attributes.src.data.attributes.url,
        coverArt: songData.attributes.coverArt?.data?.attributes?.url || '/default-cover.jpg'
      }
    ];

    loadPlaylist(newPlaylist);
    handleTrackChange(0, newPlaylist);
  };

  const isCurrentTrack = currentPlayingTrack?.songId === id;

  if (isLoading) return <div>Loading song details...</div>;
  if (error) return <div>{error}</div>;
  if (!songData || !songData.attributes) return <div>No song data available.</div>;

  const { name, album, authors, coverArt, src, listenTime, lyrics } = songData.attributes;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white">
      <div className="p-6 flex items-center bg-gray-300">
        <div className="relative w-32 h-32 rounded-full overflow-hidden">
          {coverArt?.data ? (
            <Image
              src={`${STRAPI_BASE_URL}${coverArt.data.attributes.url}`}
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
            <Link
              href={`/artists/${authors.data[0].id}`}
              className="hover:text-gray-200 mr-2"
            >
              {authors.data[0].attributes.name}
            </Link>
            <Link
              href={`/albums/${album.data.id}`}
              className="hover:text-gray-200 mr-2"
            >
              {album.data.attributes.name}
            </Link>
            {audioDuration ? formatDuration(audioDuration) : "Loading..."}{" "}
            {listenTime}
          </p>
        </div>
      </div>

      <div className="bg-gray-900 h-10 my-4 ml-6 flex items-center">
        <button
          className="text-green-300 inline-block p-2 rounded-full"
          onClick={handleTrackChangeFromPage}
        >
          {isCurrentTrack && isPlaying ? <PauseCircle /> : <PlayCircle />}
        </button>
        <div className="relative ml-2">
          <DropdownAddToPlaylist songId={songData.id} />
        </div>
      </div>

      {/* Lyrics Section */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Lyrics</h2>
        <div className="bg-gray-800 rounded-lg p-4 max-h-80 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-gray-200">
            {lyrics || "No lyrics available."}
          </pre>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-gray-900 p-4">
        <div className="flex items-center justify-between">
          <button className="text-white" onClick={handleTrackChangeFromPage}>
            Next Track
          </button>
        </div>
      </div>
    </div>
  );
};

export default SongPage;