document.addEventListener('DOMContentLoaded', () => {
    const btnLogin = document.getElementById('btnLogin');
    const inputUsuario = document.getElementById('usuario');
    const inputSenha = document.getElementById('senha');

    btnLogin.addEventListener('click', async () => {
        const usuario = inputUsuario.value.trim();
        const senha = inputSenha.value.trim();

        if (!usuario || !senha) {
            alert('Preencha todos os campos!');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    login: usuario,
                    password: senha
                })
            });

            if (response.ok) {
            const data = await response.json();

            if (data.token && data.token !== "Login failed") {
                localStorage.setItem('token', data.token);
                alert('Login realizado com sucesso!');
                window.location.href = '/html/home.html';
            } else {
                alert('Login inválido! Verifique usuário e senha.');
            }
        } else {
            const error = await response.text();
            alert('Erro no login: ' + error);
        }
        } catch (err) {
            alert('Erro de conexão com o servidor.');
            console.error(err);
        }
    });
});
