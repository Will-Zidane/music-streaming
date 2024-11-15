import { useEffect } from 'react';
import PlaylistDetails from "@/components/PlaylistDetails/PlaylistDetails";
import Layout from "@/layout/Layout";
const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_BASE_URL;

export async function getServerSideProps() {
  try {
    const response = await fetch(
      `${STRAPI_BASE_URL}/api/playlists?populate=*`
    );
    const data = await response.json();

    return {
      props: {
        initialPlaylist: data.data[0] || null,
      },
    };
  } catch (error) {
    return {
      props: {
        initialPlaylist: null,
        error: 'Failed to load playlist',
      },
    };
  }
}

const PlaylistPage = ({ initialPlaylist, error: initialError }) => {
  return (
    <Layout>
      <main className="flex-1 overflow-y-auto">
        {initialError ? (
          <div className="flex-1 bg-gradient-to-b from-gray-900 to-black p-8">
            <p className="text-red-500">{initialError}</p>
          </div>
        ) : (
          <PlaylistDetails playlist={initialPlaylist} />
        )}
      </main>
    </Layout>
  );
};

export default PlaylistPage;