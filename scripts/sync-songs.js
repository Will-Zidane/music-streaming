const { RecombeeClient, AddItem, SetItemValues } = require('recombee-api-client');

const client = new RecombeeClient(
  process.env.RECOMBEE_DATABASE_ID,
  process.env.RECOMBEE_PRIVATE_TOKEN
);

// Hàm gọi API Strapi và thêm dữ liệu vào Recombee
async function syncSongsFromStrapi() {
  try {
    // Gọi API Strapi
    const response = await fetch('http://localhost:1337/api/songs?populate=*');
    const jsonData = await response.json();
    const songs = jsonData.data;

    for (const song of songs) {
      const songId = song.id.toString(); // ID của bài hát
      const attributes = song.attributes;

      // Tạo item trong Recombee
      await client.send(new AddItem(songId));

      // Đặt giá trị cho các thuộc tính của bài hát
      await client.send(
        new SetItemValues(
          songId,
          {
            name: attributes.name,
            listenTime: attributes.listenTime || 0,
            src: attributes.src?.data?.attributes?.url || '',
            album: attributes.album?.data?.attributes?.name || 'Unknown',
            createdAt: attributes.createdAt,
            updatedAt: attributes.updatedAt,
          },
          { cascadeCreate: true }
        )
      );

      console.log(`Đã thêm bài hát: ${attributes.name}`);
    }
  } catch (error) {
    console.error('Lỗi đồng bộ dữ liệu:', error);
  }
}

syncSongsFromStrapi();
