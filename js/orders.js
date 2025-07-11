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
    if (!token) {
        alert('Você precisa estar logado!');
        window.location.href = '/html/home.html';
        return;
    }

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

    if (role !== 'ROLE_ADMIN') {
        alert('Acesso negado! Somente administradores podem ver os pedidos.');
        window.location.href = '/html/home.html';
        return;
    }

    fetchOrders(token);
});

function fetchOrders(token) {
    fetch('http://localhost:8080/api/orders/today', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao buscar pedidos');
        }
        return response.json();
    })
    .then(data => {
        renderOrders(data);
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao buscar os pedidos. Verifique o servidor.');
    });
}

function renderOrders(orders) {
    const ordersContainer = document.querySelector('.orders');
    ordersContainer.innerHTML = '';

    if (orders.length === 0) {
        ordersContainer.innerHTML = '<h2>Nenhum pedido realizado hoje.</h2>';
        return;
    }

    orders.forEach(order => {
        const card = document.createElement('div');
        card.classList.add('order-card');

        card.innerHTML = `
            <h3>Pedido #${order.id}</h3>
            <p><strong>Cliente:</strong> ${order.nomeCliente}</p>
            <p><strong>Telefone:</strong> ${order.telefoneCliente}</p>
            <p><strong>Endereço:</strong> ${order.enderecoEntrega}</p>
            <p><strong>Status:</strong> <span class="status">${order.statusPedidos}</span></p>
            <p><strong>Data:</strong> ${formatDate(order.dataCriacao)}</p>
            <p><strong>Valor Total:</strong> R$ ${order.valorTotal.toFixed(2).replace('.', ',')}</p>
            <div class="status-buttons">
                <button class="btn-status" data-status="PRONTO">Pronto</button>
                <button class="btn-status" data-status="ENTREGUE">Saiu pra Entrega</button>
            </div>
        `;

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('btn-delete');
        deleteButton.innerText = 'Excluir';
        deleteButton.addEventListener('click', () => {
            deleteOrder(order.id);
        });

        const statusButtons = card.querySelectorAll('.btn-status');
        statusButtons.forEach(button => {
            button.addEventListener('click', () => {
                const newStatus = button.getAttribute('data-status');
                updateOrderStatus(order.id, newStatus);
            });
        });

        card.appendChild(deleteButton);
        ordersContainer.appendChild(card);
    });
}


function updateOrderStatus(orderId, newStatus) {
    const token = localStorage.getItem('token');

    fetch(`http://localhost:8080/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ status: newStatus })
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(text || 'Erro ao atualizar status');
            });
        }
        return response.text();
    })
    .then(() => {
        alert(`Status do pedido #${orderId} atualizado para ${newStatus}`);
        
        if (newStatus === 'ENTREGUE') {
            sendEmailNotification(orderId);
        }

        fetchOrders(token);
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao atualizar o status. Verifique o servidor.');
    });
}

function sendEmailNotification(orderId) {
    const token = localStorage.getItem('token');

    fetch(`http://localhost:8080/api/orders/${orderId}/send-email`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (response.ok) {
            console.log(`E-mail enviado com sucesso para o pedido #${orderId}`);
        } else {
            console.error(`Falha ao enviar e-mail para o pedido #${orderId}`);
        }
    })
    .catch(error => {
        console.error('Erro ao enviar e-mail:', error);
    });
}


function deleteOrder(orderId) {
    const token = localStorage.getItem('token');

    if (confirm(`Tem certeza que deseja excluir o pedido #${orderId}?`)) {
        fetch(`http://localhost:8080/api/orders/${orderId}/delete`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => {
            if (response.status === 204) {
                alert(`Pedido #${orderId} excluído com sucesso.`);
                fetchOrders(token); // Atualiza a lista após excluir
            } else if (response.status === 404) {
                alert('Pedido não encontrado.');
            } else {
                throw new Error('Erro ao excluir pedido');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro na conexão com o servidor');
        });
    }
}



function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
}
