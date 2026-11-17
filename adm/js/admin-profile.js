"use strict";

async function configurarLinkPerfilAdmin() {

    const link =
        document.getElementById("adminProfileLink");

    if (!link) {
        return;
    }

    const token =
        localStorage.getItem("yoka_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token");

    if (!token) {
        return;
    }

    try {

        const resposta =
            await fetch(
                "/api/v1/artists/me",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json"
                    }
                }
            );

        const dados =
            await resposta.json();

        if (!resposta.ok) {

            console.error(
                "Não foi possível obter o perfil do administrador:",
                dados
            );

            return;
        }

        const perfil =
            dados.perfil ||
            dados.artist ||
            dados.artista ||
            dados;

        const id =
            perfil?.id;

        if (!id) {

            console.error(
                "ID do perfil do administrador não encontrado:",
                dados
            );

            return;
        }

        link.href =
            `../artist.html?artistId=${encodeURIComponent(id)}`;

    } catch (erro) {

        console.error(
            "Erro ao configurar link do perfil:",
            erro
        );
    }
}


/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        configurarLinkPerfilAdmin();
    }
);