const API_URL = "/api/auth/signup";
const form = document.getElementById("signup-form");
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const emailInput = document.getElementById("email");
const phoneNumberInput = document.getElementById("phoneNumber");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const signupButton = document.getElementById("signup-button");
const togglePasswordButton = document.getElementById("toggle-password");
const toggleConfirmPasswordButton = document.getElementById("toggle-confirm-password");
togglePasswordButton.addEventListener("click", function () {
    togglePasswordVisibility(passwordInput, togglePasswordButton);
});
toggleConfirmPasswordButton.addEventListener("click", function () {
    togglePasswordVisibility(confirmPasswordInput, toggleConfirmPasswordButton);
});
form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const email = emailInput.value.trim();
    const phoneNumber = phoneNumberInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        showMessage("Please fill in all required fields.", "error");
        return;
    }
    if (password !== confirmPassword) {
        showMessage("Passwords do not match.", "error");
        return;
    }
    signupButton.disabled = true;
    signupButton.textContent = "Creating account...";
    const body = {firstName, lastName, email, phoneNumber, password};
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            if (response.status === 409) {
                throw new Error("An account with this email already exists.");
            }
            throw new Error("Failed to create account.");
        }
        showMessage("Account created successfully. Redirecting to login...", "success");
        setTimeout(function () {
            window.location.href = "/auth/login.html";
        }, 1000);
    } catch (error) {
        console.error(error);
        showMessage(error.message, "error");
        signupButton.disabled = false;
        signupButton.textContent = "Create Account";
    }
});

function togglePasswordVisibility(input, button) {
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    button.textContent = isPassword ? "Hide" : "Show";
    button.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
}

function showMessage(message, type) {
    const element = document.getElementById("message");
    element.innerHTML = ` <div class="message ${type}"> ${message} </div> `;
}