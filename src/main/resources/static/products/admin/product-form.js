const API_URL = "/api/products";
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
const form = document.getElementById("product-form");
const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("image-preview");
let existingImageUrl = null;
document.addEventListener("DOMContentLoaded", initializeForm);

async function initializeForm() {
    if (productId) {
        document.getElementById("form-title").textContent = "Edit Product";
        document.getElementById("form-description").textContent = "Update product information";
        document.getElementById("submit-button").textContent = "Update Product";
        await loadProduct();
    } else {
        document.getElementById("active-group").style.display = "none";
        imageInput.required = true;
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
        document.getElementById("active").checked = product.active;
        existingImageUrl = product.imageUrl ?? null;
        if (product.imageUrl) {
            imagePreview.src = product.imageUrl;
            imagePreview.style.display = "block";
        }
    } catch (error) {
        console.error(error);
        showMessage("Failed to load product.", "error");
    }
}

imageInput.addEventListener("change", function () {
    const file = imageInput.files[0];
    if (!file) {
        imagePreview.src = "";
        imagePreview.style.display = "none";
        return;
    }
    const imageUrl = URL.createObjectURL(file);
    imagePreview.src = imageUrl;
    imagePreview.style.display = "block";
});
form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const name = document.getElementById("name").value.trim();
    const description = document.getElementById("description").value.trim();
    const price = document.getElementById("price").value;
    try {
        let response;
        if (productId) { /* * UPDATE PRODUCT */
            const active = document.getElementById("active").checked;
            const product = {name, description, price: Number(price), active};
            const formData = new FormData();
            formData.append("product", new Blob([JSON.stringify(product)], {type: "application/json"}));
            const imageFile = imageInput.files[0];
            if (imageFile) {
                formData.append("image", imageFile);
            }
            response = await fetch(`${API_URL}/${productId}`, {method: "PUT", body: formData});
        } else { /* * CREATE PRODUCT */
            const imageFile = imageInput.files[0];
            if (!imageFile) {
                showMessage("Please select a product image.", "error");
                return;
            }
            const product = {name, description, price: Number(price)};
            const formData = new FormData();
            formData.append("product", new Blob([JSON.stringify(product)], {type: "application/json"}));
            formData.append("image", imageFile);
            response = await fetch(API_URL, {method: "POST", body: formData});
        }
        if (!response.ok) {
            const errorText = await response.text();
            console.error(errorText);
            throw new Error("Request failed");
        }
        window.location.href = "products.html";
    } catch (error) {
        console.error(error);
        showMessage(productId ? "Failed to update product." : "Failed to create product.", "error");
    }
});

function showMessage(message, type) {
    const element = document.getElementById("message");
    element.innerHTML = `<div class="message ${type}">${message}</div>`;
}