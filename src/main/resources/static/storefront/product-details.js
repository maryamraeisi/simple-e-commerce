const API_URL = "/api/products";

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");
const productDetails = document.getElementById("product-details");

const productImage = document.getElementById("product-image");
const imagePlaceholder = document.getElementById("image-placeholder");

const productName = document.getElementById("product-name");
const productPrice = document.getElementById("product-price");
const productDescription = document.getElementById("product-description");

const quantityInput = document.getElementById("quantity");
const decreaseQuantityButton =
    document.getElementById("decrease-quantity");
const increaseQuantityButton =
    document.getElementById("increase-quantity");

const addToCartButton =
    document.getElementById("add-to-cart-button");

document.addEventListener(
    "DOMContentLoaded",
    initializeProductDetails
);

async function initializeProductDetails() {

    const productId = getProductIdFromUrl();

    if (!productId) {
        showError("Product ID is missing.");
        return;
    }

    setupQuantityControls();

    await loadProduct(productId);

}

function getProductIdFromUrl() {

    const params =
        new URLSearchParams(window.location.search);

    return params.get("id");

}

async function loadProduct(productId) {

    try {

        const response =
            await fetch(`${API_URL}/${productId}`);

        if (response.status === 404) {
            throw new Error("Product not found.");
        }

        if (!response.ok) {
            throw new Error("Failed to load product.");
        }

        const product =
            await response.json();

        if (!product.active) {
            throw new Error("This product is not available.");
        }

        renderProduct(product);

        loading.hidden = true;
        productDetails.hidden = false;

    } catch (error) {

        console.error(error);

        loading.hidden = true;

        showError(
            error.message ||
            "Failed to load product. Please try again later."
        );
    }

}

function renderProduct(product) {

    productName.textContent =
        product.name;

    productPrice.textContent =
        formatPrice(product.price);

    productDescription.textContent =
        product.description ||
        "No description available.";


    if (product.imageUrl) {

        productImage.src =
            product.imageUrl;

        productImage.alt =
            product.name;

        productImage.hidden = false;
        imagePlaceholder.hidden = true;

        productImage.onerror = function () {

            productImage.hidden = true;
            imagePlaceholder.hidden = false;
        };

    } else {

        productImage.hidden = true;
        imagePlaceholder.hidden = false;
    }

}

function setupQuantityControls() {

    decreaseQuantityButton.addEventListener(
        "click",
        decreaseQuantity
    );

    increaseQuantityButton.addEventListener(
        "click",
        increaseQuantity
    );

    quantityInput.addEventListener(
        "change",
        validateQuantity
    );

    addToCartButton.addEventListener(
        "click",
        addToCart
    );

}

function decreaseQuantity() {

    const quantity =
        getQuantity();

    if (quantity > 1) {
        quantityInput.value =
            quantity - 1;
    }

}

function increaseQuantity() {

    const quantity =
        getQuantity();

    quantityInput.value =
        quantity + 1;

}

function validateQuantity() {

    let quantity =
        parseInt(quantityInput.value, 10);

    if (Number.isNaN(quantity) || quantity < 1) {
        quantity = 1;
    }

    quantityInput.value = quantity;

}

function getQuantity() {

    let quantity =
        parseInt(quantityInput.value, 10);

    if (Number.isNaN(quantity) || quantity < 1) {
        quantity = 1;
    }

    return quantity;

}

function addToCart() {

    const productId =
        getProductIdFromUrl();

    const quantity =
        getQuantity();

    const cartItem = {
        productId: Number(productId),
        quantity: quantity
    };

    console.log("Add to cart:", cartItem);

    /*
     * Cart functionality will be implemented
     * in the next step.
     */

    addToCartButton.textContent =
        "Added to Cart";

    addToCartButton.disabled = true;

    setTimeout(() => {

        addToCartButton.textContent =
            "Add to Cart";

        addToCartButton.disabled = false;

    }, 1500);

}

function showError(message) {

    errorMessage.textContent =
        message;

    errorMessage.hidden = false;

}

function formatPrice(price) {

    const numericPrice =
        Number(price);

    if (Number.isNaN(numericPrice)) {
        return price;
    }

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(numericPrice);

}