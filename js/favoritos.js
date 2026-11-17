
document.addEventListener("DOMContentLoaded", async function () {

    console.log("Yoka: página de favoritos iniciada");


    /* ============================================================
       ELEMENTOS
    ============================================================ */

    const loading =
        document.getElementById("favoritesLoading");

    const errorBox =
        document.getElementById("favoritesError");

    const emptyBox =
        document.getElementById("favoritesEmpty");

    const list =
        document.getElementById("favoritesList");

    const count =
        document.getElementById("favoritesCount");


    /* ============================================================
       VERIFICAR LOGIN
    ============================================================ */

    const token =
        YokaAPI.obterToken();


    if (!token) {

        if (loading) {
            loading.style.display = "none";
        }

        if (errorBox) {

            errorBox.textContent =
                "Faça login para ver as suas músicas favoritas.";

            errorBox.style.display = "block";
        }

        return;
    }


    /* ============================================================
       CARREGAR FAVORITOS
    ============================================================ */

    try {

        console.log("Yoka: carregando /favorites");


        const resposta =
            await YokaAPI.apiRequest(
                "/favorites"
            );


        console.log(
            "Yoka: resposta dos favoritos:",
            resposta
        );


        if (
            !resposta ||
            resposta.sucesso !== true
        ) {

            throw new Error(
                resposta?.mensagem ||
                "Não foi possível carregar os favoritos."
            );
        }


        const favoritos =
            Array.isArray(
                resposta.favoritos
            )
                ? resposta.favoritos
                : [];


        /* ========================================================
           ESCONDER LOADING
        ======================================================== */

        if (loading) {

            loading.style.display =
                "none";
        }


        if (errorBox) {

            errorBox.style.display =
                "none";
        }


        /* ========================================================
           CONTADOR
        ======================================================== */

        atualizarContador(
            favoritos.length
        );


        /* ========================================================
           NENHUM FAVORITO
        ======================================================== */

        if (
            favoritos.length === 0
        ) {

            if (emptyBox) {

                emptyBox.style.display =
                    "block";
            }

            return;
        }


        if (emptyBox) {

            emptyBox.style.display =
                "none";
        }


        /* ========================================================
           RENDERIZAR
        ======================================================== */

        renderizarFavoritos(
            favoritos
        );


    } catch (erro) {

        console.error(
            "Yoka: erro ao carregar favoritos:",
            erro
        );


        if (loading) {

            loading.style.display =
                "none";
        }


        if (errorBox) {

            errorBox.textContent =
                erro.message ||
                "Não foi possível carregar os favoritos.";

            errorBox.style.display =
                "block";
        }
    }

});


/* ================================================================
   RENDERIZAR FAVORITOS
================================================================ */

function renderizarFavoritos(favoritos) {

    const list =
        document.getElementById(
            "favoritesList"
        );


    if (!list) {
        return;
    }


    list.innerHTML = "";


    favoritos.forEach(
        favorito => {

            const elemento =
                criarFavorito(
                    favorito
                );

            list.appendChild(
                elemento
            );
        }
    );

}


/* ================================================================
   CRIAR CARTÃO
================================================================ */

function criarFavorito(favorito) {

    const item =
        document.createElement(
            "article"
        );


    item.className =
        "favorite-song-card";


    const songId =
        favorito.song_id;


    const titulo =
        favorito.title ||
        "Sem título";


    const artista =
        favorito.artist_name ||
        "Artista";


    const capa =
        favorito.cover_url ||
        "";

const genero = escapeHtml(
    favorito.genre || favorito.genero || ""
);
    item.innerHTML = `

       <div class="favorite-song-cover">

    ${
        capa
            ? `
                <img
                    src="${escapeHtml(
                        obterUrlArquivo(capa)
                    )}"
                    alt="Capa da música"
                    loading="lazy"
                >
              `
            : `
                <div class="favorite-no-cover">
                    🎵
                </div>
              `
    }

    ${
        genero
            ? `
                <span class="favorite-song-genre">
                    ${genero}
                </span>
              `
            : ""
    }

</div>


        <div class="favorite-song-info">

            <h2>
                ${escapeHtml(titulo)}
            </h2>

            <p>
                ${escapeHtml(artista)}
            </p>

        </div>


        <div class="favorite-song-actions">

            <button
                type="button"
                class="favorite-play-button"
            >
                ▶ Ouvir
            </button>


            <button
                type="button"
                class="favorite-remove-button"
            >
                ☆ Remover
            </button>

        </div>

    `;


    /* ============================================================
       BOTÃO OUVIR
    ============================================================ */

    const playButton =
        item.querySelector(
            ".favorite-play-button"
        );


    if (playButton) {

        playButton.addEventListener(
            "click",
            function () {

                if (!songId) {

                    alert(
                        "ID da música inválido."
                    );

                    return;
                }


                /*
                 * Abre a página song.html
                 *
                 * autoplay=1 informa ao song.js
                 * que a música deve tentar começar
                 * automaticamente.
                 */
window.location.href =
    "./song.html?id=" +
                    "&autoplay=1";

            }
        );
    }


    /* ============================================================
       BOTÃO REMOVER
    ============================================================ */

    const removeButton =
        item.querySelector(
            ".favorite-remove-button"
        );


    if (removeButton) {

        removeButton.addEventListener(
            "click",
            function () {

                removerFavorito(
                    songId,
                    item
                );

            }
        );
    }


    return item;

}


/* ================================================================
   REMOVER FAVORITO
================================================================ */

async function removerFavorito(
    songId,
    elemento
) {

    const token =
        YokaAPI.obterToken();


    if (!token) {

        alert(
            "Faça login para alterar os favoritos."
        );

        return;
    }


    if (!songId) {

        alert(
            "ID da música inválido."
        );

        return;
    }


    const confirmar =
        confirm(
            "Tem certeza que deseja remover esta música dos favoritos?"
        );


    if (!confirmar) {
        return;
    }


    const botao =
        elemento.querySelector(
            ".favorite-remove-button"
        );


    if (botao) {

        botao.disabled =
            true;

        botao.textContent =
            "Removendo...";
    }


    try {

        const resposta =
            await YokaAPI.apiRequest(
                "/favorites/song/" +
                encodeURIComponent(songId),
                {
                    method: "DELETE"
                }
            );


        console.log(
            "Resposta remover favorito:",
            resposta
        );


        if (
            !resposta ||
            resposta.sucesso !== true
        ) {

            throw new Error(
                resposta?.mensagem ||
                "Não foi possível remover o favorito."
            );
        }


        /* ========================================================
           REMOVER CARTÃO
        ======================================================== */

        elemento.remove();


        /* ========================================================
           ATUALIZAR CONTADOR
        ======================================================== */

        const list =
            document.getElementById(
                "favoritesList"
            );


        const total =
            list
                ? list.children.length
                : 0;


        atualizarContador(
            total
        );


        /* ========================================================
           LISTA VAZIA
        ======================================================== */

        if (total === 0) {

            const emptyBox =
                document.getElementById(
                    "favoritesEmpty"
                );


            if (emptyBox) {

                emptyBox.style.display =
                    "block";
            }
        }


    } catch (erro) {

        console.error(
            "Erro ao remover favorito:",
            erro
        );


        alert(
            erro.message ||
            "Não foi possível remover o favorito."
        );


        if (botao) {

            botao.disabled =
                false;

            botao.textContent =
                "☆ Remover";
        }
    }

}


/* ================================================================
   CONTADOR
================================================================ */

function atualizarContador(total) {

    const count =
        document.getElementById(
            "favoritesCount"
        );


    if (!count) {
        return;
    }


    if (total === 1) {

        count.textContent =
            "1 música";

    } else {

        count.textContent =
            total +
            " músicas";
    }

}


/* ================================================================
   URL DOS ARQUIVOS
================================================================ */

function obterUrlArquivo(caminho) {

    if (!caminho) {
        return "";
    }


    if (
        caminho.startsWith("http://") ||
        caminho.startsWith("https://")
    ) {

        return caminho;
    }


    const origem =
        YokaAPI.API_BASE_URL.replace(
            "/api/v1",
            ""
        );


    if (caminho.startsWith("/")) {

        return origem +
            caminho;
    }


    return origem +
        "/" +
        caminho;

}


/* ================================================================
   ESCAPAR HTML
================================================================ */

function escapeHtml(valor) {

    return String(
        valor ?? ""
    )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
