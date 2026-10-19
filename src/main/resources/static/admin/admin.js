
const CURRENT_USER_URL = "/api/auth/me";
const LOGOUT_URL = "/api/auth/logout";
const LOGIN_URL = "/auth/login.html?redirect=%2Fadmin%2Findex.html";

const adminName = document.getElementById("admin-name");
const userAvatar = document.getElementById("user-avatar");
const pageMessage = document.getElementById("page-message");
const logoutButton = document.getElementById("logout-button");
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menu-toggle");
const mobileOverlay = document.getElementById("mobile-overlay");

document.addEventListener("DOMContentLoaded", loadCurrentUser);

async function loadCurrentUser() {
    try {
        const response = await fetch(CURRENT_USER_URL, {
            method: "GET",
            credentials: "same-origin",
            headers: { "Accept": "application/json" }
        });

        if (response.status === 401 || response.status === 403) {
            window.location.replace(LOGIN_URL);
            return;
        }

        if (!response.ok) {
            throw new Error(`Could not load the current user (${response.status}).`);
        }

        const user = await response.json();

        const roles = Array.isArray(user.roles)
            ? user.roles
            : Array.isArray(user.role)
                ? user.role
                : [];

        if (!roles.includes("ADMIN")) {
            showMessage("This area is only available to administrator accounts.", true);

            window.setTimeout(() => {
                window.location.replace("/index.html");
            }, 1200);

            return;
        }

        const displayName = [
            user.firstName,
            user.lastName
        ]
            .filter(value => typeof value === "string" && value.trim())
            .join(" ") || user.username || "Administrator";

        // These elements may not exist on every admin page.
        if (adminName) {
            adminName.textContent = displayName;
        }

        if (userAvatar) {
            userAvatar.textContent =
                displayName.trim().charAt(0).toUpperCase() || "A";
        }
    } catch (error) {
        console.error("Unable to initialize admin dashboard:", error);

        showMessage(
            "We couldn't verify your account. Please refresh the page or sign in again.",
            true
        );
    }
}

if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        logoutButton.disabled = true;
        logoutButton.textContent = "Logging out…";

        try {
            const response = await fetch(LOGOUT_URL, {
                method: "POST",
                credentials: "same-origin",
                headers: { "Accept": "application/json" }
            });

            // Spring Security's configured logout handler returns 204 on success.
            if (response.ok || response.status === 401) {
                window.location.replace(LOGIN_URL);
                return;
            }

            throw new Error(`Logout failed (${response.status}).`);
        } catch (error) {
            console.error("Logout failed:", error);

            showMessage("Could not log out. Please try again.", true);

            logoutButton.disabled = false;
            logoutButton.textContent = "Log out";
        }
    });
}

function showMessage(message, isError = false) {
    if (!pageMessage) {
        console.error(message);
        return;
    }

    pageMessage.textContent = message;
    pageMessage.classList.toggle("error", isError);
    pageMessage.hidden = false;
}

function closeMobileNavigation() {
    if (sidebar) {
        sidebar.classList.remove("open");
    }

    if (mobileOverlay) {
        mobileOverlay.classList.remove("visible");
        mobileOverlay.hidden = true;
    }

    if (menuToggle) {
        menuToggle.setAttribute("aria-expanded", "false");
    }
}

if (menuToggle) {
    menuToggle.addEventListener("click", () => {
        if (!sidebar || !mobileOverlay) {
            return;
        }

        const isOpen = sidebar.classList.toggle("open");

        mobileOverlay.hidden = !isOpen;
        mobileOverlay.classList.toggle("visible", isOpen);

        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
}

if (mobileOverlay) {
    mobileOverlay.addEventListener("click", closeMobileNavigation);
}

document.querySelectorAll(".side-nav .nav-link").forEach(link => {
    link.addEventListener("click", closeMobileNavigation);
});
