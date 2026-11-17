"use strict";

/*
|--------------------------------------------------------------------------
| CONFIGURAÇÃO
|--------------------------------------------------------------------------
*/

const API_BASE = "/api/v1";

const DEFAULT_COVER =
    "../assets/images/default-cover.svg";

const DEFAULT_AVATAR =
    "../assets/images/default-avatar.svg";


/*
|--------------------------------------------------------------------------
| ELEMENTOS
|--------------------------------------------------------------------------
*/

const elementos = {

    adminName:
        document.getElementById("adminName"),

    logoutButton:
        document.getElementById("logoutButton"),

    deleteMusicButton:
        document.getElementById("deleteMusicButton"),

    mensagem:
        document.getElementById("mensagem"),

    carregando:
        document.getElementById("carregando"),

    conteudo:
        document.getElementById("conteudo"),

    musicCover:
        document.getElementById("musicCover"),

    musicTitle:
        document.getElementById("musicTitle"),

    musicArtist:
        document.getElementById("musicArtist"),

    musicDescription:
        document.getElementById("musicDescription"),

    musicStatus:
        document.getElementById("musicStatus"),

    totalPlays:
        document.getElementById("totalPlays"),

    totalLikes:
        document.getElementById("totalLikes"),

    totalFavorites:
        document.getElementById("totalFavorites"),

    totalComments:
        document.getElementById("totalComments"),

    musicGenre:
        document.getElementById("musicGenre"),

    musicDuration:
        document.getElementById("musicDuration"),

    musicStatusInfo:
        document.getElementById("musicStatusInfo"),

    musicPublishedAt:
        document.getElementById("musicPublishedAt"),

    musicCreatedAt:
        document.getElementById("musicCreatedAt"),

    musicUpdatedAt:
        document.getElementById("musicUpdatedAt"),

    artistAvatar:
        document.getElementById("artistAvatar"),

    artistName:
        document.getElementById("artistName"),

    artistGenre:
        document.getElementById("artistGenre"),

    artistLocation:
        document.getElementById("artistLocation"),

    musicAudio:
        document.getElementById("musicAudio")
};


/*
|--------------------------------------------------------------------------
| TOKEN
|--------------------------------------------------------------------------
*/

function obterToken() {

    return (
        localStorage.getItem("yoka_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token")
    );
}


/*
|--------------------------------------------------------------------------
| LIMPAR TOKENS
|--------------------------------------------------------------------------
*/

function limparTokens() {

    localStorage.removeItem("yoka_token");
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("access_token");
}


/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

function redirecionarLogin() {

    window.location.href =
        "../login.html";
}


/*
|--------------------------------------------------------------------------
| FETCH AUTENTICADO
|--------------------------------------------------------------------------
*/

async function apiFetch(endpoint, options = {}) {

    const token = obterToken();

    if (!token) {

        redirecionarLogin();

        throw new Error(
            "Token de autenticação não encontrado."
        );
    }


    const headers = {

        ...(options.headers || {}),

        Authorization:
            `Bearer ${token}`
    };


    if (
        options.body &&
        !headers["Content-Type"]
    ) {

        headers["Content-Type"] =
            "application/json";
    }


    const resposta =
        await fetch(
            `${API_BASE}${endpoint}`,
            {
                ...options,
                headers
            }
        );


    if (resposta.status === 401) {

        limparTokens();

        redirecionarLogin();

        throw new Error(
            "Sessão expirada."
        );
    }


    if (resposta.status === 403) {

        throw new Error(
            "Acesso negado. Esta área é exclusiva para administradores."
        );
    }


    let dados;

    try {

        dados =
            await resposta.json();

    } catch {

        throw new Error(
            "Resposta inválida do servidor."
        );
    }


    if (
        !resposta.ok ||
        dados.sucesso === false
    ) {

        throw new Error(
            dados.mensagem ||
            "Erro ao comunicar com o servidor."
        );
    }


    return dados;
}


/*
|--------------------------------------------------------------------------
| MENSAGEM
|--------------------------------------------------------------------------
*/

function mostrarMensagem(
    mensagem,
    tipo = "erro"
) {

    if (!elementos.mensagem) {
        return;
    }


    elementos.mensagem.textContent =
        mensagem;


    elementos.mensagem.className =
        `mensagem ${tipo}`;


    elementos.mensagem.hidden =
        false;
}


function esconderMensagem() {

    if (!elementos.mensagem) {
        return;
    }


    elementos.mensagem.hidden =
        true;
}


/*
|--------------------------------------------------------------------------
| FORMATAÇÃO DE DATA
|--------------------------------------------------------------------------
*/

function formatarData(data) {

    if (!data) {
        return "—";
    }


    const dataObj =
        new Date(data);


    if (
        Number.isNaN(
            dataObj.getTime()
        )
    ) {

        return "—";
    }


    return dataObj.toLocaleString(
        "pt-AO",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/*
|--------------------------------------------------------------------------
| FORMATAÇÃO DE NÚMEROS
|--------------------------------------------------------------------------
*/

function formatarNumero(valor) {

    return Number(
        valor || 0
    ).toLocaleString("pt-AO");
}


/*
|--------------------------------------------------------------------------
| FORMATAÇÃO DE DURAÇÃO
|--------------------------------------------------------------------------
*/

function formatarDuracao(segundos) {

    if (
        segundos === null ||
        segundos === undefined ||
        segundos === ""
    ) {

        return "Não disponível";
    }


    const total =
        Number(segundos);


    if (
        !Number.isFinite(total) ||
        total < 0
    ) {

        return "Não disponível";
    }


    const minutos =
        Math.floor(total / 60);

    const segundosRestantes =
        Math.floor(total % 60);


    return (
        `${String(minutos).padStart(2, "0")}:` +
        `${String(segundosRestantes).padStart(2, "0")}`
    );
}


/*
|--------------------------------------------------------------------------
| ESTADO
|--------------------------------------------------------------------------
*/

function obterEstado(status) {

    switch (status) {

        case "published":

            return {
                texto: "Publicada",
                classe: "status-published"
            };


        case "draft":

            return {
                texto: "Rascunho",
                classe: "status-draft"
            };


        case "archived":

            return {
                texto: "Arquivada",
                classe: "status-archived"
            };


        default:

            return {
                texto:
                    status ||
                    "Desconhecido",

                classe:
                    "status-draft"
            };
    }
}


/*
|--------------------------------------------------------------------------
| ID DA MÚSICA
|--------------------------------------------------------------------------
*/

function obterIdMusica() {

    const parametros =
        new URLSearchParams(
            window.location.search
        );


    return parametros.get("id");
}


/*
|--------------------------------------------------------------------------
| CARREGAR ADMINISTRADOR
|--------------------------------------------------------------------------
*/

async function carregarAdministrador() {

    try {

        const dados =
            await apiFetch(
                "/auth/me"
            );


        if (
            dados.usuario &&
            elementos.adminName
        ) {

            elementos.adminName.textContent =
                dados.usuario.name ||
                "Administrador";
        }

    } catch (error) {

        console.error(
            "Erro ao carregar administrador:",
            error
        );
    }
}


/*
|--------------------------------------------------------------------------
| PREENCHER DETALHES
|--------------------------------------------------------------------------
*/

function preencherDetalhes(musica) {

    const estado =
        obterEstado(
            musica.status
        );


    /*
    |--------------------------------------------------------------------------
    | Música
    |--------------------------------------------------------------------------
    */

    elementos.musicTitle.textContent =
        musica.title ||
        "Sem título";


    elementos.musicArtist.textContent =
        musica.artist_name ||
        "Artista desconhecido";


    elementos.musicDescription.textContent =
        musica.description ||
        "Sem descrição.";


    elementos.musicCover.src =
        musica.cover_url ||
        DEFAULT_COVER;


    elementos.musicCover.onerror =
        function () {

            this.onerror = null;

            this.src =
                DEFAULT_COVER;
        };


    elementos.musicStatus.textContent =
        estado.texto;


    elementos.musicStatus.className =
        `status ${estado.classe}`;


    /*
    |--------------------------------------------------------------------------
    | Estatísticas
    |--------------------------------------------------------------------------
    */

    elementos.totalPlays.textContent =
        formatarNumero(
            musica.total_reproducoes_registadas ??
            musica.plays_count
        );


    elementos.totalLikes.textContent =
        formatarNumero(
            musica.total_likes_registados ??
            musica.likes_count
        );


    elementos.totalFavorites.textContent =
        formatarNumero(
            musica.total_favoritos
        );


    elementos.totalComments.textContent =
        formatarNumero(
            musica.total_comentarios
        );


    /*
    |--------------------------------------------------------------------------
    | Informações
    |--------------------------------------------------------------------------
    */

    elementos.musicGenre.textContent =
        musica.genre ||
        "Sem gênero";


    elementos.musicDuration.textContent =
        formatarDuracao(
            musica.duration_seconds
        );


    elementos.musicStatusInfo.textContent =
        estado.texto;


    elementos.musicPublishedAt.textContent =
        formatarData(
            musica.published_at
        );


    elementos.musicCreatedAt.textContent =
        formatarData(
            musica.created_at
        );


    elementos.musicUpdatedAt.textContent =
        formatarData(
            musica.updated_at
        );


    /*
    |--------------------------------------------------------------------------
    | Artista
    |--------------------------------------------------------------------------
    */

    elementos.artistName.textContent =
        musica.artist_name ||
        "Artista desconhecido";


    elementos.artistGenre.textContent =
        musica.artist_genre ||
        "Gênero não informado";


    elementos.artistLocation.textContent =
        musica.artist_location ||
        "Localização não informada";


    elementos.artistAvatar.src =
        musica.artist_avatar_url ||
        DEFAULT_AVATAR;


    elementos.artistAvatar.onerror =
        function () {

            this.onerror = null;

            this.src =
                DEFAULT_AVATAR;
        };


    /*
    |--------------------------------------------------------------------------
    | Áudio
    |--------------------------------------------------------------------------
    */

    if (musica.audio_url) {

        elementos.musicAudio.src =
            musica.audio_url;

    } else {

        elementos.musicAudio.removeAttribute(
            "src"
        );
    }
}


/*
|--------------------------------------------------------------------------
| CARREGAR MÚSICA
|--------------------------------------------------------------------------
*/

async function carregarMusica() {

    const id =
        obterIdMusica();


    if (!id) {

        mostrarMensagem(
            "ID da música não informado."
        );

        elementos.carregando.hidden =
            true;

        return;
    }


    try {

        esconderMensagem();


        const dados =
            await apiFetch(
                `/admin/songs/${encodeURIComponent(id)}`
            );


        if (
            !dados.musica
        ) {

            throw new Error(
                "Dados da música não encontrados."
            );
        }


        preencherDetalhes(
            dados.musica
        );


        elementos.carregando.hidden =
            true;


        elementos.conteudo.hidden =
            false;


    } catch (error) {

        console.error(
            "Erro ao carregar detalhes:",
            error
        );


        elementos.carregando.hidden =
            true;


        mostrarMensagem(
            error.message ||
            "Não foi possível carregar os detalhes da música."
        );
    }
}


/*
|--------------------------------------------------------------------------
| EXCLUIR MÚSICA
|--------------------------------------------------------------------------
*/

async function excluirMusica() {

    const id =
        obterIdMusica();


    if (!id) {

        mostrarMensagem(
            "ID da música não encontrado."
        );

        return;
    }


    const titulo =
        elementos.musicTitle?.textContent ||
        "esta música";


    const confirmar =
        window.confirm(
            `Tem certeza que deseja excluir "${titulo}"?\n\n` +
            "A música, a capa, o áudio e os dados relacionados serão removidos.\n\n" +
            "Esta ação não pode ser desfeita."
        );


    if (!confirmar) {
        return;
    }


    const botao =
        elementos.deleteMusicButton;


    if (botao) {

        botao.disabled =
            true;

        botao.textContent =
            "Excluindo...";
    }


    try {

        const dados =
            await apiFetch(
                `/admin/songs/${encodeURIComponent(id)}`,
                {
                    method: "DELETE"
                }
            );


        mostrarMensagem(
            dados.mensagem ||
            "Música excluída com sucesso.",
            "sucesso"
        );


        if (botao) {

            botao.textContent =
                "Música excluída";
        }


        setTimeout(
            () => {

                window.location.href =
                    "./musicas.html";

            },
            1000
        );

    } catch (error) {

        console.error(
            "Erro ao excluir música:",
            error
        );


        mostrarMensagem(
            error.message ||
            "Erro ao excluir música.",
            "erro"
        );


        if (botao) {

            botao.disabled =
                false;

            botao.textContent =
                "🗑 Excluir música";
        }
    }
}


/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

function fazerLogout() {

    limparTokens();

    redirecionarLogin();
}


if (elementos.logoutButton) {

    elementos.logoutButton.addEventListener(
        "click",
        fazerLogout
    );
}


/*
|--------------------------------------------------------------------------
| BOTÃO EXCLUIR
|--------------------------------------------------------------------------
*/

if (elementos.deleteMusicButton) {

    elementos.deleteMusicButton.addEventListener(
        "click",
        excluirMusica
    );
}


/*
|--------------------------------------------------------------------------
| INICIALIZAÇÃO
|--------------------------------------------------------------------------
*/

async function iniciar() {

    await carregarAdministrador();

    await carregarMusica();
}


document.addEventListener(
    "DOMContentLoaded",
    iniciar
);