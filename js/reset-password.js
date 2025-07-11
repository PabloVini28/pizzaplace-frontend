document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');

    const inputEmail = document.getElementById('email');
    const inputToken = document.getElementById('token');
    const inputNewPassword = document.getElementById('newPassword');
    const inputConfirmPassword = document.getElementById('confirmPassword');
    const btnReset = document.getElementById('btnReset');

    if (email) {
        inputEmail.value = email;
    }

    btnReset.addEventListener('click', async () => {
        const emailValue = inputEmail.value.trim();
        const tokenValue = inputToken.value.trim();
        const newPassword = inputNewPassword.value.trim();
        const confirmPassword = inputConfirmPassword.value.trim();

        if (!emailValue || !tokenValue || !newPassword || !confirmPassword) {
            alert('Preencha todos os campos!');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }

        btnReset.textContent = 'Redefinindo...';
        btnReset.disabled = true;

        try {
            const response = await fetch(`http://localhost:8080/api/auth/reset-password?email=${encodeURIComponent(emailValue)}&token=${encodeURIComponent(tokenValue)}&newPassword=${encodeURIComponent(newPassword)}`, {
                method: 'POST'
            });

            if (response.ok) {
                alert('Senha redefinida com sucesso!');
                window.location.href = '/html/login.html';
            } else {
                const error = await response.text();
                alert('Erro ao redefinir senha: ' + error);
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao conectar com o servidor.');
        }
    });
});
