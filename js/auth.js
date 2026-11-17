"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {


        /*
        |--------------------------------------------------------------------------
        | LOGIN
        |--------------------------------------------------------------------------
        */

        const loginForm =
            document.getElementById(
                "loginForm"
            );

        const loginMensagem =
            document.getElementById(
                "loginMensagem"
            );


        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                async (event) => {

                    event.preventDefault();


                    const emailElement =
                        document.getElementById(
                            "email"
                        );

                    const passwordElement =
                        document.getElementById(
                            "password"
                        );


                    const email =
                        emailElement
                            ? emailElement.value.trim()
                            : "";

                    const password =
                        passwordElement
                            ? passwordElement.value
                            : "";


                    /*
                    |--------------------------------------------------------------------------
                    | VALIDAÇÃO
                    |--------------------------------------------------------------------------
                    */

                    if (!email || !password) {

                        mostrarMensagem(
                            loginMensagem,
                            "Preencha o email e a senha.",
                            true
                        );

                        return;
                    }


                    /*
                    |--------------------------------------------------------------------------
                    | BOTÃO LOGIN
                    |--------------------------------------------------------------------------
                    */

                    const botao =
                        loginForm.querySelector(
                            "button[type='submit']"
                        );


                    if (botao) {

                        botao.disabled =
                            true;

                        botao.textContent =
                            "Entrando...";

                    }


                    /*
                    |--------------------------------------------------------------------------
                    | TENTAR LOGIN
                    |--------------------------------------------------------------------------
                    */

                    try {

                        const resposta =
                            await fetch(
                                `${YokaAPI.API_BASE_URL}/auth/login`,
                                {
                                    method: "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body:
                                        JSON.stringify({
                                            email,
                                            password
                                        })
                                }
                            );


                        const dados =
                            await resposta.json();


                        /*
                        |--------------------------------------------------------------------------
                        | VERIFICAR RESPOSTA
                        |--------------------------------------------------------------------------
                        */

                        if (
                            !resposta.ok ||
                            !dados.sucesso
                        ) {

                            const mensagemErro =
                                dados.mensagem ||
                                "Email ou senha incorretos.";


                            /*
                            |--------------------------------------------------------------------------
                            | EMAIL NÃO CONFIRMADO
                            |--------------------------------------------------------------------------
                            */

                            if (
                                mensagemErro ===
                                "Confirme o seu email antes de iniciar sessão."
                            ) {

                                mostrarMensagem(
                                    loginMensagem,
                                    mensagemErro,
                                    true
                                );


                                criarBotaoReenviarConfirmacao(
                                    loginForm,
                                    loginMensagem,
                                    email
                                );


                                return;
                            }


                            /*
                            |--------------------------------------------------------------------------
                            | OUTROS ERROS
                            |--------------------------------------------------------------------------
                            */

                            throw new Error(
                                mensagemErro
                            );
                        }


                        /*
                        |--------------------------------------------------------------------------
                        | REMOVER BOTÃO DE REENVIO
                        |--------------------------------------------------------------------------
                        */

                        const botaoReenviar =
                            document.getElementById(
                                "reenviarConfirmacao"
                            );


                        if (botaoReenviar) {

                            botaoReenviar.remove();

                        }


                        /*
                        |--------------------------------------------------------------------------
                        | GUARDAR TOKEN
                        |--------------------------------------------------------------------------
                        */

                        YokaAPI.guardarToken(
                            dados.token
                        );


                        /*
                        |--------------------------------------------------------------------------
                        | GUARDAR UTILIZADOR
                        |--------------------------------------------------------------------------
                        */

                        localStorage.setItem(
                            "yoka_usuario",
                            JSON.stringify(
                                dados.usuario
                            )
                        );


                        /*
                        |--------------------------------------------------------------------------
                        | MENSAGEM
                        |--------------------------------------------------------------------------
                        */

                        mostrarMensagem(
                            loginMensagem,
                            "Login realizado com sucesso.",
                            false
                        );


                        /*
                        |--------------------------------------------------------------------------
                        | REDIRECIONAR
                        |--------------------------------------------------------------------------
                        */

                        setTimeout(
                            () => {

                                window.location.href =
                                    "index.html";

                            },
                            500
                        );


                    } catch (erro) {

                        console.error(
                            "Erro no login:",
                            erro
                        );


                        mostrarMensagem(
                            loginMensagem,
                            erro.message ||
                            "Não foi possível realizar o login.",
                            true
                        );


                    } finally {

                        if (botao) {

                            botao.disabled =
                                false;

                            botao.textContent =
                                "Entrar";

                        }

                    }

                }
            );

        }


        /*
        |--------------------------------------------------------------------------
        | REGISTRO
        |--------------------------------------------------------------------------
        */

        const registerForm =
            document.getElementById(
                "registerForm"
            );

        const registerMensagem =
            document.getElementById(
                "registerMensagem"
            );


        if (registerForm) {

            registerForm.addEventListener(
                "submit",
                async (event) => {

                    event.preventDefault();


                    const nameElement =
                        document.getElementById(
                            "name"
                        );

                    const emailElement =
                        document.getElementById(
                            "email"
                        );

                    const passwordElement =
                        document.getElementById(
                            "password"
                        );


                    const name =
                        nameElement
                            ? nameElement.value.trim()
                            : "";

                    const email =
                        emailElement
                            ? emailElement.value.trim()
                            : "";

                    const password =
                        passwordElement
                            ? passwordElement.value
                            : "";


                    /*
                    |--------------------------------------------------------------------------
                    | VALIDAÇÃO
                    |--------------------------------------------------------------------------
                    */

                    if (
                        !name ||
                        !email ||
                        !password
                    ) {

                        mostrarMensagem(
                            registerMensagem,
                            "Preencha todos os campos.",
                            true
                        );

                        return;
                    }


                    if (
                        name.length < 2
                    ) {

                        mostrarMensagem(
                            registerMensagem,
                            "O nome deve ter pelo menos 2 caracteres.",
                            true
                        );

                        return;
                    }


                    /*
                    |--------------------------------------------------------------------------
                    | SENHA
                    |--------------------------------------------------------------------------
                    */

                    if (
                        password.length < 8
                    ) {

                        mostrarMensagem(
                            registerMensagem,
                            "A senha deve ter pelo menos 8 caracteres.",
                            true
                        );

                        return;
                    }


                    /*
                    |--------------------------------------------------------------------------
                    | BOTÃO
                    |--------------------------------------------------------------------------
                    */

                    const botao =
                        registerForm.querySelector(
                            "button[type='submit']"
                        );


                    if (botao) {

                        botao.disabled =
                            true;

                        botao.textContent =
                            "Criando conta...";

                    }


                    /*
                    |--------------------------------------------------------------------------
                    | CRIAR CONTA
                    |--------------------------------------------------------------------------
                    */

                    try {

                        const resposta =
                            await fetch(
                                `${YokaAPI.API_BASE_URL}/auth/register`,
                                {
                                    method: "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body:
                                        JSON.stringify({
                                            name,
                                            email,
                                            password
                                        })
                                }
                            );


                        const dados =
                            await resposta.json();


                        /*
                        |--------------------------------------------------------------------------
                        | VERIFICAR RESPOSTA
                        |--------------------------------------------------------------------------
                        */

                        if (
                            !resposta.ok ||
                            !dados.sucesso
                        ) {

                            throw new Error(
                                dados.mensagem ||
                                "Não foi possível criar a conta."
                            );

                        }


                        /*
                        |--------------------------------------------------------------------------
                        | SUCESSO
                        |--------------------------------------------------------------------------
                        */

                        mostrarMensagem(
                            registerMensagem,
                            "Conta criada. Verifique o seu email para ativar a conta.",
                            false
                        );


                        /*
                        |--------------------------------------------------------------------------
                        | LIMPAR FORMULÁRIO
                        |--------------------------------------------------------------------------
                        */

                        registerForm.reset();


                        /*
                        |--------------------------------------------------------------------------
                        | IR PARA LOGIN
                        |--------------------------------------------------------------------------
                        */

                        setTimeout(
                            () => {

                                window.location.href =
                                    "login.html";

                            },
                            50000
                        );


                    } catch (erro) {

                        console.error(
                            "Erro no cadastro:",
                            erro
                        );


                        mostrarMensagem(
                            registerMensagem,
                            erro.message ||
                            "Não foi possível criar a conta.",
                            true
                        );


                    } finally {

                        if (botao) {

                            botao.disabled =
                                false;

                            botao.textContent =
                                "Criar conta";

                        }

                    }

                }
            );

        }


        /*
        |--------------------------------------------------------------------------
        | CRIAR BOTÃO — REENVIAR CONFIRMAÇÃO
        |--------------------------------------------------------------------------
        */

        function criarBotaoReenviarConfirmacao(
            formulario,
            elementoMensagem,
            email
        ) {

            /*
            |--------------------------------------------------------------------------
            | VERIFICAR SE JÁ EXISTE
            |--------------------------------------------------------------------------
            */

            let botaoReenviar =
                document.getElementById(
                    "reenviarConfirmacao"
                );


            if (botaoReenviar) {

                return;

            }


            /*
            |--------------------------------------------------------------------------
            | CRIAR BOTÃO
            |--------------------------------------------------------------------------
            */

            botaoReenviar =
                document.createElement(
                    "button"
                );


            botaoReenviar.type =
                "button";

            botaoReenviar.id =
                "reenviarConfirmacao";

            botaoReenviar.textContent =
                "Reenviar email de confirmação";


            /*
            |--------------------------------------------------------------------------
            | ESTILO BÁSICO
            |--------------------------------------------------------------------------
            */

            botaoReenviar.style.display =
                "block";

            botaoReenviar.style.marginTop =
                "10px";

            botaoReenviar.style.cursor =
                "pointer";


            /*
            |--------------------------------------------------------------------------
            | INSERIR BOTÃO
            |--------------------------------------------------------------------------
            */

            if (
                elementoMensagem &&
                elementoMensagem.parentElement
            ) {

                elementoMensagem.parentElement
                    .appendChild(
                        botaoReenviar
                    );

            } else {

                formulario.appendChild(
                    botaoReenviar
                );

            }


            /*
            |--------------------------------------------------------------------------
            | EVENTO DO BOTÃO
            |--------------------------------------------------------------------------
            */

            botaoReenviar.addEventListener(
                "click",
                async () => {

                    /*
                    |--------------------------------------------------------------------------
                    | BLOQUEAR IMEDIATAMENTE
                    |--------------------------------------------------------------------------
                    */

                    botaoReenviar.disabled =
                        true;

                    botaoReenviar.textContent =
                        "Enviando...";


                    try {

                        /*
                        |--------------------------------------------------------------------------
                        | SOLICITAR NOVO EMAIL
                        |--------------------------------------------------------------------------
                        */

                        const resposta =
                            await fetch(
                                `${YokaAPI.API_BASE_URL}/auth/resend-verification`,
                                {
                                    method: "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body:
                                        JSON.stringify({
                                            email
                                        })
                                }
                            );


                        const dados =
                            await resposta.json();


                        /*
                        |--------------------------------------------------------------------------
                        | VERIFICAR LIMITE DE 60 SEGUNDOS
                        |--------------------------------------------------------------------------
                        */

                        if (
                            resposta.status === 429
                        ) {

                            mostrarMensagem(
                                elementoMensagem,
                                dados.mensagem ||
                                "Aguarde antes de solicitar outro email.",
                                true
                            );


                            iniciarCooldownReenvio(
                                botaoReenviar,
                                extrairSegundosCooldown(
                                    dados.mensagem
                                )
                            );


                            return;
                        }


                        /*
                        |--------------------------------------------------------------------------
                        | OUTROS ERROS
                        |--------------------------------------------------------------------------
                        */

                        if (
                            !resposta.ok ||
                            !dados.sucesso
                        ) {

                            throw new Error(
                                dados.mensagem ||
                                "Não foi possível reenviar o email."
                            );

                        }


                        /*
                        |--------------------------------------------------------------------------
                        | SUCESSO
                        |--------------------------------------------------------------------------
                        */

                        mostrarMensagem(
                            elementoMensagem,
                            "Verifique o seu e-mail, um novo email de confirmação foi enviado.",
                            false
                        );


                        /*
                        |--------------------------------------------------------------------------
                        | INICIAR CONTAGEM DE 60 SEGUNDOS
                        |--------------------------------------------------------------------------
                        */

                        iniciarCooldownReenvio(
                            botaoReenviar,
                            60
                        );


                    } catch (erro) {

                        console.error(
                            "Erro ao reenviar confirmação:",
                            erro
                        );


                        mostrarMensagem(
                            elementoMensagem,
                            erro.message ||
                            "Não foi possível reenviar o email.",
                            true
                        );


                        /*
                        |--------------------------------------------------------------------------
                        | LIBERAR BOTÃO EM CASO DE ERRO
                        |--------------------------------------------------------------------------
                        */

                        botaoReenviar.disabled =
                            false;

                        botaoReenviar.textContent =
                            "Reenviar email de confirmação";

                    }

                }
            );

        }


        /*
        |--------------------------------------------------------------------------
        | COOLDOWN — 60 SEGUNDOS
        |--------------------------------------------------------------------------
        */

        function iniciarCooldownReenvio(
            botao,
            segundosIniciais = 60
        ) {

            let segundos =
                Number(
                    segundosIniciais
                );


            /*
            |--------------------------------------------------------------------------
            | GARANTIR VALOR VÁLIDO
            |--------------------------------------------------------------------------
            */

            if (
                !Number.isFinite(
                    segundos
                ) ||
                segundos <= 0
            ) {

                segundos = 60;

            }


            /*
            |--------------------------------------------------------------------------
            | BLOQUEAR BOTÃO
            |--------------------------------------------------------------------------
            */

            botao.disabled =
                true;


            botao.textContent =
                `Aguarde ${segundos}s...`;


            /*
            |--------------------------------------------------------------------------
            | CONTAGEM
            |--------------------------------------------------------------------------
            */

            const intervalo =
                setInterval(
                    () => {

                        segundos--;


                        /*
                        |--------------------------------------------------------------------------
                        | CHEGOU A ZERO
                        |--------------------------------------------------------------------------
                        */

                        if (
                            segundos <= 0
                        ) {

                            clearInterval(
                                intervalo
                            );


                            botao.disabled =
                                false;


                            botao.textContent =
                                "Reenviar email de confirmação";


                            return;
                        }


                        /*
                        |--------------------------------------------------------------------------
                        | ATUALIZAR TEXTO
                        |--------------------------------------------------------------------------
                        */

                        botao.textContent =
                            `Aguarde ${segundos}s...`;

                    },
                    1000
                );

        }


        /*
        |--------------------------------------------------------------------------
        | EXTRAIR SEGUNDOS DO ERRO 429
        |--------------------------------------------------------------------------
        */

        function extrairSegundosCooldown(
            mensagem
        ) {

            if (
                typeof mensagem !==
                "string"
            ) {

                return 60;

            }


            const resultado =
                mensagem.match(
                    /(\d+)\s*segundos?/i
                );


            if (!resultado) {

                return 60;

            }


            const segundos =
                Number(
                    resultado[1]
                );


            if (
                !Number.isFinite(
                    segundos
                ) ||
                segundos <= 0
            ) {

                return 60;

            }


            return segundos;

        }


        /*
        |--------------------------------------------------------------------------
        | MENSAGEM
        |--------------------------------------------------------------------------
        */

        function mostrarMensagem(
            elemento,
            texto,
            erro
        ) {

            if (!elemento) {

                return;

            }


            elemento.textContent =
                texto;


            elemento.style.display =
                "block";


            elemento.style.color =
                erro
                    ? "#dc2626"
                    : "#16a34a";

        }

    }
);