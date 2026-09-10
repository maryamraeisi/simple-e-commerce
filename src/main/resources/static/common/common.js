/**
 * Get a query parameter from the current URL.
 *
 * Example:
 * /products/product-details.html?id=5
 *
 * getQueryParam("id") -> "5"
 */
function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}


/**
 * Display an error message in an element.
 */
function showError(elementId, message) {
    const element = document.getElementById(elementId);

    if (!element) {
        console.error(message);
        return;
    }

    element.textContent = message;
    element.classList.remove("message-success");
    element.classList.add("message-error");
}


/**
 * Display a success message in an element.
 */
function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);

    if (!element) {
        console.log(message);
        return;
    }

    element.textContent = message;
    element.classList.remove("message-error");
    element.classList.add("message-success");
}


/**
 * Format a number as a price.
 */
function formatPrice(price) {
    return Number(price).toFixed(2);
}


/**
 * Format an ISO date/time string.
 *
 * Example:
 * 2026-09-10T15:30:00
 */
function formatDateTime(dateTime) {
    if (!dateTime) {
        return "";
    }

    return new Date(dateTime).toLocaleString();
}


/**
 * Make a DELETE request.
 */
async function deleteResource(url) {
    const response = await fetch(url, {
        method: "DELETE"
    });

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    return response;
}