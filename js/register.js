document.addEventListener('DOMContentLoaded', () => {
    const btnCadastrar = document.getElementById('btnRegister');

    btnCadastrar.addEventListener('click', async () => {
        const name = document.getElementById('nome').value.trim();
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('senha').value.trim();
        const confirmPassword = document.getElementById('confirmarSenha').value.trim();
        const address = document.getElementById('endereco').value.trim();
        const phoneNumber = document.getElementById('telefone').value.trim();

        if (!name || !username || !email || !password || !confirmPassword || !address || !phoneNumber) {
            alert('Preencha todos os campos!');
            return;
        }

        if (password !== confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }

        const userData = {
            name,
            username,
            email,
            password,
            confirmPassword,
            address,
            phoneNumber
        };

        btnCadastrar.disabled = true;
        btnCadastrar.textContent = 'Cadastrando...';

        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                alert('Cadastro realizado! Verifique seu e-mail para confirmar.');
                window.location.href = `/html/verify.html?email=${encodeURIComponent(email)}`;
            } else {
                const errorText = await response.text();
                alert('Erro no cadastro: ' + errorText);
            }
        } catch (error) {
            alert('Erro ao conectar com o servidor.');
            console.error(error);
        } finally {
            btnCadastrar.disabled = false;
            btnCadastrar.textContent = 'Cadastrar';
        }
    });
});