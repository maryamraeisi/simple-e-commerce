const API_URL = "/api/payments";

const paymentTableBody = document.getElementById("paymentTableBody");
const emptyMessage = document.getElementById("emptyMessage");


document.addEventListener("DOMContentLoaded", loadPayments);


async function loadPayments() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load payments.");
        }

        const payments = await response.json();

        paymentTableBody.innerHTML = "";

        if (payments.length === 0) {
            emptyMessage.style.display = "block";
            return;
        }

        emptyMessage.style.display = "none";

        payments.forEach(payment => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${payment.id}</td>

                <td>${payment.orderId}</td>

                <td>${formatAmount(payment.amount)}</td>

                <td>
                    <span class="status ${getStatusClass(payment.status)}">
                        ${payment.status}
                    </span>
                </td>

                <td>
                    <a
                        href="payment-details.html?id=${payment.id}"
                        class="btn btn-small btn-secondary">
                        View
                    </a>
                </td>
            `;

            paymentTableBody.appendChild(row);
        });

    } catch (error) {

        console.error(error);

        paymentTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="error-message">
                    Failed to load payments.
                </td>
            </tr>
        `;
    }
}


function formatAmount(amount) {
    return Number(amount).toFixed(2);
}


function getStatusClass(status) {

    switch (status) {

        case "PENDING":
            return "status-pending";

        case "COMPLETED":
            return "status-completed";

        case "FAILED":
            return "status-failed";

        case "REFUNDED":
            return "status-refunded";

        default:
            return "";
    }
}