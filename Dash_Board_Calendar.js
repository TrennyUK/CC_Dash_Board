// Mảng tháng gốc
const originalMonths = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// ID Google Sheets từng tháng
const sheetLinks = {
  "January":   "1bv0_DB47DF8YBiPJnTHw434H1RBQv3q88lPXNJmbGrk",
  "February":  "1aBcD_EFgHiJkLmNoPqRsTuVwXyZ0123456789abcdE",
  "March":     "1bBcD_EFgHiJkLmNoPqRsTuWwXyZ0123456789abcdF",
  "April":     "1cBcD_EFgHiJkLmNoPqRsTuWwXyZ0123456789abcdG",
  "May":       "1dBcD_EFgHiJkLmNoPqRsTuWwXyZ0123456789abcdH",
  "June":      "1eBcD_EFgHiJkLmNoPqRsTuWwXyZ0123456789abcdI",
  "July":      "1fBcD_EFgHiJkLmNoPqRsTuWwXyZ0123456789abcdJ",
  "August":    "1gBcD_EFgHiJkLmNoPqRsTuWwXyZ0123456789abcdK",
  "September": "1hBcD_EFgHiJkLmNoPqRsTuWwXyZ0123456789abcdL",
  "October":   "1iBcD_EFgHiJkLmNoPqRsTuWwXyZ0123456789abcdM",
  "November":  "1jBcD_EFgHiJkLmNoPqRsTuWwXyZ0123456789abcdN",
  "December":  "1kBcD_EFgHiJkLmNoPqRsTuWwXyZ0123456789abcdO"
};

// Tạo URL truy cập Google Sheets theo tháng
const monthToURL = {};
for (const [month, id] of Object.entries(sheetLinks)) {
  monthToURL[month] = `https://docs.google.com/spreadsheets/d/${id}/edit#gid=761478464`;
}

// DOM elements
const selected = document.getElementById('selectedMonth');
const wrapper = document.getElementById('monthListWrapper');
const list = document.getElementById('monthList');
const picker = document.getElementById('monthPicker');

// Tạo danh sách tháng nhiều lần để scroll tuần hoàn
const months = Array(100).fill(originalMonths).flat();

let itemHeight = 0; // chiều cao 1 item tháng
let openedTabs = {}; // quản lý tab đã mở theo tháng


// ───── Hàm tự động chọn tháng hiện tại khi mở web ─────
function autoSelectCurrentMonth() {
  const now = new Date();
  const currentMonthIndex = now.getMonth(); // 0–11
  const monthList = document.querySelectorAll('#monthList li');
  const monthName = monthList[currentMonthIndex].textContent;

  // Set selected text
  document.querySelector('#selectedMonth .month-text').textContent = monthName;

  // Set ngày bắt đầu và kết thúc
  const year = now.getFullYear();
  const start = `01/${currentMonthIndex + 1}/${year}`;
  const endDate = new Date(year, currentMonthIndex + 1, 0);
  const end = `${endDate.getDate()}/${currentMonthIndex + 1}/${year}`;

  document.getElementById('start-day').textContent = start;
  document.getElementById('end-day').textContent = end;
}

// ───── Hàm xử lý click tháng trong danh sách ─────
function setupMonthClickHandler() {
  const list = document.getElementById('monthList');
  list.addEventListener('click', e => {
    if (e.target.tagName !== 'LI') return;

    const selectedText = e.target.textContent;
    document.querySelector('#selectedMonth .month-text').textContent = selectedText;

    const monthIndex = [...list.children].indexOf(e.target);
    const year = new Date().getFullYear();
    const start = `01/${monthIndex + 1}/${year}`;
    const endDate = new Date(year, monthIndex + 1, 0);
    const end = `${endDate.getDate()}/${monthIndex + 1}/${year}`;

    document.getElementById('start-day').textContent = start;
    document.getElementById('end-day').textContent = end;

    drawChart();
  });
}



// Tạo danh sách li tháng và gắn sự kiện
months.forEach(m => {
  const li = document.createElement("li");
  li.textContent = m;

  let clickTimeout;

  li.addEventListener("click", () => {
    clearTimeout(clickTimeout);
    clickTimeout = setTimeout(() => {
      const month = li.textContent;
      selected.textContent = month;
      updateCalendarDates(month);
      picker.classList.remove("show");

      drawChart();
      updateDashboard(month);
    }, 250);
  });

  // PHẦN NÀY ĐÃ ĐƯỢC KHÔI PHỤC ĐỂ ĐẠT ĐƯỢC YÊU CẦU CỦA BẠN
  li.addEventListener("dblclick", () => {
    clearTimeout(clickTimeout); // Xóa bỏ timeout của single click nếu có
    const month = li.textContent;
    const url = monthToURL[month];

    if (url) {
      // 1. Kiểm tra xem tab cho tháng này đã được mở bởi ứng dụng và chưa bị đóng chưa
      if (openedTabs[month] && !openedTabs[month].closed) {
        openedTabs[month].focus(); // Nếu có, đưa tab cũ lên tiêu điểm (focus)
      } else {
        // 2. Nếu chưa, mở một tab mới và lưu lại tham chiếu của tab đó
        const newTab = window.open(url, "_blank"); // Mở trong một tab mới
        if (newTab) {
          openedTabs[month] = newTab; // Lưu tham chiếu để sử dụng cho lần sau
        } else {
          // Nếu trình duyệt chặn pop-up
          alert("Trình duyệt đã chặn pop-up. Hãy bật cho phép.");
        }
      }
    }
  });

  list.appendChild(li);
});






// Hàm tạo ngày trong calendar
function createCalendarDays(endDay) {
  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";

  for (let day = 1; day <= 31; day++) {
    const link = document.createElement("a");

    // Link mở Google Sheet ngày (thay your_sheet_id_here bằng ID tương ứng)
    // Bạn có thể tùy chỉnh link ngày theo sheet tháng nếu muốn
    link.href = `https://docs.google.com/spreadsheets/d/your_sheet_id_here/edit#gid=0&range=A${day}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    const dayDiv = document.createElement("div");
    dayDiv.className = "calendar-day";
    dayDiv.textContent = day;

    if (day > endDay) {
      dayDiv.classList.add("hidden");
    } else if (day === endDay) {
      dayDiv.classList.add("last");
      if (day === 31) dayDiv.classList.add("last-31");
    }

    link.appendChild(dayDiv);
    grid.appendChild(link);
  }
}

// Cập nhật ngày đầu-cuối hiển thị calendar
function updateCalendarGridFromEndDay() {
  const endDayText = document.getElementById("end-day").textContent;
  const [day] = endDayText.split("/");
  const endDay = parseInt(day);
  if (!isNaN(endDay)) createCalendarDays(endDay);
}

// Cập nhật range ngày bắt đầu và kết thúc theo tháng
function setCalendarDateRange(monthIndex = 1) {
  const year = new Date().getFullYear();
  const lastDay = new Date(year, monthIndex, 0).getDate();
  const mm = `0${monthIndex}`.slice(-2);
  document.getElementById("start-day").textContent = `01/${mm}/${year}`;
  document.getElementById("end-day").textContent = `${lastDay}/${mm}/${year}`;
}

// Cập nhật calendar khi chọn tháng
function updateCalendarDates(monthName) {
  const monthIndex = originalMonths.indexOf(monthName);
  const year = new Date().getFullYear();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const mm = (monthIndex + 1).toString().padStart(2, '0');

  document.getElementById("start-day").textContent = `01/${mm}/${year}`;
  document.getElementById("end-day").textContent = `${daysInMonth}/${mm}/${year}`;

  updateCalendarGridFromEndDay();
}

// Scroll tới tháng trong danh sách tháng
function scrollToMonth(targetMonth = "January") {
  requestAnimationFrame(() => {
    if (!itemHeight) itemHeight = list.children[0].offsetHeight;

    // Lấy index tháng trong phần giữa (để scroll tuần hoàn)
    const selectedIndex = months.findIndex((m, i) =>
      m === targetMonth && i >= months.length / 2
    );
    wrapper.scrollTop = selectedIndex * itemHeight;

    wrapper.dataset.hasScrolled = "true";
    selected.textContent = targetMonth;

    updateHighlight();
    updateSelected();
  });
}

function updateHighlight() {
  const center = wrapper.scrollTop + wrapper.clientHeight / 2;
  list.querySelectorAll("li").forEach(item => {
    const dist = Math.abs((item.offsetTop + item.offsetHeight / 2) - center);
    if (dist < 5) {
      item.style.opacity = 1;
      item.style.color = '#aaa';
      item.style.textShadow = '0 0 5px rgba(0,0,0,0.3)';
    } else if (dist < 40) {
      item.style.opacity = 1;
      item.style.color = '#646464';
      item.style.textShadow = '0 5px 1px rgba(0,0,0,0.2)';
    } else {
      item.style.opacity = 0.25;
      item.style.color = '#aaa';
      item.style.textShadow = 'none';
    }
  });
}


// Cập nhật selected tháng hiện tại dựa trên scroll
function updateSelected() {
  const center = wrapper.scrollTop + wrapper.clientHeight / 2;
  let closest = null, min = Infinity;

  list.querySelectorAll("li").forEach((item, i) => {
    const dist = Math.abs((item.offsetTop + item.offsetHeight / 2) - center);
    if (dist < min) {
      min = dist;
      closest = item;
    }
  });

  if (closest) {
    const chosen = closest.textContent;
    selected.textContent = chosen;
    updateCalendarDates(chosen);
  }
}


// Scroll khi mở web:
let hasInitialScroll = false; // biến global
// Đảm bảo biến isPickerOpen được định nghĩa. Nếu chưa, thêm 'let isPickerOpen = false;' ở đâu đó gần đầu file.
let isPickerOpen = false; // Thêm dòng này nếu chưa có

selected.addEventListener("click", e => {
  e.stopPropagation();
  picker.classList.toggle("show");
  isPickerOpen = picker.classList.contains("show");


  if (isPickerOpen) {
    if (!itemHeight) itemHeight = list.children[0].offsetHeight;

    if (!hasInitialScroll) {
      const targetIndex = Math.floor(months.length * 0.1);
      wrapper.scrollTop = targetIndex * itemHeight - (wrapper.clientHeight / 2) + (itemHeight / 2);
      hasInitialScroll = true;
    }

    updateHighlight();
    updateSelected();
  }
});



document.addEventListener("click", e => {
  if (!picker.contains(e.target)) {
    picker.classList.remove("show");
    isPickerOpen = false;
  }
});

wrapper.addEventListener('scroll', () => {
  updateHighlight();

  clearTimeout(wrapper.updateTimeout);
  wrapper.updateTimeout = setTimeout(updateSelected, 300);

  // Bỏ phần tự scroll mượt khi scroll xong:
  // clearTimeout(wrapper.isScrolling);
  // wrapper.isScrolling = setTimeout(() => {
  //   const nearest = Math.round(wrapper.scrollTop / itemHeight);
  //   wrapper.scrollTo({ top: nearest * itemHeight, behavior: 'smooth' });
  // }, 50);
});


//Scroll chuột:
wrapper.addEventListener('wheel', e => {
  e.preventDefault();
  wrapper.scrollTop += e.deltaY / 2.5;

  if (isPickerOpen && !hasUserScrolled) {
    hasUserScrolled = true;
  }
}, { passive: false });

//nhấn lên xuống:
document.addEventListener("keydown", e => {
  if (!picker.classList.contains("show")) return;

  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault(); // Ngăn cuộn trang

    if (!itemHeight) itemHeight = list.children[0].offsetHeight;

    const direction = e.key === "ArrowDown" ? 1 : -1;
    wrapper.scrollTop += direction * itemHeight;

    // Cập nhật highlight + selected sau khi scroll
    clearTimeout(wrapper.updateTimeout);
    wrapper.updateTimeout = setTimeout(updateSelected, 300);
  }
});


// Nhấn Enter chỉ chọn tháng và đóng picker, không mở link
document.addEventListener("keydown", e => {
  if (e.key !== "Enter") return;

  const isOpen = picker.classList.contains("show");
  if (!isOpen) return;

  e.preventDefault();
  picker.classList.remove("show");

  const center = wrapper.scrollTop + wrapper.clientHeight / 2;
  let closest = null, min = Infinity;

  list.querySelectorAll("li").forEach(item => {
    const middle = item.offsetTop + item.offsetHeight / 2;
    const dist = Math.abs(middle - center);
    if (dist < min) {
      min = dist;
      closest = item;
    }
  });

  if (closest) {
  const month = closest.textContent;             // "February"
const sheetId = sheetLinks[month];               // ID từ sheetLinks
  selected.textContent = month;

  updateCalendarDates(month);
  drawChart();

  const monthIndex = originalMonths.indexOf(month) + 1;
  const sheetName = `Month ${monthIndex}`;       // có ra đúng "Month 2" không?
  fetchSalaryFromSheet(sheetId, sheetName);
}

});




// Hàm mẫu cập nhật dashboard bên trái
function updateDashboard(monthName) {
  // TODO: Viết code cập nhật biểu đồ, dữ liệu tổng lương hoặc phần dashboard bên trái theo tháng
  console.log("Cập nhật dashboard cho tháng:", monthName);
}

// Load animation Lottie cho icon calendar
lottie.loadAnimation({
  container: document.getElementById('calendar-icon-absolute'),
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: 'https://lottie.host/966cfb95-1d76-4669-ae41-a5e561f27e1c/ADmURlS433.lottie',
});

// Khởi tạo ban đầu
document.addEventListener("DOMContentLoaded", () => {
  const defaultMonthIndex = 1; // Tháng 1 (January)
  setCalendarDateRange(defaultMonthIndex);
  updateCalendarGridFromEndDay();

  scrollToMonth(originalMonths[defaultMonthIndex - 1]);  // Scroll khi load trang
});

