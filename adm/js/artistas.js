"use strict";


/*
|--------------------------------------------------------------------------
| CONFIGURAÇÃO
|--------------------------------------------------------------------------
*/

const API_BASE = "https://wairujyynjohterkqort.supabase.co/functions/v1/yoka";

const TOKEN_KEYS = [
    "yoka_token",
    "token",
    "accessToken",
    "access_token"
];


/*
|--------------------------------------------------------------------------
| ELEMENTOS
|--------------------------------------------------------------------------
*/

const elementos = {

    artistsGrid:
        document.getElementById("artistsGrid"),

    loadingContainer:
        document.getElementById("loadingContainer"),

    emptyContainer:
        document.getElementById("emptyContainer"),

    messageContainer:
        document.getElementById("messageContainer"),

    refreshButton:
        document.getElementById("refreshButton"),

    logoutButton:
        document.getElementById("logoutButton")

};


/*
|--------------------------------------------------------------------------
| TOKEN
|--------------------------------------------------------------------------
*/

function obterToken() {

    for (const chave of TOKEN_KEYS) {

        const token =
            localStorage.getItem(chave);

        if (token) {
            return token;
        }
    }

    return null;
}


/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
*/

async function apiFetch(
    endpoint,
    options = {}
) {

    const token =
        obterToken();

    if (!token) {

        window.location.href =
            "../login.html";

        throw new Error(
            "Token de autenticação não encontrado."
        );
    }

    const headers = {

        ...(options.headers || {}),

        Authorization:
            `Bearer ${token}`,

        "Content-Type":
            "application/json"
    };


    const response =
        await fetch(
            `${API_BASE}${endpoint}`,
            {
                ...options,
                headers
            }
        );


    let data = null;

    try {

        data =
            await response.json();

    } catch (error) {

        data = null;
    }


    if (
        response.status === 401 ||
        response.status === 403
    ) {

        localStorage.removeItem("token");
        localStorage.removeItem("yoka_token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("access_token");

        window.location.href =
            "../login.html";

        throw new Error(
            "Sessão expirada ou acesso não autorizado."
        );
    }


    if (!response.ok) {

        throw new Error(
            data?.mensagem ||
            "Erro ao comunicar com o servidor."
        );
    }


    return data;
}


/*
|--------------------------------------------------------------------------
| MENSAGENS
|--------------------------------------------------------------------------
*/

function mostrarMensagem(
    mensagem,
    tipo = "success"
) {

    if (
        !elementos.messageContainer
    ) {
        return;
    }


    elementos.messageContainer.innerHTML = "";


    const div =
        document.createElement("div");

    div.className =
        `message ${tipo}`;

    div.textContent =
        mensagem;


    elementos.messageContainer.appendChild(
        div
    );


    setTimeout(() => {

        if (
            elementos.messageContainer
        ) {
            elementos.messageContainer.innerHTML =
                "";
        }

    }, 5000);
}


/*
|--------------------------------------------------------------------------
| ESCAPAR HTML
|--------------------------------------------------------------------------
*/

function escaparHTML(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {
        return "";
    }


    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/*
|--------------------------------------------------------------------------
| URL DE IMAGEM
|--------------------------------------------------------------------------
*/

function obterImagem(
    url,
    tipo = "avatar"
) {

    if (!url) {

        if (tipo === "cover") {

            return (
                "data:image/svg+xml," +
                encodeURIComponent(`
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="800"
                        height="300"
                        viewBox="0 0 800 300"
                    >
                        <rect
                            width="800"
                            height="300"
                            fill="#1f2937"
                        />
                    </svg>
                `)
            );

        }


        return (
            "data:image/svg+xml," +
            encodeURIComponent(`
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="200"
                    height="200"
                    viewBox="0 0 200 200"
                >
                    <circle
                        cx="100"
                        cy="100"
                        r="100"
                        fill="#e5e7eb"
                    />

                    <circle
                        cx="100"
                        cy="82"
                        r="35"
                        fill="#9ca3af"
                    />

                    <path
                        d="M40 180
                           C45 140 70 120 100 120
                           C130 120 155 140 160 180"
                        fill="#9ca3af"
                    />
                </svg>
            `)
        );
    }


    return url;
}


/*
|--------------------------------------------------------------------------
| FORMATAÇÃO
|--------------------------------------------------------------------------
*/

function formatarNumero(valor) {

    const numero =
        Number(valor || 0);

    return numero.toLocaleString(
        "pt-BR"
    );
}


/*
|--------------------------------------------------------------------------
| RENDERIZAR ARTISTA
|--------------------------------------------------------------------------
*/

function criarCardArtista(
    artista
) {

    const card =
        document.createElement("article");

    card.className =
        "artist-card";


    const cover =
        obterImagem(
            artista.cover_url,
            "cover"
        );


    const avatar =
        obterImagem(
            artista.avatar_url ||
            artista.user_avatar_url,
            "avatar"
        );


    const nome =
        artista.artist_name ||
        artista.user_name ||
        "Artista sem nome";


    const genero =
        artista.genre ||
        "Gênero não informado";


    const localizacao =
        artista.location ||
        "Localização não informada";


    const verificado =
        artista.is_verified
            ? `
                <span
                    class="verified-badge"
                    title="Artista verificado"
                >
                    ✓
                </span>
            `
            : "";


    card.innerHTML = `

        <div
            class="artist-cover"
            style="
                background-image:
                    url('${escaparHTML(cover)}');
            "
        >

            <div class="artist-avatar-wrapper">

                <img
                    class="artist-avatar"
                    src="${escaparHTML(avatar)}"
                    alt="Avatar de ${escaparHTML(nome)}"
                    loading="lazy"
                >

            </div>

        </div>


        <div class="artist-content">

            <div class="artist-name-row">

                <h3 class="artist-name">
                    ${escaparHTML(nome)}
                </h3>

                ${verificado}

            </div>


            <p class="artist-genre">
                ${escaparHTML(genero)}
            </p>


            <p class="artist-location">
                📍 ${escaparHTML(localizacao)}
            </p>


            <div class="artist-stats">

                <div class="artist-stat">

                    <span class="artist-stat-value">
                        ${formatarNumero(
                            artista.total_musicas
                        )}
                    </span>

                    <span class="artist-stat-label">
                        Músicas
                    </span>

                </div>


                <div class="artist-stat">

                    <span class="artist-stat-value">
                        ${formatarNumero(
                            artista.total_reproducoes
                        )}
                    </span>

                    <span class="artist-stat-label">
                        Plays
                    </span>

                </div>


                <div class="artist-stat">

                    <span class="artist-stat-value">
                        ${formatarNumero(
                            artista.total_seguidores
                        )}
                    </span>

                    <span class="artist-stat-label">
                        Seguidores
                    </span>

                </div>

            </div>


            <div class="artist-user">

                <p class="artist-user-name">
                    Conta:
                    ${escaparHTML(
                        artista.user_name ||
                        "—"
                    )}
                </p>

                <p class="artist-user-email">
                    ${escaparHTML(
                        artista.user_email ||
                        "—"
                    )}
                </p>

            </div>
<button
    type="button"
    class="artist-details-button"
    data-artist-id="${escaparHTML(artista.id)}"
>
    Ver detalhes
</button>
        </div>
        
    `;
const detailsButton =
    card.querySelector(
        ".artist-details-button"
    );

if (detailsButton) {

    detailsButton.addEventListener(
        "click",
        () => {

            const artistaId =
                detailsButton.dataset.artistId;

            if (!artistaId) {
                return;
            }

            window.location.href =
                `./artista-detalhes.html?id=${encodeURIComponent(artistaId)}`;
        }
    );
}

    return card;
}


/*
|--------------------------------------------------------------------------
| RENDERIZAR LISTA
|--------------------------------------------------------------------------
*/

function renderizarArtistas(
    artistas
) {

    elementos.artistsGrid.innerHTML =
        "";


    if (
        !Array.isArray(artistas) ||
        artistas.length === 0
    ) {

        elementos.emptyContainer.hidden =
            false;

        return;
    }


    elementos.emptyContainer.hidden =
        true;


    const fragment =
        document.createDocumentFragment();


    artistas.forEach(
        artista => {

            const card =
                criarCardArtista(
                    artista
                );

            fragment.appendChild(
                card
            );
        }
    );


    elementos.artistsGrid.appendChild(
        fragment
    );
}


/*
|--------------------------------------------------------------------------
| CARREGAR ARTISTAS
|--------------------------------------------------------------------------
*/

async function carregarArtistas() {

    elementos.loadingContainer.hidden =
        false;

    elementos.emptyContainer.hidden =
        true;

    elementos.artistsGrid.innerHTML =
        "";


    try {

        const resposta =
            await apiFetch(
                "/admin/artists"
            );


        if (
            !resposta ||
            resposta.sucesso !== true
        ) {

            throw new Error(
                resposta?.mensagem ||
                "Não foi possível carregar os artistas."
            );
        }


        renderizarArtistas(
            resposta.artistas
        );


    } catch (error) {

        console.error(
            "Erro ao carregar artistas:",
            error
        );


        mostrarMensagem(
            error.message ||
            "Erro ao carregar artistas.",
            "error"
        );

    } finally {

        elementos.loadingContainer.hidden =
            true;
    }
}


/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

function fazerLogout() {

    localStorage.removeItem("token");
    localStorage.removeItem("yoka_token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("access_token");

    window.location.href =
        "../login.html";
}


/*
|--------------------------------------------------------------------------
| EVENTOS
|--------------------------------------------------------------------------
*/

if (elementos.refreshButton) {

    elementos.refreshButton.addEventListener(
        "click",
        carregarArtistas
    );
}


if (elementos.logoutButton) {

    elementos.logoutButton.addEventListener(
        "click",
        fazerLogout
    );
}


/*
|--------------------------------------------------------------------------
| INICIALIZAÇÃO
|--------------------------------------------------------------------------
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        carregarArtistas();




    }
);








