let requestsChart, errorsChart, latencyChart;

async function loadDashboard() {
  await loadGraphs();
  await loadLogs();
  await checkPattern();
}

// ================= GRAPH DATA =================

async function loadGraphs() {
  const res = await apiRequest("/graphs");

  if (!res.success) {
    console.error("Graph load failed");
    return;
  }

  const { requests, errors, latency } = res.data;

  renderRequestsChart(requests);
  renderErrorsChart(errors);
  renderLatencyChart(latency);
}

// ================= CHARTS =================

function getCommonChartOptions(label) {
  return {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#e2e8f0"
        }
      }
    },
    scales: {
      x: {
        ticks: { color: "#94a3b8" }
      },
      y: {
        ticks: { color: "#94a3b8" }
      }
    }
  };
}

function renderRequestsChart(data) {
  const ctx = document.getElementById("requestsChart").getContext("2d");

  if (requestsChart) requestsChart.destroy();

  requestsChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.map(d => d.date),
      datasets: [{
        label: "Requests",
        data: data.map(d => Number(d.count)),
        borderWidth: 2,
        tension: 0.3
      }]
    },
    options: getCommonChartOptions()
  });
}

function renderErrorsChart(data) {
  const ctx = document.getElementById("errorsChart").getContext("2d");

  if (errorsChart) errorsChart.destroy();

  errorsChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.map(d => d.date),
      datasets: [{
        label: "Errors",
        data: data.map(d => Number(d.count)),
        borderWidth: 2,
        tension: 0.3
      }]
    },
    options: getCommonChartOptions()
  });
}

function renderLatencyChart(data) {
  const ctx = document.getElementById("latencyChart").getContext("2d");

  if (latencyChart) latencyChart.destroy();

  latencyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.map(d => d.date),
      datasets: [{
        label: "Latency (ms)",
        data: data.map(d => Number(d.avg_latency)),
        borderWidth: 2,
        tension: 0.3
      }]
    },
    options: getCommonChartOptions()
  });
}

// ================= LOG TABLE =================

async function loadLogs() {
  const res = await apiRequest("/logs");

  if (!res.success) return;

  const table = document.getElementById("logTable");
  table.innerHTML = "";

  res.data.forEach(log => {
    const row = document.createElement("tr");

    // UI improvement (instead of inline color)
    if (log.status >= 400) {
      row.classList.add("error");
    } else {
      row.classList.add("success");
    }

    row.innerHTML = `
      <td>${log.url}</td>
      <td>
        <span class="badge ${log.status >= 400 ? "badge-error" : "badge-success"}">
          ${log.status}
        </span>
      </td>
      <td>${log.response_time} ms</td>
      <td>${log.retry ? "Yes" : "No"}</td>
      <td>${log.retry_success ? "Yes" : "No"}</td>
      <td>${log.error || "-"}</td>
    `;

    table.appendChild(row);
  });
}

// ================= PATTERN =================

async function checkPattern() {
  const res = await apiRequest("/pattern");

  if (!res.success) return;

  const alertBox = document.getElementById("patternAlert");

  if (res.unstable) {
    alertBox.innerText = "⚠️ API UNSTABLE: Last 5 requests failed";
    alertBox.style.color = "#ef4444";
  } else {
    alertBox.innerText = "✅ API Stable";
    alertBox.style.color = "#22c55e";
  }
}