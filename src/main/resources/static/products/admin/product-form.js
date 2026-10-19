
const API_URL = "/api/products";
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

const form = document.getElementById("product-form");
const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("image-preview");
const activeGroup = document.getElementById("active-group");
const submitButton = document.getElementById("submit-button");

let existingImageUrl = null;
let previewObjectUrl = null;

document.addEventListener("DOMContentLoaded", initializeForm);

async function initializeForm() {
    if (productId) {
        document.title = "Edit Product | Simple Shop Admin";
        document.getElementById("form-title").textContent = "Edit product";
        document.getElementById("form-description").textContent = "Update this product's information.";
        document.getElementById("breadcrumb-current").textContent = "Edit product";
        document.getElementById("image-hint").textContent =
            "Choose a new image only if you want to replace the current one.";
        submitButton.replaceChildren();
        submitButton.textContent = "Save changes";
        activeGroup.hidden = false;
        imageInput.required = false;

        await loadProduct();
    } else {
        activeGroup.hidden = true;
        imageInput.required = true;
    }
}

async function loadProduct() {
    try {
        const response = await fetch(`${API_URL}/${encodeURIComponent(productId)}`);

        if (!response.ok) {
            throw new Error("Product not found.");
        }

        const product = await response.json();

        document.getElementById("name").value = product.name ?? "";
        document.getElementById("description").value = product.description ?? "";
        document.getElementById("price").value = product.price ?? "";
        document.getElementById("active").checked = Boolean(product.active);

        existingImageUrl = product.imageUrl ?? null;

        if (existingImageUrl) {
            imagePreview.src = existingImageUrl;
            imagePreview.hidden = false;
        }
    } catch (error) {
        console.error(error);
        showMessage("Failed to load the product. It may no longer exist.", "error");
        submitButton.disabled = true;
    }
}

imageInput.addEventListener("change", () => {
    const file = imageInput.files?.[0];

    if (previewObjectUrl) {
        URL.revokeObjectURL(previewObjectUrl);
        previewObjectUrl = null;
    }

    if (!file) {
        if (existingImageUrl) {
            imagePreview.src = existingImageUrl;
            imagePreview.hidden = false;
        } else {
            imagePreview.removeAttribute("src");
            imagePreview.hidden = true;
        }
        return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        imageInput.value = "";
        showMessage("Choose a JPG, PNG, or WebP image.", "error");
        return;
    }

    previewObjectUrl = URL.createObjectURL(file);
    imagePreview.src = previewObjectUrl;
    imagePreview.hidden = false;
});

form.addEventListener("submit", async event => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const description = document.getElementById("description").value.trim();
    const priceValue = document.getElementById("price").value;
    const price = Number(priceValue);
    const imageFile = imageInput.files?.[0];

    if (!name) {
        showMessage("Product name is required.", "error");
        return;
    }

    if (priceValue === "" || !Number.isFinite(price) || price < 0) {
        showMessage("Enter a valid, non-negative price.", "error");
        return;
    }

    if (!productId && !imageFile) {
        showMessage("Please select a product image.", "error");
        return;
    }

    const product = { name, description, price };

    if (productId) {
        product.active = document.getElementById("active").checked;
    }

    const formData = new FormData();
    formData.append(
        "product",
        new Blob([JSON.stringify(product)], { type: "application/json" })
    );

    if (imageFile) {
        formData.append("image", imageFile);
    }

    submitButton.disabled = true;
    submitButton.textContent = productId ? "Saving changes..." : "Creating product...";

    try {
        const url = productId
            ? `${API_URL}/${encodeURIComponent(productId)}`
            : API_URL;

        const response = await fetch(url, {
            method: productId ? "PUT" : "POST",
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Product API error:", errorText);
            throw new Error("The server could not save the product.");
        }

        window.location.href = "/products/admin/products.html";
    } catch (error) {
        console.error(error);
        showMessage(
            productId ? "Failed to update the product." : "Failed to create the product.",
            "error"
        );
        submitButton.disabled = false;
        submitButton.textContent = productId ? "Save changes" : "Create product";
    }
});

function showMessage(message, type) {
    const element = document.getElementById("message");
    element.replaceChildren();

    const notice = document.createElement("div");
    notice.className = `message ${type}`;
    notice.textContent = message;
    element.appendChild(notice);

    element.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

window.addEventListener("beforeunload", () => {
    if (previewObjectUrl) {
        URL.revokeObjectURL(previewObjectUrl);
    }
});
