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