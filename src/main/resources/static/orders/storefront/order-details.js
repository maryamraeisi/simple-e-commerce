const API_URL = "/api/orders";

const loading = document.getElementById("loading");
const loginRequired = document.getElementById("login-required");
const errorMessage = document.getElementById("error-message");
const errorText = document.getElementById("error-text");
const retryButton = document.getElementById("retry-button");

const orderDetails = document.getElementById("order-details");

const orderNumber = document.getElementById("order-number");
const orderDate = document.getElementById("order-date");
const orderStatus = document.getElementById("order-status");

const orderItems = document.getElementById("order-items");
const itemsCount = document.getElementById("items-count");
const orderTotal = document.getElementById("order-total");

const cancelOrderButton =
    document.getElementById("cancel-order-button");


// =========================
// Initialization
// =========================

document.addEventListener("DOMContentLoaded", () => {
    loadOrder();
});

retryButton.addEventListener("click", () => {
    loadOrder();
});


// =========================
// Get Order ID
// =========================

function getOrderId() {

    const params =
        new URLSearchParams(window.location.search);

    return params.get("id");
}


// =========================
// Load Order
// =========================

async function loadOrder() {

    const id = getOrderId();

    if (!id) {
        showError("No order was specified.");
        return;
    }

    showOnly(loading);

    try {

        const response = await fetch(
            `${API_URL}/${encodeURIComponent(id)}`,
            {
                method: "GET",
                credentials: "same-origin",
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        if (
            response.status === 401 ||
            response.status === 403
        ) {
            showOnly(loginRequired);
            return;
        }

        if (response.status === 404) {
            showError(
                "The requested order could not be found."
            );
            return;
        }

        if (!response.ok) {
            throw new Error(
                `Failed to load order. Status: ${response.status}`
            );
        }

        const order = await response.json();

        renderOrder(order);

        showOnly(orderDetails);

    } catch (error) {

        console.error(
            "Error loading order:",
            error
        );

        showError(
            "We couldn't load this order. Please try again."
        );
    }
}


// =========================
// Render Order
// =========================

function renderOrder(order) {

    /*
     * Do not display the database order ID.
     */
    orderNumber.textContent = "Order";

    orderDate.textContent =
        formatDate(order.createdAt);

    const status =
        normalizeStatus(order.status);

    orderStatus.textContent =
        status;

    orderStatus.className =
        `order-status ${getStatusClass(status)}`;

    renderItems(order.items);

    const totalItems =
        calculateItemsCount(order.items);

    itemsCount.textContent =
        totalItems;

    orderTotal.textContent =
        formatPrice(order.totalPrice);


    if (isCancellable(order.status)) {

        cancelOrderButton.classList.remove(
            "hidden"
        );

        cancelOrderButton.onclick =
            () => cancelOrder(order.id);

    } else {

        cancelOrderButton.classList.add(
            "hidden"
        );
    }
}


// =========================
// Render Items
// =========================

function renderItems(items) {

    orderItems.innerHTML = "";

    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        orderItems.innerHTML = `
            <div class="state-message">
                <p>
                    No items found for this order.
                </p>
            </div>
        `;

        return;
    }

    items.forEach(item => {

        const element =
            document.createElement("div");

        element.className =
            "order-item";

        element.innerHTML = `
            ${createProductImage(item)}

            <div class="order-item-info">

                <p class="order-item-name">
                    ${escapeHtml(item.productName)}
                </p>

                <p class="order-item-meta">
                    ${item.quantity}
                    ×
                    ${formatPrice(item.unitPrice)}
                </p>

            </div>

            <span class="order-item-subtotal">
                ${formatPrice(item.subtotal)}
            </span>
        `;

        orderItems.appendChild(element);
    });
}


// =========================
// Product Image
// =========================

function createProductImage(item) {

    if (item.productImageUrl) {

        return `
            <div class="order-item-image-container">

                <img
                    src="${escapeHtml(item.productImageUrl)}"
                    alt="${escapeHtml(item.productName)}"
                    class="order-item-image"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                >

                <div
                    class="order-item-image-placeholder"
                    style="display: none;">
                    No image
                </div>

            </div>
        `;
    }

    return `
        <div class="order-item-image-container">

            <div class="order-item-image-placeholder">
                No image
            </div>

        </div>
    `;
}


// =========================
// Cancel Order
// =========================

async function cancelOrder(orderId) {

    const confirmed =
        window.confirm(
            "Are you sure you want to cancel this order?"
        );

    if (!confirmed) {
        return;
    }

    cancelOrderButton.disabled = true;

    cancelOrderButton.textContent =
        "Cancelling...";

    try {

        const response = await fetch(
            `${API_URL}/${encodeURIComponent(orderId)}/cancel`,
            {
                method: "PATCH",

                credentials: "same-origin",

                headers: {
                    "Accept": "application/json"
                }
            }
        );

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            window.location.href =
                `/auth/login.html?redirect=${encodeURIComponent(
                    window.location.pathname +
                    window.location.search
                )}`;

            return;
        }

        if (!response.ok) {

            let message =
                "Unable to cancel the order.";

            try {

                const data =
                    await response.json();

                if (data.message) {
                    message = data.message;
                }

            } catch {
                // Response may not contain JSON.
            }

            throw new Error(message);
        }

        /*
         * Reload the order so the new status
         * comes directly from the backend.
         */
        await loadOrder();

    } catch (error) {

        console.error(
            "Error cancelling order:",
            error
        );

        alert(
            error.message ||
            "Unable to cancel the order."
        );

        cancelOrderButton.disabled =
            false;

        cancelOrderButton.textContent =
            "Cancel Order";
    }
}


// =========================
// Helpers
// =========================

function calculateItemsCount(items) {

    if (!Array.isArray(items)) {
        return 0;
    }

    return items.reduce(
        (total, item) => {
            return total +
                Number(item.quantity || 0);
        },
        0
    );
}


function isCancellable(status) {

    if (!status) {
        return false;
    }

    const normalized =
        String(status)
            .toLowerCase()
            .replace(/_/g, " ");

    return [
        "pending",
        "confirmed"
    ].includes(normalized);
}


function normalizeStatus(status) {

    if (!status) {
        return "unknown";
    }

    return String(status)
        .toLowerCase()
        .replace(/_/g, " ");
}


function getStatusClass(status) {

    const normalized =
        status
            .toLowerCase()
            .replace(/\s+/g, "-");

    const knownStatuses = [
        "pending",
        "confirmed",
        "paid",
        "completed",
        "cancelled",
        "failed"
    ];

    if (knownStatuses.includes(normalized)) {
        return `status-${normalized}`;
    }

    return "status-default";
}


function formatPrice(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "—";
    }

    const number =
        Number(value);

    if (Number.isNaN(number)) {
        return String(value);
    }

    return new Intl.NumberFormat(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ).format(number);
}


function formatDate(value) {

    if (!value) {
        return "Date unavailable";
    }

    const date =
        new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    ).format(date);
}


function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =========================
// UI State
// =========================

function showOnly(element) {
    const elements = [
        loading,
        loginRequired,
        errorMessage,
        orderDetails
    ];

    elements.forEach(item => {
        item.classList.add("hidden");
    });

    element.classList.remove("hidden");
}


function showError(message) {
    errorText.textContent = message;
    showOnly(errorMessage);
}