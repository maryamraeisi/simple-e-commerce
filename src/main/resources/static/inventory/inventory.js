const INVENTORY_API = "/api/inventory";
const PRODUCTS_API = "/api/products";

document.addEventListener("DOMContentLoaded", () => {
    /*
     * inventory.html
     */
    if (document.getElementById("inventoryTableBody")) {
        initializeInventoryPage();
    }
});

/* =========================================================
Inventory page
========================================================= */

async function initializeInventoryPage() {
    try {

        await loadInventory();

    } catch (error) {

        console.error(error);

        showInventoryMessage("Failed to load inventory.", "error");

    }


    /*
     * Live product search
     */
    document
        .getElementById("inventorySearch")
        .addEventListener("input", handleInventorySearch);


    /*
     * Reserve / Release
     */
    document
        .getElementById("reserveButton")
        .addEventListener("click", handleReserve);


    document
        .getElementById("releaseButton")
        .addEventListener("click", handleRelease);
}

/* =========================================================
Load inventory
========================================================= */

async function loadInventory() {
    const response = await fetch(INVENTORY_API);

    if (!response.ok) {
        throw new Error("Failed to load inventory.");
    }

    const inventoryList = await response.json();


    const tableBody = document.getElementById("inventoryTableBody");

    const emptyState = document.getElementById("emptyState");


    tableBody.innerHTML = "";


    if (inventoryList.length === 0) {

        emptyState.style.display = "block";

        return;
    }


    emptyState.style.display = "none";


    inventoryList.forEach(inventory => {

        const row = document.createElement("tr");


        /*
         * Store the product name on the row.
         *
         * This is useful for live search.
         */
        row.dataset.productName = (inventory.productName || "").toLowerCase();
        row.dataset.productId = inventory.productId;
        const available = inventory.quantity - inventory.reservedQuantity;


        row.innerHTML = `
    <td class="inventory-product">
        ${escapeHtml(inventory.productName)}
        </td>

    <td class="quantity">
        ${inventory.quantity}
    </td>

    <td class="reserved">
        ${inventory.reservedQuantity}
    </td>

    <td class="available">
        ${available}
    </td>

    <td class="table-action">

        <div class="stock-action">

            <button
                type="button"
                class="btn btn-primary"
                onclick="showAddStockInput(this, ${inventory.productId})">
                Add Stock
            </button>

        </div>

    </td>
        `;


        tableBody.appendChild(row);
    });

}

/* =========================================================
Live inventory search
========================================================= */

function handleInventorySearch(event) {
    const searchTerm = event.target.value
        .trim()
        .toLowerCase();


    const rows = document.querySelectorAll("#inventoryTableBody tr");


    let visibleRows = 0;


    rows.forEach(row => {

        const productName = row.dataset.productName || "";


        const matches = productName.includes(searchTerm);


        if (matches) {

            row.style.display = "";

            visibleRows++;

        } else {

            row.style.display = "none";
        }

    });


    /*
     * Show empty state when the search
     * doesn't match any product.
     */
    const emptyState = document.getElementById("emptyState");


    if (visibleRows === 0) {

        emptyState.style.display = "block";

    } else {

        emptyState.style.display = "none";
    }

}

/* =========================================================
Show Add Stock input
========================================================= */

function showAddStockInput(button, productId) {
    const actionContainer = button.parentElement;


    /*
     * Don't create another input if
     * one is already open.
     */
    if (actionContainer.querySelector(".stock-input")) {
        return;
    }


    actionContainer.innerHTML = `
    <div class="stock-input">

        <input
    type="number"
    class="stock-quantity"
    min="1"
    placeholder="Quantity"
    required>

    <button
    type="button"
    class="btn btn-primary"
    onclick="addStockFromRow(this, ${productId})">
        Add
        </button>

    <button
        type="button"
        class="btn btn-secondary"
        onclick="cancelAddStock(this)">
        Cancel
    </button>

</div>
    `;


    actionContainer
        .querySelector(".stock-quantity")
        .focus();

}

/* =========================================================
Add stock from table row
========================================================= */

async function addStockFromRow(button, productId) {

    const actionContainer = button.closest(".stock-action");


    const quantityInput = actionContainer.querySelector(".stock-quantity");


    const quantity = Number(quantityInput.value);


    if (!quantity || quantity <= 0) {

        showInventoryMessage("Quantity must be greater than zero.", "error");

        quantityInput.focus();

        return;
    }


    /*
     * Prevent multiple requests while
     * the current request is running.
     */
    button.disabled = true;


    try {

        const response = await fetch(`${INVENTORY_API}/${productId}/add`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                quantity: quantity
            })
        });


        if (!response.ok) {
            throw new Error("Failed to add stock.");
        }


        showInventoryMessage("Stock added successfully.", "success");


        /*
         * Reload inventory so the quantity,
         * available stock, etc. are updated.
         */
        await loadInventory();


        /*
         * Re-apply the current search after
         * the table has been rebuilt.
         */
        const searchInput = document.getElementById("inventorySearch");


        if (searchInput.value) {

            handleInventorySearch({
                target: searchInput
            });
        }


    } catch (error) {

        console.error(error);

        showInventoryMessage("Failed to add stock.", "error");


        button.disabled = false;
    }

}

/* =========================================================
Cancel Add Stock
========================================================= */

function cancelAddStock(button) {
    const actionContainer = button.closest(".stock-action");
    const row = button.closest("tr");
    const productId = row.dataset.productId;

    actionContainer.innerHTML = `
        <button
            type="button"
            class="btn btn-primary">
            Add Stock
        </button>
    `;

    const newButton = actionContainer.querySelector("button");

    newButton.onclick = function () {
        showAddStockInput(newButton, productId);
    };
}

/* =========================================================
Reserve stock
========================================================= */

async function handleReserve() {
    const orderId = document.getElementById("orderId").value;


    if (!orderId) {

        showInventoryMessage("Please enter an order ID.", "error");

        return;
    }


    try {

        const response = await fetch(`${INVENTORY_API}/${orderId}/reserve`, {
            method: "POST"
        });


        if (!response.ok) {
            throw new Error("Failed to reserve stock.");
        }


        showInventoryMessage("Stock reserved successfully.", "success");


        await loadInventory();


        /*
         * Preserve the current search after
         * reloading the table.
         */
        const searchInput = document.getElementById("inventorySearch");


        if (searchInput.value) {

            handleInventorySearch({
                target: searchInput
            });
        }


    } catch (error) {

        console.error(error);

        showInventoryMessage("Failed to reserve stock.", "error");
    }

}

/* =========================================================
Release stock
========================================================= */

async function handleRelease() {
    const orderId = document.getElementById("orderId").value;


    if (!orderId) {

        showInventoryMessage("Please enter an order ID.", "error");

        return;
    }


    try {

        const response = await fetch(`${INVENTORY_API}/${orderId}/release`, {
            method: "POST"
        });


        if (!response.ok) {
            throw new Error("Failed to release stock.");
        }


        showInventoryMessage("Stock released successfully.", "success");


        await loadInventory();


        /*
         * Preserve the current search after
         * reloading the table.
         */
        const searchInput = document.getElementById("inventorySearch");


        if (searchInput.value) {

            handleInventorySearch({
                target: searchInput
            });
        }


    } catch (error) {

        console.error(error);

        showInventoryMessage("Failed to release stock.", "error");
    }
}

/* =========================================================
Messages
========================================================= */

function showInventoryMessage(message, type) {

    const element = document.getElementById("message");


    if (!element) {
        return;
    }


    element.textContent = message;

    element.style.display = "block";


    element.classList.remove("message-success", "message-error");


    if (type === "success") {

        element.classList.add("message-success");

    } else {

        element.classList.add("message-error");
    }


    setTimeout(() => {

        element.style.display = "none";

    }, 4000);
}

/* =========================================================
Security helper
========================================================= */

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}