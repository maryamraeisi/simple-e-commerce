const API_URL = "/api/customers";
const params = new URLSearchParams(window.location.search);
const customerId = params.get("id");
const form = document.getElementById("customer-form");

document.addEventListener("DOMContentLoaded", initializeForm);

async function initializeForm() {
    if (customerId) {
        document.getElementById("form-title").textContent = "Edit Customer";
        document.getElementById("form-description").textContent = "Update customer information";
        document.getElementById("submit-button").textContent = "Update Customer";
        await loadCustomer();
    }
}

async function loadCustomer() {
    try {
        const response = await fetch(`${API_URL}/${customerId}`);

        if (!response.ok) {
            throw new Error("Customer not found");
        }

        const customer = await response.json();

        document.getElementById("firstName").value = customer.firstName;
        document.getElementById("lastName").value = customer.lastName;
        document.getElementById("email").value = customer.email;
        document.getElementById("phoneNumber").value = customer.phoneNumber ?? "";
        // Email cannot be updated
        document.getElementById("email").disabled = true;
    } catch (error) {
        console.error(error);
        showMessage("Failed to load customer.", "error");
    }
}

form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;
        const email = document.getElementById("email").value;
        const phoneNumber = document.getElementById("phoneNumber").value;

        let url;
        let method;
        let body;

        if (customerId) {
            // UpdateCustomerRequest
            url = `${API_URL}/${customerId}`;
            method = "PUT";
            body = {firstName, lastName, phoneNumber};
        } else {
            // CreateCustomerRequest
            url = API_URL;
            method = "POST";
            body = {firstName, lastName, email, phoneNumber};
        }

        try {
            const response = await fetch(url,
                {
                    method: method,
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(body)
                }
            );

            if (!response.ok) {
                throw new Error("Request failed");
            }

            window.location.href = "/customers/customers.html";
        } catch (error) {
            console.error(error);
            showMessage(customerId ? "Failed to update customer." : "Failed to create customer.", "error");
        }

    }
);

function showMessage(message, type) {
    const element = document.getElementById("message");
    element.innerHTML = `
        <div class="message ${type}">
            ${message}
        </div>
    `;
}