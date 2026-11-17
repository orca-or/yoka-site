
"use strict";

/* ============================================================
   YOKA — DASHBOARD ADMINISTRATIVO
   Estatísticas, administradores, permissões e denúncias
   ============================================================ */

const API_BASE = "/api/v1";

/* ============================================================
   ELEMENTOS — ESTATÍSTICAS
   ============================================================ */

const totalUsuarios = document.getElementById("totalUsuarios");
const usuariosAtivos = document.getElementById("usuariosAtivos");
const usuariosInativos = document.getElementById("usuariosInativos");
const totalArtistas = document.getElementById("totalArtistas");
const totalMusicas = document.getElementById("totalMusicas");
const musicasPublicadas = document.getElementById("musicasPublicadas");
const musicasRascunho = document.getElementById("musicasRascunho");
const musicasArquivadas = document.getElementById("musicasArquivadas");
const totalReproducoes = document.getElementById("totalReproducoes");
const totalCurtidas = document.getElementById("totalCurtidas");
const totalSeguidores = document.getElementById("totalSeguidores");
const totalComentarios = document.getElementById("totalComentarios");

/* ============================================================
   ELEMENTOS — ADMINISTRADORES
   ============================================================ */

const adminManagementSection =
    document.getElementById("adminManagementSection");

const listaAdministradores =
    document.getElementById("listaAdministradores");

const administradoresLoading =
    document.getElementById("administradoresLoading");

const btnAdicionarAdministrador =
    document.getElementById("btnAdicionarAdministrador");

const administradoresMensagem =
    document.getElementById("administradoresMensagem");

/* ============================================================
   MODAIS — ADMINISTRADORES
   ============================================================ */

const modalAdicionarAdministrador =
    document.getElementById("modalAdicionarAdministrador");

const novoAdministradorEmail =
    document.getElementById("novoAdministradorEmail");

const novasPermissoes =
    document.getElementById("novasPermissoes");

const btnConfirmarAdicionarAdministrador =
    document.getElementById("btnConfirmarAdicionarAdministrador");

const modalEditarPermissoes =
    document.getElementById("modalEditarPermissoes");

const editarAdministradorId =
    document.getElementById("editarAdministradorId");

const editarAdministradorDescricao =
    document.getElementById("editarAdministradorDescricao");

const editarPermissoes =
    document.getElementById("editarPermissoes");

const btnConfirmarEditarPermissoes =
    document.getElementById("btnConfirmarEditarPermissoes");

/* ============================================================
   ESTADO
   ============================================================ */

let usuarioAtual = null;
let estadoFiltroDenuncias = "";
let carregandoDenuncias = false;

/* ============================================================
   PERMISSÕES DISPONÍVEIS
   ============================================================ */

const PERMISSOES = [
    {
        id: "users.view",
        nome: "Visualizar usuários",
        descricao: "Permite visualizar os usuários da plataforma."
    },
    {
        id: "users.manage",
        nome: "Gerenciar usuários",
        descricao: "Permite administrar usuários."
    },
    {
        id: "artists.view",
        nome: "Visualizar artistas",
        descricao: "Permite visualizar os artistas cadastrados."
    },
    {
        id: "artists.manage",
        nome: "Gerenciar artistas",
        descricao: "Permite administrar perfis de artistas."
    },
    {
        id: "songs.view",
        nome: "Visualizar músicas",
        descricao: "Permite visualizar as músicas cadastradas."
    },
    {
        id: "songs.manage",
        nome: "Gerenciar músicas",
        descricao: "Permite administrar músicas e publicações."
    },
    {
        id: "comments.manage",
        nome: "Gerenciar comentários",
        descricao: "Permite moderar e administrar comentários."
    },
    {
        id: "reports.manage",
        nome: "Gerenciar denúncias",
        descricao: "Permite visualizar e gerir denúncias de músicas."
    },
    {
        id: "statistics.view",
        nome: "Visualizar estatísticas",
        descricao: "Permite acessar as estatísticas da Yoka."
    },
    {
        id: "notifications.manage",
        nome: "Gerenciar notificações",
        descricao: "Permite administrar notificações."
    },
    {
        id: "admins.manage",
        nome: "Gerenciar administradores",
        descricao: "Permite adicionar, remover e configurar administradores."
    },
    {
        id: "settings.manage",
        nome: "Gerenciar configurações",
        descricao: "Permite administrar configurações da plataforma."
    }
];

/* ============================================================
   SEGURANÇA E SESSÃO
   ============================================================ */

function obterToken() {
    return (
        localStorage.getItem("yoka_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token")
    );
}

function limparSessao() {
    [
        "yoka_token",
        "token",
        "accessToken",
        "access_token",
        "yoka_usuario"
    ].forEach(chave => localStorage.removeItem(chave));
}

async function requisicao(url, opcoes = {}) {
    const token = obterToken();

    if (!token) {
        window.location.href = "./login.html";
        throw new Error("Sessão não encontrada.");
    }

    const headers = {
        ...(opcoes.headers || {}),
        Authorization: `Bearer ${token}`
    };

    if (opcoes.body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    const resposta = await fetch(`${API_BASE}${url}`, {
        ...opcoes,
        headers
    });

    let dados = null;

    try {
        dados = await resposta.json();
    } catch {
        dados = null;
    }

    if (resposta.status === 401) {
        limparSessao();
        window.location.href = "./login.html";
        throw new Error("Sessão expirada.");
    }

    if (resposta.status === 403) {
        throw new Error(
            dados?.mensagem ||
            "Não tens permissão para realizar esta ação."
        );
    }

    if (!resposta.ok) {
        throw new Error(
            dados?.mensagem ||
            `Erro na comunicação com o servidor (${resposta.status}).`
        );
    }

    return dados;
}

/* ============================================================
   UTILITÁRIOS
   ============================================================ */

function escaparHTML(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatarNumero(valor) {
    return Number(valor || 0).toLocaleString("pt-AO");
}

function formatarData(valor) {
    if (!valor) return "Data indisponível";

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) {
        return "Data indisponível";
    }

    return data.toLocaleString("pt-AO", {
        dateStyle: "short",
        timeStyle: "short"
    });
}

function mostrarErro(mensagem) {
    const elemento = document.getElementById("mensagem");

    if (!elemento) {
        console.error(mensagem);
        return;
    }

    elemento.textContent = mensagem;
    elemento.hidden = false;
    elemento.className = "mensagem erro";

    setTimeout(() => {
        elemento.hidden = true;
    }, 5000);
}

function mostrarMensagemAdministradores(mensagem, tipo = "sucesso") {
    if (!administradoresMensagem) {
        mostrarErro(mensagem);
        return;
    }

    administradoresMensagem.textContent = mensagem;
    administradoresMensagem.hidden = false;
    administradoresMensagem.className = `mensagem ${tipo}`;

    setTimeout(() => {
        administradoresMensagem.hidden = true;
    }, 5000);
}

/* ============================================================
   ESTATÍSTICAS
   ============================================================ */

async function carregarDashboard() {
    try {
        const resposta = await requisicao("/admin/dashboard");
        const dados = resposta?.dashboard;

        if (!dados) {
            throw new Error("A API não devolveu os dados do dashboard.");
        }

        const estatisticas = {
            totalUsuarios: dados.total_usuarios,
            usuariosAtivos: dados.usuarios_ativos,
            usuariosInativos: dados.usuarios_inativos,
            totalArtistas: dados.total_artistas,
            totalMusicas: dados.total_musicas,
            musicasPublicadas: dados.musicas_publicadas,
            musicasRascunho: dados.musicas_rascunho,
            musicasArquivadas: dados.musicas_arquivadas,
            totalReproducoes: dados.total_reproducoes,
            totalCurtidas: dados.total_curtidas,
            totalSeguidores: dados.total_seguidores,
            totalComentarios: dados.total_comentarios
        };

        Object.entries(estatisticas).forEach(([id, valor]) => {
            const elemento = document.getElementById(id);

            if (elemento) {
                elemento.textContent = formatarNumero(valor);
            }
        });
    } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
        mostrarErro("Não foi possível carregar as estatísticas.");
    }
}

/* ============================================================
   ADMINISTRADOR LOGADO
   ============================================================ */

async function carregarAdministrador() {
    try {
        const resposta = await requisicao("/auth/me");

        usuarioAtual = resposta?.usuario || resposta?.user || null;

        if (!usuarioAtual) return;

        const adminName = document.getElementById("adminName");

        if (adminName) {
            adminName.textContent =
                usuarioAtual.name ||
                usuarioAtual.nome ||
                "Administrador";
        }

        localStorage.setItem(
            "yoka_usuario",
            JSON.stringify(usuarioAtual)
        );
    } catch (error) {
        console.error("Erro ao carregar administrador:", error);
    }
}

/* ============================================================
   VERIFICAR PERMISSÕES DO ADMINISTRADOR
   ============================================================ */

async function obterPermissoesDoUsuario(usuarioId) {
    const resposta = await requisicao(
        `/admin/users/${encodeURIComponent(usuarioId)}/permissions`
    );

    return resposta?.permissoes || [];
}


async function verificarPermissaoGestaoAdministradores() {
    if (!usuarioAtual?.id) {
        console.error(
            "Não foi possível verificar permissões: administrador não carregado."
        );
        return false;
    }

    try {
        const permissoes = await obterPermissoesDoUsuario(
            usuarioAtual.id
        );

        const possuiPermissao = permissoes.some(
            permissao =>
                (permissao.name || permissao.permission_name) ===
                "admins.manage"
        );

        console.log(
            "Permissão admins.manage:",
            possuiPermissao ? "concedida" : "não encontrada"
        );

        return possuiPermissao;
    } catch (error) {
        console.error(
            "Erro ao verificar admins.manage:",
            error
        );

        return false;
    }
}


async function verificarPermissaoDenuncias() {
    if (!usuarioAtual?.id) return false;

    try {
        const permissoes = await obterPermissoesDoUsuario(
            usuarioAtual.id
        );

        return permissoes.some(
            permissao => permissao.name === "reports.manage"
        );
    } catch (error) {
        console.error(
            "Erro ao verificar permissão de denúncias:",
            error
        );

        return false;
    }
}

/* ============================================================
   GESTÃO DE ADMINISTRADORES
   ============================================================ */

async function inicializarGestaoAdministradores() {
    const possuiPermissao =
        await verificarPermissaoGestaoAdministradores();

    if (!possuiPermissao) {
        if (adminManagementSection) {
            adminManagementSection.hidden = true;
        }
        return;
    }

    if (adminManagementSection) {
        adminManagementSection.hidden = false;
    }

    await carregarAdministradores();

    if (
        btnAdicionarAdministrador &&
        !btnAdicionarAdministrador.dataset.eventoConfigurado
    ) {
        btnAdicionarAdministrador.addEventListener(
            "click",
            abrirFormularioAdicionarAdministrador
        );

        btnAdicionarAdministrador.dataset.eventoConfigurado = "true";
    }
}

async function carregarAdministradores() {
    if (!listaAdministradores) return;

    listaAdministradores.textContent =
        "Carregando administradores...";

    try {
        const resposta = await requisicao("/admin/administrators");
        const administradores = resposta?.administradores || [];

        listaAdministradores.replaceChildren();

        if (administradores.length === 0) {
            listaAdministradores.textContent =
                "Nenhum administrador encontrado.";
            return;
        }

        administradores.forEach(administrador => {
            listaAdministradores.appendChild(
                criarCardAdministrador(administrador)
            );
        });
    } catch (error) {
        console.error("Erro ao carregar administradores:", error);
        listaAdministradores.textContent =
            "Não foi possível carregar os administradores.";
    }
}

function criarCardAdministrador(administrador) {
    const card = document.createElement("div");
    card.className = "administrator-card";

    const permissoes = Array.isArray(administrador.permissoes)
        ? administrador.permissoes
        : [];

    const nome =
        administrador.name ||
        administrador.nome ||
        "Administrador";

    const email = administrador.email || "";
    const ativo = administrador.is_active !== false;
    const ehAtual = Boolean(
        usuarioAtual &&
        String(administrador.id) === String(usuarioAtual.id)
    );

    const info = document.createElement("div");
    info.className = "administrator-info";

    const titulo = document.createElement("h4");
    titulo.textContent = nome;

    const emailElemento = document.createElement("p");
    emailElemento.textContent = email;

    const estado = document.createElement("span");
    estado.className = ativo
        ? "administrator-active"
        : "administrator-inactive";
    estado.textContent = ativo ? "Ativo" : "Inativo";

    info.append(titulo, emailElemento, estado);

    const areaPermissoes = document.createElement("div");
    areaPermissoes.className = "administrator-permissions";

    const subtitulo = document.createElement("strong");
    subtitulo.textContent = "Permissões";

    const lista = document.createElement("div");
    lista.className = "administrator-permission-list";

    if (permissoes.length === 0) {
        const badge = document.createElement("span");
        badge.className = "permission-badge";
        badge.textContent = "Nenhuma permissão";
        lista.appendChild(badge);
    } else {
        permissoes.forEach(permissao => {
            const definicao = PERMISSOES.find(
                item => item.id === permissao.name
            );

            const badge = document.createElement("span");
            badge.className = "permission-badge";
            badge.textContent = definicao
                ? definicao.nome
                : permissao.name;

            lista.appendChild(badge);
        });
    }

    areaPermissoes.append(subtitulo, lista);

    const acoes = document.createElement("div");
    acoes.className = "administrator-actions";

    const editar = document.createElement("button");
    editar.type = "button";
    editar.className = "admin-edit-button";
    editar.textContent = "Editar";

    editar.addEventListener("click", () => {
        abrirFormularioEditarPermissoes(administrador);
    });

    const remover = document.createElement("button");
    remover.type = "button";
    remover.className = "admin-remove-button";
    remover.textContent = "Remover";
    remover.disabled = ehAtual;

    if (ehAtual) {
        remover.title = "Não podes remover a tua própria conta.";
    } else {
        remover.addEventListener("click", () => {
            removerAdministrador(administrador);
        });
    }

    acoes.append(editar, remover);
    card.append(info, areaPermissoes, acoes);

    return card;
}

/* ============================================================
   PERMISSÕES — CHECKBOXES
   ============================================================ */

function gerarCheckboxesPermissoes(
    container,
    permissoesSelecionadas = []
) {
    if (!container) return;

    const selecionadas = new Set(permissoesSelecionadas);
    container.replaceChildren();

    PERMISSOES.forEach(permissao => {
        const label = document.createElement("label");
        label.className = "permission-checkbox";

        const input = document.createElement("input");
        input.type = "checkbox";
        input.value = permissao.id;
        input.dataset.permission = permissao.id;
        input.checked = selecionadas.has(permissao.id);

        const texto = document.createElement("span");
        const nome = document.createElement("strong");
        const descricao = document.createElement("small");

        nome.textContent = permissao.nome;
        descricao.textContent = permissao.descricao;

        texto.append(nome, descricao);
        label.append(input, texto);
        container.appendChild(label);
    });
}

function obterPermissoesSelecionadas(container) {
    if (!container) return [];

    return Array.from(
        container.querySelectorAll(
            'input[type="checkbox"]:checked'
        )
    ).map(input => input.value);
}

async function obterIdsDasPermissoes(nomes) {
    if (!Array.isArray(nomes) || nomes.length === 0) {
        return [];
    }

    const resposta = await requisicao("/admin/permissions");
    const permissoes = resposta?.permissoes || [];

    return nomes
        .map(nome => permissoes.find(item => item.name === nome)?.id)
        .filter(Boolean);
}

/* ============================================================
   MODAIS — ABRIR E FECHAR
   ============================================================ */

function abrirModal(modal) {
    if (!modal) return;

    modal.hidden = false;
    document.body.classList.add("admin-modal-open");
}

function fecharModal(modal) {
    if (!modal) return;

    modal.hidden = true;

    if (!document.querySelector(".admin-modal:not([hidden])")) {
        document.body.classList.remove("admin-modal-open");
    }
}

function abrirFormularioAdicionarAdministrador() {
    if (!modalAdicionarAdministrador) return;

    if (novoAdministradorEmail) {
        novoAdministradorEmail.value = "";
    }

    gerarCheckboxesPermissoes(novasPermissoes, []);
    abrirModal(modalAdicionarAdministrador);

    setTimeout(() => novoAdministradorEmail?.focus(), 50);
}

async function abrirFormularioEditarPermissoes(administrador) {
    if (!modalEditarPermissoes) return;

    if (editarAdministradorId) {
        editarAdministradorId.value = administrador.id;
    }

    if (editarAdministradorDescricao) {
        editarAdministradorDescricao.textContent =
            `Permissões de ${
                administrador.name ||
                administrador.nome ||
                administrador.email
            }`;
    }

    if (editarPermissoes) {
        editarPermissoes.textContent = "Carregando permissões...";
    }

    abrirModal(modalEditarPermissoes);

    try {
        const resposta = await obterPermissoesDoUsuario(
            administrador.id
        );

        gerarCheckboxesPermissoes(
            editarPermissoes,
            resposta.map(permissao => permissao.name)
        );
    } catch (error) {
        console.error("Erro ao carregar permissões:", error);

        if (editarPermissoes) {
            editarPermissoes.textContent =
                "Não foi possível carregar as permissões.";
        }

        mostrarMensagemAdministradores(error.message, "erro");
    }
}

/* ============================================================
   ADICIONAR ADMINISTRADOR
   ============================================================ */

async function confirmarAdicionarAdministrador() {
    const email = novoAdministradorEmail?.value
        ?.trim()
        .toLowerCase();

    if (!email) {
        mostrarMensagemAdministradores(
            "Informe o e-mail do usuário.",
            "erro"
        );
        return;
    }

    const permissoes = obterPermissoesSelecionadas(novasPermissoes);
    const botao = btnConfirmarAdicionarAdministrador;
    const textoOriginal = botao?.textContent;

    try {
        if (botao) {
            botao.disabled = true;
            botao.textContent = "Adicionando...";
        }

        const permissionIds = await obterIdsDasPermissoes(permissoes);

        const resposta = await requisicao(
            "/admin/administrators",
            {
                method: "POST",
                body: JSON.stringify({
                    email,
                    permissionIds
                })
            }
        );

        fecharModal(modalAdicionarAdministrador);

        mostrarMensagemAdministradores(
            resposta?.mensagem ||
            "Administrador adicionado com sucesso.",
            "sucesso"
        );

        await carregarAdministradores();
    } catch (error) {
        console.error("Erro ao adicionar administrador:", error);

        mostrarMensagemAdministradores(
            error.message ||
            "Não foi possível adicionar o administrador.",
            "erro"
        );
    } finally {
        if (botao) {
            botao.disabled = false;
            botao.textContent =
                textoOriginal || "Adicionar administrador";
        }
    }
}

/* ============================================================
   ATUALIZAR PERMISSÕES
   ============================================================ */

async function confirmarEditarPermissoes() {
    const administradorId = editarAdministradorId?.value;

    if (!administradorId) return;

    const nomes = obterPermissoesSelecionadas(editarPermissoes);
    const botao = btnConfirmarEditarPermissoes;
    const textoOriginal = botao?.textContent;

    try {
        if (botao) {
            botao.disabled = true;
            botao.textContent = "Salvando...";
        }

        const permissionIds = await obterIdsDasPermissoes(nomes);

        const resposta = await requisicao(
            `/admin/administrators/${encodeURIComponent(administradorId)}/permissions`,
            {
                method: "PUT",
                body: JSON.stringify({ permissionIds })
            }
        );

        fecharModal(modalEditarPermissoes);

        mostrarMensagemAdministradores(
            resposta?.mensagem ||
            "Permissões atualizadas com sucesso.",
            "sucesso"
        );

        await carregarAdministradores();
    } catch (error) {
        console.error("Erro ao atualizar permissões:", error);

        mostrarMensagemAdministradores(
            error.message ||
            "Não foi possível atualizar as permissões.",
            "erro"
        );
    } finally {
        if (botao) {
            botao.disabled = false;
            botao.textContent = textoOriginal || "Salvar permissões";
        }
    }
}

/* ============================================================
   REMOVER ADMINISTRADOR
   ============================================================ */

async function removerAdministrador(administrador) {
    const nome =
        administrador.name ||
        administrador.nome ||
        administrador.email;

    if (!window.confirm(
        `Desejas realmente remover "${nome}" dos administradores?`
    )) {
        return;
    }

    try {
        await requisicao(
            `/admin/administrators/${encodeURIComponent(administrador.id)}`,
            { method: "DELETE" }
        );

        mostrarMensagemAdministradores(
            "Administrador removido com sucesso.",
            "sucesso"
        );

        await carregarAdministradores();
    } catch (error) {
        console.error("Erro ao remover administrador:", error);

        mostrarMensagemAdministradores(
            error.message ||
            "Não foi possível remover o administrador.",
            "erro"
        );
    }
}

/* ============================================================
   DENÚNCIAS — ESTILOS
   ============================================================ */

function inicializarEstilosDenuncias() {
    if (document.getElementById("yokaDenunciasStyles")) return;

    const estilo = document.createElement("style");
    estilo.id = "yokaDenunciasStyles";

    estilo.textContent = `
        #reportsManagementSection {
            margin: 24px 0;
            padding: 20px;
            border-radius: 14px;
            border: 1px solid rgba(128,128,128,.25);
            background: var(--card-bg, transparent);
        }

        #reportsManagementSection .reports-header {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 18px;
        }

        #reportsManagementSection .reports-header h2 {
            margin: 0;
        }

        #reportsManagementSection .reports-filters {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 10px;
        }

        #reportsManagementSection select,
        #reportsManagementSection button {
            font: inherit;
            padding: 9px 12px;
            border-radius: 8px;
        }

        #reportsManagementSection .reports-list {
            display: grid;
            gap: 14px;
        }

        #reportsManagementSection .report-card {
            border: 1px solid rgba(128,128,128,.28);
            border-radius: 12px;
            padding: 16px;
            overflow-wrap: anywhere;
        }

        #reportsManagementSection .report-top {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
        }

        #reportsManagementSection .report-card h3 {
            margin: 0 0 8px;
        }

        #reportsManagementSection .report-meta {
            display: grid;
            gap: 7px;
            margin: 12px 0;
        }

        #reportsManagementSection .report-description {
            white-space: pre-wrap;
            overflow-wrap: anywhere;
            margin: 12px 0;
        }

        #reportsManagementSection .report-status {
            display: inline-block;
            border-radius: 20px;
            padding: 5px 10px;
            font-size: .85rem;
            background: rgba(128,128,128,.16);
        }

        #reportsManagementSection .report-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 14px;
        }

        #reportsManagementSection .report-actions button {
            cursor: pointer;
        }

        #reportsManagementSection button:disabled {
            opacity: .55;
            cursor: not-allowed;
        }

        #reportsManagementSection .reports-empty {
            padding: 18px 0;
            opacity: .8;
        }
    `;

    document.head.appendChild(estilo);
}

/* ============================================================
   DENÚNCIAS — CRIAR SECÇÃO AUTOMATICAMENTE
   ============================================================ */

function criarSecaoDenuncias() {
    let secao = document.getElementById("reportsManagementSection");

    if (secao) return secao;

    secao = document.createElement("section");
    secao.id = "reportsManagementSection";
    secao.hidden = true;

    secao.innerHTML = `
        <div class="reports-header">
            <div>
                <h2>Denúncias de músicas</h2>
                <p>Analisa as denúncias recebidas e atualiza o seu estado.</p>
            </div>

            <div class="reports-filters">
                <label for="reportsStatusFilter">Estado:</label>

                <select id="reportsStatusFilter">
                    <option value="">Todas</option>
                    <option value="pending">Pendentes</option>
                    <option value="reviewing">Em análise</option>
                    <option value="resolved">Resolvidas</option>
                    <option value="rejected">Rejeitadas</option>
                </select>

                <button type="button" id="btnAtualizarDenuncias">
                    Atualizar
                </button>
            </div>
        </div>

        <div
            id="reportsMessage"
            class="reports-empty"
            role="status"
            aria-live="polite"
        >
            A carregar denúncias...
        </div>

        <div id="reportsList" class="reports-list"></div>
    `;

    const referencia =
        document.getElementById("adminManagementSection");

    if (referencia?.parentNode) {
        referencia.parentNode.insertBefore(secao, referencia);
    } else {
        const conteudo =
            document.querySelector("main") ||
            document.querySelector(".dashboard-content") ||
            document.body;

        conteudo.appendChild(secao);
    }

    const filtro = secao.querySelector("#reportsStatusFilter");
    const botaoAtualizar = secao.querySelector("#btnAtualizarDenuncias");

    filtro.addEventListener("change", () => {
        estadoFiltroDenuncias = filtro.value;
        carregarDenuncias();
    });

    botaoAtualizar.addEventListener("click", () => {
        carregarDenuncias();
    });

    return secao;
}

/* ============================================================
   DENÚNCIAS — TEXTOS E ESTADOS
   ============================================================ */

function nomeMotivoDenuncia(motivo) {
    const motivos = {
        copyright: "Direitos de autor",
        inappropriate: "Conteúdo inadequado",
        violence: "Violência",
        spam: "Spam",
        other: "Outro motivo"
    };

    return motivos[motivo] || motivo || "Não especificado";
}

function nomeEstadoDenuncia(estado) {
    const estados = {
        pending: "Pendente",
        reviewing: "Em análise",
        resolved: "Resolvida",
        rejected: "Rejeitada"
    };

    return estados[estado] || estado || "Desconhecido";
}

function mostrarMensagemDenuncias(mensagem) {
    const elemento = document.getElementById("reportsMessage");

    if (elemento) {
        elemento.textContent = mensagem;
        elemento.hidden = false;
    }
}

/* ============================================================
   DENÚNCIAS — CARREGAR LISTA
   ============================================================ */

async function inicializarGestaoDenuncias() {
    const secao = criarSecaoDenuncias();
    inicializarEstilosDenuncias();

    const possuiPermissao = await verificarPermissaoDenuncias();

    if (!possuiPermissao) {
        secao.hidden = true;
        return;
    }

    secao.hidden = false;
    await carregarDenuncias();
}

async function carregarDenuncias() {
    if (carregandoDenuncias) return;

    const lista = document.getElementById("reportsList");
    const mensagem = document.getElementById("reportsMessage");
    const filtro = document.getElementById("reportsStatusFilter");
    const botaoAtualizar =
        document.getElementById("btnAtualizarDenuncias");

    if (!lista || !mensagem) return;

    carregandoDenuncias = true;

    if (filtro) {
        filtro.value = estadoFiltroDenuncias;
    }

    if (botaoAtualizar) {
        botaoAtualizar.disabled = true;
    }

    lista.replaceChildren();
    mensagem.hidden = false;
    mensagem.textContent = "A carregar denúncias...";

    try {
        const query = estadoFiltroDenuncias
            ? `?status=${encodeURIComponent(estadoFiltroDenuncias)}`
            : "";

        const resposta = await requisicao(`/admin/reports${query}`);
        const denuncias = resposta?.denuncias || [];

        lista.replaceChildren();

        if (denuncias.length === 0) {
            mensagem.textContent =
                "Não existem denúncias para este filtro.";
            return;
        }

        mensagem.hidden = true;

        denuncias.forEach(denuncia => {
            lista.appendChild(criarCardDenuncia(denuncia));
        });
    } catch (error) {
        console.error("Erro ao carregar denúncias:", error);

        mensagem.hidden = false;
        mensagem.textContent =
            error.message ||
            "Não foi possível carregar as denúncias.";
    } finally {
        carregandoDenuncias = false;

        if (botaoAtualizar) {
            botaoAtualizar.disabled = false;
        }
    }
}

/* ============================================================
   DENÚNCIAS — CARTÃO INDIVIDUAL
   ============================================================ */

function criarCardDenuncia(denuncia) {
    const card = document.createElement("article");
    card.className = "report-card";
card.dataset.reportId = String(denuncia.id);
    const topo = document.createElement("div");
    topo.className = "report-top";

    const tituloArea = document.createElement("div");
    const titulo = document.createElement("h3");

    titulo.textContent =
        denuncia.song_title || "Música sem título";

    const motivo = document.createElement("p");
    motivo.textContent =
        `Motivo: ${nomeMotivoDenuncia(denuncia.reason)}`;

    tituloArea.append(titulo, motivo);

    const estado = document.createElement("span");
    estado.className = "report-status";
    estado.textContent = nomeEstadoDenuncia(denuncia.status);

    topo.append(tituloArea, estado);

    const meta = document.createElement("div");
    meta.className = "report-meta";

    const artista = document.createElement("div");
    artista.textContent =
        `Artista: ${denuncia.artist_name || "Não identificado"}`;

    const denunciante = document.createElement("div");
    denunciante.textContent =
        `Denunciante: ${denuncia.reporter_name || "Não identificado"}`;

    const email = document.createElement("div");
    email.textContent =
        `E-mail: ${denuncia.reporter_email || "Não disponível"}`;

    const data = document.createElement("div");
    data.textContent =
        `Recebida em: ${formatarData(denuncia.created_at)}`;

    meta.append(artista, denunciante, email, data);

    card.append(topo, meta);

    if (denuncia.description) {
        const descricao = document.createElement("p");
        descricao.className = "report-description";
        descricao.textContent =
            `Descrição: ${denuncia.description}`;

        card.appendChild(descricao);
    }

    const acoes = document.createElement("div");
    acoes.className = "report-actions";

    const seletor = document.createElement("select");
    seletor.setAttribute(
        "aria-label",
        "Selecionar novo estado da denúncia"
    );

    [
        ["pending", "Pendente"],
        ["reviewing", "Em análise"],
        ["resolved", "Resolvida"],
        ["rejected", "Rejeitada"]
    ].forEach(([valor, texto]) => {
        const opcao = document.createElement("option");
        opcao.value = valor;
        opcao.textContent = texto;
        seletor.appendChild(opcao);
    });

    seletor.value = denuncia.status;

    const guardar = document.createElement("button");
    guardar.type = "button";
    guardar.textContent = "Guardar estado";

    guardar.addEventListener("click", async () => {
        const novoEstado = seletor.value;

        if (novoEstado === denuncia.status) {
            mostrarErro("Seleciona um estado diferente do atual.");
            return;
        }

        const confirmar = window.confirm(
            `Alterar o estado desta denúncia para "${nomeEstadoDenuncia(novoEstado)}"?`
        );

        if (!confirmar) return;

        guardar.disabled = true;
        seletor.disabled = true;
        guardar.textContent = "A guardar...";

        try {
            await requisicao(
                `/admin/reports/${encodeURIComponent(denuncia.id)}/status`,
                {
                    method: "PATCH",
                    body: JSON.stringify({ status: novoEstado })
                }
            );

            await carregarDenuncias();
        } catch (error) {
            console.error("Erro ao atualizar denúncia:", error);
            mostrarErro(
                error.message ||
                "Não foi possível atualizar a denúncia."
            );
        } finally {
            guardar.disabled = false;
            seletor.disabled = false;
            guardar.textContent = "Guardar estado";
        }
    });

    acoes.append(seletor, guardar);
    card.appendChild(acoes);

    return card;
}

/* ============================================================
   MODAIS — EVENTOS
   ============================================================ */

function inicializarModais() {
    document.querySelectorAll("[data-close-modal]").forEach(elemento => {
        elemento.addEventListener("click", () => {
            const tipo = elemento.dataset.closeModal;

            if (tipo === "adicionar") {
                fecharModal(modalAdicionarAdministrador);
            }

            if (tipo === "editar") {
                fecharModal(modalEditarPermissoes);
            }
        });
    });

    document.addEventListener("keydown", evento => {
        if (evento.key !== "Escape") return;

        fecharModal(modalAdicionarAdministrador);
        fecharModal(modalEditarPermissoes);
    });
}

/* ============================================================
   LOGOUT
   ============================================================ */

function inicializarLogout() {
    const logoutButton = document.getElementById("logoutButton");

    if (!logoutButton || logoutButton.dataset.eventoConfigurado) {
        return;
    }

    logoutButton.addEventListener("click", () => {
        limparSessao();
        window.location.href = "./login.html";
    });

    logoutButton.dataset.eventoConfigurado = "true";
}

/* ============================================================
   EVENTOS DOS BOTÕES DOS MODAIS
   ============================================================ */

function inicializarEventosAdministradores() {
    if (
        btnConfirmarAdicionarAdministrador &&
        !btnConfirmarAdicionarAdministrador.dataset.eventoConfigurado
    ) {
        btnConfirmarAdicionarAdministrador.addEventListener(
            "click",
            confirmarAdicionarAdministrador
        );

        btnConfirmarAdicionarAdministrador.dataset.eventoConfigurado =
            "true";
    }

    if (
        btnConfirmarEditarPermissoes &&
        !btnConfirmarEditarPermissoes.dataset.eventoConfigurado
    ) {
        btnConfirmarEditarPermissoes.addEventListener(
            "click",
            confirmarEditarPermissoes
        );

        btnConfirmarEditarPermissoes.dataset.eventoConfigurado =
            "true";
    }
}



/* ============================================================
   NOTIFICAÇÕES DO PAINEL ADMINISTRATIVO
   ============================================================ */

let temporizadorNotificacoesAdmin = null;

async function carregarNotificacoesAdmin() {
    const lista = document.getElementById("adminNotificationList");
    const badge = document.getElementById("adminNotificationBadge");

    if (!lista || !badge) return;

    try {
        const [respostaLista, respostaContador] = await Promise.all([
            requisicao("/notifications?limite=50"),
            requisicao("/notifications/unread-count")
        ]);

        const notificacoes = respostaLista?.notificacoes || [];
        const total = Number(respostaContador?.total || 0);

        badge.textContent = total > 99 ? "99+" : String(total);
        badge.hidden = total <= 0;

        lista.replaceChildren();

        if (notificacoes.length === 0) {
            const vazio = document.createElement("div");
            vazio.className = "admin-notification-empty";
            vazio.textContent = "Não tens notificações.";
            lista.appendChild(vazio);
            return;
        }

        notificacoes.forEach(notificacao => {
            const item = document.createElement("button");
            item.type = "button";
            item.className = "admin-notification-item";

            if (!notificacao.is_read) {
                item.classList.add("unread");
            }

            const titulo = document.createElement("strong");
            titulo.textContent =
                notificacao.title || "Notificação";

            const mensagem = document.createElement("p");
            mensagem.textContent =
                notificacao.message || "Sem detalhes adicionais.";

            const data = document.createElement("small");
            data.textContent = formatarData(notificacao.created_at);

            item.append(titulo, mensagem, data);

            item.addEventListener("click", async () => {
                item.disabled = true;

                try {
                    if (!notificacao.is_read) {
                        await requisicao(
                            `/notifications/${encodeURIComponent(notificacao.id)}/read`,
                            { method: "PUT" }
                        );
                    }

                    document.getElementById(
                        "adminNotificationDropdown"
                    ).hidden = true;

                    document.getElementById(
                        "adminNotificationButton"
                    ).setAttribute("aria-expanded", "false");

                    await carregarNotificacoesAdmin();

                    const tipo =
                        notificacao.entity_type ||
                        notificacao.entityType;

                    const entidade =
                        notificacao.entity_id ||
                        notificacao.entityId;
if (tipo === "song_report" && entidade) {
    window.location.href =
        `./denuncias.html?reportId=${encodeURIComponent(entidade)}`;

} else if (tipo === "comment_report" && entidade) {
    window.location.href =
        `./comentarios.html?commentId=${encodeURIComponent(entidade)}`;
}               } catch (error) {
                    console.error(
                        "Erro ao abrir notificação:",
                        error
                    );
                    mostrarErro(
                        error.message ||
                        "Não foi possível abrir a notificação."
                    );
                } finally {
                    item.disabled = false;
                }
            });

            lista.appendChild(item);
        });
    } catch (error) {
        console.error(
            "Erro ao carregar notificações do ADM:",
            error
        );

        lista.textContent =
            "Não foi possível carregar as notificações.";
    }
}

async function abrirDenunciaDaNotificacao(denunciaId) {
    const secao = criarSecaoDenuncias();

    secao.hidden = false;

    estadoFiltroDenuncias = "";

    const filtro = document.getElementById("reportsStatusFilter");

    if (filtro) {
        filtro.value = "";
    }

    await carregarDenuncias();

    const cards = document.querySelectorAll("#reportsList .report-card");

    const card = Array.from(cards).find(elemento =>
        elemento.dataset.reportId === String(denunciaId)
    );

    if (!card) {
        mostrarErro(
            "A denúncia não foi encontrada na lista. Verifica se tens permissão para a consultar."
        );
        return;
    }

    card.classList.add("report-highlight");

    card.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    setTimeout(() => {
        card.classList.remove("report-highlight");
    }, 5000);
}

function inicializarNotificacoesAdmin() {
    const botao = document.getElementById(
        "adminNotificationButton"
    );

    const dropdown = document.getElementById(
        "adminNotificationDropdown"
    );

    const marcarTodas = document.getElementById(
        "adminMarkAllRead"
    );

    if (!botao || !dropdown) return;

    botao.addEventListener("click", async evento => {
        evento.stopPropagation();

        dropdown.hidden = !dropdown.hidden;

        botao.setAttribute(
            "aria-expanded",
            String(!dropdown.hidden)
        );

        if (!dropdown.hidden) {
            await carregarNotificacoesAdmin();
        }
    });

    dropdown.addEventListener("click", evento => {
        evento.stopPropagation();
    });

    document.addEventListener("click", () => {
        dropdown.hidden = true;
        botao.setAttribute("aria-expanded", "false");
    });

    if (marcarTodas) {
        marcarTodas.addEventListener("click", async () => {
            marcarTodas.disabled = true;

            try {
                await requisicao("/notifications/read-all", {
                    method: "PUT"
                });

                await carregarNotificacoesAdmin();
            } catch (error) {
                console.error(
                    "Erro ao marcar notificações como lidas:",
                    error
                );

                mostrarErro(
                    error.message ||
                    "Não foi possível marcar as notificações."
                );
            } finally {
                marcarTodas.disabled = false;
            }
        });
    }

    carregarNotificacoesAdmin();

    temporizadorNotificacoesAdmin = setInterval(
        carregarNotificacoesAdmin,
        30000
    );
}

/* ============================================================
   INICIALIZAÇÃO GERAL
   ============================================================ */

async function iniciar() {
    inicializarModais();
    inicializarLogout();
      inicializarNotificacoesAdmin();
    inicializarEventosAdministradores();

    await carregarAdministrador();

    /*
     * O admin-profile.js continua responsável
     * pelo link de perfil do administrador.
     */

    await carregarDashboard();
    await inicializarGestaoAdministradores();
   


    
}

document.addEventListener("DOMContentLoaded", iniciar);
