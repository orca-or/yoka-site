"use strict";

/* =========================================================
   CONFIGURAÇÃO
========================================================= */

const API_BASE = "https://wairujyynjohterkqort.supabase.co/functions/v1/yoka";

/* =========================================================
   ELEMENTOS
========================================================= */

const notificationForm =
    document.getElementById("notificationForm");

const usuariosContainer =
    document.getElementById("listaUsuariosCheckboxes");

const selecionarTodosCheckbox =
    document.getElementById("selecionarTodosUsuarios");

const contadorUsuariosSelecionados =
    document.getElementById("contadorUsuariosSelecionados");

const tituloInput =
    document.getElementById("titulo");

const mensagemInput =
    document.getElementById("mensagem");

const contadorMensagem =
    document.getElementById("contadorMensagem");

const notificationMessage =
    document.getElementById("notificationMessage");

const sendNotificationButton =
    document.getElementById("sendNotificationButton");

const logoutButtons =
    document.querySelectorAll("#logoutButton");

/* =========================================================
   TOKEN
========================================================= */

function obterToken() {
    return (
        localStorage.getItem("yoka_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token")
    );
}

/* =========================================================
   API
========================================================= */

async function apiFetch(url, options = {}) {
    const token = obterToken();

    if (!token) {
        window.location.href = "../login.html";

        throw new Error(
            "Token de autenticação não encontrado."
        );
    }

    const headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    let dados = null;

    try {
        dados = await response.json();
    } catch (error) {
        dados = null;
    }

    if (!response.ok) {
        throw new Error(
            dados?.mensagem ||
            dados?.message ||
            "Ocorreu um erro na comunicação com o servidor."
        );
    }

    return dados;
}

/* =========================================================
   MENSAGENS DA INTERFACE
========================================================= */

function mostrarMensagem(mensagem, tipo = "sucesso") {
    notificationMessage.textContent = mensagem;

    notificationMessage.className =
        `notification-message ${tipo}`;

    notificationMessage.hidden = false;
}

function esconderMensagem() {
    notificationMessage.hidden = true;
}

/* =========================================================
   USUÁRIOS SELECIONADOS
========================================================= */

function obterUsuariosSelecionados() {
    return Array.from(
        usuariosContainer.querySelectorAll(
            'input[name="usuarios_destinatarios"]:checked'
        )
    ).map(checkbox => checkbox.value);
}

/* =========================================================
   CONTADOR DE USUÁRIOS
========================================================= */

function atualizarSelecaoUsuarios() {
    const checkboxes = Array.from(
        usuariosContainer.querySelectorAll(
            'input[name="usuarios_destinatarios"]'
        )
    );

    const selecionados = checkboxes.filter(
        checkbox => checkbox.checked
    ).length;

    contadorUsuariosSelecionados.textContent =
        `${selecionados} selecionado${selecionados === 1 ? "" : "s"}`;

    selecionarTodosCheckbox.checked =
        checkboxes.length > 0 &&
        selecionados === checkboxes.length;

    selecionarTodosCheckbox.indeterminate =
        selecionados > 0 &&
        selecionados < checkboxes.length;
}

/* =========================================================
   SELECIONAR OU DESMARCAR TODOS
========================================================= */

selecionarTodosCheckbox.addEventListener(
    "change",
    () => {
        const checkboxes =
            usuariosContainer.querySelectorAll(
                'input[name="usuarios_destinatarios"]'
            );

        checkboxes.forEach(checkbox => {
            checkbox.checked =
                selecionarTodosCheckbox.checked;
        });

        atualizarSelecaoUsuarios();
    }
);

/* =========================================================
   CARREGAR USUÁRIOS
========================================================= */

async function carregarUsuarios() {
    usuariosContainer.textContent =
        "Carregando usuários...";

    selecionarTodosCheckbox.disabled = true;

    try {
        const dados = await apiFetch(
            `${API_BASE}/admin/users`
        );

        const usuarios = dados.usuarios || [];

        usuariosContainer.replaceChildren();

        if (usuarios.length === 0) {
            usuariosContainer.textContent =
                "Nenhum usuário encontrado.";

            contadorUsuariosSelecionados.textContent =
                "0 selecionados";

            selecionarTodosCheckbox.checked = false;

            return;
        }

        usuarios.forEach(usuario => {
            const label = document.createElement("label");

            label.className = "user-checkbox-label";

            const checkbox = document.createElement("input");

            checkbox.type = "checkbox";
            checkbox.name = "usuarios_destinatarios";
            checkbox.value = usuario.id;

            checkbox.addEventListener(
                "change",
                atualizarSelecaoUsuarios
            );

            const informacao = document.createElement("span");

            informacao.textContent =
                `${usuario.name || "Usuário"} — ${usuario.email || ""}`;

            label.appendChild(checkbox);
            label.appendChild(informacao);

            usuariosContainer.appendChild(label);
        });

        selecionarTodosCheckbox.disabled = false;

        atualizarSelecaoUsuarios();

    } catch (error) {
        console.error(
            "Erro ao carregar usuários:",
            error
        );

        usuariosContainer.textContent =
            "Não foi possível carregar os usuários.";

        mostrarMensagem(error.message, "erro");
    }
}

/* =========================================================
   CONTADOR DA MENSAGEM
========================================================= */

function atualizarContador() {
    const quantidade = mensagemInput.value.length;

    contadorMensagem.textContent =
        `${quantidade} / 1000`;
}

/* =========================================================
   ENVIAR NOTIFICAÇÃO PARA VÁRIOS USUÁRIOS
========================================================= */

async function enviarNotificacao(event) {
    event.preventDefault();

    esconderMensagem();

    const usuariosIds = obterUsuariosSelecionados();

    const titulo = tituloInput.value.trim();

    const mensagem = mensagemInput.value.trim();

    /* VALIDAÇÃO */

    if (usuariosIds.length === 0) {
        mostrarMensagem(
            "Selecione pelo menos um usuário.",
            "erro"
        );

        return;
    }

    if (!titulo) {
        mostrarMensagem(
            "Digite o título da notificação.",
            "erro"
        );

        tituloInput.focus();

        return;
    }

    if (!mensagem) {
        mostrarMensagem(
            "Digite a mensagem da notificação.",
            "erro"
        );

        mensagemInput.focus();

        return;
    }

    if (titulo.length > 150 || mensagem.length > 1000) {
        mostrarMensagem(
            "O título ou a mensagem ultrapassa o limite permitido.",
            "erro"
        );

        return;
    }

    /* BLOQUEAR ENVIO DUPLO */

    sendNotificationButton.disabled = true;

    sendNotificationButton.textContent =
        "Enviando notificações...";

    try {
        let enviadas = 0;
        let falhadas = 0;

        /*
         * Envia uma notificação por usuário.
         * Mantém a rota e o formato atuais da API.
         */

        for (const usuarioId of usuariosIds) {
            try {
                await apiFetch(
                    `${API_BASE}/admin/notifications`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            usuario_id: usuarioId,
                            titulo,
                            mensagem
                        })
                    }
                );

                enviadas++;

            } catch (error) {
                falhadas++;

                console.error(
                    `Falha ao notificar o usuário ${usuarioId}:`,
                    error
                );
            }
        }

        /* RESULTADO */

        if (falhadas === 0) {
            mostrarMensagem(
                `Notificação enviada com sucesso para ${enviadas} usuário(s).`,
                "sucesso"
            );

            tituloInput.value = "";
            mensagemInput.value = "";

            usuariosContainer.querySelectorAll(
                'input[name="usuarios_destinatarios"]'
            ).forEach(checkbox => {
                checkbox.checked = false;
            });

            selecionarTodosCheckbox.checked = false;

            atualizarSelecaoUsuarios();
            atualizarContador();

        } else {
            mostrarMensagem(
                `Envio concluído: ${enviadas} enviada(s) e ${falhadas} falhada(s). Verifica os erros na consola antes de tentar novamente.`,
                "erro"
            );
        }

    } catch (error) {
        console.error(
            "Erro ao enviar notificações:",
            error
        );

        mostrarMensagem(
            error.message,
            "erro"
        );

    } finally {
        sendNotificationButton.disabled = false;

        sendNotificationButton.textContent =
            "Enviar notificação";
    }
}

/* =========================================================
   LOGOUT
========================================================= */

function logout() {
    localStorage.removeItem("yoka_token");
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("access_token");

    window.location.href = "../login.html";
}

/* =========================================================
   EVENTOS
========================================================= */

notificationForm.addEventListener(
    "submit",
    enviarNotificacao
);

mensagemInput.addEventListener(
    "input",
    atualizarContador
);

logoutButtons.forEach(button => {
    button.addEventListener("click", logout);
});

/* =========================================================
   INICIALIZAÇÃO
========================================================= */

atualizarContador();
carregarUsuarios();