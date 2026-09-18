const API_URL = "/api/auth/login";
const form = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("login-button");
const togglePasswordButton = document.getElementById("toggle-password");
togglePasswordButton.addEventListener("click", function () {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    togglePasswordButton.textContent = isPassword ? "Hide" : "Show";
    togglePasswordButton.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
});
form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || !password) {
        showMessage("Email and password are required.", "error");
        return;
    }
    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, password})
        });
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Invalid email or password.");
            }
            throw new Error("Login failed.");
        }
        window.location.href = "/index.html";
    } catch (error) {
        console.error(error);
        showMessage(error.message, "error");
        loginButton.disabled = false;
        loginButton.textContent = "Login";
    }
});

function showMessage(message, type) {
    const element = document.getElementById("message");
    element.innerHTML = ` <div class="message ${type}"> ${message} </div> `;
}