const socket = io();

function renderProducts(products) {
    const productList = document.getElementById('products-list');
    productList.innerHTML = '';

    products.forEach((product) => {
        const li = document.createElement('li');
        li.textContent = `${product.name} - ${product.price} `;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.onclick = () => deleteProduct(product.id);
        li.appendChild(deleteButton);
        productList.appendChild(li);
    });
}

socket.on('productList', (products) => {
    renderProducts(products);
});

socket.on('productAdded', (product) => {
    const products = [...document.querySelectorAll("#products-list li")].map((li) => ({
        name: li.childNodes[0].textContent.split(" - ")[0],
        price: li.childNodes[0].textContent.split(" - ")[1],
        id: li.querySelector("button").onclick.toString().split("'")[1],
    }));
    products.push(product);
    renderProducts(products);
});

socket.on('productDeleted', (deletedProduct) => {
    const products = [...document.querySelectorAll("#products-list li")].map((li) => ({
        name: li.childNodes[0].textContent.split(" - ")[0],
        price: li.childNodes[0].textContent.split(" - ")[1],
        id: li.querySelector("button").onclick.toString().split("'")[1],
    }));
    const filteredProducts = products.filter((product) => product.id !== deletedProduct.id);
    renderProducts(filteredProducts);
});

document.getElementById("product-form").addEventListener("submit", function(event) {
    event.preventDefault();
    const productName = document.getElementById("product-name").value.trim();
    const productPrice = document.getElementById("product-price").value.trim();

    if (!productName || !productPrice) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    const productId = Date.now().toString();

    socket.emit("addProduct", {
        name: productName,
        price: productPrice,
        id: productId,
    }, (response) => {
        if (response.error) {
            alert("Error al agregar el producto." + response.error);
        } else {
            document.getElementById("product-name").value = "";
            document.getElementById("product-price").value = "";
        }
    });
});

function deleteProduct(productId) {
    socket.emit("deleteProduct", productId, (response) => {
        if (response.error) {
            alert("Error al eliminar el producto." + response.error);
        } else {
            socket.emit('requestProductList');
        }
    });
}