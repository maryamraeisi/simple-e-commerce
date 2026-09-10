const INVENTORY_API = "/api/inventory";
const PRODUCTS_API = "/api/products";


document.addEventListener("DOMContentLoaded", () => {

    /*
     * inventory.html
     */
    if (document.getElementById("inventoryTableBody")) {
        initializeInventoryPage();
    }


    /*
     * inventory-form.html
     */
    if (document.getElementById("inventoryForm")) {
        initializeInventoryForm();
    }

});


/* =========================================================
   Inventory page
   ========================================================= */

async function initializeInventoryPage() {

    try {

        await loadInventory();

        await loadProductsForStock();

    } catch (error) {

        console.error(error);

        showInventoryMessage(
            "Failed to load inventory.",
            "error"
        );

    }


    document
        .getElementById("addStockForm")
        .addEventListener("submit", handleAddStock);


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

    const tableBody =
        document.getElementById("inventoryTableBody");

    const emptyState =
        document.getElementById("emptyState");


    tableBody.innerHTML = "";


    if (inventoryList.length === 0) {

        emptyState.style.display = "block";

        return;
    }


    emptyState.style.display = "none";


    inventoryList.forEach(inventory => {

        const row =
            document.createElement("tr");

        const available =
            inventory.quantity -
            inventory.reservedQuantity;


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
                <button
                    class="btn btn-primary"
                    onclick="selectProductForStock(${inventory.productId})">
                    Add Stock
                </button>
            </td>
        `;


        tableBody.appendChild(row);
    });
}


/* =========================================================
   Load products for Add Stock
   ========================================================= */

async function loadProductsForStock() {

    const response =
        await fetch(PRODUCTS_API);

    if (!response.ok) {
        throw new Error("Failed to load products.");
    }

    const products =
        await response.json();

    const select =
        document.getElementById("stockProduct");


    select.innerHTML = `
        <option value="">
            Select a product
        </option>
    `;


    products.forEach(product => {

        const option =
            document.createElement("option");

        option.value = product.id;

        option.textContent = product.name;

        select.appendChild(option);
    });
}


/* =========================================================
   Select product for Add Stock
   ========================================================= */

function selectProductForStock(productId) {

    const select =
        document.getElementById("stockProduct");

    select.value = productId;

    document
        .getElementById("stockQuantity")
        .focus();

    document
        .querySelector(".operation-section")
        .scrollIntoView({
            behavior: "smooth"
        });
}


/* =========================================================
   Add stock
   ========================================================= */

async function handleAddStock(event) {

    event.preventDefault();


    const productId =
        document.getElementById("stockProduct").value;

    const quantity =
        Number(
            document.getElementById("stockQuantity").value
        );


    if (!productId) {

        showInventoryMessage(
            "Please select a product.",
            "error"
        );

        return;
    }


    if (!quantity || quantity <= 0) {

        showInventoryMessage(
            "Quantity must be greater than zero.",
            "error"
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${INVENTORY_API}/${productId}/add`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        quantity: quantity
                    })
                }
            );


        if (!response.ok) {
            throw new Error("Failed to add stock.");
        }


        document
            .getElementById("addStockForm")
            .reset();


        showInventoryMessage(
            "Stock added successfully.",
            "success"
        );


        await loadInventory();

    } catch (error) {

        console.error(error);

        showInventoryMessage(
            "Failed to add stock.",
            "error"
        );
    }
}


/* =========================================================
   Reserve stock
   ========================================================= */

async function handleReserve() {

    const orderId =
        document.getElementById("orderId").value;


    if (!orderId) {

        showInventoryMessage(
            "Please enter an order ID.",
            "error"
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${INVENTORY_API}/${orderId}/reserve`,
                {
                    method: "POST"
                }
            );


        if (!response.ok) {
            throw new Error("Failed to reserve stock.");
        }


        showInventoryMessage(
            "Stock reserved successfully.",
            "success"
        );


        await loadInventory();

    } catch (error) {

        console.error(error);

        showInventoryMessage(
            "Failed to reserve stock.",
            "error"
        );
    }
}


/* =========================================================
   Release stock
   ========================================================= */

async function handleRelease() {

    const orderId =
        document.getElementById("orderId").value;


    if (!orderId) {

        showInventoryMessage(
            "Please enter an order ID.",
            "error"
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${INVENTORY_API}/${orderId}/release`,
                {
                    method: "POST"
                }
            );


        if (!response.ok) {
            throw new Error("Failed to release stock.");
        }


        showInventoryMessage(
            "Stock released successfully.",
            "success"
        );


        await loadInventory();

    } catch (error) {

        console.error(error);

        showInventoryMessage(
            "Failed to release stock.",
            "error"
        );
    }
}


/* =========================================================
   Inventory form
   ========================================================= */

async function initializeInventoryForm() {

    try {

        await loadProductsForInventoryForm();

    } catch (error) {

        console.error(error);

        showInventoryMessage(
            "Failed to load products.",
            "error"
        );

        return;
    }


    document
        .getElementById("inventoryForm")
        .addEventListener(
            "submit",
            handleCreateInventory
        );
}


/* =========================================================
   Load products for Create Inventory
   ========================================================= */

async function loadProductsForInventoryForm() {

    const response =
        await fetch(PRODUCTS_API);


    if (!response.ok) {
        throw new Error("Failed to load products.");
    }


    const products =
        await response.json();


    const select =
        document.getElementById("product");


    select.innerHTML = `
        <option value="">
            Select a product
        </option>
    `;


    products
        .filter(product => product.active)
        .forEach(product => {

            const option =
                document.createElement("option");

            option.value = product.id;

            option.textContent = product.name;

            select.appendChild(option);
        });
}


/* =========================================================
   Create inventory
   ========================================================= */

async function handleCreateInventory(event) {

    event.preventDefault();


    const productId =
        Number(
            document.getElementById("product").value
        );


    const quantity =
        Number(
            document.getElementById("quantity").value
        );


    if (!productId) {

        showInventoryMessage(
            "Please select a product.",
            "error"
        );

        return;
    }


    if (quantity < 0 || Number.isNaN(quantity)) {

        showInventoryMessage(
            "Please enter a valid quantity.",
            "error"
        );

        return;
    }


    try {

        const response =
            await fetch(
                INVENTORY_API,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        productId: productId,
                        quantity: quantity
                    })
                }
            );


        if (!response.ok) {
            throw new Error(
                "Failed to create inventory."
            );
        }


        showInventoryMessage(
            "Inventory created successfully.",
            "success"
        );


        document
            .getElementById("inventoryForm")
            .reset();


        setTimeout(() => {

            window.location.href =
                "/inventory/inventory.html";

        }, 800);

    } catch (error) {

        console.error(error);

        showInventoryMessage(
            "Failed to create inventory.",
            "error"
        );
    }
}


/* =========================================================
   Messages
   ========================================================= */

function showInventoryMessage(message, type) {

    const element =
        document.getElementById("message");


    if (!element) {
        return;
    }


    element.textContent = message;

    element.style.display = "block";


    element.classList.remove(
        "message-success",
        "message-error"
    );


    if (type === "success") {

        element.classList.add(
            "message-success"
        );

    } else {

        element.classList.add(
            "message-error"
        );
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