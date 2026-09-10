const API_URL = "/api/customers";

document.addEventListener("DOMContentLoaded", loadCustomers);

async function loadCustomers() {
    const tableBody = document.getElementById("customer-table-body");

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load customers");
        }

        const customers = await response.json();

        tableBody.innerHTML = "";

        if (customers.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty">
                        No customers found.
                    </td>
                </tr>
            `;
            return;
        }

        customers.forEach(customer => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${customer.id}</td>
                <td>
                    <strong>
                        ${customer.firstName} ${customer.lastName}
                    </strong>
                </td>
                <td>${customer.email}</td>
                <td>${customer.phoneNumber ?? "-"}</td>
                <td>${formatDate(customer.createdAt)}</td>
                <td class="actions">
                    <a
                        href="/customers/customer-details.html?id=${customer.id}"
                        class="btn btn-small">
                        View
                    </a>

                    <a
                        href="/customers/customer-form.html?id=${customer.id}"
                        class="btn btn-small btn-warning">
                        Edit
                    </a>

                    <button
                        class="btn btn-small btn-danger"
                        onclick="deleteCustomer(${customer.id})">
                        Delete
                    </button>

                </td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error(error);
        showMessage("Failed to load customers.", "error");
    }
}

async function deleteCustomer(id) {
    const confirmed = confirm("Are you sure you want to delete this customer?");

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {method: "DELETE"});

        if (!response.ok) {
            throw new Error("Failed to delete customer");
        }

        showMessage("Customer deleted successfully.", "success");

        await loadCustomers();
    } catch (error) {
        console.error(error);
        showMessage("Failed to delete customer.", "error");
    }
}

function formatDate(dateString) {
    if (!dateString) {
        return "-";
    }

    return new Date(dateString).toLocaleString();
}

function showMessage(message, type) {
    const element = document.getElementById("message");
    element.innerHTML = `
        <div class="message ${type}">
            ${message}
        </div>
    `;

    setTimeout(() => {
        element.innerHTML = "";
    }, 3000);
}