google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(drawChart);

async function drawChart() {
  try {
    // Fetch từ Web App endpoint (Google Apps Script Web App bạn setup sẵn)
    const response = await fetch('https://script.google.com/macros/s/AKfycbwFm2cttm0DqgdBEZHzfeRjTRGt9LhASvIw8Dj4SeHc1nWhpJjO_PbOp5q2LacJDdMsIg/exec');
    const data = await response.json();

    const names = data.names;
    const hours = data.hours.map(Number);

    const chartData = [['Tên', 'Giờ làm']];
    for (let i = 0; i < names.length; i++) {
      chartData.push([names[i], hours[i]]);
    }

    const maxHour = Math.max(...hours);
    const paddedMax = maxHour * 1.25;

    const dataTable = google.visualization.arrayToDataTable(chartData);

    const options = {
      legend: { position: 'none' },
      backgroundColor: 'transparent',
      colors: ['black'],
      bar: { groupWidth: '50%' },
      hAxis: {
        textStyle: { color: '#333', fontSize: 12 },
        slantedText: false,
        showTextEvery: 1
      },
      vAxis: {
        minValue: 0,
        maxValue: paddedMax,
        textStyle: { color: '#333' }
      }
    };

    const chart = new google.visualization.ColumnChart(document.getElementById('chart_inner'));
    chart.draw(dataTable, options);
  } catch (error) {
    console.error('Error loading chart data:', error);
  }
}
