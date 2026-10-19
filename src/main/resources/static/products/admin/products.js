
const API_URL = "/api/products";

let allProducts = [];

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("refresh-products")
        ?.addEventListener("click", loadProducts);

    document.getElementById("product-search")
        ?.addEventListener("input", renderProducts);

    loadProducts();
});

async function loadProducts() {
    const tableBody = document.getElementById("product-table-body");
    const count = document.getElementById("product-count");
    const refreshButton = document.getElementById("refresh-products");

    refreshButton.disabled = true;
    renderTableMessage(tableBody, "Loading products...");
    count.textContent = "Loading products...";

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Failed to load products (${response.status}).`);
        }

        allProducts = normalizeCollection(await response.json());
        renderProducts();
    } catch (error) {
        console.error("Error loading products:", error);

        allProducts = [];
        count.textContent = "Unable to load products";

        renderTableMessage(
            tableBody,
            "Couldn't load products. Please try refreshing."
        );

        showMessage(
            error.message || "Failed to load products.",
            "error"
        );
    } finally {
        refreshButton.disabled = false;
    }
}

function normalizeCollection(payload) {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload?.content)) {
        return payload.content;
    }

    if (Array.isArray(payload?.items)) {
        return payload.items;
    }

    return [];
}

function renderProducts() {
    const tableBody = document.getElementById("product-table-body");
    const count = document.getElementById("product-count");
    const searchInput = document.getElementById("product-search");

    const query = searchInput.value.trim().toLowerCase();

    const filteredProducts = allProducts.filter(product =>
        (product.name || "").toLowerCase().includes(query)
    );

    tableBody.replaceChildren();

    if (allProducts.length === 0) {
        count.textContent = "0 products";
        renderTableMessage(
            tableBody,
            "No products found. Add your first product to get started."
        );
        return;
    }

    count.textContent = query
        ? `${filteredProducts.length} of ${allProducts.length} products`
        : `${allProducts.length} ${allProducts.length === 1 ? "product" : "products"}`;

    if (filteredProducts.length === 0) {
        renderTableMessage(tableBody, "No products match your search.");
        return;
    }

    filteredProducts.forEach(product => {
        tableBody.appendChild(createProductRow(product));
    });
}

function createProductRow(product) {
    const row = document.createElement("tr");

    // Product image and name
    const productCell = document.createElement("td");
    productCell.className = "product-column";

    const summary = document.createElement("div");
    summary.className = "product-summary";

    const image = createProductImage(product);

    const name = document.createElement("span");
    name.className = "product-name";
    name.textContent = product.name || "Unnamed product";

    summary.append(image, name);
    productCell.appendChild(summary);

    // Price
    const priceCell = document.createElement("td");

    const price = document.createElement("span");
    price.className = "product-price";
    price.textContent = formatPrice(product.price);

    priceCell.appendChild(price);

    // Available stock comes directly from ProductResponse.available
    const stockCell = document.createElement("td");
    const stockLabel = document.createElement("span");

    const stock = product.available == null
        ? null
        : Number(product.available);

    stockLabel.className = "product-stock";

    if (stock === null || !Number.isFinite(stock)) {
        stockLabel.textContent = "—";
        stockLabel.title = "Stock quantity is unavailable";
    } else {
        stockLabel.textContent = String(stock);

        if (stock <= 0) {
            stockLabel.classList.add("out-of-stock");
        }
    }

    stockCell.appendChild(stockLabel);

    // Product status
    const statusCell = document.createElement("td");
    const status = document.createElement("span");

    const isActive = product.active === true;

    status.className = `product-status ${isActive ? "active" : "inactive"}`;
    status.textContent = isActive ? "Active" : "Inactive";

    statusCell.appendChild(status);

    // Actions: only View Details on the products list
    const actionsCell = document.createElement("td");
    actionsCell.className = "actions-column";

    const viewButton = document.createElement("a");
    viewButton.className = "view-details-button";
    viewButton.href = `/products/admin/product-details.html?id=${encodeURIComponent(product.id)}`;
    viewButton.textContent = "View Details";
    viewButton.setAttribute(
        "aria-label",
        `View details for ${product.name || "product"}`
    );

    actionsCell.appendChild(viewButton);

    row.append(
        productCell,
        priceCell,
        stockCell,
        statusCell,
        actionsCell
    );

    return row;
}

function createProductImage(product) {
    if (!product.imageUrl) {
        return createImageFallback();
    }

    const image = document.createElement("img");

    image.className = "product-thumbnail";
    image.src = product.imageUrl;
    image.alt = product.name || "Product image";
    image.loading = "lazy";

    image.addEventListener("error", () => {
        image.replaceWith(createImageFallback());
    }, { once: true });

    return image;
}

function createImageFallback() {
    const fallback = document.createElement("div");

    fallback.className = "product-image-fallback";
    fallback.setAttribute("aria-label", "Product image unavailable");
    fallback.textContent = "—";

    return fallback;
}

function formatPrice(price) {
    const amount = Number(price);

    if (!Number.isFinite(amount)) {
        return "—";
    }

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(amount);
}

function renderTableMessage(tableBody, message) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 5;
    cell.className = "table-message";
    cell.textContent = message;

    row.appendChild(cell);
    tableBody.replaceChildren(row);
}

function showMessage(message, type) {
    const element = document.getElementById("message");

    if (!element) {
        console.error(message);
        return;
    }

    element.replaceChildren();

    const notice = document.createElement("div");
    notice.className = `message ${type}`;
    notice.textContent = message;

    element.appendChild(notice);

    if (showMessage.timeoutId) {
        clearTimeout(showMessage.timeoutId);
    }

    showMessage.timeoutId = setTimeout(() => {
        element.replaceChildren();
    }, 4000);
}
