export default async function handler(req, res) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

  try {
    const response = await fetch(`${API_URL}/api/songs?populate=*`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Thêm headers cần thiết cho authentication nếu có
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Transform data từ Strapi format
    const transformedData = data.data.map(song => ({
      id: song.id,
      attributes: {
        ...song.attributes,
        audio_url: song.attributes.audio_file?.data?.attributes?.url
          ? `${API_URL}${song.attributes.audio_file.data.attributes.url}`
          : null,
        cover_url: song.attributes.cover?.data?.attributes?.url
          ? `${API_URL}${song.attributes.cover.data.attributes.url}`
          : null,
        createdAt: song.attributes.createdAt,
        updatedAt: song.attributes.updatedAt,
        publishedAt: song.attributes.publishedAt,
      }
    }));

    res.status(200).json(transformedData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch playlist' });
  }
}