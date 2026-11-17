"use strict";


/*
|--------------------------------------------------------------------------
| CONFIGURAÇÃO
|--------------------------------------------------------------------------
*/

const API_BASE_URL = "/api/v1";


let comentarioParaExcluir = null;


/*
|--------------------------------------------------------------------------
| ELEMENTOS
|--------------------------------------------------------------------------
*/

const commentsLoading =
    document.getElementById(
        "commentsLoading"
    );

const commentsMessage =
    document.getElementById(
        "commentsMessage"
    );

const commentsContainer =
    document.getElementById(
        "commentsContainer"
    );

const totalComments =
    document.getElementById(
        "totalComments"
    );

const deleteModal =
    document.getElementById(
        "deleteModal"
    );

const deleteCommentPreview =
    document.getElementById(
        "deleteCommentPreview"
    );

const cancelDeleteButton =
    document.getElementById(
        "cancelDeleteButton"
    );

const confirmDeleteButton =
    document.getElementById(
        "confirmDeleteButton"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


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
        localStorage.getItem("access_token") ||
        null
    );
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
| FORMATAR DATA
|--------------------------------------------------------------------------
*/

function formatarData(data) {

    if (!data) {
        return "-";
    }

    const dataObjeto =
        new Date(data);

    if (
        Number.isNaN(
            dataObjeto.getTime()
        )
    ) {
        return data;
    }

    return dataObjeto.toLocaleString(
        "pt-BR",
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
| MENSAGEM
|--------------------------------------------------------------------------
*/

function mostrarMensagem(
    mensagem,
    tipo = "info"
) {

    commentsMessage.textContent =
        mensagem;

    commentsMessage.className =
        `comments-message ${tipo}`;

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
            "/assets/images/default-cover.svg"
        );

    }


    return (
        "/assets/images/default-avatar.svg"
    );
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
            "Token não encontrado."
        );
    }


    const headers = {

        "Authorization":
            `Bearer ${token}`

    };


    if (
        options.body &&
        typeof options.body !== "string"
    ) {

        headers["Content-Type"] =
            "application/json";

        options.body =
            JSON.stringify(
                options.body
            );

    }


    const resposta =
        await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                ...options,
                headers: {
                    ...headers,
                    ...(options.headers || {})
                }
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
        !resposta.ok
    ) {

        const erro =
            new Error(
                dados?.mensagem ||
                "Erro ao comunicar com o servidor."
            );

        erro.status =
            resposta.status;

        throw erro;
    }


    return dados;
}


/*
|--------------------------------------------------------------------------
| CARREGAR COMENTÁRIOS
|--------------------------------------------------------------------------
*/

async function carregarComentarios() {

    commentsLoading.hidden =
        false;

    commentsContainer.innerHTML =
        "";

    mostrarMensagem(
        ""
    );


    try {

        const dados =
            await apiFetch(
                "/admin/comments"
            );


        const comentarios =
            Array.isArray(
                dados.comentarios
            )
                ? dados.comentarios
                : [];


        totalComments.textContent =
            comentarios.length;


        if (
            comentarios.length === 0
        ) {

            commentsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        💬
                    </div>

                    <h2>
                        Nenhum comentário
                    </h2>

                    <p>
                        Ainda não existem comentários
                        para administrar.
                    </p>
                </div>
            `;

            return;
        }


        comentarios.forEach(
            comentario => {

                commentsContainer.insertAdjacentHTML(
                    "beforeend",
                    criarComentarioCard(
                        comentario
                    )
                );

            }
        );


        adicionarEventosExcluir();


    } catch (error) {

        console.error(
            "Erro ao carregar comentários:",
            error
        );


        if (
            error.status === 401 ||
            error.status === 403
        ) {

            mostrarMensagem(
                error.message ||
                "Você não tem permissão para acessar esta área.",
                "error"
            );

        } else {

            mostrarMensagem(
                error.message ||
                "Não foi possível carregar os comentários.",
                "error"
            );

        }

    } finally {

        commentsLoading.hidden =
            true;

    }
}


/*
|--------------------------------------------------------------------------
| CRIAR CARD
|--------------------------------------------------------------------------
*/

function criarComentarioCard(
    comentario
) {

    const id =
        escaparHTML(
            comentario.id
        );

    const nome =
        escaparHTML(
            comentario.display_name ||
            comentario.user_name ||
            "Usuário"
        );

    const email =
        escaparHTML(
            comentario.user_email ||
            ""
        );

    const conteudo =
        escaparHTML(
            comentario.content
        );

    const musica =
        escaparHTML(
            comentario.song_title ||
            "Música desconhecida"
        );

    const artista =
        escaparHTML(
            comentario.artist_name ||
            "Artista desconhecido"
        );

    const avatar =
        escaparHTML(
            obterImagem(
                comentario.avatar_url,
                "avatar"
            )
        );

    const capa =
        escaparHTML(
            obterImagem(
                comentario.song_cover_url,
                "cover"
            )
        );

    const likes =
        Number(
            comentario.likes_count || 0
        );

    const data =
        formatarData(
            comentario.created_at
        );

    const ehResposta =
        comentario.parent_id !== null;


    return `
        <article
            class="comment-card"
            data-comment-id="${id}"
        >

            <div class="comment-card-header">

                <div class="comment-user">

                    <img
                        src="${avatar}"
                        alt="Avatar de ${nome}"
                        class="comment-avatar"
                    >

                    <div class="comment-user-info">

                        <strong>
                            ${nome}
                        </strong>

                        ${
                            email
                                ? `
                                    <span>
                                        ${email}
                                    </span>
                                  `
                                : ""
                        }

                    </div>

                </div>


                <span
                    class="
                        comment-type
                        ${
                            ehResposta
                                ? "reply"
                                : "comment"
                        }
                    "
                >
                    ${
                        ehResposta
                            ? "Resposta"
                            : "Comentário"
                    }
                </span>

            </div>


            <div class="comment-content">

                <p>
                    ${conteudo}
                </p>

            </div>


            <div class="comment-song">

                <img
                    src="${capa}"
                    alt="Capa de ${musica}"
                    class="song-cover"
                >


                <div class="song-info">

                    <strong>
                        ${musica}
                    </strong>

                    <span>
                        ${artista}
                    </span>

                </div>

            </div>


            <div class="comment-footer">

                <div class="comment-meta">

                    <span>
                        ♥ ${likes} likes
                    </span>

                    <span>
                        ${data}
                    </span>

                </div>


                <button
                    type="button"
                    class="delete-comment-button"
                    data-comment-id="${id}"
                    data-comment-content="${conteudo}"
                >
                    Excluir
                </button>

            </div>

        </article>
    `;
}


/*
|--------------------------------------------------------------------------
| EVENTOS DE EXCLUSÃO
|--------------------------------------------------------------------------
*/

function adicionarEventosExcluir() {

    const botoes =
        document.querySelectorAll(
            ".delete-comment-button"
        );


    botoes.forEach(
        botao => {

            botao.addEventListener(
                "click",
                () => {

                    const commentId =
                        botao.dataset.commentId;

                    const content =
                        botao.dataset.commentContent ||
                        "";


                    abrirModalExclusao(
                        commentId,
                        content
                    );

                }
            );

        }
    );
}


/*
|--------------------------------------------------------------------------
| ABRIR MODAL
|--------------------------------------------------------------------------
*/

function abrirModalExclusao(
    commentId,
    content
) {

    comentarioParaExcluir =
        commentId;


    deleteCommentPreview.textContent =
        content;


    deleteModal.hidden =
        false;

}


/*
|--------------------------------------------------------------------------
| FECHAR MODAL
|--------------------------------------------------------------------------
*/

function fecharModalExclusao() {

    comentarioParaExcluir =
        null;

    deleteCommentPreview.textContent =
        "";

    deleteModal.hidden =
        true;

}


/*
|--------------------------------------------------------------------------
| EXCLUIR COMENTÁRIO
|--------------------------------------------------------------------------
*/

async function excluirComentario() {

    if (
        !comentarioParaExcluir
    ) {
        return;
    }


    const commentId =
        comentarioParaExcluir;


    confirmDeleteButton.disabled =
        true;

    confirmDeleteButton.textContent =
        "Excluindo...";


    try {

        await apiFetch(
            `/admin/comments/${encodeURIComponent(commentId)}`,
            {
                method: "DELETE"
            }
        );


        fecharModalExclusao();


        mostrarMensagem(
            "Comentário excluído com sucesso.",
            "success"
        );


        await carregarComentarios();


    } catch (error) {

        console.error(
            "Erro ao excluir comentário:",
            error
        );


        mostrarMensagem(
            error.message ||
            "Não foi possível excluir o comentário.",
            "error"
        );


    } finally {

        confirmDeleteButton.disabled =
            false;

        confirmDeleteButton.textContent =
            "Excluir comentário";

    }
}


/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

function fazerLogout() {

    localStorage.removeItem(
        "yoka_token"
    );

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "accessToken"
    );

    localStorage.removeItem(
        "access_token"
    );


    window.location.href =
        "../login.html";
}


/*
|--------------------------------------------------------------------------
| EVENTOS
|--------------------------------------------------------------------------
*/

cancelDeleteButton.addEventListener(
    "click",
    fecharModalExclusao
);


confirmDeleteButton.addEventListener(
    "click",
    excluirComentario
);


deleteModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            deleteModal
        ) {

            fecharModalExclusao();

        }

    }
);


logoutButton.addEventListener(
    "click",
    fazerLogout
);


/*
|--------------------------------------------------------------------------
| ESC
|--------------------------------------------------------------------------
*/

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            !deleteModal.hidden
        ) {

            fecharModalExclusao();

        }

    }
);




/*
|--------------------------------------------------------------------------
| ABRIR COMENTÁRIO A PARTIR DE UMA NOTIFICAÇÃO
|--------------------------------------------------------------------------
*/

function abrirComentarioDenunciado() {
    const parametros = new URLSearchParams(
        window.location.search
    );

    const comentarioId =
        parametros.get("commentId");

    if (!comentarioId) {
        return;
    }

    const tentarLocalizarComentario = () => {
        const card = Array.from(
            document.querySelectorAll(
                ".comment-card[data-comment-id]"
            )
        ).find(elemento =>
            elemento.dataset.commentId === comentarioId
        );

        if (!card) {
            return false;
        }

        card.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        card.classList.add("comment-report-highlight");

        setTimeout(() => {
            card.classList.remove(
                "comment-report-highlight"
            );
        }, 6000);

        return true;
    };

    if (tentarLocalizarComentario()) {
        return;
    }

    // Aguarda os comentários terminarem de carregar.
    let tentativas = 0;

    const temporizador = setInterval(() => {
        tentativas++;

        if (
            tentarLocalizarComentario() ||
            tentativas >= 20
        ) {
            clearInterval(temporizador);
        }
    }, 250);
}

document.addEventListener(
    "DOMContentLoaded",
    abrirComentarioDenunciado
);










/*
|--------------------------------------------------------------------------
| DESTACAR COMENTÁRIO DENUNCIADO
|--------------------------------------------------------------------------
*/

function destacarComentarioDenunciado() {
    const parametros = new URLSearchParams(
        window.location.search
    );

    const comentarioId = parametros.get("commentId");

    if (!comentarioId) return;

    let tentativas = 0;
    const maxTentativas = 40;

    const temporizador = setInterval(() => {
        tentativas++;

        const comentario = Array.from(
            document.querySelectorAll(
                ".comment-card[data-comment-id]"
            )
        ).find(card =>
            card.dataset.commentId === comentarioId
        );

        if (comentario) {
            clearInterval(temporizador);

            comentario.classList.remove(
                "comment-report-highlight"
            );

            // Reinicia a animação visual.
            void comentario.offsetWidth;

            comentario.classList.add(
                "comment-report-highlight"
            );

            comentario.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            setTimeout(() => {
                comentario.classList.remove(
                    "comment-report-highlight"
                );
            }, 8000);

        } else if (tentativas >= maxTentativas) {
            clearInterval(temporizador);

            console.warn(
                "O comentário denunciado não foi encontrado:",
                comentarioId
            );
        }
    }, 250);
}

destacarComentarioDenunciado();

const estiloDestaqueDenuncia = document.createElement("style");

estiloDestaqueDenuncia.textContent = `
    .comment-card.comment-report-highlight {
        outline: 4px solid black !important;
        outline-offset: 4px !important;
        background: rgba(214, 214, 214, 0.16) !important;
        box-shadow: 0 0 24px rgba(143, 138, 138, 0.45) !important;
        border-radius: 12px;
        animation: yokaDenunciaPulse 1s ease-in-out 3;
    }

    @keyframes yokaDenunciaPulse {
        0%, 100% {
            box-shadow: 0 0 8px rgba(143, 136, 136, 0.25);
        }
        50% {
            box-shadow: 0 0 28px rgba(110, 107, 107, 0.75);
        }
    }
`;

document.head.appendChild(estiloDestaqueDenuncia);
/*
|--------------------------------------------------------------------------
| INICIALIZAÇÃO
|--------------------------------------------------------------------------
*/

document.addEventListener(
    "DOMContentLoaded",
    carregarComentarios
);