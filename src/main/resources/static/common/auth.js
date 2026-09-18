const AUTH_ME_URL = "/api/auth/me";
const AUTH_LOGOUT_URL = "/api/auth/logout";
document.addEventListener("DOMContentLoaded", initializeAuth);

async function initializeAuth() {
    try {
        const response = await fetch(AUTH_ME_URL);
        if (response.ok) {
            const customer = await response.json();
            showLoggedIn(customer);
        } else {
            showLoggedOut();
        }
    } catch (error) {
        console.error("Failed to check authentication status:", error);
        showLoggedOut();
    }
}

function showLoggedIn(customer) {
    const loggedOut = document.getElementById("logged-out");
    const loggedIn = document.getElementById("logged-in");
    const customerName = document.getElementById("customer-name");
    if (!loggedOut || !loggedIn || !customerName) {
        return;
    }
    customerName.textContent = `${customer.firstName} ${customer.lastName}`;
    loggedOut.hidden = true;
    loggedIn.hidden = false;
    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) {
        logoutButton.addEventListener("click", logout);
    }
}

function showLoggedOut() {
    const loggedOut = document.getElementById("logged-out");
    const loggedIn = document.getElementById("logged-in");
    if (!loggedOut || !loggedIn) {
        return;
    }
    loggedOut.hidden = false;
    loggedIn.hidden = true;
}

async function logout() {
    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) {
        logoutButton.disabled = true;
        logoutButton.textContent = "Logging out...";
    }
    try {
        const response = await fetch(AUTH_LOGOUT_URL, {method: "POST"});
        if (!response.ok) {
            throw new Error("Logout failed.");
        }
        window.location.reload();
    } catch (error) {
        console.error(error);
        if (logoutButton) {
            logoutButton.disabled = false;
            logoutButton.textContent = "Logout";
        }
    }
}