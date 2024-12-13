import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link"; // Import Link component

const ArtistPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_BASE_URL;

  useEffect(() => {
    if (artist) {
      document.title = `${artist.name}`; // Set the tab title to artist's name
    } else {
      document.title = "Artist - Music Page"; // Fallback title while loading
    }
  }, [artist]); // This effect runs every time `artist` changes

  useEffect(() => {
    if (!id) return;

    const fetchArtistAndAlbums = async () => {
      try {
        // Fetch artist info with populated albums
        const artistResponse = await fetch(
          `${STRAPI_BASE_URL}/api/authors/${id}?populate=avatar,albums.coverArt`
        );
        const artistData = await artistResponse.json();

        if (artistData?.data) {
          setArtist(artistData.data.attributes);

          // Extract albums and handle missing coverArt gracefully
          const albumsData =
            artistData.data.attributes.albums?.data || [];
          const formattedAlbums = albumsData.map((album) => ({
            id: album.id,
            name: album.attributes.name,
            coverArtUrl: album.attributes.coverArt?.data?.attributes?.url, // Safely access coverArt
            releaseDate: album.attributes.releaseDate, // Add release date to album data
          }));
          setAlbums(formattedAlbums);
        }
      } catch (error) {
        console.error("Error fetching artist and albums:", error);
      }
    };

    fetchArtistAndAlbums();
  }, [id]);



  if (!artist) return <div>Loading...</div>;

  return (
    <div className="h-full bg-gradient-to-b from-blue-800 to-blue-900 text-white">
      {/* Artist Header */}
      <div className="flex items-center bg-gray-300 p-6">
        <div className="relative w-32 h-32 rounded-full overflow-hidden">
          <Image
            src={
              artist.avatar?.data?.attributes?.url
                ? `${STRAPI_BASE_URL}${artist.avatar.data.attributes.url}`
                : "/default-avatar.jpg"
            }
            alt={artist.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="ml-6">
          <h1 className="text-4xl font-bold">{artist.name}</h1>
          <p className="text-gray-200">
            {artist.country} • Born: {new Date(artist.dateOfBirth).toDateString()}
          </p>
        </div>
      </div>

      {/* Albums Section */}
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Albums</h2>
        {albums.length === 0 ? (
          <p className="text-gray-400">No albums available for this artist.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2  lg:grid-cols-3 gap-6">
            {albums.map((album) => (
              <Link key={album.id} href={`/albums/${album.id}`}>
                <div className="bg-gray-300 p-4 rounded-lg shadow hover:shadow-lg transition">
                  <div className="relative w-full h-40">
                    <Image
                      src={
                        album.coverArtUrl
                          ? `${STRAPI_BASE_URL}${album.coverArtUrl}`
                          : "/default-cover.jpg"
                      }
                      alt={album.name}
                      fill
                      className="rounded object-cover"
                    />
                  </div>
                  <div className="mt-2">
                    <h3 className="text-lg font-bold truncate">{album.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistPage;
