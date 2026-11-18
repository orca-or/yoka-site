/* =========================================================
   YOKA — ARTIST.JS
   PERFIL PÚBLICO DO ARTISTA
   ========================================================= */

"use strict";

/* =========================================================
   CONFIGURAÇÃO
   ========================================================= */

const ARTIST_API_BASE = "https://wairujyynjohterkqort.supabase.co/functions/v1/yoka";

const DEFAULT_AVATAR =
    "./assets/images/default-avatar.svg";

const DEFAULT_COVER =
    "./assets/images/default-cover.svg";


/* =========================================================
   ELEMENTOS — PERFIL
   ========================================================= */

const artistContent =
    document.getElementById("artistContent");

const artistCover =
    document.getElementById("artistCover");

const artistAvatar =
    document.getElementById("artistAvatar");

const artistName =
    document.getElementById("artistName");

const artistBio =
    document.getElementById("artistBio");

const artistGenre =
    document.getElementById("artistGenre");

const artistLocation =
    document.getElementById("artistLocation");

const verifiedBadge =
    document.getElementById("verifiedBadge");

const followersCount =
    document.getElementById("followersCount");

const songsCount =
    document.getElementById("songsCount");

const followButton =
    document.getElementById("followButton");

const editProfileButton =
    document.getElementById("editProfileButton");

const statisticsButton =
    document.getElementById("statisticsButton");

const uploadMusicButton =
    document.getElementById("uploadMusicButton");

const songsContainer =
    document.getElementById("songsContainer");


/* =========================================================
   ELEMENTOS — HEADER
   ========================================================= */

const headerUser =
    document.getElementById("headerUser");

const loginButton =
    document.getElementById("loginButton");

const userMenu =
    document.getElementById("userMenu");

const userAvatarButton =
    document.getElementById("userAvatarButton");

const userDropdown =
    document.getElementById("userDropdown");

const headerAvatar =
    document.getElementById("headerAvatar");

const currentYear =
    document.getElementById("currentYear");

/*
|--------------------------------------------------------------------------
| DASHBOARD ADM
|--------------------------------------------------------------------------
*/

const adminDashboardButton =
    document.getElementById("adminDashboardButton");


/* =========================================================
   ANO
   ========================================================= */

if (currentYear) {

    currentYear.textContent =
        new Date().getFullYear();

}


/* =========================================================
   ESTADO
   ========================================================= */

let artistId = null;

let artistData = null;

let musicas = [];

let usuarioAtual = null;


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

        const token =
            localStorage.getItem(nome);

        if (token) {

            return token;

        }

    }

    return null;

}


/* =========================================================
   LIMPAR TOKENS
   ========================================================= */

function limparTokens() {

    const nomes = [
        "token",
        "yoka_token",
        "accessToken",
        "access_token"
    ];

    nomes.forEach(nome => {

        localStorage.removeItem(nome);

    });

    localStorage.removeItem("user");

    localStorage.removeItem("usuario");

    localStorage.removeItem("yoka_user");

}


/* =========================================================
   HEADERS
   ========================================================= */

function obterHeaders() {

    const token =
        obterToken();

    const headers = {

        "Accept": "application/json"

    };

    if (token) {

        headers.Authorization =
            `Bearer ${token}`;

    }

    return headers;

}


/* =========================================================
   URL DOS ARQUIVOS
   ========================================================= */

function obterUrlArquivo(caminho) {

    if (!caminho) {

        return "";

    }

    const valor =
        String(caminho).trim();

    if (!valor) {

        return "";

    }


    /* URL externa */

    if (
        valor.startsWith("http://") ||
        valor.startsWith("https://")
    ) {

        return valor;

    }


    /* Caminho absoluto */

    if (valor.startsWith("/")) {

        if (
            typeof YokaAPI !== "undefined" &&
           YokaAPI.API_BASE_URL
        ) {

            const origem =
               YokaAPI.API_BASE_URL
                    .replace(/\/api\/v1\/?$/, "");

            return origem + valor;

        }

        return valor;

    }


    /* Caminho relativo */

    if (
        typeof YokaAPI !== "undefined" &&
       YokaAPI.API_BASE_URL
    ) {

        const origem =
          YokaAPI.API_BASE_URL
                .replace(/\/api\/v1\/?$/, "");

        return origem + "/" + valor;

    }

    return "/" + valor;

}


/* =========================================================
   NORMALIZAR URL
   ========================================================= */

function normalizarUrl(url, fallback) {

    if (!url) {

        return fallback;

    }

    const valor =
        String(url).trim();

    if (!valor) {

        return fallback;

    }

    if (
        valor.startsWith("http://") ||
        valor.startsWith("https://")
    ) {

        return valor;

    }

    if (valor.startsWith("/")) {

        return valor;

    }

    return "/" + valor;

}


/* =========================================================
   ESCAPAR HTML
   ========================================================= */

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


/* =========================================================
   FORMATAR NÚMERO
   ========================================================= */

function formatarNumero(numero) {

    const valor =
        Number(numero) || 0;

    return valor.toLocaleString("pt-PT");

}


/* =========================================================
   FORMATAR DURAÇÃO
   ========================================================= */

function formatarDuracao(segundos) {

    const total =
        Number(segundos);

    if (
        !Number.isFinite(total) ||
        total <= 0
    ) {

        return "--:--";

    }

    const minutos =
        Math.floor(total / 60);

    const segundosRestantes =
        Math.floor(total % 60);

    return (
        String(minutos).padStart(2, "0") +
        ":" +
        String(segundosRestantes).padStart(2, "0")
    );

}


/* =========================================================
   FORMATAR DATA DA PUBLICAÇÃO
   ========================================================= */

function formatarDataPublicacao(data) {

    if (!data) {

        return "";

    }

    const dataPublicacao =
        new Date(data);

    if (
        Number.isNaN(
            dataPublicacao.getTime()
        )
    ) {

        return "";

    }

    const agora =
        new Date();

    const diferencaMs =
        agora.getTime() -
        dataPublicacao.getTime();

    const diferencaSegundos =
        Math.floor(
            diferencaMs / 1000
        );

    const diferencaMinutos =
        Math.floor(
            diferencaSegundos / 60
        );

    const diferencaHoras =
        Math.floor(
            diferencaMinutos / 60
        );

    const diferencaDias =
        Math.floor(
            diferencaHoras / 24
        );

    if (diferencaMs < 0) {

        return dataPublicacao.toLocaleDateString(
            "pt-PT",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

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

        const semanas =
            Math.floor(
                diferencaDias / 7
            );

        return semanas === 1
            ? "há 1 semana"
            : `há ${semanas} semanas`;

    }

    if (diferencaDias < 365) {

        const meses =
            Math.floor(
                diferencaDias / 30
            );

        return meses === 1
            ? "há 1 mês"
            : `há ${meses} meses`;

    }

    return dataPublicacao.toLocaleDateString(
        "pt-PT",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );

}


/* =========================================================
   MOSTRAR / OCULTAR
   ========================================================= */

function mostrarElemento(elemento) {

    if (!elemento) {

        return;

    }

    elemento.classList.remove("hidden");

}


function ocultarElemento(elemento) {

    if (!elemento) {

        return;

    }

    elemento.classList.add("hidden");

}


function mostrarConteudo() {

    if (!artistContent) {

        return;

    }

    artistContent.classList.remove("hidden");

}


/* =========================================================
   PEGAR ID DO ARTISTA
   ========================================================= */

function obterArtistId() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const id =
        params.get("artistId") ||
        params.get("id") ||
        params.get("artist");

    if (!id) {

        return null;

    }

    return id.trim();

}


/* =========================================================
   HEADER
   ========================================================= */

function fecharMenuUtilizador() {

    if (!userDropdown) {

        return;

    }

    userDropdown.classList.add("hidden");

}


function alternarMenuUtilizador() {

    if (!userDropdown) {

        return;

    }

    userDropdown.classList.toggle("hidden");

}


/* =========================================================
   CONFIGURAR DASHBOARD ADM
   ========================================================= */
function configurarDashboardAdmin() {

    if (!adminDashboardButton) {
        return;
    }

    /*
     * Por segurança, começa sempre escondido.
     */
    ocultarElemento(
        adminDashboardButton
    );

    /*
     * O botão só aparece quando:
     *
     * 1. O utilizador está autenticado;
     * 2. O utilizador é administrador;
     * 3. O perfil aberto pertence ao próprio administrador.
     */
    if (
        usuarioAtual &&
        usuarioAtual.role === "admin" &&
        artistData &&
        artistData.is_owner === true
    ) {

        mostrarElemento(
            adminDashboardButton
        );
    }
}

/* =========================================================
   CARREGAR AVATAR HEADER
   ========================================================= */

async function carregarAvatarHeader() {

    if (!headerAvatar) {

        return;

    }

    headerAvatar.src =
        DEFAULT_AVATAR;

    headerAvatar.onerror =
        function () {

            this.onerror = null;

            this.src =
                DEFAULT_AVATAR;

        };


    const token =
        obterToken();

    if (!token) {

        return;

    }


    try {

        const respostaPerfil =
            await fetch(
                `${ARTIST_API_BASE}/artists/me`,
                {
                    method: "GET",
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        if (respostaPerfil.ok) {

            const dadosPerfil =
                await respostaPerfil.json();

            const perfil =
                dadosPerfil?.perfil || null;

            const avatar =
                perfil?.avatar_url || null;


            if (avatar) {

                headerAvatar.src =
                    obterUrlArquivo(
                        avatar
                    );

                return;

            }

        }


        const respostaUsuario =
            await fetch(
                `${ARTIST_API_BASE}/auth/me`,
                {
                    method: "GET",
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        if (!respostaUsuario.ok) {

            return;

        }


        const dadosUsuario =
            await respostaUsuario.json();

        const utilizador =
            dadosUsuario?.usuario ||
            dadosUsuario?.user ||
            dadosUsuario?.utilizador ||
            dadosUsuario?.data ||
            dadosUsuario;


        const avatarUsuario =
            utilizador?.avatar_url ||
            utilizador?.avatar ||
            utilizador?.photo_url ||
            utilizador?.photoURL ||
            null;


        if (avatarUsuario) {

            headerAvatar.src =
                obterUrlArquivo(
                    avatarUsuario
                );

        }


    } catch (erro) {

        console.error(
            "Erro ao carregar avatar do header:",
            erro
        );

        headerAvatar.src =
            DEFAULT_AVATAR;

    }

}


/* =========================================================
   CONFIGURAR HEADER
   ========================================================= */

async function configurarHeaderUtilizador() {

    if (!headerUser) {

        return;

    }


    const token =
        obterToken();


    if (!token) {

        usuarioAtual = null;

        configurarDashboardAdmin();

        mostrarElemento(
            loginButton
        );

        ocultarElemento(
            userMenu
        );

        fecharMenuUtilizador();

        return;

    }


    try {

        const resposta =
            await fetch(
                `${ARTIST_API_BASE}/auth/me`,
                {
                    method: "GET",
                    headers: obterHeaders()
                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.mensagem ||
                "Sessão inválida."
            );

        }


        usuarioAtual =
            dados.usuario ||
            dados.user ||
            dados.utilizador ||
            dados.data ||
            dados;


        if (!usuarioAtual) {

            throw new Error(
                "Utilizador não encontrado."
            );

        }


        /*
         * CONFIGURAR DASHBOARD ADM
         *
         * O botão só aparece se:
         *
         * usuarioAtual.role === "admin"
         */

        configurarDashboardAdmin();


        ocultarElemento(
            loginButton
        );

        mostrarElemento(
            userMenu
        );

        fecharMenuUtilizador();

        await carregarAvatarHeader();


    } catch (erro) {

        console.error(
            "Erro ao verificar sessão:",
            erro
        );

        limparTokens();

        usuarioAtual = null;

        configurarDashboardAdmin();

        mostrarElemento(
            loginButton
        );

        ocultarElemento(
            userMenu
        );

        fecharMenuUtilizador();

    }

}


function configurarCliqueAvatar() {

    if (!userAvatarButton) {

        return;

    }

    userAvatarButton.addEventListener(
        "click",
        function (evento) {

            evento.preventDefault();

            evento.stopPropagation();


            if (!obterToken()) {

                return;

            }


            alternarMenuUtilizador();

        }
    );

}


function configurarCliqueFora() {

    document.addEventListener(
        "click",
        function (evento) {

            if (!userMenu) {

                return;

            }


            if (
                !userMenu.contains(
                    evento.target
                )
            ) {

                fecharMenuUtilizador();

            }

        }
    );

}


function sairDaConta() {

    limparTokens();

    usuarioAtual = null;

    configurarDashboardAdmin();

    fecharMenuUtilizador();

    window.location.href =
        "./index.html";

}


function configurarLogout() {

    const botao =
        document.getElementById(
            "logoutButton"
        );


    if (!botao) {

        return;

    }


    botao.addEventListener(
        "click",
        function (evento) {

            evento.preventDefault();

            evento.stopPropagation();

            sairDaConta();

        }
    );

}


/* =========================================================
   ABRIR PERFIL DA CONTA AUTENTICADA
   ========================================================= */

function configurarLinkPerfil() {
    const profileMenuLink =
        document.getElementById("profileMenuLink");

    if (!profileMenuLink) {
        return;
    }

    // Evita registar o mesmo evento mais de uma vez.
    if (profileMenuLink.dataset.configurado === "true") {
        return;
    }

    profileMenuLink.dataset.configurado = "true";

    profileMenuLink.addEventListener("click", async function (evento) {
        evento.preventDefault();
        evento.stopPropagation();

        const token = obterToken();

        if (!token) {
            window.location.href = "./login.html";
            return;
        }

        profileMenuLink.style.pointerEvents = "none";

        try {
            const resposta = await fetch(
                `${ARTIST_API_BASE}/artists/me`,
                {
                    method: "GET",
                    headers: obterHeaders()
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem ||
                    "Não foi possível carregar o teu perfil."
                );
            }

            const perfil = dados.perfil;

            if (!perfil || !perfil.id) {
                throw new Error(
                    "Não foi encontrado o perfil associado à tua conta."
                );
            }

            // Abre o perfil da conta autenticada,
            // não o perfil do artista que estás a visitar.
            window.location.href =
                `./artist.html?id=${encodeURIComponent(perfil.id)}`;

        } catch (erro) {
            console.error(
                "Erro ao abrir o perfil da conta:",
                erro
            );

            alert(
                erro.message ||
                "Ocorreu um erro ao abrir o teu perfil."
            );

        } finally {
            profileMenuLink.style.pointerEvents = "";
        }
    });
}


async function iniciarHeader() {
    await configurarHeaderUtilizador();

    configurarCliqueAvatar();

    configurarCliqueFora();

    configurarLogout();

    configurarLinkPerfil();
}


/* =========================================================
   CARREGAR PERFIL
   ========================================================= */

async function carregarPerfil() {

    if (!artistId) {

        mostrarErro(
            "ID do artista não informado."
        );

        return;

    }


    try {

        console.log(
            "Yoka — carregando artista:",
            artistId
        );


        const url =
            `${ARTIST_API_BASE}/artists/${encodeURIComponent(artistId)}`;


        console.log(
            "Yoka — URL:",
            url
        );


        const resposta =
            await fetch(
                url,
                {
                    method: "GET",
                    headers: obterHeaders()
                }
            );


        const dados =
            await resposta.json();


        console.log(
            "Yoka — resposta do artista:",
            dados
        );


        if (!resposta.ok) {

            throw new Error(
                dados.mensagem ||
                "Não foi possível carregar o perfil."
            );

        }


        if (!dados.sucesso) {

            throw new Error(
                dados.mensagem ||
                "Erro ao carregar perfil."
            );

        }


        artistData =
            dados.perfil || {};


        musicas =
            Array.isArray(dados.musicas)
                ? dados.musicas.filter(
                    musica =>
                        musica &&
                        musica.id
                )
                : [];


        artistData.seguidores =
            Number(
                dados.seguidores ?? 0
            );


        artistData.seguindo =
            Boolean(
                dados.seguindo
            );


        artistData.is_owner =
            Boolean(
                dados.is_owner
            );


        console.log(
            "Yoka — músicas recebidas:",
            musicas.length
        );


        console.table(
            musicas
        );


       renderizarPerfil();

renderizarMusicas();

configurarAcoes();

configurarDashboardAdmin();

mostrarConteudo();
        console.log(
            "Yoka — perfil mostrado."
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar artista:",
            erro
        );


        mostrarErro(
            erro.message ||
            "Erro ao carregar o perfil."
        );

    }

}


/* =========================================================
   RENDERIZAR PERFIL
   ========================================================= */

function renderizarPerfil() {

    if (!artistData) {

        return;

    }


    if (artistName) {

        artistName.textContent =
            artistData.artist_name ||
            "Artista";

    }


    /* BIO */

    if (artistBio) {

        const bio =
            String(
                artistData.bio || ""
            );


        artistBio.textContent =
            bio;


        if (!bio.trim()) {

            ocultarElemento(
                artistBio
            );

        } else {

            mostrarElemento(
                artistBio
            );

        }

    }


    /* AVATAR */

    if (artistAvatar) {

        const avatarUrl =
            obterUrlArquivo(
                artistData.avatar_url
            );


        artistAvatar.src =
            avatarUrl ||
            DEFAULT_AVATAR;


        artistAvatar.onerror =
            function () {

                this.onerror = null;

                this.src =
                    DEFAULT_AVATAR;

            };

    }


    /* CAPA */

    if (artistCover) {

        const coverUrl =
            obterUrlArquivo(
                artistData.cover_url
            );


        artistCover.src =
            coverUrl ||
            DEFAULT_COVER;


        artistCover.onerror =
            function () {

                this.onerror = null;

                this.src =
                    DEFAULT_COVER;

            };

    }


    /* GÉNERO */

    if (artistGenre) {

        const texto =
            artistGenre.querySelector(
                "span"
            );


        if (
            texto &&
            artistData.genre
        ) {

            texto.textContent =
                artistData.genre;

            mostrarElemento(
                artistGenre
            );

        } else {

            ocultarElemento(
                artistGenre
            );

        }

    }


    /* LOCALIZAÇÃO */

    if (artistLocation) {

        const texto =
            artistLocation.querySelector(
                "span"
            );


        if (
            texto &&
            artistData.location
        ) {

            texto.textContent =
                artistData.location;

            mostrarElemento(
                artistLocation
            );

        } else {

            ocultarElemento(
                artistLocation
            );

        }

    }


    /* VERIFICADO */

    if (verifiedBadge) {

        if (
            artistData.is_verified === true
        ) {

            mostrarElemento(
                verifiedBadge
            );

        } else {

            ocultarElemento(
                verifiedBadge
            );

        }

    }


    /* SEGUIDORES */

    if (followersCount) {

        followersCount.textContent =
            formatarNumero(
                artistData.seguidores
            );

    }


    /* MÚSICAS */

    if (songsCount) {

        songsCount.textContent =
            formatarNumero(
                musicas.length
            );

    }


  

}


/* =========================================================
   AÇÕES DO PERFIL
   ========================================================= */

function configurarAcoes() {

    if (!artistData) {

        return;

    }


    /* =====================================================
       DONO DO PERFIL
       ===================================================== */

    if (artistData.is_owner) {

        mostrarElemento(
            editProfileButton
        );

        mostrarElemento(
            statisticsButton
        );

        mostrarElemento(
            uploadMusicButton
        );

        ocultarElemento(
            followButton
        );

        return;

    }


    /* =====================================================
       VISITANTE
       ===================================================== */

    ocultarElemento(
        editProfileButton
    );

    ocultarElemento(
        statisticsButton
    );

    ocultarElemento(
        uploadMusicButton
    );

    mostrarElemento(
        followButton
    );


    if (obterToken()) {

        atualizarBotaoSeguir();

    } else {

        followButton.textContent =
            "Seguir";

        followButton.classList.remove(
            "following"
        );

        followButton.classList.remove(
            "seguindo"
        );

    }

}


/* =========================================================
   BOTÃO SEGUIR
   ========================================================= */

function atualizarBotaoSeguir() {

    if (!followButton) {

        return;

    }


    if (
        artistData &&
        artistData.seguindo
    ) {

        followButton.textContent =
            "Seguindo";

        followButton.classList.add(
            "following"
        );

        followButton.classList.add(
            "seguindo"
        );

    } else {

        followButton.textContent =
            "Seguir";

        followButton.classList.remove(
            "following"
        );

        followButton.classList.remove(
            "seguindo"
        );

    }

}


async function alternarSeguir() {

    if (!followButton) {

        return;

    }


    const token =
        obterToken();


    if (!token) {

        window.location.href =
            "./login.html";

        return;

    }


    if (!artistId) {

        return;

    }


    const seguindoAgora =
        Boolean(
            artistData?.seguindo
        );


    const metodo =
        seguindoAgora
            ? "DELETE"
            : "POST";


    const textoOriginal =
        followButton.textContent;


    followButton.disabled =
        true;


    followButton.textContent =
        "Aguarde...";


    try {

        const resposta =
            await fetch(
                `${ARTIST_API_BASE}/artists/${encodeURIComponent(artistId)}/follow`,
                {
                    method: metodo,
                    headers: obterHeaders()
                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.mensagem ||
                "Não foi possível alterar o seguimento."
            );

        }


        artistData.seguindo =
            dados.seguindo !== undefined
                ? Boolean(dados.seguindo)
                : !seguindoAgora;


        if (
            dados.seguidores !== undefined
        ) {

            artistData.seguidores =
                Number(
                    dados.seguidores
                );

        }


        if (followersCount) {

            followersCount.textContent =
                formatarNumero(
                    artistData.seguidores
                );

        }


        atualizarBotaoSeguir();


    } catch (erro) {

        console.error(
            "Erro ao seguir artista:",
            erro
        );


        followButton.textContent =
            textoOriginal;


        alert(
            erro.message ||
            "Erro ao atualizar seguimento."
        );


    } finally {

        followButton.disabled =
            false;

    }

}


/* =========================================================
   EDITAR PERFIL
   ========================================================= */

function abrirEdicaoPerfil() {

    if (
        !artistData ||
        !artistData.is_owner
    ) {

        return;

    }


    window.location.href =
        "./edit-artist.html";

}


/* =========================================================
   MÚSICAS
   ========================================================= */

function renderizarMusicas() {

    console.log(
        "Yoka — renderizarMusicas() iniciou."
    );


    if (!songsContainer) {

        console.error(
            "Yoka — ERRO: #songsContainer não existe."
        );

        return;

    }


    songsContainer.classList.remove(
        "hidden"
    );


    songsContainer.innerHTML =
        "";


    /* NENHUMA MÚSICA */

    if (
        !Array.isArray(musicas) ||
        musicas.length === 0
    ) {

        songsContainer.innerHTML = `
            <div class="empty-state">
                <h3>
                    Nenhuma música publicada
                </h3>
                <p>
                    Este artista ainda não publicou músicas.
                </p>
            </div>
        `;

        return;

    }


    /* FRAGMENT */

    const fragment =
        document.createDocumentFragment();


    musicas.forEach(
        (musica, index) => {

            const card =
                criarCardMusica(
                    musica,
                    index
                );


            if (card) {

                fragment.appendChild(
                    card
                );

            }

        }
    );


    songsContainer.appendChild(
        fragment
    );


    /* CONTADOR */

    if (songsCount) {

        songsCount.textContent =
            formatarNumero(
                musicas.length
            );

    }

}


/* =========================================================
   ABRIR MÚSICA
   ========================================================= */

function abrirMusica(songId) {

    if (!songId) {

        console.error(
            "Yoka — ID da música não informado."
        );

        return;

    }


    console.log(
        "Yoka — abrindo música:",
        songId
    );


    window.location.href =
        `./song.html?id=${encodeURIComponent(songId)}`;

}


/* =========================================================
   CRIAR CARD DA MÚSICA
   ========================================================= */

function criarCardMusica(
    musica,
    index
) {

    if (!musica) {

        return null;

    }


    const article =
        document.createElement(
            "article"
        );


    article.className =
        "song-card";


    article.dataset.songId =
        String(
            musica.id || ""
        );


    /* CAPA */

    const capaUrl =
        obterUrlArquivo(
            musica.cover_url
        ) || DEFAULT_COVER;

const genero = escaparHTML(
    musica.genre || musica.genero || ""
);
    /* DADOS */

    const tituloTexto =
        musica.title ||
        "Sem título";


    const descricaoTexto =
        musica.description ||
        "";


    const titulo =
        escaparHTML(
            tituloTexto
        );


    const descricao =
        escaparHTML(
            descricaoTexto
        );


    const plays =
        formatarNumero(
            musica.plays_count
        );


    const likes =
        formatarNumero(
            musica.likes_count
        );


    const duracao =
        formatarDuracao(
            musica.duration_seconds
        );


    const dataPublicacao =
        formatarDataPublicacao(
            musica.published_at ||
            musica.created_at
        );


    /* =====================================================
       BOTÕES DO DONO
       ===================================================== */

    const acoesDono =
        artistData &&
        artistData.is_owner
            ? `
                <div class="song-card-actions">

                    <button
                        type="button"
                        class="song-edit-button"
                        data-song-id="${escaparHTML(String(musica.id))}"
                    >
                        Editar
                    </button>

                    <button
                        type="button"
                        class="song-delete-button"
                        data-song-id="${escaparHTML(String(musica.id))}"
                    >
                        Apagar
                    </button>

                </div>
            `
            : "";


    /* =====================================================
       HTML
       ===================================================== */

    article.innerHTML = `
        <div class="song-card-cover">

            <img
                class="song-card-image"
                src="${escaparHTML(capaUrl)}"
                alt="${titulo}"
                loading="lazy"
            >

            ${genero ? `
    <span class="song-card-genre">${genero}</span>
` : ""}

            <button
                class="song-play"
                type="button"
                aria-label="Abrir ${titulo}"
                data-song-id="${escaparHTML(String(musica.id))}"
            >
                ▶
            </button>

        </div>


        <div class="song-card-info">

            <div class="song-card-title-row">

                <h3
                    class="song-card-title"
                    title="${titulo}"
                >
                    ${titulo}
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


            ${
                descricao
                    ? `
                        <p class="song-card-description">
                            ${descricao}
                        </p>
                    `
                    : ""
            }


            <div class="song-card-meta">

                <span>
                    ▶ ${plays}
                </span>

                <span>
                    ♥ ${likes}
                </span>

                ${
                    duracao !== "--:--"
                        ? `
                            <span>
                                ${duracao}
                            </span>
                        `
                        : ""
                }

            </div>


            ${acoesDono}

        </div>
    `;


    /* =====================================================
       FALLBACK DA CAPA
       ===================================================== */

    const imagem =
        article.querySelector(
            ".song-card-image"
        );


    if (imagem) {

        imagem.addEventListener(
            "error",
            function () {

                console.error(
                    "Yoka — erro ao carregar capa:",
                    capaUrl
                );


                this.onerror = null;

                this.src =
                    DEFAULT_COVER;

            }
        );

    }


    /* =====================================================
       BOTÃO PLAY
       ===================================================== */

    const botaoPlay =
        article.querySelector(
            ".song-play"
        );


    if (botaoPlay) {

        botaoPlay.addEventListener(
            "click",
            function (evento) {

                evento.preventDefault();

                evento.stopPropagation();


                const songId =
                    this.dataset.songId;


                abrirMusica(
                    songId
                );

            }
        );

    }


    /* =====================================================
       BOTÃO EDITAR
       ===================================================== */

    const botaoEditar =
        article.querySelector(
            ".song-edit-button"
        );


    if (botaoEditar) {

        botaoEditar.addEventListener(
            "click",
            function (evento) {

                evento.preventDefault();

                evento.stopPropagation();


                const songId =
                    this.dataset.songId;


                if (!songId) {

                    return;

                }


                editarMusica(
                    songId
                );

            }
        );

    }


    /* =====================================================
       BOTÃO APAGAR
       ===================================================== */

    const botaoApagar =
        article.querySelector(
            ".song-delete-button"
        );


    if (botaoApagar) {

        botaoApagar.addEventListener(
            "click",
            function (evento) {

                evento.preventDefault();

                evento.stopPropagation();


                const songId =
                    this.dataset.songId;


                if (!songId) {

                    return;

                }


                apagarMusica(
                    songId,
                    article
                );

            }
        );

    }


    /* =====================================================
       CLIQUE NO CARD
       ===================================================== */

    article.addEventListener(
        "click",
        function (evento) {

            /*
             * Editar e Apagar não abrem
             * a música.
             */

            if (
                evento.target.closest(
                    ".song-edit-button, .song-delete-button"
                )
            ) {

                return;

            }


            abrirMusica(
                musica.id
            );

        }
    );


    return article;

}


/* =========================================================
   EDITAR MÚSICA
   ========================================================= */

function editarMusica(songId) {

    if (
        !artistData ||
        !artistData.is_owner
    ) {

        console.warn(
            "Yoka — utilizador não é dono deste perfil."
        );

        return;

    }


    if (!songId) {

        return;

    }


    window.location.href =
        `./edit-song.html?id=${encodeURIComponent(songId)}`;

}


/* =========================================================
   APAGAR MÚSICA
   ========================================================= */

async function apagarMusica(
    songId,
    article
) {

    if (
        !artistData ||
        !artistData.is_owner
    ) {

        console.warn(
            "Yoka — tentativa de apagar música sem ser dono."
        );

        return;

    }


    if (!songId) {

        return;

    }


    const musica =
        musicas.find(
            item =>
                String(item.id) ===
                String(songId)
        );


    const nomeMusica =
        musica?.title ||
        "esta música";


    const confirmar =
        window.confirm(
            `Tem certeza que deseja apagar "${nomeMusica}"?\n\nEsta ação não poderá ser desfeita.`
        );


    if (!confirmar) {

        return;

    }


    const token =
        obterToken();


    if (!token) {

        alert(
            "A sua sessão expirou. Faça login novamente."
        );


        window.location.href =
            "./login.html";


        return;

    }


    const botao =
        article?.querySelector(
            ".song-delete-button"
        );


    const textoOriginal =
        botao?.textContent ||
        "Apagar";


    try {

        if (botao) {

            botao.disabled =
                true;

            botao.textContent =
                "A apagar...";

        }


        const resposta =
            await fetch(
                `${ARTIST_API_BASE}/songs/${encodeURIComponent(songId)}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                        Accept:
                            "application/json"
                    }
                }
            );


        let dados = {};


        try {

            dados =
                await resposta.json();

        } catch {

            dados = {};

        }


        if (!resposta.ok) {

            throw new Error(
                dados.mensagem ||
                "Não foi possível apagar a música."
            );

        }


        /* REMOVER DO ARRAY */

        musicas =
            musicas.filter(
                item =>
                    String(item.id) !==
                    String(songId)
            );


        /* ATUALIZAR CONTADOR */

        if (songsCount) {

            songsCount.textContent =
                formatarNumero(
                    musicas.length
                );

        }


        /* REMOVER CARD */

        if (article) {

            article.remove();

        }


        /* ESTADO VAZIO */

        if (
            musicas.length === 0
        ) {

            renderizarMusicas();

        }


        alert(
            "Música apagada com sucesso."
        );


    } catch (erro) {

        console.error(
            "Yoka — erro ao apagar música:",
            erro
        );


        if (botao) {

            botao.disabled =
                false;

            botao.textContent =
                textoOriginal;

        }


        alert(
            erro.message ||
            "Erro ao apagar música."
        );

    }

}


/* =========================================================
   ERRO
   ========================================================= */

function mostrarErro(
    mensagem
) {

    if (!artistContent) {

        return;

    }


    artistContent.classList.remove(
        "hidden"
    );


    artistContent.innerHTML = `
        <div class="error-message">

            <h2>
                Não foi possível carregar o perfil
            </h2>

            <p>
                ${escaparHTML(
                    mensagem ||
                    "Ocorreu um erro."
                )}
            </p>

        </div>
    `;

}


/* =========================================================
   EVENTOS
   ========================================================= */

if (followButton) {

    followButton.addEventListener(
        "click",
        alternarSeguir
    );

}


if (editProfileButton) {

    editProfileButton.addEventListener(
        "click",
        abrirEdicaoPerfil
    );

}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

async function iniciar() {

    iniciarHeader()
        .catch(
            erro => {

                console.error(
                    "Erro no header:",
                    erro
                );

            }
        );


    artistId =
        obterArtistId();


    console.log(
        "Yoka — artistId:",
        artistId
    );


    if (!artistId) {

        mostrarErro(
            "Não foi encontrado o ID do artista na URL."
        );

        return;

    }


    await carregarPerfil();

}


/* =========================================================
   START
   ========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        iniciar
    );

} else {

    iniciar();

}
