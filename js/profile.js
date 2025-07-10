function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Erro ao decodificar o token:', e);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        const payload = parseJwt(token);
        console.log('Payload do token:', payload);

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

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/html/login.html';
}

function tokenExpirado(decodedToken) {
    if (!decodedToken.exp) return true;
    const agora = Math.floor(Date.now() / 1000);
    return decodedToken.exp < agora;
}

function renderizarPerfil(user) {
    const profileDiv = document.querySelector('.profile');
    profileDiv.innerHTML = `
        <h2>Dados do Usuário</h2>
        <div class="profile-card">
            <p><strong>ID:</strong> ${user.id}</p>
            <p><strong>Nome:</strong> ${user.name}</p>
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Endereço:</strong> ${user.address}</p>
        </div>

        <div class="buttons">
            <button onclick="logout()">LOG OUT</button>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Usuário não autenticado. Faça login novamente.');
        window.location.href = '/html/login.html';
        return;
    }

    const decoded = parseJwt(token);

    if (!decoded || tokenExpirado(decoded)) {
        alert('Sua sessão expirou. Por favor, faça login novamente.');
        logout();
        return;
    }

    const userId = decoded.userId; 

    if (!userId) {
        alert('Token inválido. Faça login novamente.');
        logout();
        return;
    }

    fetch(`http://localhost:8080/api/users/id/${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(async response => {
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Erro ${response.status}: ${text}`);
        }
        return response.json();
    })
    .then(user => {
        renderizarPerfil(user);
    })
    .catch(error => {
        console.error('Erro:', error);
        alert(error.message);
        if (error.message.includes('403') || error.message.includes('401')) {
            logout();
        }
    });
});
