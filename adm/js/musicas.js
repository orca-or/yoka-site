"use strict";

/*
|--------------------------------------------------------------------------
| CONFIGURAÇÃO
|--------------------------------------------------------------------------
*/

const API_BASE = "/api/v1";

const DEFAULT_COVER = "../assets/images/default-cover.svg";


/*
|--------------------------------------------------------------------------
| ELEMENTOS
|--------------------------------------------------------------------------
*/

const elementos = {
    adminName: document.getElementById("adminName"),
    logoutButton: document.getElementById("logoutButton"),
    totalMusicas: document.getElementById("totalMusicas"),
    tabela: document.getElementById("musicasTabela"),
    mensagem: document.getElementById("mensagem")
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
| ESCAPAR HTML
|--------------------------------------------------------------------------
*/

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
        Authorization: `Bearer ${token}`
    };

    if (options.body && !headers["Content-Type"]) {

        headers["Content-Type"] =
            "application/json";
    }

    const resposta = await fetch(
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

        dados = await resposta.json();

    } catch {

        throw new Error(
            "Resposta inválida do servidor."
        );
    }


    if (!resposta.ok || dados.sucesso === false) {

        throw new Error(
            dados.mensagem ||
            "Erro ao comunicar com o servidor."
        );
    }


    return dados;
}


/*
|--------------------------------------------------------------------------
| TOKENS
|--------------------------------------------------------------------------
*/

function limparTokens() {

    localStorage.removeItem("yoka_token");
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("access_token");
}


function redirecionarLogin() {

    window.location.href = "../login.html";
}


/*
|--------------------------------------------------------------------------
| MENSAGENS
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

    elementos.mensagem.hidden = false;
}


function esconderMensagem() {

    if (!elementos.mensagem) {
        return;
    }

    elementos.mensagem.hidden = true;

}


/*
|--------------------------------------------------------------------------
| DATA
|--------------------------------------------------------------------------
*/

function formatarData(data) {

    if (!data) {
        return "—";
    }

    const dataObj = new Date(data);

    if (Number.isNaN(dataObj.getTime())) {
        return "—";
    }

    return dataObj.toLocaleDateString(
        "pt-AO",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}


/*
|--------------------------------------------------------------------------
| NÚMEROS
|--------------------------------------------------------------------------
*/

function formatarNumero(valor) {

    const numero = Number(valor || 0);

    return numero.toLocaleString(
        "pt-AO"
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
                texto: status || "Desconhecido",
                classe: "status-draft"
            };
    }
}


/*
|--------------------------------------------------------------------------
| AÇÕES DISPONÍVEIS
|--------------------------------------------------------------------------
*/

function criarAcoes(musica) {

    const acoes = [];

acoes.push(`
    <button
        type="button"
        class="action-button details"
        data-action="details"
        data-id="${escaparHTML(musica.id)}"
    >
        Detalhes
    </button>
`);
    if (musica.status === "draft") {

        acoes.push(`
            <button
                type="button"
                class="action-button publish"
                data-action="publish"
                data-id="${escaparHTML(musica.id)}"
            >
                Publicar
            </button>
        `);
    }


    if (musica.status === "published") {

        acoes.push(`
            <button
                type="button"
                class="action-button archive"
                data-action="archive"
                data-id="${escaparHTML(musica.id)}"
            >
                Arquivar
            </button>
        `);
    }


    if (musica.status === "archived") {

        acoes.push(`
            <button
                type="button"
                class="action-button draft"
                data-action="draft"
                data-id="${escaparHTML(musica.id)}"
            >
                Restaurar
            </button>
        `);
    }


    return `
        <div class="actions">
            ${acoes.join("")}
        </div>
    `;
}


/*
|--------------------------------------------------------------------------
| RENDERIZAR MÚSICAS
|--------------------------------------------------------------------------
*/

function renderizarMusicas(musicas) {

    elementos.tabela.innerHTML = "";

    elementos.totalMusicas.textContent =
        musicas.length;


    if (!musicas.length) {

        elementos.tabela.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="empty"
                >
                    Nenhuma música encontrada.
                </td>
            </tr>
        `;

        return;
    }


    musicas.forEach(musica => {

        const estado =
            obterEstado(musica.status);


        const capa =
            musica.cover_url ||
            DEFAULT_COVER;


        const genero =
            musica.genre ||
            "Sem gênero";


        const linha =
            document.createElement("tr");


        linha.innerHTML = `

            <td>

                <div class="song-info">

                    <img
                        class="song-cover"
                        src="${escaparHTML(capa)}"
                        alt="Capa de ${escaparHTML(musica.title)}"
                        onerror="this.src='${DEFAULT_COVER}'"
                    >

                    <div>

                        <div class="song-title">
                            ${escaparHTML(musica.title)}
                        </div>

                        <div class="song-genre">
                            ${escaparHTML(genero)}
                        </div>

                    </div>

                </div>

            </td>


            <td>

                <span class="artist-name">
                    ${escaparHTML(
                        musica.artist_name ||
                        "Artista desconhecido"
                    )}
                </span>

            </td>


            <td class="number-cell">

                ${formatarNumero(
                    musica.plays_count
                )}

            </td>


            <td class="number-cell">

                ${formatarNumero(
                    musica.likes_count
                )}

            </td>


            <td>

                <span
                    class="status ${estado.classe}"
                >

                    <span class="status-dot"></span>

                    ${estado.texto}

                </span>

            </td>


            <td>

                ${formatarData(
                    musica.created_at
                )}

            </td>


            <td>

                ${criarAcoes(musica)}

            </td>

        `;


        elementos.tabela.appendChild(linha);

    });

}


/*
|--------------------------------------------------------------------------
| CARREGAR MÚSICAS
|--------------------------------------------------------------------------
*/

async function carregarMusicas() {

    try {

        esconderMensagem();

        elementos.tabela.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="loading"
                >
                    Carregando músicas...
                </td>
            </tr>
        `;


        const dados =
            await apiFetch("/admin/songs");


        renderizarMusicas(
            dados.musicas || []
        );


    } catch (error) {

        console.error(
            "Erro ao carregar músicas:",
            error
        );


        elementos.tabela.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="empty"
                >
                    Não foi possível carregar as músicas.
                </td>
            </tr>
        `;


        mostrarMensagem(
            error.message ||
            "Erro ao carregar músicas."
        );

    }

}


/*
|--------------------------------------------------------------------------
| CARREGAR ADMINISTRADOR
|--------------------------------------------------------------------------
*/

async function carregarAdministrador() {

    try {

        const dados =
            await apiFetch("/auth/me");


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
| LOGOUT
|--------------------------------------------------------------------------
*/

function fazerLogout() {

    limparTokens();

    redirecionarLogin();

}


/*
|--------------------------------------------------------------------------
| EVENTOS
|--------------------------------------------------------------------------
*/

if (elementos.logoutButton) {

    elementos.logoutButton.addEventListener(
        "click",
        fazerLogout
    );

}
/*
|--------------------------------------------------------------------------
| ALTERAR STATUS DA MÚSICA
|--------------------------------------------------------------------------
*/

async function alterarStatusMusica(id, status) {

    const mensagens = {
        publish: "Tem certeza que deseja publicar esta música?",
        archive: "Tem certeza que deseja arquivar esta música?",
        draft: "Tem certeza que deseja restaurar esta música para rascunho?"
    };

    const mensagem =
        mensagens[status];

    if (!mensagem) {
        return;
    }

    if (!confirm(mensagem)) {
        return;
    }

    try {

        mostrarMensagem(
            "Alterando status da música...",
            "sucesso"
        );

        const dados =
            await apiFetch(
                `/admin/songs/${id}/status`,
                {
                    method: "PATCH",

                    body: JSON.stringify({
                        status:
                            status === "publish"
                                ? "published"
                                : status === "archive"
                                    ? "archived"
                                    : "draft"
                    })
                }
            );

        mostrarMensagem(
            dados.mensagem ||
            "Status alterado com sucesso.",
            "sucesso"
        );

        await carregarMusicas();

    } catch (error) {

        console.error(
            "Erro ao alterar status:",
            error
        );

        mostrarMensagem(
            error.message ||
            "Não foi possível alterar o status.",
            "erro"
        );
    }
}


/*
|--------------------------------------------------------------------------
| EVENTOS DOS BOTÕES
|--------------------------------------------------------------------------
*/

if (elementos.tabela) {

    elementos.tabela.addEventListener(
        "click",
        event => {

            const botao =
                event.target.closest(
                    "[data-action]"
                );

            if (!botao) {
                return;
            }

            const action =
                botao.dataset.action;

            const id =
                botao.dataset.id;
if (!id || !action) {
    return;
}

if (action === "details") {

    window.location.href =
        `musica-detalhes.html?id=${encodeURIComponent(id)}`;

    return;
}

alterarStatusMusica(
    id,
    action
);
        }
    );

}


/*
|--------------------------------------------------------------------------
| EXCLUIR MÚSICA
|--------------------------------------------------------------------------
*/

async function excluirMusica() {

    const id = obterIdMusica();

    if (!id) {
        mostrarMensagem(
            "ID da música não encontrado.",
            "erro"
        );
        return;
    }

    const titulo =
        document.getElementById("musicTitle")?.textContent
        || "esta música";

    const confirmar = window.confirm(
        `Tem certeza que deseja excluir "${titulo}"?\n\n` +
        "Esta ação irá remover a música, a capa e os dados relacionados.\n\n" +
        "Esta ação não pode ser desfeita."
    );

    if (!confirmar) {
        return;
    }

    const botao =
        document.getElementById("deleteMusicButton");

    if (botao) {
        botao.disabled = true;
        botao.textContent = "Excluindo...";
    }

    try {

        const resposta =
            await apiFetch(
                `/admin/songs/${encodeURIComponent(id)}`,
                {
                    method: "DELETE"
                }
            );

        if (!resposta.ok) {

            const erro =
                await resposta.json().catch(
                    () => ({})
                );

            throw new Error(
                erro.mensagem ||
                "Não foi possível excluir a música."
            );
        }

        const dados =
            await resposta.json();

        mostrarMensagem(
            dados.mensagem ||
            "Música excluída com sucesso.",
            "sucesso"
        );

        setTimeout(() => {

            window.location.href =
                "./musicas.html";

        }, 1000);

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
            botao.disabled = false;
            botao.textContent = "🗑 Excluir música";
        }
    }
}









/*
|--------------------------------------------------------------------------
| INICIALIZAÇÃO
|--------------------------------------------------------------------------
*/

async function iniciar() {

    await carregarAdministrador();

    await carregarMusicas();

}


document.addEventListener(
    "DOMContentLoaded",
    iniciar
);