"use strict";

const API_BASE = "/api/v1";

const mensagemElement =
    document.getElementById("mensagem");

const token =
    new URLSearchParams(
        window.location.search
    ).get("token");


async function verificarEmail() {

    if (!token) {
        mensagemElement.textContent =
            "Link de confirmação inválido.";

        return;
    }

    try {

        const resposta =
            await fetch(
                `${API_BASE}/auth/verify-email?token=${encodeURIComponent(token)}`
            );

        const dados =
            await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.mensagem ||
                "Não foi possível confirmar o email."
            );
        }

        mensagemElement.textContent =
            dados.mensagem ||
            "Email confirmado com sucesso.";

        const botao =
            document.getElementById("loginButton");

        if (botao) {
            botao.style.display = "inline-block";
        }

    } catch (erro) {

        mensagemElement.textContent =
            erro.message ||
            "Ocorreu um erro ao confirmar o email.";
    }
}


verificarEmail();