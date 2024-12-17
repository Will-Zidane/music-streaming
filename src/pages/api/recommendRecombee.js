var recombee = require('recombee-api-client');
var rqs = recombee.requests;

// Khởi tạo client Recombee với databaseId và apiToken của bạn
const client = new recombee.ApiClient('thewz-thewiz', 'ahi3VNWptGKy1nCAqhFyARS7fWS7WqhKUCWrXrzSu8A413LTETD9aiBLLCur8mfA', {
  region: 'us-west',
});

// Timeout value to be used for the requests
const TIMEOUT = 10000;  // Timeout in milliseconds

var userId = '27'; // ID người dùng cần đề xuất
var count = 5;     // Số lượng mục đề xuất

// Tạo yêu cầu RecommendItemsToUser
var recommendRequest = new rqs.RecommendItemsToUser(userId, count, {
  scenario: 'top_listened_songs',  // Cảnh tình huống (tuỳ chọn)
  returnProperties: true,            // Trả về các thuộc tính
  includedProperties: ['name', 'album', 'authors', 'coverArt','listenTime'], // Các thuộc tính cần trả về
  filter: "'listenTime' >= 16",               // Bộ lọc (ví dụ: loại trừ item có id = 16)
  booster: undefined,               // Tăng cường đề xuất (tuỳ chọn)
  logic: undefined,                 // Logic đề xuất (tuỳ chọn)
  minRelevance: undefined,          // Độ liên quan tối thiểu (tuỳ chọn)
  rotationRate: undefined,          // Tốc độ quay (tuỳ chọn)
  rotationTime: undefined           // Thời gian quay (tuỳ chọn)
});

// Áp dụng timeout cho yêu cầu này
recommendRequest.timeout = TIMEOUT;

// Gửi yêu cầu với timeout đã được thiết lập cho từng yêu cầu riêng biệt
client.send(recommendRequest)
  .then((response) => {
    // Kiểm tra nếu có các mục đề xuất
    if (response.recomms && response.recomms.length > 0) {
      console.log('Recommended items:');

      // Duyệt qua mảng recomms để lấy thông tin chi tiết
      response.recomms.forEach(item => {
        console.log(`Item ID: ${item.id}`);

        // Lấy chi tiết các thuộc tính trong values (ví dụ: name, album, authors, coverArt)
        const itemDetails = item.values;

        // Nếu bạn đã yêu cầu những thuộc tính này, hãy in chúng ra
        if (itemDetails) {
          console.log(`  Name: ${itemDetails.name}`);
          console.log(`  Album: ${itemDetails.album}`);
          console.log(`  Authors: ${itemDetails.authors}`);
          console.log(`  Cover Art: ${itemDetails.coverArt}`);
          console.log(`  Listen Time: ${itemDetails.listenTime}`);

        } else {
          console.log('  No detailed values available.');
        }
      });
    } else {
      console.log('No recommendations available.');
    }
  })
  .catch((error) => {
    console.error('Error getting recommendations:', error);
  });
