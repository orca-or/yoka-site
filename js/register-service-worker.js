
"use strict";

if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
        try {
            const registo = await navigator.serviceWorker.register(
                "/service-worker.js"
            );

            console.log(
                "Yoka: Service Worker registado com sucesso:",
                registo.scope
            );
        } catch (erro) {
            console.error(
                "Yoka: erro ao registar o Service Worker:",
                erro
            );
        }
    });
}
