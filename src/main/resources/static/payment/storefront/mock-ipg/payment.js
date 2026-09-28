const PAYMENT_API = "/api/payments";

const loading = document.getElementById("loading");
const paymentContent = document.getElementById("payment-content");
const errorMessage = document.getElementById("error-message");

const paymentAmount = document.getElementById("payment-amount");
const paymentAuthority = document.getElementById("payment-authority");

const payButton = document.getElementById("pay-button");
const cancelButton = document.getElementById("cancel-button");

document.addEventListener("DOMContentLoaded", loadPayment);

async function loadPayment() {
    const params = new URLSearchParams(window.location.search);
    const authority = params.get("authority");

    if (!authority) {
        showError("Invalid payment request.");
        return;
    }

    paymentAuthority.textContent = authority;

    /*
     * We will add a backend endpoint for retrieving the payment
     * information associated with this authority.
     */
    try {
        const response = await fetch(`${PAYMENT_API}/authority/${encodeURIComponent(authority)}`);

        if (!response.ok) {
            throw new Error("Payment not found.");
        }

        const payment = await response.json();

        paymentAmount.textContent = formatPrice(payment.amount);

        loading.hidden = true;
        paymentContent.hidden = false;

    } catch (error) {
        console.error(error);
        loading.hidden = true;
        showError(error.message || "Failed to load payment.");
    }
}

payButton.addEventListener("click", () => processPayment("success"));
cancelButton.addEventListener("click", () => processPayment("cancelled"));

async function processPayment(result) {
    payButton.disabled = true;
    cancelButton.disabled = true;

    try {
        const params = new URLSearchParams(window.location.search);
        const authority = params.get("authority");

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
    }
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