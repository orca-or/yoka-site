"use strict";

/* =========================================================
YOKA — EDIT ARTIST
EDITAR PERFIL DO ARTISTA
========================================================= */

const API_BASE = "https://yoka-d1e1.onrender.com/api/v1";

/* =========================================================
ELEMENTOS
========================================================= */

const form =
document.getElementById("editArtistForm");

const saveButton =
document.getElementById("saveButton");

const formMessage =
document.getElementById("formMessage");

const artistName =
document.getElementById("artistName");

const bio =
document.getElementById("bio");

const genre =
document.getElementById("genre");

const locationInput =
document.getElementById("location");

/* =========================================================
FICHEIROS
========================================================= */

const avatarFile =
document.getElementById("avatarFile");

const coverFile =
document.getElementById("coverFile");

/* =========================================================
PREVIEWS
========================================================= */

const avatarPreviewImage =
document.getElementById("avatarPreviewImage");

const coverPreviewImage =
document.getElementById("coverPreviewImage");

/* =========================================================
DEFAULTS
========================================================= */

const DEFAULT_AVATAR =
"./assets/images/default-avatar.svg";

const DEFAULT_COVER =
"./assets/images/default-cover.svg";

/* =========================================================
ESTADO
========================================================= */

let meuPerfil = null;

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
HEADERS
========================================================= */

function obterHeaders() {


const token =
    obterToken();

const headers = {};

if (token) {

    headers.Authorization =
        `Bearer ${token}`;
}

return headers;


}

/* =========================================================
NORMALIZAR URL
========================================================= */

function normalizarUrl(url, fallback) {


if (
    typeof url !== "string" ||
    !url.trim()
) {

    return fallback;
}

url = url.trim();

if (
    url.startsWith("http://") ||
    url.startsWith("https://")
) {

    return url;
}

if (url.startsWith("/")) {

    return url;
}

return "/" + url;


}

/* =========================================================
MENSAGENS
========================================================= */

function mostrarMensagem(
mensagem,
tipo = "error"
) {


if (!formMessage) {
    return;
}

formMessage.textContent =
    mensagem;

formMessage.classList.remove(
    "hidden",
    "success",
    "error"
);

formMessage.classList.add(
    tipo
);

}

function ocultarMensagem() {


if (!formMessage) {
    return;
}

formMessage.classList.add(
    "hidden"
);


}

/* =========================================================
LOGIN
========================================================= */

function irParaLogin() {


window.location.href =
    "./login.html";


}

function limparTokens() {


const nomes = [
    "token",
    "yoka_token",
    "accessToken",
    "access_token"
];

nomes.forEach(
    nome => {
        localStorage.removeItem(nome);
    }
);


}

/* =========================================================
PREVIEW — AVATAR EXISTENTE
========================================================= */

function atualizarPreviewAvatar(url = null) {


if (!avatarPreviewImage) {
    return;
}

const imagem =
    url ||
    meuPerfil?.avatar_url ||
    DEFAULT_AVATAR;

avatarPreviewImage.src =
    normalizarUrl(
        imagem,
        DEFAULT_AVATAR
    );

avatarPreviewImage.onerror =
    function () {

        this.onerror = null;

        this.src =
            DEFAULT_AVATAR;
    };


}

/* =========================================================
PREVIEW — CAPA EXISTENTE
========================================================= */

function atualizarPreviewCapa(url = null) {


if (!coverPreviewImage) {
    return;
}

const imagem =
    url ||
    meuPerfil?.cover_url ||
    DEFAULT_COVER;

coverPreviewImage.src =
    normalizarUrl(
        imagem,
        DEFAULT_COVER
    );

coverPreviewImage.onerror =
    function () {

        this.onerror = null;

        this.src =
            DEFAULT_COVER;
    };


}

/* =========================================================
PREVIEW — NOVO AVATAR
========================================================= */

function previewNovoAvatar() {

if (!avatarFile) {
    return;
}

const arquivo =
    avatarFile.files &&
    avatarFile.files.length > 0
        ? avatarFile.files[0]
        : null;

if (!arquivo) {

    atualizarPreviewAvatar();

    return;
}

/*
 * Verificar tipo
 */

const tiposPermitidos = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

if (
    !tiposPermitidos.includes(
        arquivo.type
    )
) {

    mostrarMensagem(
        "Foto de perfil: use JPG, PNG ou WEBP."
    );

    avatarFile.value = "";

    atualizarPreviewAvatar();

    return;
}

/*
 * Verificar tamanho
 */

if (
    arquivo.size >
    5 * 1024 * 1024
) {

    mostrarMensagem(
        "A foto de perfil não pode ultrapassar 5 MB."
    );

    avatarFile.value = "";

    atualizarPreviewAvatar();

    return;
}

/*
 * Ler a imagem
 */

const leitor =
    new FileReader();

leitor.onload =
    function (evento) {

        if (
            avatarPreviewImage &&
            evento.target?.result
        ) {

            avatarPreviewImage.src =
                evento.target.result;

        }
    };

leitor.onerror =
    function () {

        mostrarMensagem(
            "Não foi possível visualizar a foto selecionada."
        );

        atualizarPreviewAvatar();
    };

leitor.readAsDataURL(
    arquivo
);


}

/* =========================================================
PREVIEW — NOVA CAPA
========================================================= */

function previewNovaCapa() {


if (!coverFile) {
    return;
}

const arquivo =
    coverFile.files &&
    coverFile.files.length > 0
        ? coverFile.files[0]
        : null;

if (!arquivo) {

    atualizarPreviewCapa();

    return;
}

/*
 * Verificar tipo
 */

const tiposPermitidos = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

if (
    !tiposPermitidos.includes(
        arquivo.type
    )
) {

    mostrarMensagem(
        "Capa: use JPG, PNG ou WEBP."
    );

    coverFile.value = "";

    atualizarPreviewCapa();

    return;
}

/*
 * Verificar tamanho
 */

if (
    arquivo.size >
    5 * 1024 * 1024
) {

    mostrarMensagem(
        "A capa não pode ultrapassar 5 MB."
    );

    coverFile.value = "";

    atualizarPreviewCapa();

    return;
}

/*
 * Ler a imagem
 */

const leitor =
    new FileReader();

leitor.onload =
    function (evento) {

        if (
            coverPreviewImage &&
            evento.target?.result
        ) {

            coverPreviewImage.src =
                evento.target.result;

        }
    };

leitor.onerror =
    function () {

        mostrarMensagem(
            "Não foi possível visualizar a capa selecionada."
        );

        atualizarPreviewCapa();
    };

leitor.readAsDataURL(
    arquivo
);


}

/* =========================================================
CARREGAR MEU PERFIL
========================================================= */

async function carregarMeuPerfil() {


const token =
    obterToken();

if (!token) {

    irParaLogin();

    return;
}

try {

    const resposta =
        await fetch(
            `${API_BASE}/artists/me`,
            {
                method: "GET",
                headers: obterHeaders()
            }
        );

    let dados = null;

    try {

        dados =
            await resposta.json();

    } catch {

        dados = null;
    }

    if (
        resposta.status === 401 ||
        resposta.status === 403
    ) {

        limparTokens();

        irParaLogin();

        return;
    }

    if (!resposta.ok) {

        throw new Error(
            dados?.mensagem ||
            "Não foi possível carregar o perfil."
        );
    }

    if (
        !dados ||
        dados.sucesso === false
    ) {

        throw new Error(
            dados?.mensagem ||
            "Não foi possível carregar o perfil."
        );
    }

    meuPerfil =
        dados.perfil ||
        dados;

    if (!meuPerfil?.id) {

        throw new Error(
            "O perfil não possui um ID válido."
        );
    }

    preencherFormulario(
        meuPerfil
    );

} catch (erro) {

    console.error(
        "Erro ao carregar perfil:",
        erro
    );

    mostrarMensagem(
        erro.message ||
        "Erro ao carregar o perfil."
    );
}

}

/* =========================================================
PREENCHER FORMULÁRIO
========================================================= */

function preencherFormulario(perfil) {


if (!perfil) {
    return;
}

if (artistName) {

    artistName.value =
        perfil.artist_name ||
        "";
}

if (bio) {

    bio.value =
        perfil.bio ||
        "";
}

if (genre) {

    genre.value =
        perfil.genre ||
        "";
}

if (locationInput) {

    locationInput.value =
        perfil.location ||
        "";
}

/*
 * Mostrar imagens atuais
 */

atualizarPreviewAvatar(
    perfil.avatar_url
);

atualizarPreviewCapa(
    perfil.cover_url
);


}

/* =========================================================
VALIDAR IMAGEM
========================================================= */

function validarImagem(
arquivo,
nome
) {


if (!arquivo) {
    return true;
}

const tiposPermitidos = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

if (
    !tiposPermitidos.includes(
        arquivo.type
    )
) {

    mostrarMensagem(
        `${nome}: use JPG, PNG ou WEBP.`
    );

    return false;
}

const tamanhoMaximo =
    5 * 1024 * 1024;

if (
    arquivo.size >
    tamanhoMaximo
) {

    mostrarMensagem(
        `${nome}: a imagem não pode ultrapassar 5 MB.`
    );

    return false;
}

return true;


}

/* =========================================================
GUARDAR PERFIL
========================================================= */

async function guardarPerfil(evento) {


evento.preventDefault();

ocultarMensagem();

const token =
    obterToken();

if (!token) {

    irParaLogin();

    return;
}

const nome =
    artistName?.value.trim() ||
    "";

if (nome.length < 2) {

    mostrarMensagem(
        "O nome artístico deve ter pelo menos 2 caracteres."
    );

    if (artistName) {
        artistName.focus();
    }

    return;
}

const novoAvatar =
    avatarFile?.files?.[0] ||
    null;

const novaCapa =
    coverFile?.files?.[0] ||
    null;

if (
    !validarImagem(
        novoAvatar,
        "Foto de perfil"
    )
) {

    return;
}

if (
    !validarImagem(
        novaCapa,
        "Capa do perfil"
    )
) {

    return;
}

if (saveButton) {

    saveButton.disabled =
        true;

    saveButton.textContent =
        "A guardar...";
}

try {

    const formulario =
        new FormData();

    /*
     * TEXTO
     */

    formulario.append(
        "artist_name",
        nome
    );

    formulario.append(
        "bio",
        bio?.value.trim() || ""
    );

    formulario.append(
        "genre",
        genre?.value.trim() || ""
    );

    formulario.append(
        "location",
        locationInput?.value.trim() || ""
    );

    /*
     * AVATAR
     */

    if (novoAvatar) {

        formulario.append(
            "avatar",
            novoAvatar,
            novoAvatar.name
        );
    }

    /*
     * CAPA
     */

    if (novaCapa) {

        formulario.append(
            "cover",
            novaCapa,
            novaCapa.name
        );
    }

    /*
     * ENVIAR
     */

    const resposta =
        await fetch(
            `${API_BASE}/artists/me`,
            {
                method: "PUT",
                headers: {
                    Authorization:
                        `Bearer ${token}`
                },
                body:
                    formulario
            }
        );

    let resultado = null;

    try {

        resultado =
            await resposta.json();

    } catch {

        resultado = null;
    }

    if (
        resposta.status === 401 ||
        resposta.status === 403
    ) {

        limparTokens();

        irParaLogin();

        return;
    }

    if (!resposta.ok) {

        throw new Error(
            resultado?.mensagem ||
            "Não foi possível atualizar o perfil."
        );
    }

    if (
        resultado &&
        resultado.sucesso === false
    ) {

        throw new Error(
            resultado.mensagem ||
            "Não foi possível atualizar o perfil."
        );
    }

    /*
     * PERFIL ATUALIZADO
     */

    const perfilAtualizado =
        resultado?.perfil;

    if (perfilAtualizado) {

        meuPerfil =
            perfilAtualizado;
    }

    const artistId =
        perfilAtualizado?.id ||
        meuPerfil?.id;

    if (!artistId) {

        throw new Error(
            "Perfil atualizado, mas o ID do artista não foi encontrado."
        );
    }

    /*
     * Atualizar previews com o resultado
     */

    if (perfilAtualizado) {

        atualizarPreviewAvatar(
            perfilAtualizado.avatar_url
        );

        atualizarPreviewCapa(
            perfilAtualizado.cover_url
        );
    }

    /*
     * Limpar ficheiros
     */

    if (avatarFile) {
        avatarFile.value = "";
    }

    if (coverFile) {
        coverFile.value = "";
    }

    mostrarMensagem(
        resultado?.mensagem ||
        "Perfil atualizado com sucesso.",
        "success"
    );

    /*
     * Voltar ao perfil
     */

    setTimeout(
        function () {

            window.location.href =
                `./artist.html?artistId=${encodeURIComponent(artistId)}`;

        },
        700
    );

} catch (erro) {

    console.error(
        "Erro ao atualizar perfil:",
        erro
    );

    mostrarMensagem(
        erro.message ||
        "Erro ao atualizar o perfil."
    );

} finally {

    if (saveButton) {

        saveButton.disabled =
            false;

        saveButton.textContent =
            "Guardar alterações";
    }
}


}

/* =========================================================
EVENTO — AVATAR
========================================================= */

if (avatarFile) {


avatarFile.addEventListener(
    "change",
    function () {

        previewNovoAvatar();

    }
);


}

/* =========================================================
EVENTO — CAPA
========================================================= */

if (coverFile) {


coverFile.addEventListener(
    "change",
    function () {

        previewNovaCapa();

    }
);


}

/* =========================================================
EVENTO — FORMULÁRIO
========================================================= */

if (form) {

form.addEventListener(
    "submit",
    guardarPerfil
);


}




/* =========================================================
EVENTO — CANCELAR EDIÇÃO
========================================================= */

const cancelEditButton =
    document.getElementById("cancelEditButton");

if (cancelEditButton) {
    cancelEditButton.addEventListener("click", function () {
        if (meuPerfil && meuPerfil.id) {
            window.location.href =
                "./artist.html?artistId=" +
                encodeURIComponent(meuPerfil.id);

            return;
        }

        mostrarMensagem(
            "O perfil ainda não foi carregado. Aguarda alguns segundos e tenta novamente."
        );
    });
}



/* =========================================================
INICIALIZAÇÃO
========================================================= */

async function iniciar() {


await carregarMeuPerfil();

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
