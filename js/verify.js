document.addEventListener('DOMContentLoaded', () => {
    const btnVerificar = document.getElementById('btnVerificar');
    const inputCodigo = document.getElementById('codigo');
    const linkReenviar = document.getElementById('linkReenviar');

    // Captura o email da URL
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');

    if (!email) {
        alert('Email não encontrado na URL. Retornando ao cadastro.');
        window.location.href = '/html/register.html';
    }

    // Verificar código
    btnVerificar.addEventListener('click', async () => {
        const codigo = inputCodigo.value.trim();

        if (!codigo) {
            alert('Digite o código de verificação!');
            return;
        }

        btnVerificar.disabled = true;
        const textoOriginal = btnVerificar.textContent;
        btnVerificar.textContent = 'Verificando...';

        try {
            const response = await fetch('http://localhost:8080/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    verificationCode: codigo
                })
            });

            if (response.ok) {
                alert('Conta verificada com sucesso!');
                window.location.href = '/html/login.html';
            } else {
                const error = await response.text();
                alert('Erro na verificação: ' + error);
            }
        } catch (err) {
            alert('Erro de conexão com o servidor.');
            console.error(err);
        } finally {
            btnVerificar.disabled = false;
            btnVerificar.textContent = textoOriginal;
        }
    });

    linkReenviar.addEventListener('click', async (e) => {
        e.preventDefault();

        linkReenviar.textContent = 'Reenviando...';
        linkReenviar.style.pointerEvents = 'none';

        try {
            const response = await fetch(`http://localhost:8080/api/auth/resend-verification?email=${email}`, {
                method: 'POST'
            });

            if (response.ok) {
                alert('Código reenviado! Verifique seu email.');
            } else {
                const error = await response.text();
                alert('Erro ao reenviar código: ' + error);
            }
        } catch (err) {
            alert('Erro de conexão com o servidor.');
            console.error(err);
        } finally {
            linkReenviar.textContent = 'Reenviar código';
            linkReenviar.style.pointerEvents = 'auto';
        }
    });
});