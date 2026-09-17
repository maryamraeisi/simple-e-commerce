const API_URL = "/api/payments";

const paymentForm = document.getElementById("payment-form");
const errorMessage = document.getElementById("errorMessage");


paymentForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    errorMessage.textContent = "";


    const orderId = Number(
        document.getElementById("orderId").value
    );

    const amount = Number(
        document.getElementById("amount").value
    );


    const request = {
        orderId: orderId,
        amount: amount
    };


    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(request)
        });


        if (!response.ok) {

            const errorText = await response.text();

            throw new Error(
                errorText || "Failed to create payment."
            );
        }


        const payment = await response.json();


        window.location.href =
            `payment-details.html?id=${payment.id}`;


    } catch (error) {

        console.error(error);

        errorMessage.textContent = error.message;
    }

});