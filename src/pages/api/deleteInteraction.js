const recombee = require('recombee-api-client');
const rqs = recombee.requests;

const client = new recombee.ApiClient('thewz-thewiz', 'ahi3VNWptGKy1nCAqhFyARS7fWS7WqhKUCWrXrzSu8A413LTETD9aiBLLCur8mfA', {
  region: 'us-west',
});

async function deleteDetailViewInteraction(userId, itemId) {
  try {
    // Chuyển timestamp từ milliseconds sang giây
    const timestampInMilliseconds = 1733886910.873;

    // Tạo yêu cầu xóa interaction với timestamp hợp lệ
    const deleteDetailViewRequest = new rqs.DeleteDetailView(userId, itemId, {
      timestamp: timestampInMilliseconds,
    });

    deleteDetailViewRequest.timeout = 5000;  // Áp dụng timeout cho yêu cầu

    // Gửi yêu cầu xóa interaction
    const response = await client.send(deleteDetailViewRequest);
    console.log(`Successfully deleted detail view interaction for user ${userId} with item ${itemId}:`, response);
    return response;
  } catch (error) {
    console.error(`Error deleting detail view interaction for user ${userId} with item ${itemId}:`, error);
    throw error;  // Ném lỗi nếu có
  }
}

// Gọi hàm để thử xóa interaction
deleteDetailViewInteraction('26', '1')
  .then((response) => {
    console.log('Interaction deleted successfully:', response);
  })
  .catch((error) => {
    console.error('Failed to delete interaction:', error);
  });
