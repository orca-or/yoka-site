"use strict";

/*
|--------------------------------------------------------------------------
| CONFIGURAÇÃO
|--------------------------------------------------------------------------
*/

const API_BASE = "/api/v1";

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

    loadingContainer:
        document.getElementById("loadingContainer"),

    artistContainer:
        document.getElementById("artistContainer"),

    messageContainer:
        document.getElementById("messageContainer"),

    backButton:
        document.getElementById("backButton"),

    logoutButton:
        document.getElementById("logoutButton"),

    artistCover:
        document.getElementById("artistCover"),

    artistAvatar:
        document.getElementById("artistAvatar"),

    artistName:
        document.getElementById("artistName"),

    artistGenre:
        document.getElementById("artistGenre"),

    artistLocation:
        document.getElementById("artistLocation"),

    artistBio:
        document.getElementById("artistBio"),

    verifiedBadge:
        document.getElementById("verifiedBadge"),

    artistVerificationStatus:
        document.getElementById(
            "artistVerificationStatus"
        ),

    artistVerificationButton:
        document.getElementById(
            "artistVerificationButton"
        ),

    notifyArtistButton:
        document.getElementById(
            "notifyArtistButton"
        ),

    artistNotificationForm:
        document.getElementById(
            "artistNotificationForm"
        ),

    artistNotificationTitle:
        document.getElementById(
            "artistNotificationTitle"
        ),

    artistNotificationMessage:
        document.getElementById(
            "artistNotificationMessage"
        ),

    cancelArtistNotificationButton:
        document.getElementById(
            "cancelArtistNotificationButton"
        ),

    sendArtistNotificationButton:
        document.getElementById(
            "sendArtistNotificationButton"
        ),

    totalMusicas:
        document.getElementById("totalMusicas"),

    totalReproducoes:
        document.getElementById("totalReproducoes"),

    totalCurtidas:
        document.getElementById("totalCurtidas"),

    totalSeguidores:
        document.getElementById("totalSeguidores"),

    totalComentarios:
        document.getElementById("totalComentarios"),

    userName:
        document.getElementById("userName"),

    userEmail:
        document.getElementById("userEmail"),

    userRole:
        document.getElementById("userRole"),

    userStatus:
        document.getElementById("userStatus"),

    emailVerified:
        document.getElementById("emailVerified"),

    artistVerified:
        document.getElementById("artistVerified"),

    websiteLink:
        document.getElementById("websiteLink"),

    instagramLink:
        document.getElementById("instagramLink"),

    facebookLink:
        document.getElementById("facebookLink"),

    youtubeLink:
        document.getElementById("youtubeLink"),

    tiktokLink:
        document.getElementById("tiktokLink"),

    noSocialLinks:
        document.getElementById("noSocialLinks"),

    createdAt:
        document.getElementById("createdAt"),

    updatedAt:
        document.getElementById("updatedAt")
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
| MENSAGEM
|--------------------------------------------------------------------------
*/

function mostrarMensagem(
    mensagem,
    tipo = "error"
) {

    if (!elementos.messageContainer) {
        return;
    }


    elementos.messageContainer.innerHTML = "";


    if (!mensagem) {
        return;
    }


    const div =
        document.createElement("div");


    div.className =
        `message ${tipo}`;


    div.textContent =
        mensagem;


    elementos.messageContainer.appendChild(
        div
    );
}


/*
|--------------------------------------------------------------------------
| SEGURANÇA
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
| FORMATAÇÃO
|--------------------------------------------------------------------------
*/

function formatarNumero(valor) {

    return Number(
        valor || 0
    ).toLocaleString("pt-BR");
}


function formatarData(valor) {

    if (!valor) {
        return "—";
    }


    const data =
        new Date(valor);


    if (
        Number.isNaN(
            data.getTime()
        )
    ) {
        return "—";
    }


    return data.toLocaleString(
        "pt-BR",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    );
}


/*
|--------------------------------------------------------------------------
| IMAGEM
|--------------------------------------------------------------------------
*/

function obterImagem(
    url,
    tipo = "avatar"
) {

    if (url) {
        return url;
    }


    if (tipo === "cover") {

        return (
            "data:image/svg+xml," +
            encodeURIComponent(`
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1200"
                    height="400"
                >
                    <rect
                        width="1200"
                        height="400"
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
                width="300"
                height="300"
            >
                <circle
                    cx="150"
                    cy="150"
                    r="150"
                    fill="#e5e7eb"
                />

                <circle
                    cx="150"
                    cy="120"
                    r="55"
                    fill="#9ca3af"
                />

                <path
                    d="M60 270
                       C70 205 105 175 150 175
                       C195 175 230 205 240 270"
                    fill="#9ca3af"
                />
            </svg>
        `)
    );
}


/*
|--------------------------------------------------------------------------
| ID DO ARTISTA
|--------------------------------------------------------------------------
*/

function obterArtistaId() {

    const parametros =
        new URLSearchParams(
            window.location.search
        );


    return parametros.get("id");
}


/*
|--------------------------------------------------------------------------
| REDES SOCIAIS
|--------------------------------------------------------------------------
*/

function configurarLink(
    elemento,
    url
) {

    if (!elemento) {
        return false;
    }


    if (!url) {

        elemento.hidden = true;

        elemento.removeAttribute("href");

        return false;
    }


    elemento.href = url;

    elemento.hidden = false;

    return true;
}


/*
|--------------------------------------------------------------------------
| ATUALIZAR ESTADO DA VERIFICAÇÃO
|--------------------------------------------------------------------------
*/

function atualizarEstadoVerificacao(
    isVerified
) {

    const verificado =
        Boolean(isVerified);


    if (elementos.verifiedBadge) {

        elementos.verifiedBadge.hidden =
            !verificado;
    }


    if (elementos.artistVerified) {

        elementos.artistVerified.textContent =
            verificado
                ? "Sim"
                : "Não";
    }


    if (elementos.artistVerificationStatus) {

        elementos.artistVerificationStatus.textContent =
            verificado
                ? "✓ Artista verificado"
                : "Não verificado";
    }


    if (elementos.artistVerificationButton) {

        elementos.artistVerificationButton.textContent =
            verificado
                ? "Remover verificação"
                : "Verificar artista";

        elementos.artistVerificationButton.dataset.verified =
            verificado
                ? "true"
                : "false";
    }
}


/*
|--------------------------------------------------------------------------
| ALTERAR VERIFICAÇÃO
|--------------------------------------------------------------------------
*/

async function alterarVerificacaoArtista() {

    const artistaId =
        obterArtistaId();


    if (!artistaId) {

        mostrarMensagem(
            "ID do artista não informado."
        );

        return;
    }


    if (!elementos.artistVerificationButton) {
        return;
    }


    const estaVerificado =
        elementos.artistVerificationButton.dataset.verified ===
        "true";


    const novoEstado =
        !estaVerificado;


    const textoOriginal =
        elementos.artistVerificationButton.textContent;


    try {

        elementos.artistVerificationButton.disabled =
            true;


        elementos.artistVerificationButton.textContent =
            "A processar...";


        const resposta =
            await apiFetch(
                `/admin/artists/${encodeURIComponent(
                    artistaId
                )}/verification`,
                {
                    method: "PATCH",

                    body: JSON.stringify({
                        is_verified: novoEstado
                    })
                }
            );


        if (
            !resposta ||
            resposta.sucesso !== true
        ) {

            throw new Error(
                resposta?.mensagem ||
                "Não foi possível alterar a verificação."
            );
        }


        atualizarEstadoVerificacao(
            resposta.artista?.is_verified
        );


        mostrarMensagem(
            resposta.mensagem ||
            (
                novoEstado
                    ? "Artista verificado com sucesso."
                    : "Verificação removida com sucesso."
            ),
            "success"
        );


    } catch (error) {

        console.error(
            "Erro ao alterar verificação:",
            error
        );


        elementos.artistVerificationButton.textContent =
            textoOriginal;


        mostrarMensagem(
            error.message ||
            "Não foi possível alterar a verificação."
        );


    } finally {

        elementos.artistVerificationButton.disabled =
            false;
    }
}


/*
|--------------------------------------------------------------------------
| NOTIFICAÇÃO DO ARTISTA
|--------------------------------------------------------------------------
*/

function abrirFormularioNotificacaoArtista() {

    if (!elementos.artistNotificationForm) {
        return;
    }


    elementos.artistNotificationForm.hidden =
        false;


    if (elementos.artistNotificationTitle) {

        elementos.artistNotificationTitle.value =
            "";

        elementos.artistNotificationTitle.focus();
    }


    if (elementos.artistNotificationMessage) {

        elementos.artistNotificationMessage.value =
            "";
    }


    mostrarMensagem(
        "",
        "success"
    );
}


function fecharFormularioNotificacaoArtista() {

    if (!elementos.artistNotificationForm) {
        return;
    }


    elementos.artistNotificationForm.hidden =
        true;


    if (elementos.artistNotificationTitle) {

        elementos.artistNotificationTitle.value =
            "";
    }


    if (elementos.artistNotificationMessage) {

        elementos.artistNotificationMessage.value =
            "";
    }
}


async function enviarNotificacaoArtista() {

    const botao =
        elementos.sendArtistNotificationButton;


    const userId =
        elementos.notifyArtistButton?.dataset.userId;


    const titulo =
        elementos.artistNotificationTitle?.value.trim();


    const mensagem =
        elementos.artistNotificationMessage?.value.trim();


    if (!userId) {

        mostrarMensagem(
            "Não foi possível identificar o usuário do artista.",
            "error"
        );

        return;
    }


    if (!titulo) {

        mostrarMensagem(
            "Digite o título da notificação.",
            "error"
        );


        if (elementos.artistNotificationTitle) {

            elementos.artistNotificationTitle.focus();
        }


        return;
    }


    if (!mensagem) {

        mostrarMensagem(
            "Digite a mensagem da notificação.",
            "error"
        );


        if (elementos.artistNotificationMessage) {

            elementos.artistNotificationMessage.focus();
        }


        return;
    }


    const textoOriginal =
        botao
            ? botao.textContent
            : "Enviar notificação";


    try {

        if (botao) {

            botao.disabled =
                true;

            botao.textContent =
                "Enviando...";
        }


        const resposta =
            await apiFetch(
                "/admin/notifications",
                {
                    method: "POST",

                    body: JSON.stringify({
                        usuario_id: userId,
                        titulo: titulo,
                        mensagem: mensagem
                    })
                }
            );


        if (
            !resposta ||
            resposta.sucesso !== true
        ) {

            throw new Error(
                resposta?.mensagem ||
                "Não foi possível enviar a notificação."
            );
        }


        fecharFormularioNotificacaoArtista();


        mostrarMensagem(
            resposta.mensagem ||
            "Notificação enviada com sucesso ao artista.",
            "success"
        );


    } catch (error) {

        console.error(
            "Erro ao enviar notificação ao artista:",
            error
        );


        mostrarMensagem(
            error.message ||
            "Erro ao enviar notificação ao artista.",
            "error"
        );


    } finally {

        if (botao) {

            botao.disabled =
                false;

            botao.textContent =
                textoOriginal;
        }
    }
}


/*
|--------------------------------------------------------------------------
| RENDERIZAR ARTISTA
|--------------------------------------------------------------------------
*/

function renderizarArtista(
    artista
) {

    /*
    |--------------------------------------------------------------------------
    | USER ID DO ARTISTA
    |--------------------------------------------------------------------------
    */

    if (elementos.notifyArtistButton) {

        elementos.notifyArtistButton.dataset.userId =
            artista.user_id || "";
    }


    elementos.artistCover.style.backgroundImage =
        `url("${obterImagem(
            artista.cover_url,
            "cover"
        )}")`;


    elementos.artistAvatar.src =
        obterImagem(
            artista.avatar_url ||
            artista.user_avatar_url,
            "avatar"
        );


    elementos.artistAvatar.alt =
        `Avatar de ${
            artista.artist_name ||
            artista.user_name ||
            "artista"
        }`;


    elementos.artistName.textContent =
        artista.artist_name ||
        artista.user_name ||
        "Artista sem nome";


    elementos.artistGenre.textContent =
        artista.genre ||
        "Gênero não informado";


    elementos.artistLocation.textContent =
        artista.location
            ? `📍 ${artista.location}`
            : "📍 Localização não informada";


    elementos.artistBio.textContent =
        artista.bio ||
        "Nenhuma biografia informada.";


    atualizarEstadoVerificacao(
        artista.is_verified
    );


    elementos.totalMusicas.textContent =
        formatarNumero(
            artista.total_musicas
        );


    elementos.totalReproducoes.textContent =
        formatarNumero(
            artista.total_reproducoes
        );


    elementos.totalCurtidas.textContent =
        formatarNumero(
            artista.total_curtidas
        );


    elementos.totalSeguidores.textContent =
        formatarNumero(
            artista.total_seguidores
        );


    elementos.totalComentarios.textContent =
        formatarNumero(
            artista.total_comentarios
        );


    elementos.userName.textContent =
        artista.user_name ||
        "—";


    elementos.userEmail.textContent =
        artista.user_email ||
        "—";


    elementos.userRole.textContent =
        artista.user_role ||
        "—";


    elementos.userStatus.textContent =
        artista.user_is_active
            ? "Ativa"
            : "Desativada";


    elementos.emailVerified.textContent =
        artista.email_verified
            ? "Sim"
            : "Não";


    elementos.artistVerified.textContent =
        artista.is_verified
            ? "Sim"
            : "Não";


    const links = [

        configurarLink(
            elementos.websiteLink,
            artista.website_url
        ),

        configurarLink(
            elementos.instagramLink,
            artista.instagram_url
        ),

        configurarLink(
            elementos.facebookLink,
            artista.facebook_url
        ),

        configurarLink(
            elementos.youtubeLink,
            artista.youtube_url
        ),

        configurarLink(
            elementos.tiktokLink,
            artista.tiktok_url
        )

    ];


    const existeLink =
        links.some(
            link => link === true
        );


    elementos.noSocialLinks.hidden =
        existeLink;


    elementos.createdAt.textContent =
        formatarData(
            artista.created_at
        );


    elementos.updatedAt.textContent =
        formatarData(
            artista.updated_at
        );


    elementos.loadingContainer.hidden =
        true;


    elementos.artistContainer.hidden =
        false;
}


/*
|--------------------------------------------------------------------------
| CARREGAR MÚSICAS DO ARTISTA
|--------------------------------------------------------------------------
*/

async function carregarMusicasDoArtista(
    artistaId
) {

    const loading =
        document.getElementById(
            "artistSongsLoading"
        );


    const container =
        document.getElementById(
            "artistSongsContainer"
        );


    const message =
        document.getElementById(
            "artistSongsMessage"
        );


    const count =
        document.getElementById(
            "artistSongsCount"
        );


    try {

        if (loading) {

            loading.style.display =
                "block";
        }


        if (container) {

            container.innerHTML =
                "";
        }


        if (message) {

            message.textContent =
                "";
        }


        const resposta =
            await apiFetch(
                `/admin/artists/${encodeURIComponent(
                    artistaId
                )}/songs`
            );


        const musicas =
            resposta?.musicas || [];


        if (count) {

            count.textContent =
                `${musicas.length} ${
                    musicas.length === 1
                        ? "música"
                        : "músicas"
                }`;
        }


        if (loading) {

            loading.style.display =
                "none";
        }


        if (musicas.length === 0) {

            if (message) {

                message.textContent =
                    "Este artista ainda não possui músicas.";
            }

            return;
        }


        musicas.forEach(
            musica => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "artist-song-card";


                const cover =
                    obterImagem(
                        musica.cover_url,
                        "cover"
                    );


                const status =
                    musica.status ||
                    "draft";


                const statusTexto = {

                    published:
                        "Publicada",

                    draft:
                        "Rascunho",

                    archived:
                        "Arquivada"

                }[status] || status;


                card.innerHTML = `

                    <img
                        class="artist-song-cover"
                        src="${escaparHTML(cover)}"
                        alt="${escaparHTML(
                            musica.title ||
                            "Música"
                        )}"
                    >

                    <div class="artist-song-info">

                        <h3>
                            ${escaparHTML(
                                musica.title ||
                                "Sem título"
                            )}
                        </h3>

                        <p>
                            ${escaparHTML(
                                musica.genre ||
                                "Sem género"
                            )}
                        </p>

                        <div
                            class="artist-song-meta"
                        >

                            <span>
                                ▶ ${
                                    formatarNumero(
                                        musica.plays_count ||
                                        0
                                    )
                                }
                            </span>

                            <span>
                                ♥ ${
                                    formatarNumero(
                                        musica.likes_count ||
                                        0
                                    )
                                }
                            </span>

                            <span
                                class="song-status song-status-${escaparHTML(
                                    status
                                )}"
                            >
                                ${escaparHTML(
                                    statusTexto
                                )}
                            </span>

                        </div>

                    </div>


                    <button
                        type="button"
                        class="artist-song-details-button"
                        data-song-id="${escaparHTML(
                            musica.id
                        )}"
                    >
                        Ver detalhes
                    </button>

                `;


                const button =
                    card.querySelector(
                        ".artist-song-details-button"
                    );


                if (button) {

                    button.addEventListener(
                        "click",
                        () => {

                            const songId =
                                button.dataset.songId;


                            if (!songId) {
                                return;
                            }


                            window.location.href =
                                `./musica-detalhes.html?id=${encodeURIComponent(
                                    songId
                                )}`;
                        }
                    );
                }


                if (container) {

                    container.appendChild(
                        card
                    );
                }
            }
        );


    } catch (error) {

        console.error(
            "Erro ao carregar músicas do artista:",
            error
        );


        if (loading) {

            loading.style.display =
                "none";
        }


        if (message) {

            message.textContent =
                error.message ||
                "Não foi possível carregar as músicas.";
        }
    }
}


/*
|--------------------------------------------------------------------------
| CARREGAR ARTISTA
|--------------------------------------------------------------------------
*/

async function carregarArtista() {

    const artistaId =
        obterArtistaId();


    if (!artistaId) {

        elementos.loadingContainer.hidden =
            true;


        mostrarMensagem(
            "ID do artista não informado."
        );


        return;
    }


    try {

        const resposta =
            await apiFetch(
                `/admin/artists/${encodeURIComponent(
                    artistaId
                )}`
            );


        if (
            !resposta ||
            resposta.sucesso !== true ||
            !resposta.artista
        ) {

            throw new Error(
                resposta?.mensagem ||
                "Não foi possível carregar o artista."
            );
        }


        renderizarArtista(
            resposta.artista
        );


        await carregarMusicasDoArtista(
            resposta.artista.id
        );


    } catch (error) {

        console.error(
            "Erro ao carregar artista:",
            error
        );


        elementos.loadingContainer.hidden =
            true;


        mostrarMensagem(
            error.message ||
            "Erro ao carregar artista."
        );
    }
}


/*
|--------------------------------------------------------------------------
| VOLTAR
|--------------------------------------------------------------------------
*/

function voltar() {

    window.location.href =
        "./artistas.html";
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

if (elementos.backButton) {

    elementos.backButton.addEventListener(
        "click",
        voltar
    );
}


if (elementos.logoutButton) {

    elementos.logoutButton.addEventListener(
        "click",
        fazerLogout
    );
}


if (elementos.artistVerificationButton) {

    elementos.artistVerificationButton.addEventListener(
        "click",
        alterarVerificacaoArtista
    );
}


if (elementos.notifyArtistButton) {

    elementos.notifyArtistButton.addEventListener(
        "click",
        abrirFormularioNotificacaoArtista
    );
}


if (elementos.cancelArtistNotificationButton) {

    elementos.cancelArtistNotificationButton.addEventListener(
        "click",
        fecharFormularioNotificacaoArtista
    );
}


if (elementos.sendArtistNotificationButton) {

    elementos.sendArtistNotificationButton.addEventListener(
        "click",
        enviarNotificacaoArtista
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

        carregarArtista();

    }
);