"use strict";

/* ============================================================
   YOKA ADM - GESTÃO DE USUÁRIOS
   ============================================================ */
const API_BASE = "https://yoka-d1e1.onrender.com/api/v1";

const usuariosTabela =
    document.getElementById("usuariosTabela");

const totalUsuarios =
    document.getElementById("totalUsuarios");

const mensagem =
    document.getElementById("mensagem");

const adminName =
    document.getElementById("adminName");

const logoutButton =
    document.getElementById("logoutButton");


/* ============================================================
   TOKEN
   ============================================================ */

function obterToken() {

    return (
        localStorage.getItem("yoka_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token")
    );
}


/* ============================================================
   REQUISIÇÃO AUTENTICADA
   ============================================================ */

async function requisicao(url, opcoes = {}) {

    const token = obterToken();

    if (!token) {
        window.location.href = "../login.html";
        return null;
    }

    const headers = {
        ...(opcoes.headers || {}),
        Authorization: `Bearer ${token}`
    };

    const resposta = await fetch(
        `${API_BASE}${url}`,
        {
            ...opcoes,
            headers
        }
    );

    let dados = null;

    try {
        dados = await resposta.json();
    } catch (error) {
        dados = null;
    }

    if (resposta.status === 401) {

        localStorage.removeItem("yoka_token");
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("access_token");

        window.location.href = "../login.html";

        return null;
    }

    if (resposta.status === 403) {

        mostrarMensagem(
            dados?.mensagem ||
            "Acesso negado.",
            "erro"
        );

        return null;
    }

    if (!resposta.ok) {

        throw new Error(
            dados?.mensagem ||
            "Erro ao processar a solicitação."
        );
    }

    return dados;
}


/* ============================================================
   MENSAGENS
   ============================================================ */

function mostrarMensagem(texto, tipo = "sucesso") {

    mensagem.textContent = texto;

    mensagem.className =
        `mensagem ${tipo}`;

    mensagem.hidden = false;

    setTimeout(() => {

        mensagem.hidden = true;

    }, 4000);
}


/* ============================================================
   ESCAPAR HTML
   ============================================================ */

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


/* ============================================================
   FORMATAR DATA
   ============================================================ */

function formatarData(data) {

    if (!data) {
        return "-";
    }

    const dataObj = new Date(data);

    if (Number.isNaN(dataObj.getTime())) {
        return "-";
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


/* ============================================================
   ROLE
   ============================================================ */

function obterClasseRole(role) {

    switch (role) {

        case "admin":
            return "role-admin";

        case "artist":
            return "role-artist";

        default:
            return "role-user";
    }
}


/* ============================================================
   NOME DA ROLE
   ============================================================ */

function formatarRole(role) {

    switch (role) {

        case "admin":
            return "Admin";

        case "artist":
            return "Artista";

        default:
            return "Usuário";
    }
}


/* ============================================================
   CARREGAR USUÁRIOS
   ============================================================ */

async function carregarUsuarios() {

    usuariosTabela.innerHTML = `
        <tr>
            <td
                colspan="6"
                class="loading"
            >
                Carregando usuários...
            </td>
        </tr>
    `;

    try {

        const dados =
            await requisicao("/admin/users");

        if (!dados) {
            return;
        }

        const usuarios =
            Array.isArray(dados.usuarios)
                ? dados.usuarios
                : [];

        totalUsuarios.textContent =
            usuarios.length;

        renderizarUsuarios(usuarios);

    } catch (error) {

        console.error(
            "Erro ao carregar usuários:",
            error
        );

        usuariosTabela.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="empty"
                >
                    Não foi possível carregar os usuários.
                </td>
            </tr>
        `;

        mostrarMensagem(
            error.message ||
            "Erro ao carregar usuários.",
            "erro"
        );
    }
}


/* ============================================================
   RENDERIZAR USUÁRIOS
   ============================================================ */

function renderizarUsuarios(usuarios) {

    if (usuarios.length === 0) {

        usuariosTabela.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="empty"
                >
                    Nenhum usuário encontrado.
                </td>
            </tr>
        `;

        return;
    }


    usuariosTabela.innerHTML =
        usuarios.map(usuario => {

            const nome =
                escaparHTML(usuario.name);

            const email =
                escaparHTML(usuario.email);

            const role =
                escaparHTML(usuario.role);

            const id =
                escaparHTML(usuario.id);

            const ativo =
                usuario.is_active === true;


            const statusHTML = ativo
                ? `
                    <span class="status status-ativo">
                        Ativo
                    </span>
                `
                : `
                    <span class="status status-inativo">
                        Inativo
                    </span>
                `;


            const botaoHTML = ativo
                ? `
                    <button
                        type="button"
                        class="btn-acao btn-desativar"
                        data-action="status"
                        data-id="${id}"
                        data-active="false"
                    >
                        Desativar
                    </button>
                `
                : `
                    <button
                        type="button"
                        class="btn-acao btn-ativar"
                        data-action="status"
                        data-id="${id}"
                        data-active="true"
                    >
                        Ativar
                    </button>
                `;


            return `
                <tr>

                    <td>

                        <div class="usuario-nome">
                            ${nome}
                        </div>

                        <div class="usuario-id">
                            ID: ${id}
                        </div>

                    </td>


                    <td>

                        <span class="usuario-email">
                            ${email}
                        </span>

                    </td>


                    <td>

                        <span
                            class="role ${obterClasseRole(role)}"
                        >
                            ${formatarRole(role)}
                        </span>

                    </td>


                    <td>
                        ${statusHTML}
                    </td>


                    <td>

                        <span class="data-cadastro">
                            ${formatarData(
                                usuario.created_at
                            )}
                        </span>

                    </td>


                    <td>

                        <div class="acoes">

                            ${botaoHTML}

                        </div>

                    </td>

                </tr>
            `;

        }).join("");
}


/* ============================================================
   ALTERAR STATUS
   ============================================================ */

async function alterarStatusUsuario(
    usuarioId,
    ativo
) {

    const acao =
        ativo
            ? "ativar"
            : "desativar";


    const confirmacao =
        window.confirm(
            ativo
                ? "Deseja ativar este usuário?"
                : "Deseja desativar este usuário?"
        );


    if (!confirmacao) {
        return;
    }


    try {

        const dados =
            await requisicao(
                `/admin/users/${usuarioId}/status`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        is_active: ativo
                    })
                }
            );


        if (!dados) {
            return;
        }


        mostrarMensagem(
            dados.mensagem ||
            (
                ativo
                    ? "Usuário ativado com sucesso."
                    : "Usuário desativado com sucesso."
            ),
            "sucesso"
        );


        await carregarUsuarios();


    } catch (error) {

        console.error(
            `Erro ao ${acao} usuário:`,
            error
        );

        mostrarMensagem(
            error.message ||
            `Erro ao ${acao} usuário.`,
            "erro"
        );
    }
}


/* ============================================================
   EVENTOS DOS BOTÕES
   ============================================================ */

usuariosTabela.addEventListener(
    "click",
    event => {

        const botao =
            event.target.closest(
                '[data-action="status"]'
            );

        if (!botao) {
            return;
        }


        const usuarioId =
            botao.dataset.id;

        const ativo =
            botao.dataset.active === "true";


        alterarStatusUsuario(
            usuarioId,
            ativo
        );
    }
);


/* ============================================================
   INFORMAÇÕES DO ADMIN
   ============================================================ */

async function carregarAdministrador() {

    try {

        const dados =
            await requisicao("/auth/me");

        if (!dados) {
            return;
        }

        const usuario =
            dados.usuario ||
            dados.user ||
            dados;

        if (usuario?.name) {

            adminName.textContent =
                usuario.name;
        }

    } catch (error) {

        console.warn(
            "Não foi possível carregar os dados do administrador:",
            error
        );
    }
}


/* ============================================================
   LOGOUT
   ============================================================ */

logoutButton.addEventListener(
    "click",
    () => {

        localStorage.removeItem("yoka_token");
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("access_token");

        window.location.href =
            "../login.html";
    }
);


/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */

async function iniciar() {

    const token = obterToken();

    if (!token) {

        window.location.href =
            "../login.html";

        return;
    }


    await carregarAdministrador();

    await carregarUsuarios();
}


iniciar();
