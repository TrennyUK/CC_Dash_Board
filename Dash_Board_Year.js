// Nạp Google Charts
google.charts.load("current", { packages: ["corechart"] });
google.charts.setOnLoadCallback(drawChart);

// Google Sheets API thông tin
const SHEET_ID_NAMES = '1bv0_DB47DF8YBiPJnTHw434H1RBQv3q88lPXNJmbGrk';
const SHEET_ID_HOURS = '1uIU21ZVrdAzC6SwvsYDrbRh5gL4aB2tsMIeUyJ5RvCs';
const API_KEY = 'AIzaSyA1fRhQE_tbpwr0w7mc4kYWPWeGpN2I4-k'; // <-- Thay bằng API key thật

const RANGE_NAMES = 'Day 1!D5:D34'; // sửa lại chính xác theo yêu cầu
const RANGE_HOURS = 'Month 1!AJ6:AJ35';

// Hàm gọi dữ liệu từ Google Sheets API
async function fetchSheetData(sheetId, range) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?key=${API_KEY}`;
  const response = await fetch(url);
  const result = await response.json();

  return result.values ? result.values.flat() : [];
}

// Vẽ biểu đồ cột giờ làm
async function drawChart() {
  const chartContainer = document.getElementById('chart_inner');
  chartContainer.innerText = 'Đang tải dữ liệu...';

  try {
    const [names, hours] = await Promise.all([
      fetchSheetData(SHEET_ID_NAMES, RANGE_NAMES),
      fetchSheetData(SHEET_ID_HOURS, RANGE_HOURS),
    ]);

    if (!names.length || !hours.length) {
      chartContainer.innerText = 'Không có dữ liệu hoặc lỗi API.';
      return;
    }

    const chartData = [['Tên', 'Giờ làm']];
    for (let i = 0; i < Math.min(names.length, hours.length); i++) {
      const name = String(names[i] || '(trống)').trim();
      const hour = parseFloat(hours[i]);

      if (!name || isNaN(hour)) continue;
      chartData.push([name, hour]);
    }

    if (chartData.length === 1) {
      chartContainer.innerText = 'Không có dữ liệu hợp lệ để vẽ biểu đồ.';
      return;
    }

    const data = google.visualization.arrayToDataTable(chartData);
    const options = {
      title: 'Giờ làm mỗi người (Tháng 1)',
      legend: { position: 'none' },
      height: 400,
      bar: { groupWidth: '75%' },
      colors: ['#1976D2'],
      hAxis: { title: 'Tên nhân viên' },
      vAxis: { title: 'Giờ làm' },
    };

    chartContainer.innerText = '';
    const chart = new google.visualization.ColumnChart(chartContainer);
    chart.draw(data, options);
  } catch (err) {
    console.error('❌ Lỗi khi tải dữ liệu từ Sheets API:', err);
    chartContainer.innerText = 'Lỗi khi tải dữ liệu.';
  }
}
