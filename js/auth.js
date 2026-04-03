let isLogin = true;

function toggleAuth() {
    isLogin = !isLogin;
    document.getElementById("authTitle").innerText = isLogin ? "Welcome" : "Sign Up";
    document.getElementById("authBtn").innerText = isLogin ? "Login" : "Create Account";
    document.getElementById("toggleLink").innerText = isLogin ? "New Pilot? Create Account" : "Already have an account? Login";
}

async function handleAuth(e) {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const msg = document.getElementById("authMsg");

    if (!email.includes("@")) {
        msg.innerText = "❌ Invalid email format";
        return;
    }

    const endpoint = isLogin ? "/login" : "/register";
    const res = await apiRequest(endpoint, "POST", { email, password });

    if (res.success) {
        if (isLogin) {
            localStorage.setItem("token", res.token);
            window.location.href = "index.html";
        } else {
            msg.className = "mt-3 small text-success";
            msg.innerText = "Success! Please login now.";
            toggleAuth();
        }
    } else {
        msg.className = "mt-3 small text-danger";
        msg.innerText = res.error;
    }
}