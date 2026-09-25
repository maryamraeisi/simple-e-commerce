const API_URL = "/api/products";

document.addEventListener("DOMContentLoaded", loadProducts);

async function loadProducts() {
    const grid = document.getElementById("product-grid");

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error("Failed to load products");
        }

        const products = await response.json();

        grid.innerHTML = "";
        if (products.length === 0) {
            grid.innerHTML = `<div class="empty">No products found.</div>`;
            return;
        }

        products.forEach(product => {
            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `

                <div class="product-image-container">

                    <img
                        src="${product.imageUrl || '/images/product-placeholder.png'}"
                        alt="${product.name}"
                        class="product-image"
                        onerror="this.src='/images/product-placeholder.png'"
                    >

                    <span class="status ${product.active ? "status-active" : "status-inactive"}">
                        ${product.active ? "Active" : "Inactive"}
                    </span>

                </div>


                <div class="product-content">

                    <h2>
                        ${product.name}
                    </h2>

                    <p class="description">
                        ${product.description || "No description"}
                    </p>

                    <div class="product-footer">

                        <span class="price">
                            $${Number(product.price).toFixed(2)}
                        </span>

                    </div>


                    <div class="product-actions">

                        <a
                            href="/products/product-details.html?id=${product.id}"
                            class="btn btn-small">
                            View
                        </a>

                        <a
                            href="/products/product-form.html?id=${product.id}"
                            class="btn btn-small btn-warning">
                            Edit
                        </a>

                        <button
                            class="btn btn-small btn-danger"
                            onclick="deleteProduct(${product.id})">
                            Delete
                        </button>

                    </div>

                </div>
            `;

            grid.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        showMessage("Failed to load products.", "error"
        );
    }
}


async function deleteProduct(id) {
    const confirmed = confirm("Are you sure you want to delete this product?");

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {method: "DELETE"});

        if (!response.ok) {
            throw new Error("Failed to delete product");
        }

        showMessage("Product deleted successfully.", "success");

        await loadProducts();

    } catch (error) {
        console.error(error);
        showMessage("Failed to delete product.", "error");
    }
}


function showMessage(message, type) {
    const element = document.getElementById("message");

    element.innerHTML = `<div class="message ${type}">${message}</div>`;

    setTimeout(() => {element.innerHTML = "";}, 3000);
}