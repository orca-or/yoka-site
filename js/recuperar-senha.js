"use strict";


const API_BASE = "/api/v1";


const form =
    document.getElementById(
        "recuperarSenhaForm"
    );


const emailInput =
    document.getElementById(
        "email"
    );


const mensagem =
    document.getElementById(
        "recuperarMensagem"
    );


const botao =
    document.getElementById(
        "btnRecuperarSenha"
    );


function mostrarMensagem(
    texto,
    tipo = "sucesso"
) {

    mensagem.textContent = texto;

    mensagem.style.display = "block";

    mensagem.className =
        `login-mensagem ${tipo}`;

}


form.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const email =
            emailInput.value
                .trim()
                .toLowerCase();


        if (!email) {

            mostrarMensagem(
                "Digite o seu email.",
                "erro"
            );

            return;

        }


        botao.disabled = true;

        botao.textContent =
            "Enviando...";


        mensagem.style.display =
            "none";


        try {

            const resposta =
                await fetch(
                    `${API_BASE}/auth/forgot-password`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email
                        })
                    }
                );


            const dados =
                await resposta.json();


            if (!resposta.ok) {

                throw new Error(
                    dados.mensagem ||
                    "Não foi possível processar o pedido."
                );

            }


         mostrarMensagem(
    "Email enviado com sucesso! Verifique a sua caixa de entrada ou a pasta de spam para continuar a recuperação da sua palavra-passe.",
    "sucesso"
);

            form.reset();


        } catch (erro) {

            console.error(
                "Erro ao recuperar palavra-passe:",
                erro
            );


            mostrarMensagem(
                erro.message ||
                "Ocorreu um erro. Tente novamente.",
                "erro"
            );

        } finally {

            botao.disabled = false;

            botao.textContent =
                "Enviar link de recuperação";

        }

    }
);