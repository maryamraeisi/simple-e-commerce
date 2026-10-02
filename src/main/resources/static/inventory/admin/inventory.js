const INVENTORY_API = "/api/admin/inventory";
const ADMIN_PRODUCTS_API = "/api/admin/products";


document.addEventListener("DOMContentLoaded", () => {

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

        showInventoryMessage(
            "Failed to load inventory.",
            "error"
        );

    }


    /*
     * Live product search
     */
    document
        .getElementById("inventorySearch")
        .addEventListener(
            "input",
            handleInventorySearch
        );

}


/* =========================================================
   Load inventory
   ========================================================= */

async function loadInventory() {

    const response =
        await fetch(INVENTORY_API);


    if (!response.ok) {
        throw new Error(
            "Failed to load inventory."
        );
    }


    const inventoryList =
        await response.json();


    const tableBody =
        document.getElementById(
            "inventoryTableBody"
        );

    const emptyState =
        document.getElementById(
            "emptyState"
        );


    tableBody.innerHTML = "";


    if (inventoryList.length === 0) {

        emptyState.style.display = "block";

        return;
    }


    emptyState.style.display = "none";


    inventoryList.forEach(inventory => {

        const row =
            document.createElement("tr");


        /*
         * Store product information on
         * the row for live search and
         * inline stock updates.
         */
        row.dataset.productName =
            (inventory.productName || "")
                .toLowerCase();

        row.dataset.productId =
            inventory.productId;


        row.innerHTML = `

            <td class="inventory-product">
                ${escapeHtml(inventory.productName)}
            </td>

            <td class="at-stock">
                ${inventory.atStock}
            </td>

            <td class="reserved">
                ${inventory.reserved}
            </td>

            <td class="available">
                ${inventory.available}
            </td>

            <td class="table-action">

                <div class="stock-action">

                    <button
                        type="button"
                        class="btn btn-primary"
                        onclick="showUpdateStockInput(
                            this,
                            ${inventory.productId}
                        )">

                        Update Stock

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

    const searchTerm =
        event.target.value
            .trim()
            .toLowerCase();


    const rows =
        document.querySelectorAll(
            "#inventoryTableBody tr"
        );


    let visibleRows = 0;


    rows.forEach(row => {

        const productName =
            row.dataset.productName || "";


        const matches =
            productName.includes(searchTerm);


        if (matches) {

            row.style.display = "";

            visibleRows++;

        } else {

            row.style.display = "none";

        }

    });


    const emptyState =
        document.getElementById(
            "emptyState"
        );


    if (visibleRows === 0) {

        emptyState.style.display = "block";

    } else {

        emptyState.style.display = "none";

    }

}


/* =========================================================
   Show Update Stock input
   ========================================================= */

function showUpdateStockInput(
    button,
    productId
) {

    const actionContainer =
        button.parentElement;


    /*
     * Don't create another input
     * if one is already open.
     */
    if (
        actionContainer.querySelector(
            ".stock-input"
        )
    ) {
        return;
    }


    actionContainer.innerHTML = `

        <div class="stock-input">

            <input
                type="number"
                class="stock-quantity"
                placeholder="± quantity"
                required>

            <button
                type="button"
                class="btn btn-primary"
                onclick="updateStockFromRow(
                    this,
                    ${productId}
                )">

                Update

            </button>

            <button
                type="button"
                class="btn btn-secondary"
                onclick="cancelUpdateStock(this)">

                Cancel

            </button>

        </div>
    `;


    actionContainer
        .querySelector(".stock-quantity")
        .focus();

}


/* =========================================================
   Update stock from table row
   ========================================================= */

async function updateStockFromRow(
    button,
    productId
) {

    const actionContainer =
        button.closest(".stock-action");


    const quantityInput =
        actionContainer.querySelector(
            ".stock-quantity"
        );


    const quantityChange =
        Number(quantityInput.value);


    if (
        Number.isNaN(quantityChange) ||
        quantityChange === 0
    ) {

        showInventoryMessage(
            "Quantity change must not be zero.",
            "error"
        );

        quantityInput.focus();

        return;
    }


    /*
     * Prevent multiple requests while
     * the current request is running.
     */
    button.disabled = true;


    try {

        const response =
            await fetch(
                `/api/admin/products/${productId}/inventory`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        quantityChange:
                        quantityChange
                    })
                }
            );


        if (!response.ok) {

            let message =
                "Failed to update stock.";

            try {

                const body =
                    await response.text();

                if (body) {
                    message = body;
                }

            } catch (error) {
                // Keep default message.
            }

            throw new Error(message);
        }


        showInventoryMessage(
            "Stock updated successfully.",
            "success"
        );


        await loadInventory();


        /*
         * Preserve the current search after
         * rebuilding the table.
         */
        const searchInput =
            document.getElementById(
                "inventorySearch"
            );


        if (searchInput.value) {

            handleInventorySearch({
                target: searchInput
            });

        }

    } catch (error) {

        console.error(error);

        showInventoryMessage(
            error.message ||
            "Failed to update stock.",
            "error"
        );


        button.disabled = false;

    }

}


/* =========================================================
   Cancel Update Stock
   ========================================================= */

function cancelUpdateStock(button) {

    const actionContainer =
        button.closest(".stock-action");

    const row =
        button.closest("tr");

    const productId =
        row.dataset.productId;


    actionContainer.innerHTML = `

        <button
            type="button"
            class="btn btn-primary">

            Update Stock

        </button>
    `;


    const newButton =
        actionContainer.querySelector(
            "button"
        );


    newButton.onclick =
        function () {

            showUpdateStockInput(
                newButton,
                productId
            );

        };

}


/* =========================================================
   Messages
   ========================================================= */

function showInventoryMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "message"
        );


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

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}