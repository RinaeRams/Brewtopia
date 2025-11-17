const ctx = document.getElementById('salesChart').getContext('2d');

// Transactions data
let transactions = JSON.parse(localStorage.getItem('transactions')) || [
  { date: '2025-07-19', customer: 'John Doe', item: 'Headphones', amount: 120 },
  { date: '2025-07-18', customer: 'Jane Smith', item: 'Smartphone', amount: 700 },
  { date: '2025-07-18', customer: 'Ali Khan', item: 'Keyboard', amount: 85 }
];

let currentFiltered = transactions;

function renderTable(filtered = currentFiltered) {
  const tbody = document.getElementById('transactionBody');
  tbody.innerHTML = '';
  filtered.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${t.date}</td><td>${t.customer}</td><td>${t.item}</td><td>R${t.amount}</td>`;
    tbody.appendChild(tr);
  });
}

// Initial render table
renderTable();

// Add transaction
document.getElementById('addTransactionForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const date = document.getElementById('dateInput').value;
  const customer = document.getElementById('customerInput').value;
  const item = document.getElementById('itemInput').value;
  const amount = parseFloat(document.getElementById('amountInput').value);
  transactions.push({ date, customer, item, amount });
  localStorage.setItem('transactions', JSON.stringify(transactions));
  currentFiltered = transactions;
  renderTable();
  e.target.reset();
});

// Date filter
document.getElementById('filterBtn').addEventListener('click', () => {
  const start = document.getElementById('startDate').value;
  const end = document.getElementById('endDate').value;
  if (start && end) {
    currentFiltered = transactions.filter(t => t.date >= start && t.date <= end);
  } else {
    currentFiltered = transactions;
  }
  renderTable();
});

const chartDataSets = {
  monthly: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    sales: [3100, 4500, 5000, 6200, 7200, 6900, 8100],
    profit: [465, 675, 750, 930, 1080, 1035, 1215],
  },
  quarterly: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    sales: [12600, 18900, 20500, 17500],
    profit: [1890, 2835, 3075, 2625],
  },
  yearly: {
    labels: ['2021', '2022', '2023', '2024', '2025'],
    sales: [52000, 68000, 74500, 81000, 89500],
    profit: [7800, 10200, 11175, 12150, 13425],
  }
};

let currentChart;

function renderChart(filterType, metric, chartType) {
  const chartData = chartDataSets[filterType];

  if (currentChart) currentChart.destroy();

  currentChart = new Chart(ctx, {
    type: chartType,
    data: {
      labels: chartData.labels,
      datasets: [{
        label: metric.charAt(0).toUpperCase() + metric.slice(1),
        data: chartData[metric],
        backgroundColor: chartType === 'bar' ? 'rgba(79, 70, 229, 0.6)' : 'rgba(79, 70, 229, 0.2)',
        borderColor: '#4f46e5',
        borderWidth: 2,
        tension: chartType === 'line' ? 0.4 : 0,
        fill: chartType === 'line',
        pointBackgroundColor: '#4f46e5',
        pointRadius: chartType === 'line' ? 4 : 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeOutBounce'
      }
    }
  });
}

// Initial render
renderChart('monthly', 'sales', 'line');

// Filter events
document.getElementById('chartFilter').addEventListener('change', (e) => {
  const metric = document.getElementById('metricFilter').value;
  const chartType = document.getElementById('chartType').value;
  renderChart(e.target.value, metric, chartType);
});

document.getElementById('metricFilter').addEventListener('change', (e) => {
  const filterType = document.getElementById('chartFilter').value;
  const chartType = document.getElementById('chartType').value;
  renderChart(filterType, e.target.value, chartType);
});

document.getElementById('chartType').addEventListener('change', (e) => {
  const filterType = document.getElementById('chartFilter').value;
  const metric = document.getElementById('metricFilter').value;
  renderChart(filterType, metric, e.target.value);
});

// Theme toggle
const themeBtn = document.getElementById('themeToggle');

function setTheme(isDark) {
  document.body.classList.toggle('dark', isDark);
  themeBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Load saved theme
const savedTheme = localStorage.getItem('theme') === 'dark';
setTheme(savedTheme);

// Toggle theme on click
themeBtn.addEventListener('click', () => {
  const isDark = !document.body.classList.contains('dark');
  setTheme(isDark);
});

// Search functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const rows = document.querySelectorAll('tbody tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(query) ? '' : 'none';
  });
});

// Export to PDF
document.getElementById('exportBtn').addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.autoTable({
    head: [['Date', 'Customer', 'Item', 'Amount']],
    body: currentFiltered.map(t => [t.date, t.customer, t.item, 'R' + t.amount])
  });
  doc.save('transactions.pdf');
});
