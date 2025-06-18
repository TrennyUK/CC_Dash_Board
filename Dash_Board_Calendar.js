// Mảng tháng gốc
const originalMonths = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// ID Google Sheets từng tháng
const sheetLinks = {
    "January": "1bv0_DB47DF8YBiPJnTHw434H1RBQv3q88lPXNJmbGrk",
    "February": "1Ov8LY7uTRfeIEotykBzYmfTQVGbrPTrSQ5sfNrhUr5o",
    "March": "1OXyX2EELj2y6zhwBSCOHEr65rs4MGMwWIIlY-LerLbE",
    "April": "1GAcOhju2t0RThGFTbIHCru3Th9sOg4eFbPONpbAOOn4",
    "May": "1ghOE4X6a535lIYCaRM030JwcJnwOX4ScPJ0LVOVO2to",
    "June": "1m3hkzV-O3YOReVULgh7Ii9VsS8r066UJyYOnRni7LrE",
    "July": "13LDPskjeuWS2ShoNtwvYTD6x_4CNJvVHQfMe5eO7n50",
    "August": "1uA_McdI8Nsr7X-SPqlFqNzYcJ57IxixLw9mtlh6XCwE",
    "September": "1D9OLcv61lTrLpWey1uHU7MR5g-ChOdq7gTMMheWe1Ro",
    "October": "1maEzzfMLnfkynj7rZ8KiGoXT1fLMB1tK7Itj3tsRxeM",
    "November": "1AzZfkYiDCHwhoo-473Qh7IDYL3Mn6eEcMvq6ZYCjHx4",
    "December": "1JwiQXRm_3NXYPjaBaqVSUaCY5J5Dk0tY2jnt21XQWl8"
};

// GID các sheet Day 1–31 (áp dụng cho tất cả các tháng vì cấu trúc giống nhau)
const dayGids = {
    "Day 1": 0, "Day 2": 67605103, "Day 3": 1052609443, "Day 4": 1424934325,
    "Day 5": 741641761, "Day 6": 2067969392, "Day 7": 362117292, "Day 8": 709125583,
    "Day 9": 352655699, "Day 10": 2050956779, "Day 11": 1046007689, "Day 12": 674856308,
    "Day 13": 816439500, "Day 14": 645750547, "Day 15": 45774549, "Day 16": 612734508,
    "Day 17": 1591895966, "Day 18": 496660734, "Day 19": 28020789, "Day 20": 854584720,
    "Day 21": 1034683200, "Day 22": 223176623, "Day 23": 1860428488, "Day 24": 1834671294,
    "Day 25": 387334056, "Day 26": 326193982, "Day 27": 990219618, "Day 28": 1159976380,
    "Day 29": 441754291, "Day 30": 348119132, "Day 31": 1420847907
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
        isDblClick = false; // Reset cờ cho mỗi click mới

        const clickedLi = e.currentTarget;
        const monthText = clickedLi.textContent;

        // **Bước 1: Ngay lập tức cập nhật tháng được chọn và lịch**
        // Điều này đảm bảo phản hồi tức thì cho người dùng khi click đơn
        selected.textContent = monthText;
        updateCalendarDates(monthText); // Cập nhật lịch ngày
        
        // Gọi updateDashboard và drawChart NGAY LẬP TỨC để thấy phản hồi
        updateDashboard(monthText); 
        drawChart();

        // Bước 2: Cuộn mượt đến tháng đó (nếu cần)
        if (itemHeight === 0) {
            itemHeight = clickedLi.offsetHeight;
        }
        if (itemHeight > 0) { // Chỉ cuộn nếu itemHeight hợp lệ
            const targetScrollTop = clickedLi.offsetTop - (wrapper.clientHeight / 2) + (itemHeight / 2);
            wrapper.scrollTo({
                top: targetScrollTop,
                behavior: 'smooth'
            });
        } else {
            console.warn("itemHeight is 0, cannot calculate scroll position accurately for click.");
        }


        // Bước 3: Đặt timeout để chờ xem có phải double click không
        clickTimeout = setTimeout(() => {
            // Chỉ đóng picker nếu KHÔNG CÓ double click xảy ra trong khoảng thời gian chờ
            if (!isDblClick) {
                picker.classList.remove("show");
                isPickerOpen = false;
                // Các hàm cập nhật đã được gọi ở trên nên không cần gọi lại ở đây
            }
        }, 250); // Khoảng thời gian chờ để xác định single/double click
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
