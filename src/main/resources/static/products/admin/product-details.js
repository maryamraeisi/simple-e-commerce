const API_URL = "/api/products";

document.addEventListener("DOMContentLoaded", loadProduct);

async function loadProduct() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        showError("Product ID is missing.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`);

        if (!response.ok) {
            throw new Error("Product not found");
        }

        const product = await response.json();
        renderProduct(product);
    } catch (error) {
        console.error(error);
        showError("Failed to load product.");
    }
}

function renderProduct(product) {
    const container = document.getElementById("product-details");

    container.innerHTML = `
        <div class="product-detail-card">
        
            <div class="detail-image">
                <img
                    src="${product.imageUrl || '/images/product-placeholder.png'}"
                    alt="${product.name}"
                    onerror="this.src='/images/product-placeholder.png'"
                >
            </div>
            
            <div class="detail-content">
            
                <div class="detail-header">
                    <h2>
                        ${product.name}
                    </h2>
                    <span class="status ${product.active ? "status-active" : "status-inactive"}">
                        ${product.active ? "Active" : "Inactive"}
                    </span>
                </div>

                <div class="detail-price">
                    $${Number(product.price).toFixed(2)}
                </div>

                <div class="detail-section">
                    <h3>Description</h3>
                    <p>${product.description || "No description available."}</p>
                </div>

                <div class="detail-section">
                    <h3>Product ID</h3>
                    <p>${product.id}</p>
                </div>

                <div class="detail-actions">
                    <a
                        href="/products/product-form.html?id=${product.id}"
                        class="btn btn-warning">
                        Edit Product
                    </a>
                </div>

            </div>

        </div>
    `;
}

function showError(message) {
    document.getElementById("product-details").innerHTML = `
        <div class="message error">
            ${message}
        </div>
    `;
}