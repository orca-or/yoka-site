
/*
|--------------------------------------------------------------------------
| YOKA — EDITAR MÚSICA
|--------------------------------------------------------------------------
*/

const API_BASE = "https://yoka-d1e1.onrender.com/api/v1";


/*
|--------------------------------------------------------------------------
| ELEMENTOS
|--------------------------------------------------------------------------
*/

const loading =
    document.getElementById("loading");

const errorMessage =
    document.getElementById("errorMessage");

const editSongForm =
    document.getElementById("editSongForm");

const titleInput =
    document.getElementById("title");

const genreInput =
    document.getElementById("genre");

const descriptionInput =
    document.getElementById("description");

const descriptionCount =
    document.getElementById("descriptionCount");

const coverInput =
    document.getElementById("cover");

const coverPreview =
    document.getElementById("coverPreview");

const previewTitle =
    document.getElementById("previewTitle");

const previewArtist =
    document.getElementById("previewArtist");

const songStatus =
    document.getElementById("songStatus");

const formMessage =
    document.getElementById("formMessage");

const saveButton =
    document.getElementById("saveButton");

const cancelButton =
    document.getElementById("cancelButton");

const backButton =
    document.getElementById("backButton");


/*
|--------------------------------------------------------------------------
| ESTADO
|--------------------------------------------------------------------------
*/

let musicaAtual = null;

let novaCapaSelecionada = null;


/*
|--------------------------------------------------------------------------
| TOKEN
|--------------------------------------------------------------------------
*/

function obterToken() {

    return (
        localStorage.getItem("token") ||
        localStorage.getItem("yoka_token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token") ||
        null
    );
}


/*
|--------------------------------------------------------------------------
| ID DA MÚSICA
|--------------------------------------------------------------------------
*/

function obterSongId() {

    const parametros =
        new URLSearchParams(
            window.location.search
        );

    return (
        parametros.get("id") ||
        parametros.get("songId") ||
        parametros.get("song")
    );
}


/*
|--------------------------------------------------------------------------
| URL DA IMAGEM ATUAL
|--------------------------------------------------------------------------
*/

function obterUrlImagem(url) {

    if (!url) {

        return "./assets/images/default-cover.svg";
    }

    const valor =
        String(url).trim();

    if (!valor) {

        return "./assets/images/default-cover.svg";
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


/*
|--------------------------------------------------------------------------
| MOSTRAR ERRO
|--------------------------------------------------------------------------
*/

function mostrarErro(mensagem) {

    if (loading) {

        loading.classList.add(
            "hidden"
        );
    }

    if (editSongForm) {

        editSongForm.classList.add(
            "hidden"
        );
    }

    if (errorMessage) {

        errorMessage.textContent =
            mensagem ||
            "Não foi possível carregar a música.";

        errorMessage.classList.remove(
            "hidden"
        );
    }
}


/*
|--------------------------------------------------------------------------
| MOSTRAR MENSAGEM
|--------------------------------------------------------------------------
*/

function mostrarMensagem(
    mensagem,
    tipo = "success"
) {

    if (!formMessage) {
        return;
    }

    formMessage.textContent =
        mensagem;

    formMessage.className =
        "message";

    formMessage.classList.add(
        tipo === "error"
            ? "error-message"
            : "success-message"
    );

    formMessage.classList.remove(
        "hidden"
    );
}


/*
|--------------------------------------------------------------------------
| ATUALIZAR CONTADOR DA DESCRIÇÃO
|--------------------------------------------------------------------------
*/

function atualizarContadorDescricao() {

    if (
        !descriptionInput ||
        !descriptionCount
    ) {
        return;
    }

    const tamanho =
        descriptionInput.value.length;

    descriptionCount.textContent =
        String(tamanho);
}


/*
|--------------------------------------------------------------------------
| ATUALIZAR PREVIEW DO TÍTULO
|--------------------------------------------------------------------------
*/

function atualizarPreview() {

    if (!previewTitle || !titleInput) {
        return;
    }

    previewTitle.textContent =
        titleInput.value.trim() ||
        "Música";
}


/*
|--------------------------------------------------------------------------
| FORMATAR STATUS
|--------------------------------------------------------------------------
*/

function formatarStatus(status) {

    switch (status) {

        case "published":
            return "Publicada";

        case "draft":
            return "Rascunho";

        case "archived":
            return "Arquivada";

        default:
            return status || "—";
    }
}


/*
|--------------------------------------------------------------------------
| PREENCHER FORMULÁRIO
|--------------------------------------------------------------------------
*/

function preencherFormulario(
    musica
) {

    musicaAtual =
        musica;


    /*
    |----------------------------------------------------------------------
    | TÍTULO
    |----------------------------------------------------------------------
    */

    if (titleInput) {

        titleInput.value =
            musica.title || "";
    }


    /*
    |----------------------------------------------------------------------
    | GÉNERO
    |----------------------------------------------------------------------
    */

    if (genreInput) {

        genreInput.value =
            musica.genre || "";
    }


    /*
    |----------------------------------------------------------------------
    | DESCRIÇÃO
    |----------------------------------------------------------------------
    */

    if (descriptionInput) {

        descriptionInput.value =
            musica.description || "";
    }


    atualizarContadorDescricao();

    atualizarPreview();


    /*
    |----------------------------------------------------------------------
    | CAPA ATUAL
    |----------------------------------------------------------------------
    |
    | IMPORTANTE:
    |
    | Aqui usamos SOMENTE:
    |
    | musica.cover_url
    |
    | Nunca usamos:
    |
    | musica.avatar_url
    |
    */

    if (coverPreview) {

        coverPreview.onerror =
            function () {

                this.onerror = null;

                this.src =
                    "./assets/images/default-cover.svg";
            };

        coverPreview.src =
            obterUrlImagem(
                musica.cover_url
            );
    }


    /*
    |----------------------------------------------------------------------
    | ARTISTA
    |----------------------------------------------------------------------
    */

    if (previewArtist) {

        previewArtist.textContent =
            musica.artist_name ||
            "Artista";
    }


    /*
    |----------------------------------------------------------------------
    | STATUS
    |----------------------------------------------------------------------
    */

    if (songStatus) {

        songStatus.textContent =
            formatarStatus(
                musica.status
            );

        songStatus.dataset.status =
            musica.status || "";
    }
}


/*
|--------------------------------------------------------------------------
| PRÉ-VISUALIZAR NOVA CAPA
|--------------------------------------------------------------------------
|
| ESTA É A PARTE MAIS IMPORTANTE.
|
| A imagem escolhida é lida diretamente do computador.
|
| Não usamos:
|
| - avatar_url
| - cover_url
| - artist
| - API
| - servidor
|
|--------------------------------------------------------------------------
*/

function selecionarNovaCapa() {

    if (
        !coverInput ||
        !coverPreview
    ) {
        return;
    }


    /*
    |----------------------------------------------------------------------
    | VERIFICAR ARQUIVO
    |----------------------------------------------------------------------
    */

    const arquivo =
        coverInput.files &&
        coverInput.files[0];


    if (!arquivo) {

        novaCapaSelecionada =
            null;

        return;
    }


    /*
    |----------------------------------------------------------------------
    | VALIDAR TIPO
    |----------------------------------------------------------------------
    */

    if (
        !arquivo.type ||
        !arquivo.type.startsWith("image/")
    ) {

        mostrarMensagem(
            "Selecione um arquivo de imagem válido.",
            "error"
        );

        coverInput.value =
            "";

        novaCapaSelecionada =
            null;

        return;
    }


    /*
    |----------------------------------------------------------------------
    | VALIDAR TAMANHO
    |----------------------------------------------------------------------
    */

    const limite =
        5 * 1024 * 1024;


    if (
        arquivo.size > limite
    ) {

        mostrarMensagem(
            "A imagem não pode ter mais de 5 MB.",
            "error"
        );

        coverInput.value =
            "";

        novaCapaSelecionada =
            null;

        return;
    }


    /*
    |----------------------------------------------------------------------
    | GUARDAR ARQUIVO
    |----------------------------------------------------------------------
    */

    novaCapaSelecionada =
        arquivo;


    /*
    |----------------------------------------------------------------------
    | LER IMAGEM DIRETAMENTE
    |----------------------------------------------------------------------
    */

    const leitor =
        new FileReader();


    leitor.onload =
        function (evento) {

            /*
             * IMPORTANTE:
             *
             * A pré-visualização recebe
             * diretamente o arquivo escolhido.
             */

            coverPreview.src =
                evento.target.result;


            /*
             * Removemos qualquer handler
             * antigo de erro.
             *
             * Assim a nova imagem não será
             * substituída pelo fallback.
             */

            coverPreview.onerror =
                null;
        };


    leitor.onerror =
        function () {

            mostrarMensagem(
                "Não foi possível visualizar a imagem selecionada.",
                "error"
            );

            novaCapaSelecionada =
                null;

            coverInput.value =
                "";
        };


    leitor.readAsDataURL(
        arquivo
    );


    /*
    |----------------------------------------------------------------------
    | LIMPAR MENSAGEM
    |----------------------------------------------------------------------
    */

    if (formMessage) {

        formMessage.classList.add(
            "hidden"
        );
    }
}


/*
|--------------------------------------------------------------------------
| CARREGAR MÚSICA
|--------------------------------------------------------------------------
*/

async function carregarMusica() {

    const songId =
        obterSongId();


    if (!songId) {

        mostrarErro(
            "ID da música não foi informado."
        );

        return;
    }


    try {

        const resposta =
            await fetch(
                `${API_BASE}/songs/${encodeURIComponent(songId)}`,
                {
                    method: "GET",

                    headers: {
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


        /*
        |----------------------------------------------------------------------
        | SESSÃO
        |----------------------------------------------------------------------
        */

        if (
            resposta.status === 401
        ) {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "yoka_token"
            );

            localStorage.removeItem(
                "accessToken"
            );

            localStorage.removeItem(
                "access_token"
            );

            window.location.href =
                "./login.html";

            return;
        }


        /*
        |----------------------------------------------------------------------
        | ERRO
        |----------------------------------------------------------------------
        */

        if (
            !resposta.ok
        ) {

            throw new Error(
                dados.mensagem ||
                "Não foi possível carregar a música."
            );
        }


        /*
        |----------------------------------------------------------------------
        | VERIFICAR DADOS
        |----------------------------------------------------------------------
        */

        if (
            !dados.musica
        ) {

            throw new Error(
                "A API não devolveu os dados da música."
            );
        }


        /*
        |----------------------------------------------------------------------
        | PREENCHER
        |----------------------------------------------------------------------
        */

        preencherFormulario(
            dados.musica
        );


        /*
        |----------------------------------------------------------------------
        | MOSTRAR FORMULÁRIO
        |----------------------------------------------------------------------
        */

        if (loading) {

            loading.classList.add(
                "hidden"
            );
        }

        if (editSongForm) {

            editSongForm.classList.remove(
                "hidden"
            );
        }


    } catch (erro) {

        console.error(
            "Yoka — erro ao carregar música:",
            erro
        );

        mostrarErro(
            erro.message ||
            "Erro ao carregar música."
        );
    }
}


/*
|--------------------------------------------------------------------------
| GUARDAR ALTERAÇÕES
|--------------------------------------------------------------------------
*/

async function guardarAlteracoes(
    evento
) {

    evento.preventDefault();


    const songId =
        obterSongId();


    if (!songId) {

        mostrarMensagem(
            "ID da música não foi informado.",
            "error"
        );

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


    /*
    |----------------------------------------------------------------------
    | DADOS
    |----------------------------------------------------------------------
    */

    const title =
        titleInput.value.trim();


    const genre =
        genreInput.value.trim();


    const description =
        descriptionInput.value.trim();


    /*
    |----------------------------------------------------------------------
    | VALIDAR TÍTULO
    |----------------------------------------------------------------------
    */

    if (!title) {

        mostrarMensagem(
            "O título da música é obrigatório.",
            "error"
        );

        titleInput.focus();

        return;
    }


    if (
        title.length > 200
    ) {

        mostrarMensagem(
            "O título não pode ter mais de 200 caracteres.",
            "error"
        );

        titleInput.focus();

        return;
    }


    /*
    |----------------------------------------------------------------------
    | VALIDAR GÉNERO
    |----------------------------------------------------------------------
    */

    if (
        genre.length > 100
    ) {

        mostrarMensagem(
            "O género não pode ter mais de 100 caracteres.",
            "error"
        );

        genreInput.focus();

        return;
    }


    /*
    |----------------------------------------------------------------------
    | VALIDAR DESCRIÇÃO
    |----------------------------------------------------------------------
    */

    if (
        description.length > 2000
    ) {

        mostrarMensagem(
            "A descrição não pode ter mais de 2000 caracteres.",
            "error"
        );

        descriptionInput.focus();

        return;
    }


    /*
    |----------------------------------------------------------------------
    | VALIDAR NOVA CAPA
    |----------------------------------------------------------------------
    */

    if (
        novaCapaSelecionada
    ) {

        if (
            !novaCapaSelecionada.type ||
            !novaCapaSelecionada.type.startsWith(
                "image/"
            )
        ) {

            mostrarMensagem(
                "A capa selecionada não é uma imagem válida.",
                "error"
            );

            return;
        }


        const limite =
            5 * 1024 * 1024;


        if (
            novaCapaSelecionada.size >
            limite
        ) {

            mostrarMensagem(
                "A capa não pode ter mais de 5 MB.",
                "error"
            );

            return;
        }
    }


    /*
    |----------------------------------------------------------------------
    | DESATIVAR BOTÃO
    |----------------------------------------------------------------------
    */

    const textoOriginal =
        saveButton.textContent;


    saveButton.disabled =
        true;


    saveButton.textContent =
        "A guardar...";


    formMessage.classList.add(
        "hidden"
    );


    /*
    |----------------------------------------------------------------------
    | FORM DATA
    |----------------------------------------------------------------------
    */

    const formData =
        new FormData();


    formData.append(
        "title",
        title
    );


    formData.append(
        "description",
        description
    );


    formData.append(
        "genre",
        genre
    );


    /*
    |----------------------------------------------------------------------
    | NOVA CAPA
    |----------------------------------------------------------------------
    */

    if (
        novaCapaSelecionada
    ) {

        formData.append(
            "cover",
            novaCapaSelecionada,
            novaCapaSelecionada.name
        );
    }


    try {

        const resposta =
            await fetch(
                `${API_BASE}/songs/${encodeURIComponent(songId)}`,
                {
                    method: "PUT",

                    headers: {

                        Accept:
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body:
                        formData
                }
            );


        let dados = {};


        try {

            dados =
                await resposta.json();

        } catch {

            dados = {};
        }


        /*
        |----------------------------------------------------------------------
        | SESSÃO EXPIRADA
        |----------------------------------------------------------------------
        */

        if (
            resposta.status === 401
        ) {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "yoka_token"
            );

            localStorage.removeItem(
                "accessToken"
            );

            localStorage.removeItem(
                "access_token"
            );

            alert(
                "A sua sessão expirou. Faça login novamente."
            );

            window.location.href =
                "./login.html";

            return;
        }


        /*
        |----------------------------------------------------------------------
        | ERRO
        |----------------------------------------------------------------------
        */

        if (
            !resposta.ok
        ) {

            throw new Error(
                dados.mensagem ||
                "Não foi possível atualizar a música."
            );
        }


        /*
        |----------------------------------------------------------------------
        | ATUALIZAR ESTADO
        |----------------------------------------------------------------------
        */

        if (
            dados.musica
        ) {

            preencherFormulario(
                dados.musica
            );
        }


        /*
        |----------------------------------------------------------------------
        | LIMPAR NOVA CAPA
        |----------------------------------------------------------------------
        */

        novaCapaSelecionada =
            null;


        if (coverInput) {

            coverInput.value =
                "";
        }


        /*
        |----------------------------------------------------------------------
        | MENSAGEM
        |----------------------------------------------------------------------
        */

        mostrarMensagem(
            dados.mensagem ||
            "Música atualizada com sucesso.",
            "success"
        );


        /*
        |----------------------------------------------------------------------
        | REDIRECIONAR
        |----------------------------------------------------------------------
        */

        setTimeout(
            function () {

                if (
                    musicaAtual &&
                    musicaAtual.artist_id
                ) {

                    window.location.href =
                        `./artist.html?id=${encodeURIComponent(
                            musicaAtual.artist_id
                        )}`;

                } else {

                    window.history.back();
                }

            },
            900
        );


    } catch (erro) {

        console.error(
            "Yoka — erro ao atualizar música:",
            erro
        );


        mostrarMensagem(
            erro.message ||
            "Erro ao atualizar música.",
            "error"
        );


        saveButton.disabled =
            false;


        saveButton.textContent =
            textoOriginal;
    }
}


/*
|--------------------------------------------------------------------------
| VOLTAR
|--------------------------------------------------------------------------
*/

function voltar() {

    if (
        musicaAtual &&
        musicaAtual.artist_id
    ) {

        window.location.href =
            `./artist.html?id=${encodeURIComponent(
                musicaAtual.artist_id
            )}`;

        return;
    }


    window.history.back();
}


/*
|--------------------------------------------------------------------------
| EVENTOS
|--------------------------------------------------------------------------
*/

if (editSongForm) {

    editSongForm.addEventListener(
        "submit",
        guardarAlteracoes
    );
}


if (descriptionInput) {

    descriptionInput.addEventListener(
        "input",
        atualizarContadorDescricao
    );
}


if (titleInput) {

    titleInput.addEventListener(
        "input",
        atualizarPreview
    );
}


if (coverInput) {

    coverInput.addEventListener(
        "change",
        selecionarNovaCapa
    );
}


if (cancelButton) {

    cancelButton.addEventListener(
        "click",
        voltar
    );
}


if (backButton) {

    backButton.addEventListener(
        "click",
        voltar
    );
}


/*
|--------------------------------------------------------------------------
| INICIAR
|--------------------------------------------------------------------------
*/

carregarMusica();
