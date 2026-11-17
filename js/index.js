
"use strict";

const API_BASE = "/api/v1";

const DEFAULT_COVER = "./assets/images/default-cover.svg";
const DEFAULT_AVATAR = "./assets/images/default-avatar.svg";

/* =========================================================
   ELEMENTOS
========================================================= */

const featuredSongsContainer =
    document.getElementById("featuredSongsContainer");

const popularSongsContainer =
    document.getElementById("popularSongsContainer");

const artistsContainer =
    document.getElementById("artistsContainer");

const loginButton =
    document.getElementById("loginButton");

const registerButton =
    document.getElementById("registerButton");

const userMenu =
    document.getElementById("userMenu");

const userAvatarButton =
    document.getElementById("userAvatarButton");

const userDropdown =
    document.getElementById("userDropdown");

const headerAvatar =
    document.getElementById("headerAvatar");

const logoutButton =
    document.getElementById("logoutButton");

const currentYear =
    document.getElementById("currentYear");

/* =========================================================
   ESTADO
========================================================= */

let musicas = [];
let artistas = [];

/* =========================================================
   TOKEN
========================================================= */

function obterToken() {
    const nomes = [
        "token",
        "yoka_token",
        "accessToken",
        "access_token"
    ];

    for (const nome of nomes) {
        const token = localStorage.getItem(nome);

        if (token) {
            return token;
        }
    }

    return null;
}

/* =========================================================
   HEADERS
========================================================= */

function obterHeaders() {
    const token = obterToken();

    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

/* =========================================================
   ESCAPAR HTML
========================================================= */

function escaparHTML(valor) {
    if (valor === null || valor === undefined) {
        return "";
    }

    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =========================================================
   URL DE ARQUIVO
========================================================= */

function obterUrlArquivo(url) {
    if (!url) {
        return "";
    }

    if (
        url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("data:") ||
        url.startsWith("/")
    ) {
        return url;
    }

    if (url.startsWith("./")) {
        return url;
    }

    return `/${url}`;
}

/* =========================================================
   ABRIR MÚSICA
========================================================= */

function abrirMusica(songId) {
    if (!songId) {
        console.error("Yoka — ID da música não informado.");
        return;
    }

    console.log("Yoka — abrindo música:", songId);

    window.location.href =
        `./song.html?id=${encodeURIComponent(songId)}`;
}

/* =========================================================
   FORMATAR DURAÇÃO
========================================================= */

function formatarDuracao(segundos) {
    const valor = Number(segundos);

    if (!Number.isFinite(valor) || valor <= 0) {
        return "";
    }

    const minutos = Math.floor(valor / 60);
    const segundosRestantes = Math.floor(valor % 60);

    return (
        `${minutos}:` +
        `${String(segundosRestantes).padStart(2, "0")}`
    );
}

/* =========================================================
   CRIAR CARD DE MÚSICA
========================================================= */

function criarCardMusica(musica) {
    if (!musica || !musica.id) {
        return "";
    }

    const id = musica.id;

    const titulo =
        musica.title ||
        musica.titulo ||
        "Sem título";

    const capa =
        obterUrlArquivo(
            musica.cover_url ||
            musica.cover ||
            musica.capa_url ||
            musica.capa
        ) || DEFAULT_COVER;

    const artista =
        musica.artist_name ||
        musica.artistName ||
        musica.artist ||
        musica.artist_nome ||
        "Artista";

    const artistId =
        musica.artist_id ||
        musica.artistId ||
        "";

    const dataPublicacao =
        formatarDataPublicacao(
            musica.published_at ||
            musica.created_at
        );

    const genero =
        musica.genre ||
        musica.genero ||
        "";

    const duracao =
        formatarDuracao(musica.duration_seconds);

    const reproducoes = Number(
        musica.plays_count ??
        musica.plays ??
        musica.play_count ??
        musica.total_plays ??
        0
    );

    const gostos = Number(
        musica.likes_count ??
        musica.likes ??
        musica.like_count ??
        musica.total_likes ??
        0
    );

    return `
        <article
            class="song-card"
            data-song-id="${escaparHTML(String(id))}"
            role="button"
            tabindex="0"
        >
            <div class="song-card-cover">
                <img
                    src="${escaparHTML(capa)}"
                    alt="Capa de ${escaparHTML(titulo)}"
                    loading="lazy"
                    onerror="this.onerror=null;this.src='${DEFAULT_COVER}'"
                >

                ${
                    genero
                        ? `
                            <span class="song-card-genre">
                                ${escaparHTML(genero)}
                            </span>
                        `
                        : ""
                }

                <button
                    type="button"
                    class="song-play-button"
                    data-song-id="${escaparHTML(String(id))}"
                    aria-label="Reproduzir ${escaparHTML(titulo)}"
                >
                    ▶
                </button>

                <div class="song-card-stats">
                    <span class="song-card-plays" title="Reproduções">
                        <span class="song-card-stat-icon">▶</span>
                        ${reproducoes.toLocaleString("pt-PT")}
                    </span>

                    <span class="song-card-likes" title="Gostos">
                        <span class="song-card-stat-icon">♥</span>
                        ${gostos.toLocaleString("pt-PT")}
                    </span>
                </div>
            </div>

            <div class="song-card-info">
                <div class="song-card-title-row">
                    <h3 class="song-card-title">
                        ${escaparHTML(titulo)}
                    </h3>

                    ${
                        dataPublicacao
                            ? `
                                <span class="song-card-date">
                                    ${escaparHTML(dataPublicacao)}
                                </span>
                            `
                            : ""
                    }
                </div>

                <p class="song-card-artist">
                    ${
                        artistId
                            ? `
                                <a
                                    href="./artist.html?id=${encodeURIComponent(artistId)}"
                                    class="song-card-artist-link"
                                    data-artist-link
                                >
                                    ${escaparHTML(artista)}
                                </a>
                            `
                            : escaparHTML(artista)
                    }
                </p>

                ${
                    genero
                        ? `
                            <span class="song-card-genre">
                                ${escaparHTML(genero)}
                            </span>
                        `
                        : ""
                }

                ${
                    duracao
                        ? `
                            <span class="song-card-duration">
                                ${duracao}
                            </span>
                        `
                        : ""
                }
            </div>
        </article>
    `;
}

/* =========================================================
   LIGAR EVENTOS DOS CARDS
========================================================= */

function configurarCardsMusica(container) {
    if (!container) {
        return;
    }

    const cards = container.querySelectorAll(".song-card");

    cards.forEach(function (card) {
        card.addEventListener("click", function (event) {
            if (
                event.target.closest(".song-play-button") ||
                event.target.closest("[data-artist-link]")
            ) {
                return;
            }

            abrirMusica(card.dataset.songId);
        });

        card.addEventListener("keydown", function (event) {
            if (
                event.key === "Enter" ||
                event.key === " "
            ) {
                event.preventDefault();
                abrirMusica(card.dataset.songId);
            }
        });
    });

    const botoes = container.querySelectorAll(".song-play-button");

    botoes.forEach(function (botao) {
        botao.addEventListener("click", function (event) {
            event.stopPropagation();
            abrirMusica(botao.dataset.songId);
        });
    });
}

/* =========================================================
   RENDERIZAR MÚSICAS
========================================================= */

function renderizarMusicas(container, lista) {
    if (!container) {
        return;
    }

    if (!Array.isArray(lista) || lista.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                Nenhuma música encontrada.
            </div>
        `;
        return;
    }

    container.innerHTML = lista
        .map(criarCardMusica)
        .join("");

    configurarCardsMusica(container);
}

/* =========================================================
   FORMATAR DATA DA PUBLICAÇÃO
========================================================= */

function formatarDataPublicacao(data) {
    if (!data) {
        return "";
    }

    const dataPublicacao = new Date(data);

    if (Number.isNaN(dataPublicacao.getTime())) {
        return "";
    }

    const agora = new Date();

    const diferencaMs =
        agora.getTime() - dataPublicacao.getTime();

    const diferencaSegundos =
        Math.floor(diferencaMs / 1000);

    const diferencaMinutos =
        Math.floor(diferencaSegundos / 60);

    const diferencaHoras =
        Math.floor(diferencaMinutos / 60);

    const diferencaDias =
        Math.floor(diferencaHoras / 24);

    if (diferencaMs < 0) {
        return dataPublicacao.toLocaleDateString("pt-PT", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    }

    if (diferencaSegundos < 60) {
        return "agora";
    }

    if (diferencaMinutos < 60) {
        return diferencaMinutos === 1
            ? "há 1 minuto"
            : `há ${diferencaMinutos} minutos`;
    }

    if (diferencaHoras < 24) {
        return diferencaHoras === 1
            ? "há 1 hora"
            : `há ${diferencaHoras} horas`;
    }

    if (diferencaDias === 1) {
        return "ontem";
    }

    if (diferencaDias < 7) {
        return `há ${diferencaDias} dias`;
    }

    if (diferencaDias < 30) {
        const semanas = Math.floor(diferencaDias / 7);

        return semanas === 1
            ? "há 1 semana"
            : `há ${semanas} semanas`;
    }

    if (diferencaDias < 365) {
        const meses = Math.floor(diferencaDias / 30);

        return meses === 1
            ? "há 1 mês"
            : `há ${meses} meses`;
    }

    return dataPublicacao.toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
}

/* =========================================================
   CRIAR CARD DE ARTISTA
========================================================= */

function criarCardArtista(artista) {
    if (!artista || !artista.id) {
        return "";
    }

    const id = artista.id;

    const nome =
        artista.artist_name ||
        artista.artistName ||
        artista.name ||
        artista.nome ||
        "Artista";

    const avatar =
        obterUrlArquivo(
            artista.avatar_url ||
            artista.avatar ||
            artista.foto
        ) || DEFAULT_AVATAR;

    const genero =
        artista.genre ||
        artista.genero ||
        "";

    return `
        <article
            class="artist-card"
            data-artist-id="${escaparHTML(String(id))}"
            role="button"
            tabindex="0"
        >
            <div class="artist-card-avatar">
                <img
                    src="${escaparHTML(avatar)}"
                    alt="Avatar de ${escaparHTML(nome)}"
                    loading="lazy"
                    onerror="this.onerror=null;this.src='${DEFAULT_AVATAR}'"
                >
            </div>

            <div class="artist-card-info">
                <h3>${escaparHTML(nome)}</h3>

                ${
                    genero
                        ? `
                            <p>${escaparHTML(genero)}</p>
                        `
                        : ""
                }
            </div>
        </article>
    `;
}

/* =========================================================
   LIGAR EVENTOS DOS ARTISTAS
========================================================= */

function configurarCardsArtistas() {
    if (!artistsContainer) {
        return;
    }

    const cards = artistsContainer.querySelectorAll(".artist-card");

    cards.forEach(function (card) {
        function abrirPerfil() {
            const id = card.dataset.artistId;

            if (!id) {
                return;
            }

            window.location.href =
                `./artist.html?id=${encodeURIComponent(id)}`;
        }

        card.addEventListener("click", abrirPerfil);

        card.addEventListener("keydown", function (event) {
            if (
                event.key === "Enter" ||
                event.key === " "
            ) {
                event.preventDefault();
                abrirPerfil();
            }
        });
    });
}

/* =========================================================
   RENDERIZAR ARTISTAS
========================================================= */

function renderizarArtistas(lista) {
    if (!artistsContainer) {
        return;
    }

    if (!Array.isArray(lista) || lista.length === 0) {
        artistsContainer.innerHTML = `
            <div class="empty-message">
                Nenhum artista encontrado.
            </div>
        `;
        return;
    }

    artistsContainer.innerHTML = lista
        .map(criarCardArtista)
        .join("");

    configurarCardsArtistas();
}

/* =========================================================
   CARREGAR MÚSICAS
========================================================= */

async function carregarMusicas() {
    try {
        console.log("Yoka — carregando músicas...");

        const resposta = await fetch(`${API_BASE}/songs`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const dados = await resposta.json();

        console.log("Yoka — resposta /songs:", dados);

        if (Array.isArray(dados)) {
            musicas = dados;
        } else if (Array.isArray(dados.musicas)) {
            musicas = dados.musicas;
        } else if (Array.isArray(dados.songs)) {
            musicas = dados.songs;
        } else if (Array.isArray(dados.data)) {
            musicas = dados.data;
        } else if (
            dados.data &&
            Array.isArray(dados.data.musicas)
        ) {
            musicas = dados.data.musicas;
        } else if (
            dados.data &&
            Array.isArray(dados.data.songs)
        ) {
            musicas = dados.data.songs;
        } else {
            musicas = [];
        }

        console.log("Yoka — total de músicas recebidas:", musicas.length);

        /*
         * MÚSICAS EM DESTAQUE
         * CORRIGIDO: mostrar todas as músicas recebidas.
         */
        renderizarMusicas(
            featuredSongsContainer,
            musicas
        );

        /*
         * MÚSICAS POPULARES
         * Mantém a ordenação por reproduções, sem limitar a 8.
         */
        const populares = [...musicas].sort(function (a, b) {
            const playsA = Number(
                a.plays_count ??
                a.plays ??
                a.play_count ??
                a.reproducoes ??
                0
            );

            const playsB = Number(
                b.plays_count ??
                b.plays ??
                b.play_count ??
                b.reproducoes ??
                0
            );

            return playsB - playsA;
        });

        renderizarMusicas(
            popularSongsContainer,
            populares
        );

    } catch (erro) {
        console.error("Yoka — erro ao carregar músicas:", erro);

        if (featuredSongsContainer) {
            featuredSongsContainer.innerHTML = `
                <div class="empty-message">
                    Não foi possível carregar as músicas.
                </div>
            `;
        }

        if (popularSongsContainer) {
            popularSongsContainer.innerHTML = `
                <div class="empty-message">
                    Não foi possível carregar as músicas.
                </div>
            `;
        }
    }
}

/* =========================================================
   CARREGAR ARTISTAS
========================================================= */

async function carregarArtistas() {
    try {
        const resposta = await fetch(`${API_BASE}/artists`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const dados = await resposta.json();

        console.log("Yoka — artistas recebidos:", dados);

        if (Array.isArray(dados)) {
            artistas = dados;
        } else if (Array.isArray(dados.artistas)) {
            artistas = dados.artistas;
        } else if (Array.isArray(dados.artists)) {
            artistas = dados.artists;
        } else if (Array.isArray(dados.data)) {
            artistas = dados.data;
        } else {
            artistas = [];
        }

        renderizarArtistas(artistas.slice(0, 8));

    } catch (erro) {
        console.error("Yoka — erro ao carregar artistas:", erro);

        if (artistsContainer) {
            artistsContainer.innerHTML = `
                <div class="empty-message">
                    Não foi possível carregar os artistas.
                </div>
            `;
        }
    }
}

/* =========================================================
   HEADER — UTILIZADOR
========================================================= */

async function configurarHeaderUtilizador() {
    if (!loginButton || !registerButton || !userMenu) {
        return;
    }

    loginButton.classList.add("hidden");
    registerButton.classList.add("hidden");
    userMenu.classList.add("hidden");

    const token = obterToken();

    if (!token) {
        loginButton.classList.remove("hidden");
        registerButton.classList.remove("hidden");
        return;
    }

    try {
        const resposta = await fetch(`${API_BASE}/auth/me`, {
            method: "GET",
            headers: obterHeaders()
        });

        if (!resposta.ok) {
            throw new Error("Sessão inválida.");
        }

        const dados = await resposta.json();

        const usuario =
            dados.usuario ||
            dados.user ||
            dados.utilizador ||
            dados.data ||
            dados;

        loginButton.classList.add("hidden");
        registerButton.classList.add("hidden");
        userMenu.classList.remove("hidden");

        if (headerAvatar && usuario) {
            let avatar =
                usuario.avatar_url ||
                usuario.avatar ||
                usuario.foto ||
                "";

            if (!avatar) {
                try {
                    const respostaPerfil = await fetch(
                        `${API_BASE}/artists/me`,
                        {
                            method: "GET",
                            headers: obterHeaders()
                        }
                    );

                    if (respostaPerfil.ok) {
                        const dadosPerfil = await respostaPerfil.json();

                        const perfil =
                            dadosPerfil.perfil ||
                            dadosPerfil.artist ||
                            dadosPerfil.artista ||
                            dadosPerfil.data ||
                            dadosPerfil;

                        avatar =
                            perfil.avatar_url ||
                            perfil.avatar ||
                            perfil.foto ||
                            "";
                    }
                } catch (erro) {
                    console.warn(
                        "Yoka — erro ao carregar avatar:",
                        erro
                    );
                }
            }

            headerAvatar.src = avatar
                ? obterUrlArquivo(avatar)
                : DEFAULT_AVATAR;

            headerAvatar.onerror = function () {
                this.onerror = null;
                this.src = DEFAULT_AVATAR;
            };
        }

    } catch (erro) {
        console.warn("Yoka — sessão inválida.", erro);
        limparSessao();
    }
}

/* =========================================================
   LIMPAR SESSÃO
========================================================= */

function limparSessao() {
    const nomes = [
        "token",
        "yoka_token",
        "accessToken",
        "access_token"
    ];

    nomes.forEach(function (nome) {
        localStorage.removeItem(nome);
    });

    if (loginButton) {
        loginButton.classList.remove("hidden");
    }

    if (registerButton) {
        registerButton.classList.remove("hidden");
    }

    if (userMenu) {
        userMenu.classList.add("hidden");
    }

    if (userDropdown) {
        userDropdown.classList.add("hidden");
    }

    if (headerAvatar) {
        headerAvatar.src = DEFAULT_AVATAR;
    }
}

/* =========================================================
   MENU DO UTILIZADOR
========================================================= */

function configurarMenuUtilizador() {
    if (userAvatarButton && userDropdown) {
        userAvatarButton.addEventListener("click", function (event) {
            event.stopPropagation();
            userDropdown.classList.toggle("hidden");
        });
    }

    const profileMenuLink =
        document.getElementById("profileMenuLink");

    if (profileMenuLink) {
        profileMenuLink.addEventListener(
            "click",
            async function (event) {
                event.preventDefault();

                const token = obterToken();

                if (!token) {
                    window.location.href = "./login.html";
                    return;
                }

                try {
                    const resposta = await fetch(
                        `${API_BASE}/artists/me`,
                        {
                            method: "GET",
                            headers: obterHeaders()
                        }
                    );

                    const dados = await resposta.json();

                    if (!resposta.ok) {
                        throw new Error(
                            dados.mensagem ||
                            "Não foi possível carregar o perfil."
                        );
                    }

                    const perfil =
                        dados.perfil ||
                        dados.artist ||
                        dados.artista ||
                        dados.data ||
                        dados.dados;

                    if (!perfil || !perfil.id) {
                        throw new Error(
                            "Perfil de artista não encontrado."
                        );
                    }

                    window.location.href =
                        `./artist.html?id=${encodeURIComponent(perfil.id)}`;

                } catch (erro) {
                    console.error("Erro ao abrir perfil:", erro);

                    alert(
                        erro.message ||
                        "Não foi possível abrir o perfil."
                    );
                }
            }
        );
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            limparSessao();
            window.location.href = "./index.html";
        });
    }

    document.addEventListener("click", function (event) {
        if (
            userDropdown &&
            userAvatarButton &&
            !userDropdown.contains(event.target) &&
            !userAvatarButton.contains(event.target)
        ) {
            userDropdown.classList.add("hidden");
        }
    });
}

/* =========================================================
   ANO
========================================================= */

function configurarAno() {
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }
}

/* =========================================================
   INICIALIZAÇÃO
========================================================= */

async function iniciarPagina() {
    configurarAno();
    configurarMenuUtilizador();

    await configurarHeaderUtilizador();

    await Promise.all([
        carregarMusicas(),
        carregarArtistas()
    ]);
}

/* =========================================================
   INICIAR
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    iniciarPagina
);
