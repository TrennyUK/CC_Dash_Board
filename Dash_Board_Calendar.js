// Mảng tháng gốc
const originalMonths = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// ID Google Sheets từng tháng
const sheetLinks = {
  "January": "11QGch7ghMfThmF9cz8zgnQweHsWu9wrPPQloXz1kz5M",
  "February": "1bYnGQGSxrtLahIEOz__5wpoJvIu6cPVEC4Uwk8e64_A",
  "March": "1opI9ukGyiWnBA8YP_ThTpHVRJOJyyPXCJwD-906PxPE",
  "April": "1lexg9UYQcMpoiGEQWZYELA-m8WsoBE5jEDVLaIIwfv4",
  "May": "1wit9AYdjAjhBXVZThY1w9nbCbMvmLwrKFMrOaQrTvhI",
  "June": "1IbRKYDyfJx-B1Dbhcmng3XZh7I0bIOyAIn2VJhtmeKQ",
  "July": "11HYloas-5QEbB4WqNXPn-ELjgg3Uhmg6a2EV8qedDOk",
  "August": "10UhbaK-1ptUz_CJ-2vu1vl743aNjg3m_j05oUFuU5UU",
  "September": "1WxGztiQVBVqRkMSkD2WgOppez23hnUpo_ooBtCAQ7VY",
  "October": "1A6ZaiLv-pU30H4ScBcGkmlDWIsNwKeXqKJb3WWGjBZo",
  "November": "1F58FctxQfosDrqtPWhCLu9QAAd0ZQ0Njo-Ibe6PmUmM",
  "December": "1IWtDwx3wHIEdvHsapdkeUxW4Utosxg_8syMP3QWHfW4"
};

// GID các sheet Day 1–31 (áp dụng cho tất cả các tháng vì cấu trúc giống nhau)
const dayGids = {
  "Day 1": 1696580395,
  "Day 2": 201064887,
  "Day 3": 286864136,
  "Day 4": 218429180,
  "Day 5": 742841642,
  "Day 6": 440262578,
  "Day 7": 43929196,
  "Day 8": 222621834,
  "Day 9": 167718641,
  "Day 10": 141515333,
  "Day 11": 2073914402,
  "Day 12": 1529654429,
  "Day 13": 1550155115,
  "Day 14": 140392305,
  "Day 15": 1438023904,
  "Day 16": 1277796223,
  "Day 17": 1800037689,
  "Day 18": 307057788,
  "Day 19": 167410143,
  "Day 20": 925445073,
  "Day 21": 1438824442,
  "Day 22": 1292122983,
  "Day 23": 130552864,
  "Day 24": 775009446,
  "Day 25": 663127843,
  "Day 26": 961099219,
  "Day 27": 379767090,
  "Day 28": 390016684,
  "Day 29": 1640626655,
  "Day 30": 1164772843,
  "Day 31": 33977388
};

let currentMonthName = "January"; // Biến global để theo dõi tháng hiện tại

// Tạo URL truy cập Google Sheets theo tháng
const monthToURL = {};
for (const [month, id] of Object.entries(sheetLinks)) {
    // Đảm bảo GID mặc định cho link tháng là đúng theo ý bạn
    monthToURL[month] = `https://docs.google.com/spreadsheets/d/${id}/edit#gid=761478464`;
}

// DOM elements
const selected = document.getElementById('selectedMonth');
const wrapper = document.getElementById('monthListWrapper');
const list = document.getElementById('monthList');
const picker = document.getElementById('monthPicker');

// Tạo danh sách tháng nhiều lần để scroll tuần hoàn
const numCopiesOfMonths = 100; // Số lượng bản sao của 12 tháng
const months = Array(numCopiesOfMonths).fill(originalMonths).flat();

let itemHeight = 0; // Chiều cao 1 item tháng (sẽ được tính toán động)
let openedTabs = {}; // Quản lý tab đã mở theo tháng
// --- HÀM TẠO VÀ GÁN SỰ KIỆN CHO CÁC PHẦN TỬ THÁNG TRONG DANH SÁCH ---
months.forEach(m => {
    const li = document.createElement("li");
    li.textContent = m;
    let clickTimeout; // Để phân biệt single/double click
    let isDblClick = false; // Biến cờ để theo dõi double click

    li.addEventListener("click", (e) => {
    clearTimeout(clickTimeout);
    isDblClick = false; 

    const clickedLi = e.currentTarget;
    const monthText = clickedLi.textContent;
    
    // Chỉ cập nhật các thành phần giao diện
    selected.textContent = monthText;
    updateCalendarDates(monthText); 
    
    // Sau đó gọi bộ não xử lý dữ liệu
    drawChart();

    if (itemHeight === 0) itemHeight = clickedLi.offsetHeight;
    if (itemHeight > 0) {
        const targetScrollTop = clickedLi.offsetTop - (wrapper.clientHeight / 2) + (itemHeight / 2);
        wrapper.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    }
    
    clickTimeout = setTimeout(() => {
        if (!isDblClick) {
            picker.classList.remove("show");
            isPickerOpen = false;
        }
    }, 250);
});

    li.addEventListener("dblclick", () => {
        clearTimeout(clickTimeout); // Hủy bỏ timeout của single click để không bị gọi cùng lúc
        isDblClick = true; // Đặt cờ double click thành true

        const month = li.textContent;
        const url = monthToURL[month];

        if (url) {
            if (openedTabs[month] && !openedTabs[month].closed) {
                openedTabs[month].focus();
            } else {
                const newTab = window.open(url, "_blank");
                if (newTab) {
                    openedTabs[month] = newTab;
                } else {
                    alert("Trình duyệt đã chặn pop-up. Vui lòng cho phép để mở link.");
                }
            }
        }
    });

    list.appendChild(li);
});

// --- HÀM QUẢN LÝ LỊCH VÀ NGÀY ---

function createCalendarDays(endDay) {
    const grid = document.getElementById("calendar-grid");
    grid.innerHTML = ""; // Xóa các ngày cũ

    // Lấy Sheet ID dựa trên tháng hiện tại (được cập nhật trong biến global currentMonthName)
    const sheetId = sheetLinks[currentMonthName];
    if (!sheetId) {
        console.error("Không tìm thấy Sheet ID cho tháng:", currentMonthName);
        return;
    }

    for (let day = 1; day <= 31; day++) {
        const dayDiv = document.createElement("div");
        dayDiv.className = "calendar-day";
        dayDiv.textContent = day;

        const link = document.createElement("a");
        const gid = dayGids[`Day ${day}`];

        // Ẩn các ngày vượt quá số ngày của tháng hoặc thêm class đặc biệt
        if (day > endDay) {
            dayDiv.classList.add("hidden");
        } else if (day === endDay) {
            dayDiv.classList.add("last");
            if (day === 31) {
                dayDiv.classList.add("last-31");
                link.classList.add("grid-span-full");
            }
        }

        if (gid !== undefined) {
            const fullUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=${gid}`;
            link.href = fullUrl; // Vẫn set href để người dùng có thể chuột phải -> open in new tab nếu muốn

            // *** PHẦN CHỈNH SỬA QUAN TRỌNG BẮT ĐẦU TỪ ĐÂY ***
            link.addEventListener('click', (e) => {
                e.preventDefault(); // Ngăn hành vi mặc định của thẻ <a> (không mở link ngay lập tức)

                // Kiểm tra xem tab cho tháng hiện tại đã tồn tại và còn mở không
                const monthTab = openedTabs[currentMonthName];
                if (monthTab && !monthTab.closed) {
                    // Nếu tab đã mở -> chỉ cập nhật URL của tab đó và đưa nó lên phía trước
                    monthTab.location.href = fullUrl;
                    monthTab.focus();
                } else {
                    // Nếu chưa có tab hoặc tab đã bị đóng -> mở tab mới
                    const newTab = window.open(fullUrl, "_blank");
                    if (newTab) {
                        // Lưu lại tham chiếu đến tab vừa mở để quản lý cho các lần click sau
                        openedTabs[currentMonthName] = newTab;
                    } else {
                        // Thông báo cho người dùng nếu trình duyệt chặn pop-up
                        alert("Trình duyệt đã chặn pop-up. Vui lòng cho phép để mở link.");
                    }
                }
            });
            // *** KẾT THÚC PHẦN CHỈNH SỬA ***

        } else {
            link.href = "#";
            link.onclick = (e) => e.preventDefault();
        }

        link.appendChild(dayDiv);
        grid.appendChild(link);
    }
}

// Cập nhật lưới lịch dựa trên ngày cuối tháng đang hiển thị
function updateCalendarGridFromEndDay() {
    const endDayText = document.getElementById("end-day").textContent;
    const [day] = endDayText.split("/");
    const endDay = parseInt(day, 10); // Đảm bảo parse base 10
    if (!isNaN(endDay)) {
        createCalendarDays(endDay);
    }
}

// Cập nhật phạm vi ngày bắt đầu và kết thúc trên giao diện
function updateCalendarDates(monthName) {
    const monthIndex = originalMonths.indexOf(monthName);
    if (monthIndex === -1) return;

    currentMonthName = monthName; // CẬP NHẬT BIẾN GLOBAL currentMonthName quan trọng
    const year = new Date().getFullYear();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate(); // Lấy số ngày trong tháng
    const mm = (monthIndex + 1).toString().padStart(2, '0'); // Định dạng tháng (01-12)

    document.getElementById("start-day").textContent = `01/${mm}/${year}`;
    document.getElementById("end-day").textContent = `${daysInMonth}/${mm}/${year}`;

    updateCalendarGridFromEndDay(); // Cập nhật lại lưới ngày
}


// --- HÀM CUỘN VÀ HIỂN THỊ THÁNG ĐƯỢC CHỌN ---

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

// Cập nhật hiệu ứng highlight cho các tháng xung quanh vị trí cuộn
function updateHighlight() {
    const center = wrapper.scrollTop + wrapper.clientHeight / 2;
    list.querySelectorAll("li").forEach(item => {
        const dist = Math.abs((item.offsetTop + item.offsetHeight / 2) - center);

        if (dist < 5) { // Tháng ở chính giữa
            item.style.opacity = 1;
            item.style.color = '#aaa';
            item.style.textShadow = '0 0 5px rgba(0,0,0,0.3)';
        } else if (dist < 40) { // Các tháng gần trung tâm
            item.style.opacity = 1;
            item.style.color = '#646464';
            item.style.textShadow = '0 5px 1px rgba(0,0,0,0.2)';
        } else { // Các tháng xa trung tâm
            item.style.opacity = 0.25;
            item.style.color = '#aaa';
            item.style.textShadow = 'none';
        }
    });
}

// Cập nhật tháng đang được chọn (hiển thị trên `selectedMonth`) dựa vào vị trí cuộn
function updateSelected() {
    const center = wrapper.scrollTop + wrapper.clientHeight / 2;
    let closestItem = null;
    let minDistance = Infinity;

    list.querySelectorAll("li").forEach(item => {
        const itemCenter = item.offsetTop + item.offsetHeight / 2;
        const distance = Math.abs(itemCenter - center);

        if (distance < minDistance) {
            minDistance = distance;
            closestItem = item;
        }
    });

    if (closestItem) {
        const chosenMonth = closestItem.textContent;
        // Chỉ cập nhật DOM và lịch nếu tháng thực sự thay đổi để tránh re-render không cần thiết
        if (selected.textContent !== chosenMonth) {
            selected.textContent = chosenMonth;
            updateCalendarDates(chosenMonth);
            // Các hàm cập nhật dashboard/chart có thể được gọi ở đây nếu bạn muốn chúng
            // được cập nhật ngay lập tức khi cuộn dừng lại.
            // updateDashboard(chosenMonth);
            // drawChart();
        }
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


// Sự kiện click bên ngoài picker để đóng
document.addEventListener("click", e => {
    // Nếu click không phải trên picker và cũng không phải trên `selectedMonth`, thì đóng picker
    if (!picker.contains(e.target) && !selected.contains(e.target)) {
        picker.classList.remove("show");
        isPickerOpen = false;
    }
});

// Sự kiện cuộn trên wrapper tháng
wrapper.addEventListener('scroll', () => {
    requestAnimationFrame(updateHighlight); // Cập nhật highlight mượt mà hơn
    clearTimeout(wrapper.updateTimeout); // Xóa timeout cũ
    // Đặt timeout để updateSelected chỉ chạy khi người dùng dừng cuộn một chút
    wrapper.updateTimeout = setTimeout(updateSelected, 150);
});

// Ngăn cuộn trang khi cuộn chuột trên wrapper và điều chỉnh tốc độ cuộn tháng
wrapper.addEventListener('wheel', e => {
    e.preventDefault(); // Ngăn cuộn trang chính
    wrapper.scrollTop += e.deltaY * 0.4; // Điều chỉnh tốc độ cuộn
}, { passive: false });


// Sự kiện nhấn phím lên/xuống để cuộn tháng
document.addEventListener("keydown", e => {
    if (!isPickerOpen) return; // Chỉ xử lý khi picker đang mở

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault(); // Ngăn cuộn trang chính

        // Đảm bảo itemHeight đã có giá trị
        if (itemHeight === 0 && list.children.length > 0) {
            itemHeight = list.children[0].offsetHeight;
        }
        if (itemHeight > 0) {
            const direction = e.key === "ArrowDown" ? 1 : -1;
            wrapper.scrollTop += direction * itemHeight; // Cuộn từng itemHeight

            // Cập nhật highlight và tháng được chọn sau khi cuộn bằng phím
            clearTimeout(wrapper.updateTimeout);
            wrapper.updateTimeout = setTimeout(updateSelected, 150);
        }
    }
});



// Nhấn Enter chỉ chọn tháng và đóng picker, không mở link
document.addEventListener("keydown", e => {
  if (e.key !== "Enter" || !picker.classList.contains("show")) return;

  e.preventDefault();
  picker.classList.remove("show");
  isPickerOpen = false;

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
    const month = closest.textContent;
    selected.textContent = month;
    updateCalendarDates(month);
    
    // CHỈ CẦN GỌI drawChart(), nó sẽ lo tất cả
    drawChart();
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
