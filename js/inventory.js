//inventory.js

const divInventoryListRight = document.getElementById("divInventoryListRight");

function renderdivInventoryListRight() {
    divInventoryListRight.innerHTML = "";

    const inventorySection = document.createElement("div");
    inventorySection.classList.add("inventory-section");

    const inventoryTitle = document.createElement("h2");
    inventoryTitle.dataset.i18n = "inventory";
    inventorySection.appendChild(inventoryTitle);

    const inventoryContainer = document.createElement("div");
    inventoryContainer.classList.add("inventory-container");

    const playerObjects = objects.filter(
        obj => obj.position === null
    );

    playerObjects.forEach(obj => {
            const card = renderItemCard(obj, 'object');
            inventoryContainer.appendChild(card);
    });

    divInventoryListRight.appendChild(inventoryContainer);
}