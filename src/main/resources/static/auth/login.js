
const API_URL = "/api/auth/login";
const CURRENT_USER_URL = "/api/auth/me";

const form = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("login-button");
const togglePasswordButton = document.getElementById("toggle-password");

togglePasswordButton.addEventListener("click", function () {
    const isPassword = passwordInput.type === "password";

    passwordInput.type = isPassword ? "text" : "password";
    togglePasswordButton.textContent = isPassword ? "Hide" : "Show";
    togglePasswordButton.setAttribute(
        "aria-label",
        isPassword ? "Hide password" : "Show password"
    );
});

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = emailInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        showMessage("Email and password are required.", "error");
        return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";

    try {
        // Authenticate the user.
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Invalid email or password.");
            }

            if (response.status === 403) {
                throw new Error("Access denied. Please try again.");
            }

            throw new Error("Login failed. Please try again.");
        }

        // Retrieve the authenticated user's details and roles.
        const userResponse = await fetch(CURRENT_USER_URL, {
            method: "GET",
            credentials: "same-origin",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!userResponse.ok) {
            throw new Error("Login succeeded, but we couldn't determine your account role. Please try again.");
        }

        const user = await userResponse.json();

        // Preserve an explicitly requested local redirect.
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect");

        if (isSafeLocalRedirect(redirect)) {
            window.location.href = redirect;
            return;
        }

        // Send administrators to the admin dashboard by default.
        if (isAdmin(user)) {
            window.location.href = "/admin/index.html";
        } else {
            window.location.href = "/index.html";
        }
    } catch (error) {
        console.error(error);
        showMessage(error.message || "Login failed.", "error");

        loginButton.disabled = false;
        loginButton.textContent = "Login";
    }
});

function isAdmin(user) {
    const roles = user?.role ?? user?.roles ?? [];

    const roleList = Array.isArray(roles) ? roles : [roles];

    return roleList.some(role => {
        const normalizedRole = String(role)
            .trim()
            .toUpperCase()
            .replace(/^ROLE_/, "");

        return normalizedRole === "ADMIN";
    });
}

function isSafeLocalRedirect(redirect) {
    return Boolean(
        redirect &&
        redirect.startsWith("/") &&
        !redirect.startsWith("//") &&
        !redirect.startsWith("/\\") &&
        !/[\r\n]/.test(redirect)
    );
}

function showMessage(message, type) {
    const element = document.getElementById("message");
    element.replaceChildren();

    const messageElement = document.createElement("div");
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;

    element.appendChild(messageElement);
}
