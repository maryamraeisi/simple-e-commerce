const API_URL = "/api/products";
const productsGrid = document.getElementById("products-grid");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");
const emptyMessage = document.getElementById("empty-message");
document.addEventListener("DOMContentLoaded", loadProducts);

async function loadProducts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error("Failed to load products.");
        }
        const products = await response.json();
        loading.hidden = true; // Only show active products
        const activeProducts = products.filter(product => product.active);
        if (activeProducts.length === 0) {
            emptyMessage.hidden = false;
            return;
        }
        renderProducts(activeProducts);
    } catch (error) {
        console.error(error);
        loading.hidden = true;
        errorMessage.textContent = "Failed to load products. Please try again later.";
        errorMessage.hidden = false;
    }
}

function renderProducts(products) {
    productsGrid.innerHTML = "";
    products.forEach(product => {
        const card = createProductCard(product);
        productsGrid.appendChild(card);
    });
}

function createProductCard(product) {
    const card = document.createElement("article");
    card.className = "product-card"; /* * Product image */
    const imageContainer = document.createElement("div");
    imageContainer.className = "product-image-container";
    if (product.imageUrl) {
        const image = document.createElement("img");
        image.className = "product-image";
        image.src = product.imageUrl;
        image.alt = product.name;
        image.onerror = function () {
            image.remove();
            const placeholder = document.createElement("div");
            placeholder.className = "product-image-placeholder";
            placeholder.textContent = "Image unavailable";
            imageContainer.appendChild(placeholder);
        };
        imageContainer.appendChild(image);
    } else {
        const placeholder = document.createElement("div");
        placeholder.className = "product-image-placeholder";
        placeholder.textContent = "No image";
        imageContainer.appendChild(placeholder);
    } /* * Product content */
    const content = document.createElement("div");
    content.className = "product-content";
    const name = document.createElement("h3");
    name.className = "product-name";
    name.textContent = product.name;
    const description = document.createElement("p");
    description.className = "product-description";
    description.textContent = product.description || "No description available."; /* * Product footer */
    const footer = document.createElement("div");
    footer.className = "product-footer";
    const price = document.createElement("span");
    price.className = "product-price";
    price.textContent = formatPrice(product.price);
    const viewButton = document.createElement("a");
    viewButton.className = "view-product-button";
    viewButton.textContent = "View Product";
    viewButton.href = `/storefront/product-details.html?id=${product.id}`;
    footer.appendChild(price);
    footer.appendChild(viewButton);
    content.appendChild(name);
    content.appendChild(description);
    content.appendChild(footer);
    card.appendChild(imageContainer);
    card.appendChild(content);
    return card;
}

function formatPrice(price) {
    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice)) {
        return price;
    }
    return new Intl.NumberFormat("en-US", {style: "currency", currency: "USD"}).format(numericPrice);
}