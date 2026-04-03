async function testAPI() {
  const url = document.getElementById("url").value.trim();
  const method = document.getElementById("method").value;

  if (!url) {
    alert("Enter a valid URL");
    return;
  }

  document.getElementById("result").innerText = "Loading...";

  const data = await apiRequest("/test", "POST", { url, method });

  document.getElementById("result").innerText =
    JSON.stringify(data, null, 2);
}

