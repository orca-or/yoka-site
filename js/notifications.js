"use strict";


/*
|--------------------------------------------------------------------------
| CONFIGURAÇÃO
|--------------------------------------------------------------------------
*/

const NOTIFICATIONS_LIMIT = 50;

let notificationElements = {};

let notificationsOpen = false;


/*
|--------------------------------------------------------------------------
| INICIALIZAÇÃO
|--------------------------------------------------------------------------
*/

function iniciarNotificacoes() {

    notificationElements = {

        container:
            document.getElementById(
                "notificationContainer"
            ),

        button:
            document.getElementById(
                "notificationButton"
            ),

        badge:
            document.getElementById(
                "notificationBadge"
            ),

        dropdown:
            document.getElementById(
                "notificationDropdown"
            ),

        list:
            document.getElementById(
                "notificationList"
            ),

        markAll:
            document.getElementById(
                "markAllNotificationsRead"
            )

    };


    if (
        !notificationElements.button ||
        !notificationElements.dropdown
    ) {

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | EVENTOS
    |--------------------------------------------------------------------------
    */

    notificationElements.button.addEventListener(
        "click",
        alternarNotificacoes
    );


    if (
        notificationElements.markAll
    ) {

        notificationElements.markAll.addEventListener(
            "click",
            marcarTodasComoLidas
        );

    }


    document.addEventListener(
        "click",
        fecharNotificacoesAoClicarFora
    );


    /*
    |--------------------------------------------------------------------------
    | CARREGAR CONTADOR
    |--------------------------------------------------------------------------
    */

    atualizarContadorNotificacoes();

}


/*
|--------------------------------------------------------------------------
| CONTADOR
|--------------------------------------------------------------------------
*/

async function atualizarContadorNotificacoes() {

    try {

        const token =
            window.YokaAPI.obterToken();


        if (!token) {

            esconderBadge();

            return;

        }


        const resposta =
            await window.YokaAPI.apiRequest(
                "/notifications/unread-count"
            );


        const total =
            Number(
                resposta.total ??
                resposta.naoLidas ??
                resposta.count ??
                0
            );


        atualizarBadge(total);

    } catch (erro) {

        console.error(
            "Yoka — erro ao carregar contador de notificações:",
            erro
        );

        esconderBadge();

    }

}


/*
|--------------------------------------------------------------------------
| BADGE
|--------------------------------------------------------------------------
*/

function atualizarBadge(total) {

    if (
        !notificationElements.badge
    ) {

        return;

    }


    total =
        Number(total) || 0;


    if (
        total <= 0
    ) {

        esconderBadge();

        return;

    }


    notificationElements.badge.textContent =
        total > 99
            ? "99+"
            : String(total);


    notificationElements.badge.classList.remove(
        "hidden"
    );

}


function esconderBadge() {

    if (
        notificationElements.badge
    ) {

        notificationElements.badge.classList.add(
            "hidden"
        );

    }

}


/*
|--------------------------------------------------------------------------
| ABRIR / FECHAR
|--------------------------------------------------------------------------
*/

async function alternarNotificacoes(event) {

    event.stopPropagation();


    if (
        notificationsOpen
    ) {

        fecharNotificacoes();

        return;

    }


    notificationsOpen = true;


    notificationElements.dropdown.classList.remove(
        "hidden"
    );


    await carregarNotificacoes();

}


function fecharNotificacoes() {

    notificationsOpen = false;


    if (
        notificationElements.dropdown
    ) {

        notificationElements.dropdown.classList.add(
            "hidden"
        );

    }

}


function fecharNotificacoesAoClicarFora(event) {

    if (
        !notificationsOpen
    ) {

        return;

    }


    if (
        notificationElements.container &&
        !notificationElements.container.contains(
            event.target
        )
    ) {

        fecharNotificacoes();

    }

}


/*
|--------------------------------------------------------------------------
| CARREGAR NOTIFICAÇÕES
|--------------------------------------------------------------------------
*/

async function carregarNotificacoes() {

    const lista =
        notificationElements.list;


    if (!lista) {

        return;

    }


    const token =
        window.YokaAPI.obterToken();


    if (!token) {

        lista.innerHTML = `
            <div class="notification-empty">
                Faça login para ver suas notificações.
            </div>
        `;

        return;

    }


    lista.innerHTML = `
        <div class="notification-empty">
            Carregando notificações...
        </div>
    `;


    try {

        const resposta =
            await window.YokaAPI.apiRequest(
                `/notifications?limit=${NOTIFICATIONS_LIMIT}`
            );


        const notificacoes =
            resposta.notificacoes ??
            resposta.data ??
            resposta.rows ??
            resposta;


        if (
            !Array.isArray(notificacoes) ||
            notificacoes.length === 0
        ) {

            lista.innerHTML = `
                <div class="notification-empty">
                    Você não tem notificações.
                </div>
            `;

            atualizarContadorNotificacoes();

            return;

        }


        renderizarNotificacoes(
            notificacoes
        );


    } catch (erro) {

        console.error(
            "Yoka — erro ao carregar notificações:",
            erro
        );


        lista.innerHTML = `
            <div class="notification-empty">
                Não foi possível carregar as notificações.
            </div>
        `;

    }

}


/*
|--------------------------------------------------------------------------
| RENDERIZAR
|--------------------------------------------------------------------------
*/

function renderizarNotificacoes(
    notificacoes
) {

    const lista =
        notificationElements.list;


    lista.innerHTML = "";


    notificacoes.forEach(
        notificacao => {

            const item =
                criarElementoNotificacao(
                    notificacao
                );


            lista.appendChild(item);

        }
    );

}


/*
|--------------------------------------------------------------------------
| ELEMENTO DE NOTIFICAÇÃO
|--------------------------------------------------------------------------
*/

function criarElementoNotificacao(
    notificacao
) {

    const item =
        document.createElement("div");


    item.className =
        "notification-item";


    if (!notificacao.is_read) {

        item.classList.add(
            "notification-unread"
        );

    }


    item.dataset.id =
        notificacao.id;


    const actorName =
        notificacao.actor_name ||
        notificacao.actor_artist_name ||
        "Yoka";


    const actorAvatar =
        notificacao.actor_avatar_url ||
        "./assets/images/default-avatar.svg";


    const titulo =
        notificacao.title ||
        obterTituloNotificacao(
            notificacao.type
        );


    let mensagem =
        notificacao.message || "";


    switch (notificacao.type) {

        case "follow":
            mensagem =
                `${actorName} começou a seguir você.`;
            break;

        case "song_like":
            mensagem =
                `${actorName} curtiu sua música.`;
            break;

        case "song_comment":
            mensagem =
                `${actorName} comentou na sua música.`;
            break;

        case "comment_like":
            mensagem =
                `${actorName} curtiu seu comentário.`;
            break;

        case "reply_like":
            mensagem =
                `${actorName} curtiu sua resposta.`;
            break;

        case "comment_reply":
            mensagem =
                `${actorName} respondeu ao seu comentário.`;
            break;

        case "song_published":
            mensagem =
                `${actorName} publicou uma nova música.`;
            break;

    }


    const data =
        formatarDataNotificacao(
            notificacao.created_at
        );


    item.innerHTML = `

        <div class="notification-avatar">

            <img
                src="${escaparHTML(actorAvatar)}"
                alt="${escaparHTML(actorName)}"
                loading="lazy"
                onerror="this.src='./assets/images/default-avatar.svg'"
            >

        </div>

        <div class="notification-content">

            <strong>
                ${escaparHTML(titulo)}
            </strong>

            <p>
                ${escaparHTML(mensagem)}
            </p>

            <small>
                ${escaparHTML(data)}
            </small>

        </div>

        <button
            class="notification-delete"
            type="button"
            title="Excluir notificação"
            aria-label="Excluir notificação"
        >
            ×
        </button>

    `;


    /*
    |--------------------------------------------------------------------------
    | CLIQUE NA NOTIFICAÇÃO
    |--------------------------------------------------------------------------
    */

    item.addEventListener(
        "click",
        async event => {

            if (
                event.target.closest(
                    ".notification-delete"
                )
            ) {

                return;

            }


            if (
                !notificacao.is_read
            ) {

                await marcarNotificacaoComoLida(
                    notificacao.id
                );

            }


            /*
            |--------------------------------------------------------------------------
            | NOTIFICAÇÃO DO ADMINISTRADOR
            |--------------------------------------------------------------------------
            */

            if (
                ehNotificacaoAdministrativa(
                    notificacao
                )
            ) {

                abrirNotificacaoAdministrativa(
                    notificacao
                );

                return;

            }


            /*
            |--------------------------------------------------------------------------
            | NOTIFICAÇÕES NORMAIS
            |--------------------------------------------------------------------------
            */

            abrirDestinoNotificacao(
                notificacao
            );

        }
    );


    /*
    |--------------------------------------------------------------------------
    | EXCLUIR
    |--------------------------------------------------------------------------
    */

    const deleteButton =
        item.querySelector(
            ".notification-delete"
        );


    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            async event => {

                event.stopPropagation();

                await excluirNotificacao(
                    notificacao.id
                );

            }
        );

    }


    return item;

}


/*
|--------------------------------------------------------------------------
| NOTIFICAÇÃO ADMINISTRATIVA
|--------------------------------------------------------------------------
|
| As notificações enviadas pelo painel administrativo não possuem
| necessariamente entity_type/entity_id.
|
| Por isso são abertas em uma janela própria.
|--------------------------------------------------------------------------
*/

function ehNotificacaoAdministrativa(
    notificacao
) {

    if (!notificacao) {

        return false;

    }


    /*
    |--------------------------------------------------------------------------
    | TIPOS POSSÍVEIS
    |--------------------------------------------------------------------------
    */

    const tiposAdministrativos = [

        "admin",
        "admin_notification",
        "admin_message",
        "system",
        "announcement"

    ];


    if (
        tiposAdministrativos.includes(
            notificacao.type
        )
    ) {

        return true;

    }


    /*
    |--------------------------------------------------------------------------
    | FALLBACK
    |--------------------------------------------------------------------------
    |
    | Se a notificação não possui entidade de destino,
    | tratamos como mensagem administrativa.
    |
    |--------------------------------------------------------------------------
    */

    const possuiDestino =
        Boolean(
            notificacao.entity_type &&
            notificacao.entity_id
        );


    if (
        !possuiDestino &&
        notificacao.message
    ) {

        return true;

    }


    return false;

}


/*
|--------------------------------------------------------------------------
| ABRIR MENSAGEM ADMINISTRATIVA
|--------------------------------------------------------------------------
*/

function abrirNotificacaoAdministrativa(
    notificacao
) {

    const titulo =
        notificacao.title ||
        "Notificação";


    const mensagem =
        notificacao.message ||
        "";


    /*
    |--------------------------------------------------------------------------
    | FECHAR DROPDOWN
    |--------------------------------------------------------------------------
    */

    fecharNotificacoes();


    /*
    |--------------------------------------------------------------------------
    | REMOVER MODAL EXISTENTE
    |--------------------------------------------------------------------------
    */

    const modalExistente =
        document.getElementById(
            "yokaAdminNotificationModal"
        );


    if (modalExistente) {

        modalExistente.remove();

    }


    /*
    |--------------------------------------------------------------------------
    | CRIAR MODAL
    |--------------------------------------------------------------------------
    */

    const modal =
        document.createElement("div");


    modal.id =
        "yokaAdminNotificationModal";


    modal.className =
        "yoka-admin-notification-modal";


    modal.innerHTML = `

        <div
            class="yoka-admin-notification-overlay"
            data-close-admin-notification
        ></div>

        <div
            class="yoka-admin-notification-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="yokaAdminNotificationTitle"
        >

            <button
                type="button"
                class="yoka-admin-notification-close"
                aria-label="Fechar notificação"
                title="Fechar"
            >
                ×
            </button>
<div class="yoka-admin-notification-sender">
    Yoka Suporte
</div>
           

            <h2 id="yokaAdminNotificationTitle">
                ${escaparHTML(titulo)}
            </h2>

            <div class="yoka-admin-notification-message">
                ${formatarMensagemAdmin(
                    mensagem
                )}
            </div>

            <small class="yoka-admin-notification-date">
                ${escaparHTML(
                    formatarDataNotificacao(
                        notificacao.created_at
                    )
                )}
            </small>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    /*
    |--------------------------------------------------------------------------
    | FECHAR
    |--------------------------------------------------------------------------
    */

    const closeButton =
        modal.querySelector(
            ".yoka-admin-notification-close"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            () => {

                modal.remove();

            }
        );

    }


    const overlay =
        modal.querySelector(
            "[data-close-admin-notification]"
        );


    if (overlay) {

        overlay.addEventListener(
            "click",
            () => {

                modal.remove();

            }
        );

    }


    /*
    |--------------------------------------------------------------------------
    | ESC
    |--------------------------------------------------------------------------
    */

    function fecharComEsc(event) {

        if (
            event.key === "Escape"
        ) {

            modal.remove();

            document.removeEventListener(
                "keydown",
                fecharComEsc
            );

        }

    }


    document.addEventListener(
        "keydown",
        fecharComEsc
    );


    /*
    |--------------------------------------------------------------------------
    | FOCO
    |--------------------------------------------------------------------------
    */

    if (closeButton) {

        closeButton.focus();

    }

}


/*
|--------------------------------------------------------------------------
| FORMATAR MENSAGEM ADMIN
|--------------------------------------------------------------------------
*/

function formatarMensagemAdmin(
    mensagem
) {

    return escaparHTML(
        mensagem
    )
    .replace(
        /\n/g,
        "<br>"
    );

}


/*
|--------------------------------------------------------------------------
| MARCAR COMO LIDA
|--------------------------------------------------------------------------
*/

async function marcarNotificacaoComoLida(
    notificationId
) {

    try {

        await window.YokaAPI.apiRequest(
            `/notifications/${notificationId}/read`,
            {
                method: "PUT"
            }
        );


        atualizarContadorNotificacoes();


    } catch (erro) {

        console.error(
            "Yoka — erro ao marcar notificação como lida:",
            erro
        );

    }

}


/*
|--------------------------------------------------------------------------
| MARCAR TODAS COMO LIDAS
|--------------------------------------------------------------------------
*/

async function marcarTodasComoLidas() {

    try {

        await window.YokaAPI.apiRequest(
            "/notifications/read-all",
            {
                method: "PUT"
            }
        );


        await carregarNotificacoes();

        await atualizarContadorNotificacoes();


    } catch (erro) {

        console.error(
            "Yoka — erro ao marcar todas como lidas:",
            erro
        );

    }

}


/*
|--------------------------------------------------------------------------
| EXCLUIR
|--------------------------------------------------------------------------
*/

async function excluirNotificacao(
    notificationId
) {

    try {

        await window.YokaAPI.apiRequest(
            `/notifications/${notificationId}`,
            {
                method: "DELETE"
            }
        );


        const item =
            document.querySelector(
                `.notification-item[data-id="${notificationId}"]`
            );


        if (item) {

            item.remove();

        }


        await atualizarContadorNotificacoes();


        const restantes =
            document.querySelectorAll(
                ".notification-item"
            );


        if (
            restantes.length === 0 &&
            notificationElements.list
        ) {

            notificationElements.list.innerHTML = `
                <div class="notification-empty">
                    Você não tem notificações.
                </div>
            `;

        }


    } catch (erro) {

        console.error(
            "Yoka — erro ao excluir notificação:",
            erro
        );

    }

}


/*
|--------------------------------------------------------------------------
| DESTINO DA NOTIFICAÇÃO
|--------------------------------------------------------------------------
|
| artist  -> artist.html
| song    -> song.html
| comment -> song.html + comentário
| reply   -> song.html + resposta
|
|--------------------------------------------------------------------------
*/

function abrirDestinoNotificacao(
    notificacao
) {

    if (!notificacao) {

        return;

    }


    const entityId =
        notificacao.entity_id;


    const entityType =
        notificacao.entity_type;


    const relatedSongId =
        notificacao.related_song_id;


    /*
    |--------------------------------------------------------------------------
    | ARTISTA
    |--------------------------------------------------------------------------
    */

    if (
        entityType === "artist" &&
        entityId
    ) {

        window.location.href =
            `./artist.html?id=${encodeURIComponent(
                entityId
            )}`;

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | MÚSICA
    |--------------------------------------------------------------------------
    */

    if (
        entityType === "song" &&
        entityId
    ) {

        window.location.href =
            `./song.html?id=${encodeURIComponent(
                entityId
            )}`;

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | COMENTÁRIO
    |--------------------------------------------------------------------------
    */

    if (
        entityType === "comment" &&
        entityId &&
        relatedSongId
    ) {

        window.location.href =
            `./song.html?id=${encodeURIComponent(
                relatedSongId
            )}&comment=${encodeURIComponent(
                entityId
            )}`;

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | RESPOSTA
    |--------------------------------------------------------------------------
    */

    if (
        entityType === "reply" &&
        entityId &&
        relatedSongId
    ) {

        window.location.href =
            `./song.html?id=${encodeURIComponent(
                relatedSongId
            )}&comment=${encodeURIComponent(
                entityId
            )}`;

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | FALLBACK
    |--------------------------------------------------------------------------
    */

    console.warn(
        "Yoka — destino da notificação não encontrado:",
        notificacao
    );

}


/*
|--------------------------------------------------------------------------
| ÍCONES
|--------------------------------------------------------------------------
*/

function obterIconeNotificacao(
    type
) {

    const icones = {

        follow:
            "👤",

        song_like:
            "❤️",

        song_comment:
            "💬",

        comment_reply:
            "↩️",

        comment_like:
            "❤️",

        reply_like:
            "❤️",

        song_published:
            "🎵"

    };


    return (
        icones[type] ||
        "🔔"
    );

}


/*
|--------------------------------------------------------------------------
| TÍTULOS
|--------------------------------------------------------------------------
*/

function obterTituloNotificacao(
    type
) {

    const titulos = {

        follow:
            "Novo seguidor",

        song_like:
            "Curtiram sua música",

        song_comment:
            "Novo comentário",

        comment_reply:
            "Nova resposta",

        comment_like:
            "Curtiram seu comentário",

        reply_like:
            "Curtiram sua resposta",

        song_published:
            "Nova música publicada"

    };


    return (
        titulos[type] ||
        "Nova notificação"
    );

}


/*
|--------------------------------------------------------------------------
| DATA
|--------------------------------------------------------------------------
*/

function formatarDataNotificacao(
    data
) {

    if (!data) {

        return "";

    }


    const dataObj =
        new Date(data);


    if (
        Number.isNaN(
            dataObj.getTime()
        )
    ) {

        return "";

    }


    return dataObj.toLocaleString(
        "pt-PT",
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
| SEGURANÇA
|--------------------------------------------------------------------------
*/

function escaparHTML(
    texto
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        texto ?? "";


    return div.innerHTML;

}


/*
|--------------------------------------------------------------------------
| INICIAR
|--------------------------------------------------------------------------
*/

document.addEventListener(
    "DOMContentLoaded",
    iniciarNotificacoes
);