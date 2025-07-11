function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Token inválido:', e);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        const payload = parseJwt(token);
        const role = payload?.role;

        const navList = document.querySelector('nav ul');

        if (role === 'ROLE_ADMIN') {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '/html/orders.html';
            a.innerText = 'PEDIDOS DO DIA';
            li.appendChild(a);
            navList.insertBefore(li, navList.lastElementChild); 
        }
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const orderContainer = document.querySelector('aside');
    const buttons = document.querySelectorAll('.food-item button');

    const cart = {};

    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const foodItem = e.target.closest('.food-item');
            if (!foodItem) return; // segurança

            const title = foodItem.querySelector('h2')?.innerText;
            // Busca o <p> que contém "R$"
            const priceP = Array.from(foodItem.querySelectorAll('p')).find(p => p.innerText.includes('R$'));
            if (!title || !priceP) return; // segurança

            const price = parseFloat(priceP.innerText.replace('R$', '').replace(',', '.'));

            if (cart[title]) {
                cart[title].quantity += 1;
            } else {
                cart[title] = {
                    name: title,
                    price: price,
                    quantity: 1
                };
            }

            renderCart();
        });
    });

    function renderCart() {
        const orderCards = orderContainer.querySelector('.order-cards');
        if (orderCards) orderCards.remove();

        const newOrderCards = document.createElement('div');
        newOrderCards.classList.add('order-cards');

        let total = 0;

        Object.values(cart).forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const div = document.createElement('div');
            div.classList.add('order-card');
            div.innerHTML = `
                <div class="order-info">
                    <h3>${item.name}</h3>
                    <div class="quantity">
                        <button class="decrease">-</button>
                        <span>${item.quantity}</span>
                        <button class="increase">+</button>
                    </div>
                    <p>R$ ${(itemTotal).toFixed(2).replace('.', ',')}</p>
                </div>
                <button class="remove-item">X</button>
            `;

            div.querySelector('.increase').addEventListener('click', () => {
                cart[item.name].quantity += 1;
                renderCart();
            });

            div.querySelector('.decrease').addEventListener('click', () => {
                cart[item.name].quantity -= 1;
                if (cart[item.name].quantity <= 0) {
                    delete cart[item.name];
                }
                renderCart();
            });

            div.querySelector('.remove-item').addEventListener('click', () => {
                delete cart[item.name];
                renderCart();
            });

            newOrderCards.appendChild(div);
        });

        orderContainer.insertBefore(newOrderCards, orderContainer.querySelector('.order-button'));

        const orderButton = orderContainer.querySelector('.order-button');
        orderButton.innerHTML = `
            <p>Total: R$ ${total.toFixed(2).replace('.', ',')}</p>
            <button class="order-done">Finalizar Pedido</button>
        `;

        orderButton.querySelector('.order-done').addEventListener('click', () => {
            sendOrder(total);
        });
    }

    function sendOrder(total) {
    const token = localStorage.getItem('token');

    const items = Object.values(cart).map(item => ({
        nome: item.name,
        quantidade: item.quantity,
        precoUnitario: item.price
    }));

    const pedido = {
        valorTotal: total,
        itens: items,
        status: "EM_PRODUCAO"
    };

    fetch('http://localhost:8080/api/orders/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(pedido)
    })
    .then(response => {
        if (response.ok) {
            alert('Pedido realizado com sucesso!');
            Object.keys(cart).forEach(key => delete cart[key]);
            renderCart();
        } else {
            response.json().then(err => {
                console.error(err);
                alert('Erro ao enviar pedido: ' + (err.message || 'Verifique o servidor'));
            });
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro na conexão com o servidor');
    });
    }

});
