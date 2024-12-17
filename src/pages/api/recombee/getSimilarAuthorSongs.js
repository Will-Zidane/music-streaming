import { getSimilarAuthorSongs } from '@/utils/recombee'; // Hàm lấy các bài hát tương tự từ Recombee

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { userId, count } = req.body;  // authorId và count là dữ liệu bạn nhận từ body của yêu cầu

      if (!userId) {
        return res.status(400).json({ error: 'authorId is required' });
      }

      // Lấy các bài hát tương tự từ tác giả
      const similarSongs = await getSimilarAuthorSongs(userId, count);

      // Kiểm tra kết quả và trả về
      if (!similarSongs || similarSongs.length === 0) {
        return res.status(404).json({ error: 'No similar songs found for this author' });
      }

      return res.status(200).json({
        message: 'Successfully fetched similar songs',
        similarSongs
      });
    } catch (error) {
      console.error('Error fetching similar songs:', error);
      return res.status(500).json({ error: 'Failed to fetch similar songs from Recombee' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
