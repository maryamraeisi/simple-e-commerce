const API_URL = "/api/customers";

document.addEventListener("DOMContentLoaded", loadCustomer);

async function loadCustomer() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        showError("Customer ID is missing.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`);

        if (!response.ok) {
            throw new Error("Customer not found");
        }

        const customer = await response.json();
        renderCustomer(customer);
    } catch (error) {
        console.error(error);
        showError("Failed to load customer.");
    }
}

function renderCustomer(customer) {
    const container = document.getElementById("customer-details");
    container.innerHTML = `
        <div class="customer-detail">
            <span class="label">ID</span>
            <span>${customer.id}</span>
        </div>

        <div class="customer-detail">
            <span class="label">First Name</span>
            <span>${customer.firstName}</span>
        </div>

        <div class="customer-detail">
            <span class="label">Last Name</span>
            <span>${customer.lastName}</span>
        </div>

        <div class="customer-detail">
            <span class="label">Email</span>
            <span>${customer.email}</span>
        </div>

        <div class="customer-detail">
            <span class="label">Phone Number</span>
            <span>${customer.phoneNumber ?? "-"}</span>
        </div>

        <div class="customer-detail">
            <span class="label">Created At</span>
            <span>${formatDate(customer.createdAt)}</span>
        </div>

        <div class="detail-actions">
            <a
                href="/customers/customer-form.html?id=${customer.id}"
                class="btn btn-warning">
                Edit Customer
            </a>
        </div>
    `;
}

function formatDate(dateString) {
    if (!dateString) {
        return "-";
    }

    return new Date(dateString).toLocaleString();
}

function showError(message) {
    document.getElementById("customer-details").innerHTML = `
        <div class="message error">
            ${message}
        </div>
    `;
}