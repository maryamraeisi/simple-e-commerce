const API_URL = "/api/payments";


const params = new URLSearchParams(window.location.search);

const paymentId = params.get("id");


const loadingMessage =
    document.getElementById("loadingMessage");

const paymentDetails =
    document.getElementById("paymentDetails");

const errorMessage =
    document.getElementById("errorMessage");

const completeButton =
    document.getElementById("completeButton");

const failButton =
    document.getElementById("failButton");

const actionButtons =
    document.getElementById("actionButtons");


document.addEventListener("DOMContentLoaded", loadPayment);


async function loadPayment() {

    if (!paymentId) {

        showError("Payment ID is missing.");

        return;
    }


    try {

        const response =
            await fetch(`${API_URL}/${paymentId}`);


        if (!response.ok) {
            throw new Error("Failed to load payment.");
        }


        const payment = await response.json();


        displayPayment(payment);


    } catch (error) {

        console.error(error);

        showError(error.message);
    }
}


function displayPayment(payment) {

    loadingMessage.style.display = "none";

    paymentDetails.style.display = "block";


    document.getElementById("paymentId").textContent =
        payment.id;


    document.getElementById("orderId").textContent =
        payment.orderId;


    document.getElementById("amount").textContent =
        formatAmount(payment.amount);


    const statusElement =
        document.getElementById("status");


    statusElement.textContent =
        payment.status;


    statusElement.className =
        `status ${getStatusClass(payment.status)}`;


    updateActionButtons(payment.status);
}


function updateActionButtons(status) {

    /*
     * A payment can only be completed or failed
     * while it is PENDING.
     */

    if (status === "PENDING") {

        actionButtons.style.display = "flex";

        completeButton.style.display = "inline-block";
        failButton.style.display = "inline-block";

        return;
    }


    actionButtons.style.display = "none";
}


completeButton.addEventListener(
    "click",
    () => changePaymentStatus("complete")
);


failButton.addEventListener(
    "click",
    () => changePaymentStatus("fail")
);


async function changePaymentStatus(action) {

    const confirmed = confirm(
        action === "complete"
            ? "Are you sure you want to complete this payment?"
            : "Are you sure you want to fail this payment?"
    );


    if (!confirmed) {
        return;
    }


    try {

        completeButton.disabled = true;
        failButton.disabled = true;


        const response =
            await fetch(
                `${API_URL}/${paymentId}/${action}`,
                {
                    method: "POST"
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText || "Failed to update payment."
            );
        }


        const payment =
            await response.json();


        displayPayment(payment);


    } catch (error) {

        console.error(error);

        showError(error.message);

        completeButton.disabled = false;
        failButton.disabled = false;
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


function showError(message) {

    loadingMessage.style.display = "none";
    paymentDetails.style.display = "none";

    errorMessage.textContent = message;
}