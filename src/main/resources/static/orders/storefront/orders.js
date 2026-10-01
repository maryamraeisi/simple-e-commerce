const API_URL = "/api/orders";

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");
const errorText = document.getElementById("error-text");
const retryButton = document.getElementById("retry-button");

const loginRequired = document.getElementById("login-required");
const emptyOrders = document.getElementById("empty-orders");
const ordersList = document.getElementById("orders-list");


// =========================
// Initialization
// =========================

document.addEventListener("DOMContentLoaded", () => {
    loadOrders();
});

retryButton.addEventListener("click", () => {
    loadOrders();
});


// =========================
// Load Orders
// =========================

async function loadOrders() {

    showOnly(loading);

    try {

        const response = await fetch(API_URL, {
            method: "GET",
            credentials: "same-origin",
            headers: {
                "Accept": "application/json"
            }
        });

        if (response.status === 401 || response.status === 403) {
            showOnly(loginRequired);
            return;
        }

        if (!response.ok) {
            throw new Error(
                `Failed to load orders. Status: ${response.status}`
            );
        }

        const orders = await response.json();

        if (!Array.isArray(orders) || orders.length === 0) {
            showOnly(emptyOrders);
            return;
        }

        /*
         * Newest order first.
         *
         * The displayed order number is based on this
         * sorted position, not on the database ID.
         */
        const sortedOrders = [...orders].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        renderOrders(sortedOrders);

        showOnly(ordersList);

    } catch (error) {

        console.error("Error loading orders:", error);

        errorText.textContent =
            "We couldn't load your orders. Please try again.";

        showOnly(errorMessage);
    }
}


// =========================
// Render Orders
// =========================

function renderOrders(orders) {

    ordersList.innerHTML = "";

    orders.forEach((order, index) => {

        const orderNumber = index + 1;

        const orderCard = createOrderCard(
            order,
            orderNumber
        );

        ordersList.appendChild(orderCard);
    });
}


// =========================
// Create Order Card
// =========================

function createOrderCard(order, orderNumber) {

    const card = document.createElement("article");

    card.className = "order-card";

    const status = normalizeStatus(order.status);

    const formattedDate = formatDate(order.createdAt);

    card.innerHTML = `
        <div class="order-number">
            ${orderNumber}.
        </div>

        <div class="order-card-content">

            <div class="order-card-header">

                <div class="order-info">

                    <h2>
                        Order
                    </h2>

                    <p class="order-date">
                        ${formattedDate}
                    </p>

                </div>

                <span class="order-status ${getStatusClass(status)}">
                    ${escapeHtml(status)}
                </span>

            </div>


            <div class="order-items">

                ${createOrderItems(order.items)}

            </div>


            <div class="order-card-footer">

                <div>
                    <span class="total-label">
                        Total
                    </span>

                    <div class="order-total">
                        ${formatPrice(order.totalPrice)}
                    </div>
                </div>


                <div class="order-actions">

                    <a
                        href="/orders/storefront/order-details.html?id=${encodeURIComponent(order.id)}"
                        class="view-order-button">
                        View Details
                    </a>

                    ${createCancelButton(order)}

                </div>

            </div>

        </div>
    `;

    const cancelButton =
        card.querySelector(".cancel-order-button");

    if (cancelButton) {

        cancelButton.addEventListener("click", () => {
            cancelOrder(order.id, cancelButton);
        });
    }

    return card;
}


// =========================
// Order Items
// =========================

function createOrderItems(items) {

    if (!Array.isArray(items) || items.length === 0) {

        return `
            <p class="product-quantity">
                No items found.
            </p>
        `;
    }

    return items.map(item => {

        const image = createProductImage(item);

        return `
            <div class="order-item">

                ${image}

                <div class="order-item-info">

                    <p class="order-item-name">
                        ${escapeHtml(item.productName)}
                    </p>

                    <p class="order-item-meta">
                        ${item.quantity} × ${formatPrice(item.unitPrice)}
                    </p>

                </div>

                <span class="order-item-subtotal">
                    ${formatPrice(item.subtotal)}
                </span>

            </div>
        `;

    }).join("");
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
// Cancel Button
// =========================

function createCancelButton(order) {

    const status = normalizeStatus(order.status);

    const cancellableStatuses = [
        "pending",
        "confirmed"
    ];

    if (!cancellableStatuses.includes(status)) {
        return "";
    }

    return `
        <button
            type="button"
            class="danger-button cancel-order-button">
            Cancel Order
        </button>
    `;
}


// =========================
// Cancel Order
// =========================

async function cancelOrder(orderId, button) {

    const confirmed = window.confirm(
        "Are you sure you want to cancel this order?"
    );

    if (!confirmed) {
        return;
    }

    button.disabled = true;
    button.textContent = "Cancelling...";

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

        if (response.status === 401 || response.status === 403) {

            window.location.href =
                `/auth/login.html?redirect=${encodeURIComponent(
                    window.location.pathname
                )}`;

            return;
        }

        if (!response.ok) {

            let message =
                "Unable to cancel the order.";

            try {

                const data = await response.json();

                if (data.message) {
                    message = data.message;
                }

            } catch {
                // Response may not contain JSON.
            }

            throw new Error(message);
        }

        await loadOrders();

    } catch (error) {

        console.error("Error cancelling order:", error);

        alert(
            error.message ||
            "Unable to cancel the order. Please try again."
        );

        button.disabled = false;
        button.textContent = "Cancel Order";
    }
}


// =========================
// Formatting
// =========================

function formatPrice(value) {

    if (value === null || value === undefined) {
        return "—";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return escapeHtml(String(value));
    }

    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(number);
}


function formatDate(value) {

    if (!value) {
        return "Date unavailable";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return escapeHtml(String(value));
    }

    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    }).format(date);
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

    const normalized = status
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


// =========================
// Security
// =========================

function escapeHtml(value) {

    if (value === null || value === undefined) {
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
        errorMessage,
        loginRequired,
        emptyOrders,
        ordersList
    ];

    elements.forEach(item => {
        item.classList.add("hidden");
    });

    element.classList.remove("hidden");
}