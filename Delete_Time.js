
async function deleteTimeFromSheets() {
  const endpoint = 'https://script.google.com/macros/s/AKfycbx3JpF-VFpyULanr0FHQhIE5nhpu-PMjl7f8sEX8rBalP2oLe_oA__K7OcC89PK7w2_AQ/exec';

  try {
    console.log('📡 Đang gửi yêu cầu xoá...');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month: 6 }) // dùng nếu cần
    });

    console.log('📨 HTTP status:', response.status);

    const text = await response.text();
    console.log('📃 Phản hồi dạng text:\n', text);

    try {
      const result = JSON.parse(text);
      console.log('✅ Đã parse JSON:', result);

      if (result.status === 'success') {
        alert('🧹 Đã xoá thành công vùng E5:M34 trên các sheet Day 1 → Day 31!');
      } else {
        alert('❌ Lỗi từ server: ' + (result.message || 'Không rõ lỗi'));
      }
    } catch (parseError) {
      console.error('❌ Không thể parse JSON:', parseError);
      alert('⚠️ Phản hồi không hợp lệ:\n' + text);
    }

  } catch (fetchError) {
    console.error('❌ Lỗi fetch:', fetchError);
    alert('⚠️ Không thể gửi yêu cầu! Kiểm tra kết nối hoặc Console.');
  }
}

// Gắn sự kiện khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  const deleteButton = document.getElementById('deleteButton');
  if (deleteButton) {
    deleteButton.addEventListener('click', () => {
      if (confirm("⚠️ Bạn có chắc chắn muốn xoá toàn bộ thời gian E5:M34 của Day 1 → Day 31 không?")) {
        deleteTimeFromSheets();
      }
    });
  } else {
    console.warn('⚠️ Không tìm thấy nút có ID #deleteButton!');
  }
});
