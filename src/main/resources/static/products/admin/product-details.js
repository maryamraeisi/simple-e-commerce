
const API_URL = "/api/products";
const PLACEHOLDER_IMAGE = "/images/product-placeholder.png";

document.addEventListener("DOMContentLoaded", loadProduct);

async function loadProduct() {
    const container = document.getElementById("product-details");
    const productId = new URLSearchParams(window.location.search).get("id");

    if (!productId) {
        showError("Product ID is missing.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${encodeURIComponent(productId)}`);

        if (!response.ok) {
            throw new Error("Product not found.");
        }

        const product = await response.json();
        renderProduct(product);
    } catch (error) {
        console.error(error);
        showError("Failed to load product details.");
    }
}

function renderProduct(product) {
    const container = document.getElementById("product-details");
    const card = document.createElement("article");
    card.className = "product-detail-card";

    const imageSection = document.createElement("div");
    imageSection.className = "detail-image";

    const image = document.createElement("img");
    image.src = product.imageUrl || PLACEHOLDER_IMAGE;
    image.alt = product.name || "Product image";
    image.onerror = () => {
        image.onerror = null;
        image.src = PLACEHOLDER_IMAGE;
    };
    imageSection.appendChild(image);

    const content = document.createElement("div");
    content.className = "detail-content";

    const header = document.createElement("div");
    header.className = "detail-header";

    const title = document.createElement("h2");
    title.textContent = product.name || "Unnamed product";

    const status = document.createElement("span");
    status.className = `status ${product.active ? "status-active" : "status-inactive"}`;
    status.textContent = product.active ? "Active" : "Inactive";
    header.append(title, status);

    const price = document.createElement("div");
    price.className = "detail-price";
    price.textContent = formatPrice(product.price);

    const descriptionSection = document.createElement("section");
    descriptionSection.className = "detail-section";

    const descriptionTitle = document.createElement("h3");
    descriptionTitle.textContent = "Description";

    const description = document.createElement("p");
    description.textContent = product.description || "No description available.";

    descriptionSection.append(descriptionTitle, description);

    const idSection = document.createElement("section");
    idSection.className = "detail-section";

    const idTitle = document.createElement("h3");
    idTitle.textContent = "Product ID";

    const idValue = document.createElement("p");
    idValue.textContent = String(product.id);

    idSection.append(idTitle, idValue);

    const actions = document.createElement("div");
    actions.className = "detail-actions";

    const editLink = document.createElement("a");
    editLink.href = `/products/admin/product-form.html?id=${encodeURIComponent(product.id)}`;
    editLink.className = "btn btn-primary";
    editLink.innerHTML = '<i data-lucide="pencil"></i><span>Edit product</span>';

    const backLink = document.createElement("a");
    backLink.href = "/products/admin/products.html";
    backLink.className = "btn btn-secondary";
    backLink.textContent = "Back to products";

    actions.append(editLink, backLink);
    content.append(header, price, descriptionSection, idSection, actions);
    card.append(imageSection, content);

    container.replaceChildren(card);

    if (window.lucide) {
        window.lucide.createIcons({ root: container });
    }
}

function formatPrice(price) {
    const amount = Number(price);

    if (!Number.isFinite(amount)) {
        return "$0.00";
    }

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(amount);
}

function showError(message) {
    const element = document.getElementById("message");
    element.replaceChildren();

    const notice = document.createElement("div");
    notice.className = "message error";
    notice.textContent = message;
    element.appendChild(notice);

    document.getElementById("product-details").replaceChildren();
}
