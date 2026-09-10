const API_URL = "/api/products";
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
const form = document.getElementById("product-form");

document.addEventListener("DOMContentLoaded", initializeForm);

async function initializeForm() {
    if (productId) {
        document.getElementById("form-title").textContent = "Edit Product";
        document.getElementById("form-description").textContent = "Update product information";
        document.getElementById("submit-button").textContent = "Update Product";

        await loadProduct();
    } else {
        // Create mode
        // Active isn't part of CreateProductRequest.
        document.getElementById("active-group").style.display = "none";
    }
}

async function loadProduct() {
    try {
        const response = await fetch(`${API_URL}/${productId}`);

        if (!response.ok) {
            throw new Error("Product not found");
        }

        const product = await response.json();

        document.getElementById("name").value = product.name;
        document.getElementById("description").value = product.description ?? "";
        document.getElementById("price").value = product.price;
        document.getElementById("imageUrl").value = product.imageUrl ?? "";
        document.getElementById("active").checked = product.active;
    } catch (error) {
        console.error(error);
        showMessage("Failed to load product.", "error");
    }
}

form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const description = document.getElementById("description").value;
        const price = document.getElementById("price").value;
        const imageUrl = document.getElementById("imageUrl").value;

        let url;
        let method;
        let body;

        if (productId) {
            // UpdateProductRequest
            const active = document.getElementById("active").checked;
            url = `${API_URL}/${productId}`;
            method = "PUT";
            body = {name, description, price: Number(price), imageUrl, active};
        } else {
            // CreateProductRequest
            url = API_URL;
            method = "POST";
            body = {name, description, price: Number(price), imageUrl};
        }

        try {
            const response = await fetch(url,
                    {
                        method,
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify(body)
                    }
                    );

            if (!response.ok) {
                throw new Error("Request failed");
            }

            window.location.href = "/products/products.html";

        } catch (error) {
            console.error(error);
            showMessage(productId ? "Failed to update product." : "Failed to create product.", "error");
        }

    }
);


function showMessage(message, type) {
    const element = document.getElementById("message");
    element.innerHTML = `<div class="message ${type}">${message}</div>`;
}