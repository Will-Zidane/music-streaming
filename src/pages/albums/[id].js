import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Album from "@/components/Albums/Albums"; // Import the new Album component
import { useMusicContext } from "@/utils/MusicProvider";

const AlbumPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [album, setAlbum] = useState(null);
  const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_BASE_URL;

  const { currentTrackIndex, handleTrackChange } = useMusicContext();

  useEffect(() => {
    if (!id) return;

    const fetchAlbum = async () => {
      try {
        const albumResponse = await fetch(
          `${STRAPI_BASE_URL}/api/albums/${id}?populate=authors,coverArt,songs.coverArt,songs.url,songs.album,songs.src,songs.authors`,
        );
        const albumData = await albumResponse.json();
        if (albumData?.data) {
          setAlbum(albumData.data.attributes);
        }
      } catch (error) {
        console.error("Error fetching album:", error);
      }
    };

    fetchAlbum();
  }, [id]);

  if (!album) return <div>Loading...</div>;

  return (
    <Album
      album={album}
      currentTrackIndex={currentTrackIndex}
      handleTrackChange={handleTrackChange}
      STRAPI_BASE_URL={STRAPI_BASE_URL}
    />
  );
};

export default AlbumPage;
