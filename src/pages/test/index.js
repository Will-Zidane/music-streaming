import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/utils/AuthContext";
import PlaylistTest from "@/components/Playlist/PlaylistTest";

export default function AccountPage({ playlist, playlistTitle, author, duration }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user) {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, authLoading, router]);

  const handleSuccess = async () => {
    router.push("/");
  };

  if (isLoading || authLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <PlaylistTest
        playlist={playlist}
        playlistTitle={playlistTitle}
        author={author}
        duration={duration}
      />
    </div>
  );
}

// Fetch data for the playlist
export async function getServerSideProps() {
  const playlist = [
    {
      title: "Linh Cảm",
      artist: "Dabee, Kriss Ngo",
      album: "Linh Cảm",
      duration: 168,
      coverArt: "/default-cover.jpg", // Replace with a real URL
    },
    {
      title: "Như Anh Đã Thấy Em",
      artist: "PhucXp, Freak D",
      album: "Như Anh Đã Thấy Em",
      duration: 302,
      coverArt: "/default-cover.jpg",
    },
  ];

  return {
    props: {
      playlist,
      playlistTitle: "My recommendation playlist",
      author: "Dan Pham",
      duration: "34 min 15 sec",
    },
  };
}
