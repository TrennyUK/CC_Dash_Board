async function deleteTimeFromSheets() {
  const endpoint = 'https://script.google.com/macros/s/AKfycbx3JpF-VFpyULanr0FHQhIE5nhpu-PMjl7f8sEX8rBalP2oLe_oA__K7OcC89PK7w2_AQ/exec';

  try {
    // Tuỳ chỉnh tháng nếu bạn dùng – hiện tại gửi tháng 6
    const payload = { month: 1 };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`HTTP status ${response.status}`);

    const result = await response.json();

    if (result.status === 'success') {
      alert('🧹 Đã xóa toàn bộ thời gian E5:M34 của các sheet Day 1 → Day 31!');
    } else {
      alert('❌ Lỗi từ server: ' + result.message);
    }

  } catch (error) {
    console.error('Fetch error:', error);
    alert('⚠️ Không thể gửi yêu cầu xoá! Kiểm tra kết nối hoặc URL.');
  }
}

// Gắn vào nút xoá khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('deleteButton');
  if (btn) {
    btn.addEventListener('click', deleteTimeFromSheets);
  } else {
    console.warn('⚠️ Không tìm thấy nút #deleteButton để gắn sự kiện!');
  }
});
