
"use strict";

(function () {
    function iniciarInstalacaoYoka() {
        const botao = document.getElementById("instalarYokaBtn");

        if (!botao || botao.dataset.instalacaoInicializada === "true") {
            return;
        }

        botao.dataset.instalacaoInicializada = "true";

        let instalacaoPendente = null;

        const eIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

        const modos = [
            window.matchMedia("(display-mode: standalone)"),
            window.matchMedia("(display-mode: fullscreen)"),
            window.matchMedia("(display-mode: minimal-ui)")
        ];

        function estaInstalada() {
            return modos.some(modo => modo.matches) ||
                window.navigator.standalone === true;
        }

        function atualizarBotao() {
            const instalada = estaInstalada();

            botao.hidden = instalada;
            botao.style.display = instalada ? "none" : "flex";
        }

        window.addEventListener("beforeinstallprompt", evento => {
            evento.preventDefault();
            instalacaoPendente = evento;
            console.log("Yoka: instalação automática disponível.");
        });

        botao.addEventListener("click", async () => {
            if (estaInstalada()) {
                alert("A Yoka já está instalada neste dispositivo.");
                atualizarBotao();
                return;
            }

            if (eIOS) {
                alert(
                    "Para instalar a Yoka no iPhone:\n\n" +
                    "1. Abre esta página no Safari.\n" +
                    "2. Toca em Partilhar.\n" +
                    "3. Escolhe «Adicionar ao ecrã principal»."
                );
                return;
            }

            if (instalacaoPendente) {
                const evento = instalacaoPendente;
                instalacaoPendente = null;

                try {
                    await evento.prompt();
                    const resultado = await evento.userChoice;

                    if (resultado.outcome === "accepted") {
                        console.log("Yoka: instalação aceite.");
                    }
                } catch (erro) {
                    console.error("Yoka: erro de instalação:", erro);
                    alert("Não foi possível iniciar a instalação pelo botão.");
                }

                atualizarBotao();
                return;
            }

            alert(
                "Para instalar a Yoka no Edge:\n\n" +
                "1. Abre o menu dos três pontos (⋯).\n" +
                "2. Seleciona «Aplicações».\n" +
                "3. Escolhe «Instalar este site como uma aplicação».\n" +
                "4. Confirma a instalação."
            );
        });

        window.addEventListener("appinstalled", () => {
            instalacaoPendente = null;
            atualizarBotao();
        });

        modos.forEach(modo => {
            modo.addEventListener("change", atualizarBotao);
        });

        atualizarBotao();
        console.log("Yoka: botão de instalação inicializado.");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciarInstalacaoYoka);
    } else {
        iniciarInstalacaoYoka();
    }
})();
