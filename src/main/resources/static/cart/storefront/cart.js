const CART_API = "/api/cart";

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");
const emptyMessage = document.getElementById("empty-message");
const cartContent = document.getElementById("cart-content");
const cartItems = document.getElementById("cart-items");
const clearCartButton = document.getElementById("clear-cart-button");


document.addEventListener("DOMContentLoaded", () => {

    clearCartButton.addEventListener(
        "click",
        deleteAllItems
    );

    loadCart();
});


async function loadCart() {

    try {

        const response =
            await fetch(CART_API);

        if (!response.ok) {
            throw new Error("Failed to load cart.");
        }

        const cart =
            await response.json();

        loading.hidden = true;

        renderCart(cart);

    } catch (error) {

        console.error(error);

        loading.hidden = true;

        showError(
            error.message ||
            "Failed to load cart. Please try again later."
        );
    }
}


function renderCart(cart) {

    cartItems.innerHTML = "";

    if (!cart.items ||
        cart.items.length === 0) {

        cartContent.hidden = true;
        emptyMessage.hidden = false;
        clearCartButton.hidden = true;

        return;
    }

    emptyMessage.hidden = true;
    cartContent.hidden = false;
    clearCartButton.hidden = false;

    cart.items.forEach(item => {

        const element =
            createCartItem(item);

        cartItems.appendChild(element);
    });
}


function createCartItem(item) {

    const container =
        document.createElement("div");

    container.className = "cart-item";

    container.innerHTML = `
        <div class="cart-item-product">

            <div class="cart-item-image-container">

                ${
        item.productImageUrl
            ? `
                            <img
                                src="${item.productImageUrl}"
                                alt="${escapeHtml(item.productName)}"
                                class="cart-item-image">
                        `
            : `
                            <div class="cart-item-image-placeholder">
                                No image
                            </div>
                        `
    }

            </div>

            <div class="cart-item-info">

                <h3>
                    ${escapeHtml(item.productName)}
                </h3>

                <p>
                    ${formatPrice(item.productPrice)}
                </p>

            </div>

        </div>


        <div class="quantity-control">

            <button
                type="button"
                class="quantity-button decrease-button">
                −
            </button>

            <input
                type="number"
                class="quantity-input"
                min="1"
                step="1"
                value="${item.quantity}">

            <button
                type="button"
                class="quantity-button increase-button">
                +
            </button>

        </div>


        <div class="cart-item-actions">

            <button
                type="button"
                class="delete-button">
                Remove
            </button>

        </div>
    `;


    const quantityInput =
        container.querySelector(
            ".quantity-input"
        );

    const decreaseButton =
        container.querySelector(
            ".decrease-button"
        );

    const increaseButton =
        container.querySelector(
            ".increase-button"
        );

    const deleteButton =
        container.querySelector(
            ".delete-button"
        );


    decreaseButton.addEventListener(
        "click",
        async () => {

            const quantity =
                getQuantity(quantityInput);

            if (quantity <= 1) {
                return;
            }

            quantityInput.value =
                quantity - 1;

            await updateQuantity(
                item,
                quantityInput,
                decreaseButton,
                increaseButton
            );
        }
    );


    increaseButton.addEventListener(
        "click",
        async () => {

            const quantity =
                getQuantity(quantityInput);

            quantityInput.value =
                quantity + 1;

            await updateQuantity(
                item,
                quantityInput,
                decreaseButton,
                increaseButton
            );
        }
    );


    quantityInput.addEventListener(
        "blur",
        async () => {

            await updateQuantity(
                item,
                quantityInput,
                decreaseButton,
                increaseButton
            );
        }
    );


    deleteButton.addEventListener(
        "click",
        () =>
            deleteItem(
                item,
                container,
                deleteButton
            )
    );


    return container;
}


async function updateQuantity(
    item,
    quantityInput,
    decreaseButton,
    increaseButton
) {

    const quantity =
        getQuantity(quantityInput);

    quantityInput.disabled = true;
    decreaseButton.disabled = true;
    increaseButton.disabled = true;


    try {

        const response =
            await fetch(
                `${CART_API}/items/${item.id}`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        quantity: quantity
                    })
                }
            );


        if (!response.ok) {

            const message =
                await response.text();

            throw new Error(
                message ||
                "Failed to update cart item."
            );
        }


    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Failed to update cart item."
        );

        await loadCart();

        return;

    } finally {

        quantityInput.disabled = false;
        decreaseButton.disabled = false;
        increaseButton.disabled = false;
    }
}


async function deleteItem(
    item,
    itemElement,
    deleteButton
) {

    const confirmed =
        confirm(
            "Remove this item from your cart?"
        );

    if (!confirmed) {
        return;
    }


    deleteButton.disabled = true;
    deleteButton.textContent =
        "Removing...";


    try {

        const response =
            await fetch(
                `${CART_API}/items/${item.id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            const message =
                await response.text();

            throw new Error(
                message ||
                "Failed to remove cart item."
            );
        }


        itemElement.remove();


        if (cartItems.children.length === 0) {

            cartContent.hidden = true;
            emptyMessage.hidden = false;
            clearCartButton.hidden = true;
        }


    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Failed to remove cart item."
        );

        deleteButton.disabled = false;
        deleteButton.textContent =
            "Remove";
    }
}


async function deleteAllItems() {

    if (!cartItems.children.length) {
        return;
    }


    const confirmed =
        confirm(
            "Are you sure you want to remove all items from your cart?"
        );

    if (!confirmed) {
        return;
    }


    clearCartButton.disabled = true;
    clearCartButton.textContent =
        "Clearing...";


    try {

        const response =
            await fetch(
                `${CART_API}/items`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            const message =
                await response.text();

            throw new Error(
                message ||
                "Failed to clear cart."
            );
        }


        cartItems.innerHTML = "";

        cartContent.hidden = true;
        emptyMessage.hidden = false;
        clearCartButton.hidden = true;


    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Failed to clear cart."
        );

    } finally {

        clearCartButton.disabled = false;
        clearCartButton.textContent =
            "Clear Cart";
    }
}


function getQuantity(input) {

    let quantity =
        parseInt(input.value, 10);

    if (Number.isNaN(quantity) ||
        quantity < 1) {

        quantity = 1;
    }

    input.value = quantity;

    return quantity;
}


function formatPrice(price) {

    const numericPrice =
        Number(price);

    if (Number.isNaN(numericPrice)) {
        return price;
    }

    return new Intl.NumberFormat(
        "en-US",
        {
            style: "currency",
            currency: "USD"
        }
    ).format(numericPrice);
}


function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


function showError(message) {

    errorMessage.textContent =
        message;

    errorMessage.hidden = false;
}