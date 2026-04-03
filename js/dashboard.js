let allLogs = [];
let showingFullList = false;
let requestsChart, errorsChart, latencyChart;

async function loadDashboard() {
  await loadGraphs();
  await loadLogs();
  await checkPattern();
}

async function loadGraphs() {
  const res = await apiRequest("/graphs");
  if (!res.success) return;
  const { requests, errors, latency } = res.data;
  renderRequestsChart(requests);
  renderErrorsChart(errors);
  renderLatencyChart(latency);
}

// ================= LOG TABLE LOGIC =================
async function loadLogs() {
  const res = await apiRequest("/logs");
  if (!res.success) return;

  allLogs = res.data;
  renderLogTable();
}

function renderLogTable() {
  const table = document.getElementById("logTable");
  table.innerHTML = "";
  
  // Only show 5 logs initially, or all if user clicked "View All"
  const logsToDisplay = showingFullList ? allLogs : allLogs.slice(0, 5);

  logsToDisplay.forEach(log => {
    const isError = log.status >= 400;
    const row = document.createElement("tr");
    row.className = "log-row";
    row.innerHTML = `
      <td>
        <div class="small text-secondary">${log.method}</div>
        <div class="fw-bold text-white">${log.url}</div>
      </td>
      <td><span class="status-badge ${isError ? 'status-err' : 'status-200'}">${log.status}</span></td>
      <td class="text-info fw-bold">${log.response_time}ms</td>
      <td>
         ${log.retry ? '<span class="badge bg-primary">RETRY</span>' : '<span class="text-muted">-</span>'}
         ${log.retry_success ? '<span class="badge bg-success ms-1">FIXED</span>' : ''}
      </td>
      <td class="small text-secondary">${log.error || "Stable Connection"}</td>
    `;
    table.appendChild(row);
  });
}

function toggleLogs() {
    showingFullList = !showingFullList;
    const btn = document.getElementById("viewAllBtn");
    btn.innerText = showingFullList ? "Show Less" : "View All Logs";
    renderLogTable();
}

// ================= CHART RENDERING =================
// ================= REQUESTS CHART =================
function renderRequestsChart(data) {
    const ctx = document.getElementById("requestsChart").getContext("2d");
    if (requestsChart) requestsChart.destroy();
    
    // Safety check: if no data, don't try to render
    if (!data || data.length === 0) return;

    requestsChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: data.map(d => d.date),
            datasets: [{
                label: "Requests",
                data: data.map(d => Number(d.count)),
                borderColor: '#8b5cf6', // Purple
                backgroundColor: 'rgba(139, 92, 246, 0.2)', // Purple Glow
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { display: false, beginAtZero: true },
                x: { display: false }
            }
        }
    });
}

// ================= ERRORS CHART =================
function renderErrorsChart(data) {
    const ctx = document.getElementById("errorsChart").getContext("2d");
    if (errorsChart) errorsChart.destroy();
    
    if (!data || data.length === 0) return;

    errorsChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: data.map(d => d.date),
            datasets: [{
                label: "Errors",
                data: data.map(d => Number(d.count)),
                borderColor: '#f472b6', // Pink
                backgroundColor: 'rgba(244, 114, 182, 0.2)', // Pink Glow
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { display: false, beginAtZero: true },
                x: { display: false }
            }
        }
    });
}

// ================= LATENCY CHART =================
function renderLatencyChart(data) {
    const ctx = document.getElementById("latencyChart").getContext("2d");
    if (latencyChart) latencyChart.destroy();
    
    if (!data || data.length === 0) return;

    latencyChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: data.map(d => d.date),
            datasets: [{
                label: "Latency (ms)",
                data: data.map(d => Number(d.avg_latency)),
                borderColor: '#0ea5e9', // Cyan
                backgroundColor: 'rgba(14, 165, 233, 0.2)', // Cyan Glow
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { display: false, beginAtZero: true },
                x: { display: false }
            }
        }
    });
}

async function checkPattern() {
  const res = await apiRequest("/pattern");
  if (!res.success) return;

  const alertBox = document.getElementById("patternAlert");
  
  if (res.unstable) {
    alertBox.innerHTML = `
      <div class="status-pill-container">
        <span class="status-dot dot-unstable"></span>
        <span class="text-unstable">System Unstable: Multiple Failures</span>
      </div>
    `;
  } else {
    alertBox.innerHTML = `
      <div class="status-pill-container">
        <span class="status-dot dot-stable"></span>
        <span class="text-stable">All Systems Operational</span>
      </div>
    `;
  }
}