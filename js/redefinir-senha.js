"use strict";


const API_BASE = "https://wairujyynjohterkqort.supabase.co/functions/v1/yoka";


const form =
    document.getElementById(
        "redefinirSenhaForm"
    );


const passwordInput =
    document.getElementById(
        "password"
    );


const confirmPasswordInput =
    document.getElementById(
        "confirmPassword"
    );


const mensagem =
    document.getElementById(
        "redefinirMensagem"
    );


const botao =
    document.getElementById(
        "btnRedefinirSenha"
    );


/*
|--------------------------------------------------------------------------
| OBTER TOKEN DA URL
|--------------------------------------------------------------------------
*/

const parametros =
    new URLSearchParams(
        window.location.search
    );


const token =
    parametros.get("token");


/*
|--------------------------------------------------------------------------
| MENSAGEM
|--------------------------------------------------------------------------
*/

function mostrarMensagem(
    texto,
    tipo = "sucesso"
) {

    mensagem.textContent =
        texto;

    mensagem.style.display =
        "block";

    mensagem.className =
        `login-mensagem ${tipo}`;

}


/*
|--------------------------------------------------------------------------
| VERIFICAR TOKEN
|--------------------------------------------------------------------------
*/

if (!token) {

    mostrarMensagem(
        "O link de recuperação é inválido ou está incompleto.",
        "erro"
    );

    botao.disabled = true;

}


/*
|--------------------------------------------------------------------------
| ENVIAR NOVA SENHA
|--------------------------------------------------------------------------
*/

form.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        if (!token) {

            return;

        }


        const password =
            passwordInput.value;


        const confirmPassword =
            confirmPasswordInput.value;


        /*
        |--------------------------------------------------------------------------
        | VALIDAR SENHAS
        |--------------------------------------------------------------------------
        */

        if (
            password.length < 8
        ) {

            mostrarMensagem(
                "A palavra-passe deve ter pelo menos 8 caracteres.",
                "erro"
            );

            return;

        }


        if (
            password !== confirmPassword
        ) {

            mostrarMensagem(
                "As palavras-passe não coincidem.",
                "erro"
            );

            return;

        }


        /*
        |--------------------------------------------------------------------------
        | BLOQUEAR BOTÃO
        |--------------------------------------------------------------------------
        */

        botao.disabled = true;

        botao.textContent =
            "A alterar...";


        mensagem.style.display =
            "none";


        try {

            const resposta =
                await fetch(
                    `${API_BASE}/auth/reset-password`,
                    {
                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                token,

                                password

                            })

                    }
                );


            const dados =
                await resposta.json();


            if (!resposta.ok) {

                throw new Error(
                    dados.mensagem ||
                    "Não foi possível alterar a palavra-passe."
                );

            }


            mostrarMensagem(
                dados.mensagem ||
                "Palavra-passe alterada com sucesso.",
                "sucesso"
            );


            form.reset();


            /*
            |--------------------------------------------------------------------------
            | REDIRECIONAR PARA LOGIN
            |--------------------------------------------------------------------------
            */

            setTimeout(
                function() {

                    window.location.href =
                        "login.html";

                },
                2000
            );


        } catch (erro) {

            console.error(
                "Erro ao redefinir palavra-passe:",
                erro
            );


            mostrarMensagem(
                erro.message ||
                "Ocorreu um erro. Tente novamente.",
                "erro"
            );


            botao.disabled = false;

            botao.textContent =
                "Redefinir palavra-passe";

        }

    }
);