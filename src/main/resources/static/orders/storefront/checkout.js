const ORDER_API = "/api/orders";
const PAYMENT_API = "/api/payments";

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");
const checkoutContent = document.getElementById("checkout-content");
const orderItems = document.getElementById("order-items");
const orderTotal = document.getElementById("order-total");
const orderStatus = document.getElementById("order-status");
const payButton = document.getElementById("pay-button");

document.addEventListener("DOMContentLoaded", () => {
    payButton.addEventListener("click", payOrder);
    loadOrder();
});

async function loadOrder() {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("id");

    if (!orderId) {
        showError("Order not found.");
        loading.hidden = true;
        return;
    }

    try {
        const response = await fetch(`${ORDER_API}/${orderId}`);

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = `/auth/login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
                return;
            }

            if (response.status === 403) {
                throw new Error("You do not have permission to view this order.");
            }

            throw new Error("Failed to load order.");
        }

        const order = await response.json();

        loading.hidden = true;
        checkoutContent.hidden = false;

        renderOrder(order);

    } catch (error) {
        console.error(error);

        loading.hidden = true;
        showError(error.message || "Failed to load order. Please try again later.");
    }
}

function renderOrder(order) {
    orderItems.innerHTML = "";

    order.items.forEach(item => {
        const element = createOrderItem(item);
        orderItems.appendChild(element);
    });

    orderTotal.textContent = formatPrice(order.totalPrice);
    orderStatus.textContent = formatStatus(order.status);

    if (order.status !== "CREATED") {
        payButton.hidden = true;
    }
}

function createOrderItem(item) {
    const container = document.createElement("div");
    container.className = "order-item";

    container.innerHTML = `
        <div class="order-item-product">

            <div class="order-item-image-container">
                ${
        item.productImageUrl
            ? `
                            <img
                                src="${item.productImageUrl}"
                                alt="${escapeHtml(item.productName)}"
                                class="order-item-image">
                        `
            : `
                            <div class="order-item-image-placeholder">
                                No image
                            </div>
                        `
    }
            </div>

            <div class="order-item-info">
                <h3>${escapeHtml(item.productName)}</h3>
                <p>Quantity: ${item.quantity}</p>
            </div>

        </div>

        <div class="order-item-price">
            ${formatPrice(item.subtotal)}
        </div>
    `;

    return container;
}

async function payOrder() {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("id");

    if (!orderId) {
        showError("Order not found.");
        return;
    }

    payButton.disabled = true;
    payButton.textContent = "Processing...";

    try {
        const response = await fetch(PAYMENT_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                orderId: Number(orderId)
            })
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = `/auth/login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
                return;
            }

            if (response.status === 400) {
                const error = await response.json().catch(() => null);
                throw new Error(error?.message || "Unable to create payment.");
            }

            throw new Error("Unable to create payment.");
        }

        const payment = await response.json();

        if (!payment.paymentUrl) {
            throw new Error("Payment gateway URL was not returned.");
        }

        window.location.href = payment.paymentUrl;

    } catch (error) {
        console.error(error);

        showError(error.message || "Payment could not be started.");

        payButton.disabled = false;
        payButton.textContent = "Pay Now";
    }
}

function formatStatus(status) {
    switch (status) {
        case "CREATED":
            return "Awaiting Payment";
        case "PAID":
            return "Paid";
        case "CANCELLED":
            return "Cancelled";
        default:
            return status;
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

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
}