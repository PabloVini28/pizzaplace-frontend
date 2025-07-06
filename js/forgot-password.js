document.addEventListener('DOMContentLoaded', () => {
    const btnEnviar = document.getElementById('btnEnviar');
    const inputEmail = document.getElementById('email');

    btnEnviar.addEventListener('click', async () => {
        const email = inputEmail.value.trim();

        if (!email) {
            alert('Por favor, insira um email válido.');
            return;
        }

        btnEnviar.disabled = true;
        const textoOriginal = btnEnviar.textContent;
        btnEnviar.textContent = 'Enviando...';

        try {
            const response = await fetch('http://localhost:8080/api/auth/request-password-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email })
            });

            if (response.ok) {
                alert('Email de recuperação enviado! Verifique sua caixa de entrada.');
                window.location.href = `/html/reset-password.html?email=${email}`;
            } else {
                const error = await response.text();
                alert('Erro ao solicitar recuperação: ' + error);
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao conectar com o servidor.');
        } finally {
            
            btnEnviar.disabled = false;
            btnEnviar.textContent = textoOriginal;
        }
    });
});