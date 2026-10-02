const API_URL = "/api/products";
const CART_API = "/api/cart/items";

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");
const productDetails = document.getElementById("product-details");
const productImage = document.getElementById("product-image");
const imagePlaceholder = document.getElementById("image-placeholder");
const productName = document.getElementById("product-name");
const productPrice = document.getElementById("product-price");
const productDescription = document.getElementById("product-description");
const quantityInput = document.getElementById("quantity");
const decreaseQuantityButton = document.getElementById("decrease-quantity");
const increaseQuantityButton = document.getElementById("increase-quantity");
const addToCartButton = document.getElementById("add-to-cart-button");

let availableStock = 0;

document.addEventListener("DOMContentLoaded", initializeProductDetails);

/* =========================================================
   Initialize
   ========================================================= */

async function initializeProductDetails() {
    const productId = getProductIdFromUrl();

    if (!productId) {
        showError("Product ID is missing.");
        return;
    }

    setupQuantityControls();
    await loadProduct(productId);
}

/* =========================================================
   Get product ID
   ========================================================= */

function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

/* =========================================================
   Load product
   ========================================================= */

async function loadProduct(productId) {
    try {
        const response = await fetch(`${API_URL}/${productId}`);

        if (response.status === 404) {
            throw new Error("Product not found.");
        }

        if (!response.ok) {
            throw new Error("Failed to load product.");
        }

        const product = await response.json();

        if (!product.active) {
            throw new Error("This product is not available.");
        }

        availableStock = Number(product.available) || 0;
        renderProduct(product);

        loading.hidden = true;
        productDetails.hidden = false;
    } catch (error) {
        console.error(error);
        loading.hidden = true;
        showError(error.message || "Failed to load product. Please try again later.");
    }
}

/* =========================================================
   Render product
   ========================================================= */

function renderProduct(product) {
    productName.textContent = product.name;
    productPrice.textContent = formatPrice(product.price);
    productDescription.textContent = product.description || "No description available.";

    if (product.imageUrl) {
        productImage.src = product.imageUrl;
        productImage.alt = product.name;
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

    renderStockStatus();

    quantityInput.max = Math.max(availableStock, 1);
    quantityInput.value = availableStock > 0 ? 1 : 0;
    quantityInput.disabled = availableStock <= 0;

    updateQuantityControls();

    addToCartButton.disabled = availableStock <= 0;
    addToCartButton.textContent = availableStock <= 0 ? "Out of Stock" : "Add to Cart";
}

/* =========================================================
   Stock status
   ========================================================= */

function renderStockStatus() {
    let stockElement = document.getElementById("product-stock");

    if (!stockElement) {
        stockElement = document.createElement("p");
        stockElement.id = "product-stock";
        stockElement.className = "product-stock";
        productPrice.insertAdjacentElement("afterend", stockElement);
    }

    stockElement.classList.remove("in-stock", "out-of-stock");

    if (availableStock <= 0) {
        stockElement.classList.add("out-of-stock");
        stockElement.textContent = "Out of stock";
    } else {
        stockElement.classList.add("in-stock");
        stockElement.textContent = `${availableStock} remaining`;
    }
}

/* =========================================================
   Quantity controls
   ========================================================= */

function setupQuantityControls() {
    decreaseQuantityButton.addEventListener("click", decreaseQuantity);
    increaseQuantityButton.addEventListener("click", increaseQuantity);
    quantityInput.addEventListener("change", validateQuantity);
    quantityInput.addEventListener("input", validateQuantity);
    addToCartButton.addEventListener("click", addToCart);
}

function decreaseQuantity() {
    const quantity = getQuantity();

    if (quantity > 1) {
        quantityInput.value = quantity - 1;
    }

    updateQuantityControls();
}

function increaseQuantity() {
    const quantity = getQuantity();

    if (quantity < availableStock) {
        quantityInput.value = quantity + 1;
    }

    updateQuantityControls();
}

function validateQuantity() {
    let quantity = parseInt(quantityInput.value, 10);

    if (Number.isNaN(quantity) || quantity < 1) {
        quantity = availableStock > 0 ? 1 : 0;
    }

    if (availableStock > 0 && quantity > availableStock) {
        quantity = availableStock;
    }

    quantityInput.value = quantity;
    updateQuantityControls();
}

function updateQuantityControls() {
    const quantity = getQuantity();

    decreaseQuantityButton.disabled = availableStock <= 0 || quantity <= 1;
    increaseQuantityButton.disabled = availableStock <= 0 || quantity >= availableStock;
}

function getQuantity() {
    let quantity = parseInt(quantityInput.value, 10);

    if (Number.isNaN(quantity) || quantity < 1) {
        quantity = 1;
    }

    if (availableStock > 0 && quantity > availableStock) {
        quantity = availableStock;
    }

    return quantity;
}

/* =========================================================
   Add to cart
   ========================================================= */

async function addToCart() {
    const productId = getProductIdFromUrl();
    const quantity = getQuantity();

    if (availableStock <= 0) {
        return;
    }

    if (quantity > availableStock) {
        alert(`Only ${availableStock} item(s) available.`);
        return;
    }

    addToCartButton.disabled = true;
    addToCartButton.textContent = "Adding...";

    try {
        const response = await fetch(CART_API, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                productId: Number(productId),
                quantity
            })
        });

        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || "Failed to add product to cart.");
        }

        await response.json();
        showAddedToCart();
    } catch (error) {
        console.error(error);
        addToCartButton.textContent = "Add to Cart";
        addToCartButton.disabled = false;
        alert(error.message || "Failed to add product to cart.");
    }
}

/* =========================================================
   Added to cart
   ========================================================= */

function showAddedToCart() {
    addToCartButton.textContent = "Added to Cart";

    setTimeout(() => {
        addToCartButton.textContent = availableStock <= 0 ? "Out of Stock" : "Add to Cart";
        addToCartButton.disabled = availableStock <= 0;
    }, 1500);
}

/* =========================================================
   Error
   ========================================================= */

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
}

/* =========================================================
   Format price
   ========================================================= */

function formatPrice(price) {
    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
        return price;
    }

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(numericPrice);
}