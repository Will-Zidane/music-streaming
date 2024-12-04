import { useEffect, useState } from "react";

const Albums = () => {
  const [albums, setAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await fetch("http://localhost:1337/api/albums?populate=coverArt");
        const result = await response.json();

        // Format lại dữ liệu album
        const formattedAlbums = result.data.map((album) => ({
          id: album.id,
          name: album.attributes.name,
          year: new Date(album.attributes.createdAt).getFullYear(),
          coverArt: album.attributes.coverArt?.data?.attributes?.url || "/default-album-cover.jpg",
        }));

        setAlbums(formattedAlbums);
      } catch (error) {
        console.error("Error fetching albums:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-6">
        <p>Loading albums...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ml-4">
        {albums.map((album) => (
          <div key={album.id} className="bg-gray-500 rounded-lg overflow-hidden shadow-md">
            <img
              src={`http://localhost:1337${album.coverArt}`}
              alt={album.name}
              className="w-full h-40 object-cover"
            />
            <div className="p-4 text-center">
              <h3 className="text-lg font-semibold">{album.name}</h3>
              <p className="text-sm text-gray-400">{album.year}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Albums;
