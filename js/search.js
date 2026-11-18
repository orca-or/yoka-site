
"use strict";

(function () {
    const SEARCH_API_BASE = "https://wairujyynjohterkqort.supabase.co/functions/v1/yoka";

    // =========================================================
    // ELEMENTOS
    // =========================================================

    let searchInput = null;
    let searchButton = null;
    let toggleHeaderSearch = null;
    let headerSearch = null;

    let searchTerm = null;
    let searchLoading = null;
    let searchError = null;
    let searchEmpty = null;
    let searchResultsList = null;

    // =========================================================
    // UTILITÁRIOS
    // =========================================================

    function escaparHTML(valor) {
        return String(valor ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function obterUrlArquivo(url) {
        if (!url) {
            return "";
        }

        const valor = String(url).trim();

        if (!valor) {
            return "";
        }

        // URLs externas: aceitar apenas HTTP e HTTPS.
        if (/^https?:\/\//i.test(valor)) {
            try {
                const urlValidada = new URL(valor);

                if (
                    urlValidada.protocol !== "http:" &&
                    urlValidada.protocol !== "https:"
                ) {
                    return "";
                }

                return urlValidada.href;
            } catch {
                return "";
            }
        }

        // Não aceitar esquemas de URL executáveis ou data URLs.
        if (
            /^[a-z][a-z0-9+.-]*:/i.test(valor) ||
            valor.startsWith("//")
        ) {
            return "";
        }

        if (valor.startsWith("/")) {
            return valor;
        }

        if (valor.startsWith("./")) {
            return valor;
        }

        return "/" + valor.replace(/^\/+/, "");
    }

    function formatarDuracao(segundos) {
        const valor = Number(segundos);

        if (!Number.isFinite(valor) || valor <= 0) {
            return "";
        }

        const minutos = Math.floor(valor / 60);
        const segundosRestantes = Math.floor(valor % 60);

        return (
            minutos +
            ":" +
            String(segundosRestantes).padStart(2, "0")
        );
    }

    function mostrarElemento(elemento) {
        if (elemento) {
            elemento.style.display = "";
        }
    }

    function esconderElemento(elemento) {
        if (elemento) {
            elemento.style.display = "none";
        }
    }

    function normalizarTexto(valor) {
        return String(valor ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLocaleLowerCase("pt-AO")
            .trim();
    }

    function obterToken() {
        const nomes = [
            "token",
            "yoka_token",
            "accessToken",
            "access_token"
        ];

        for (const nome of nomes) {
            try {
                const valor = localStorage.getItem(nome);

                if (valor) {
                    return valor;
                }
            } catch (erro) {
                console.warn(
                    "Yoka — não foi possível consultar o armazenamento local.",
                    erro
                );

                return null;
            }
        }

        return null;
    }

    async function lerJSON(resposta) {
        try {
            return await resposta.json();
        } catch {
            throw new Error("O servidor devolveu uma resposta inválida.");
        }
    }

    // =========================================================
    // PESQUISA DO CABEÇALHO
    // =========================================================

    function executarPesquisa() {
        if (!searchInput) {
            console.error(
                "Yoka — campo searchInput não encontrado."
            );

            return;
        }

        const termo = searchInput.value.trim();

        if (!termo) {
            searchInput.focus();
            return;
        }

        window.location.href =
            "./pesquisa.html?q=" +
            encodeURIComponent(termo);
    }

    function configurarPesquisa() {
        searchInput = document.getElementById("searchInput");
        searchButton = document.getElementById("searchButton");

        searchTerm = document.getElementById("searchTerm");
        searchLoading = document.getElementById("searchLoading");
        searchError = document.getElementById("searchError");
        searchEmpty = document.getElementById("searchEmpty");

        searchResultsList =
            document.getElementById("searchResultsList");

        toggleHeaderSearch =
            document.getElementById("toggleHeaderSearch");

        headerSearch =
            document.querySelector(".header-search");

        if (searchButton) {
            searchButton.addEventListener(
                "click",
                executarPesquisa
            );
        }

        if (searchInput) {
            searchInput.addEventListener(
                "keydown",
                function (event) {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        executarPesquisa();
                    }

                    if (
                        event.key === "Escape" &&
                        headerSearch?.classList.contains("search-open")
                    ) {
                        fecharPesquisaHeader();
                    }
                }
            );
        }

        configurarBotaoPesquisaHeader();
    }

    // =========================================================
    // BOTÃO PARA ABRIR/FECHAR A PESQUISA NO TELEMÓVEL
    // =========================================================

    function configurarBotaoPesquisaHeader() {
        if (!toggleHeaderSearch || !headerSearch) {
            return;
        }

        toggleHeaderSearch.addEventListener(
            "click",
            function () {
                const aberta =
                    headerSearch.classList.contains("search-open");

                if (aberta) {
                    fecharPesquisaHeader();
                } else {
                    abrirPesquisaHeader();
                }
            }
        );

        // Se o ecrã aumentar, não manter a pesquisa presa
        // ao estado recolhido do telemóvel.
        window.addEventListener("resize", function () {
            if (window.innerWidth > 704) {
                headerSearch.classList.remove("search-open");

                toggleHeaderSearch.setAttribute(
                    "aria-expanded",
                    "false"
                );

                toggleHeaderSearch.setAttribute(
                    "aria-label",
                    "Abrir pesquisa"
                );
            }
        });
    }

    function abrirPesquisaHeader() {
        if (!headerSearch || !toggleHeaderSearch) {
            return;
        }

        headerSearch.classList.add("search-open");

        toggleHeaderSearch.setAttribute(
            "aria-expanded",
            "true"
        );

        toggleHeaderSearch.setAttribute(
            "aria-label",
            "Fechar pesquisa"
        );

        window.requestAnimationFrame(function () {
            if (searchInput) {
                searchInput.focus();
            }
        });
    }

    function fecharPesquisaHeader() {
        if (!headerSearch || !toggleHeaderSearch) {
            return;
        }

        headerSearch.classList.remove("search-open");

        toggleHeaderSearch.setAttribute(
            "aria-expanded",
            "false"
        );

        toggleHeaderSearch.setAttribute(
            "aria-label",
            "Abrir pesquisa"
        );

        toggleHeaderSearch.focus();
    }

    // =========================================================
    // CARREGAR RESULTADOS
    // =========================================================

    async function carregarResultados() {
        if (!searchResultsList) {
            return;
        }

        const parametros =
            new URLSearchParams(window.location.search);

        const termo = (parametros.get("q") || "").trim();

        if (searchInput) {
            searchInput.value = termo;
        }

        if (searchTerm) {
            searchTerm.textContent = termo
                ? `Resultados para "${termo}"`
                : "Digite algo para pesquisar.";
        }

        searchResultsList.innerHTML = "";

        esconderElemento(searchError);
        esconderElemento(searchLoading);

        if (!termo) {
            mostrarElemento(searchEmpty);

            if (searchEmpty) {
                searchEmpty.textContent =
                    "Digite algo para pesquisar.";
            }

            return;
        }

        esconderElemento(searchEmpty);
        mostrarElemento(searchLoading);

        try {
            const resposta = await fetch(
                SEARCH_API_BASE + "/songs",
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

            if (!resposta.ok) {
                throw new Error(
                    `Erro HTTP: ${resposta.status}`
                );
            }

            const dados = await lerJSON(resposta);

            if (!dados || dados.sucesso !== true) {
                throw new Error(
                    dados?.mensagem ||
                    "Não foi possível carregar as músicas."
                );
            }

            const musicas = Array.isArray(dados.musicas)
                ? dados.musicas
                : [];

            const termoNormalizado = normalizarTexto(termo);

            const resultados = musicas.filter(function (musica) {
                if (!musica) {
                    return false;
                }

                const titulo = normalizarTexto(musica.title);
                const artista = normalizarTexto(musica.artist_name);
                const genero = normalizarTexto(musica.genre);
                const descricao = normalizarTexto(musica.description);

                return (
                    titulo.includes(termoNormalizado) ||
                    artista.includes(termoNormalizado) ||
                    genero.includes(termoNormalizado) ||
                    descricao.includes(termoNormalizado)
                );
            });

            esconderElemento(searchLoading);

            if (resultados.length === 0) {
                mostrarElemento(searchEmpty);

                if (searchEmpty) {
                    searchEmpty.textContent =
                        `Nenhuma música encontrada para "${termo}".`;
                }

                return;
            }

            esconderElemento(searchEmpty);

            renderizarResultados(resultados);
        } catch (erro) {
            console.error(
                "Yoka — erro ao carregar resultados:",
                erro
            );

            esconderElemento(searchLoading);
            esconderElemento(searchEmpty);
            mostrarElemento(searchError);

            if (searchError) {
                searchError.textContent =
                    "Não foi possível carregar os resultados. Tente novamente.";
            }
        }
    }

    // =========================================================
    // RENDERIZAR RESULTADOS
    // =========================================================

    function renderizarResultados(musicas) {
        if (!searchResultsList) {
            return;
        }

        searchResultsList.innerHTML = musicas
            .map(criarCardMusica)
            .filter(Boolean)
            .join("");

        // Um único listener para os cartões, evitando criar
        // vários listeners individuais em cada elemento.
        searchResultsList.addEventListener(
            "click",
            tratarCliqueResultado
        );

        searchResultsList.addEventListener(
            "keydown",
            tratarTeclaResultado
        );
    }

    function tratarCliqueResultado(event) {
        const botao = event.target.closest(".search-song-play");
        const card = event.target.closest(".search-song-card");

        if (botao && card) {
            event.preventDefault();
            event.stopPropagation();

            abrirMusica(card.dataset.songId);
            return;
        }

        if (card) {
            abrirMusica(card.dataset.songId);
        }
    }

    function tratarTeclaResultado(event) {
        const card = event.target.closest(".search-song-card");

        if (!card || event.target !== card) {
            return;
        }

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            abrirMusica(card.dataset.songId);
        }
    }

    // =========================================================
    // CRIAR CARTÃO DE MÚSICA
    // =========================================================

    function criarCardMusica(musica) {
        if (!musica || !musica.id) {
            return "";
        }

        const id = escaparHTML(musica.id);
        const titulo = escaparHTML(musica.title || "Sem título");
        const artista = escaparHTML(
            musica.artist_name || "Artista desconhecido"
        );

        const genero = escaparHTML(musica.genre || "");
        const capa = obterUrlArquivo(musica.cover_url);
        const duracao = formatarDuracao(
            musica.duration_seconds
        );

        const imagemHTML = capa
            ? `
                <img
                    src="${escaparHTML(capa)}"
                    alt="Capa de ${titulo}"
                    loading="lazy"
                    decoding="async"
                    referrerpolicy="no-referrer"
                >
            `
            : `
                <div class="search-no-cover" aria-hidden="true">
                    🎵
                </div>
            `;

        return `
            <article
                class="search-song-card"
                data-song-id="${id}"
                tabindex="0"
                role="link"
                aria-label="Abrir música ${titulo}, de ${artista}"
            >
                <div class="search-song-cover">
                    ${imagemHTML}
                </div>

                <div class="search-song-info">
                    <h2>${titulo}</h2>

                    <p>${artista}</p>

                    ${
                        genero
                            ? `<span>${genero}</span>`
                            : ""
                    }
                </div>

                ${
                    duracao
                        ? `
                            <div class="search-song-duration">
                                ${escaparHTML(duracao)}
                            </div>
                        `
                        : ""
                }

                <button
                    type="button"
                    class="search-song-play"
                    aria-label="Abrir música ${titulo}"
                >
                    ▶
                </button>
            </article>
        `;
    }

    // =========================================================
    // ABRIR MÚSICA
    // =========================================================

    function abrirMusica(id) {
        if (!id) {
            return;
        }

        window.location.href =
            "./song.html?id=" +
            encodeURIComponent(id);
    }

    // =========================================================
    // AVATAR DO CABEÇALHO
    // =========================================================

    async function carregarAvatarHeader() {
        const loginButton =
            document.getElementById("loginButton");

        const userMenu =
            document.getElementById("userMenu");

        const headerAvatar =
            document.getElementById("headerAvatar");

        if (!loginButton || !userMenu) {
            return;
        }

        const token = obterToken();

        if (!token) {
            mostrarEstadoVisitante(loginButton, userMenu);
            return;
        }

        try {
            const resposta = await fetch(
                `${SEARCH_API_BASE}/auth/me`,
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            if (!resposta.ok) {
                throw new Error(
                    `Não foi possível validar a sessão (${resposta.status}).`
                );
            }

            const dados = await lerJSON(resposta);

            const usuario =
                dados?.usuario ||
                dados?.user ||
                dados?.utilizador ||
                dados?.data ||
                dados;

            mostrarEstadoAutenticado(loginButton, userMenu);

            if (!headerAvatar) {
                return;
            }

            let avatar =
                usuario?.avatar_url ||
                usuario?.avatar ||
                usuario?.foto ||
                "";

            // Consultar o perfil de artista apenas se o utilizador
            // não tiver avatar no objeto principal.
            if (!avatar) {
                avatar = await obterAvatarPerfilArtista(token);
            }

            const urlAvatar = obterUrlArquivo(avatar);

            headerAvatar.src = urlAvatar ||
                "./assets/images/default-avatar.svg";

            headerAvatar.onerror = function () {
                this.onerror = null;
                this.src = "./assets/images/default-avatar.svg";
            };
        } catch (erro) {
            console.warn(
                "Yoka — erro ao carregar o utilizador:",
                erro
            );

            mostrarEstadoVisitante(loginButton, userMenu);
        }
    }

    async function obterAvatarPerfilArtista(token) {
        try {
            const resposta = await fetch(
                `${SEARCH_API_BASE}/artists/me`,
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            // Nem todos os utilizadores têm perfil de artista.
            if (!resposta.ok) {
                return "";
            }

            const dados = await lerJSON(resposta);

            const perfil =
                dados?.perfil ||
                dados?.artist ||
                dados?.artista ||
                dados?.data ||
                dados;

            return (
                perfil?.avatar_url ||
                perfil?.avatar ||
                perfil?.foto ||
                ""
            );
        } catch (erro) {
            console.warn(
                "Yoka — não foi possível carregar o avatar do artista.",
                erro
            );

            return "";
        }
    }

    function mostrarEstadoVisitante(loginButton, userMenu) {
        loginButton.classList.remove("hidden");
        userMenu.classList.add("hidden");
    }

    function mostrarEstadoAutenticado(loginButton, userMenu) {
        loginButton.classList.add("hidden");
        userMenu.classList.remove("hidden");
    }

    // =========================================================
    // INICIALIZAÇÃO
    // =========================================================

    document.addEventListener(
        "DOMContentLoaded",
        function () {
            configurarPesquisa();

            const paginaAtual = window.location.pathname
                .split("/")
                .pop()
                .toLowerCase();

            // Na página inicial, o index.js já trata do cabeçalho.
            if (
                paginaAtual !== "index.html" &&
                paginaAtual !== ""
            ) {
                carregarAvatarHeader();
            }

            carregarResultados();
        },
        { once: true }
    );
})();
