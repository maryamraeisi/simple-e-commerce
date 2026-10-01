const loading = document.getElementById("loading");
const paymentContent = document.getElementById("payment-content");
const errorMessage = document.getElementById("error-message");

const paymentAmount = document.getElementById("payment-amount");
const payAmount = document.getElementById("pay-amount");

const paymentForm = document.getElementById("payment-form");
const payButton = document.getElementById("pay-button");
const cancelButton = document.getElementById("cancel-button");

const cardNumber = document.getElementById("card-number");
const expiry = document.getElementById("expiry");
const cvv = document.getElementById("cvv");

let authority = null;

initialize();

function initialize() {
    console.log("initialize started");

    paymentForm.addEventListener("submit", event => {
        event.preventDefault();
        processPayment("SUCCESS");
    });

    cancelButton.addEventListener("click", () => {
        processPayment("CANCELLED");
    });

    cardNumber.addEventListener("input", formatCardNumber);
    expiry.addEventListener("input", formatExpiry);
    cvv.addEventListener("input", formatCvv);

    loadPayment();
}

async function loadPayment() {
    console.log("loadPayment started");

    const params = new URLSearchParams(window.location.search);
    authority = params.get("authority");

    console.log("authority:", authority);

    if (!authority) {
        showError("Invalid payment request.");
        loading.hidden = true;
        return;
    }

    const url = `/mock-ipg/payment/${encodeURIComponent(authority)}`;

    console.log("Fetching payment:", url);

    try {
        const response = await fetch(url);

        console.log("Payment response:", response.status);

        if (!response.ok) {
            throw new Error("Payment not found.");
        }

        const amount = await response.json();

        console.log("Payment amount:", amount);

        const formattedAmount = formatPrice(amount);

        paymentAmount.textContent = formattedAmount;
        payAmount.textContent = formattedAmount;

        paymentContent.hidden = false;

    } catch (error) {
        console.error("Failed to load payment:", error);

        showError(error.message || "Failed to load payment.");

    } finally {
        loading.hidden = true;
    }
}

async function processPayment(result) {
    if (result === "success" && !paymentForm.checkValidity()) {
        paymentForm.reportValidity();
        return;
    }

    payButton.disabled = true;
    cancelButton.disabled = true;

    if (result === "success") {
        payButton.querySelector("span:first-child").textContent = "Processing...";
    } else {
        cancelButton.textContent = "Cancelling...";
    }

    try {
        const response = await fetch("/mock-ipg/process", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                authority,
                result
            })
        });

        if (!response.ok) {
            throw new Error("Payment processing failed.");
        }

        const data = await response.json();

        window.location.href = data.callbackUrl;

    } catch (error) {
        console.error(error);

        showError(error.message || "Payment processing failed.");

        payButton.disabled = false;
        cancelButton.disabled = false;

        payButton.querySelector("span:first-child").textContent = "Pay";
        cancelButton.textContent = "Cancel payment";
    }
}

function formatCardNumber(event) {
    let value = event.target.value.replace(/\D/g, "");

    value = value.substring(0, 16);
    value = value.replace(/(\d{4})(?=\d)/g, "$1 ");

    event.target.value = value;
}

function formatExpiry(event) {
    let value = event.target.value.replace(/\D/g, "");

    value = value.substring(0, 4);

    if (value.length >= 3) {
        value = `${value.substring(0, 2)} / ${value.substring(2)}`;
    }

    event.target.value = value;
}

function formatCvv(event) {
    event.target.value = event.target.value
        .replace(/\D/g, "")
        .substring(0, 4);
}

function formatPrice(price) {
    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
        return price;
    }

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(numericPrice);
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
}