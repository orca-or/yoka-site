
"use strict";

/* ============================================================
   YOKA ADM — NOTIFICAÇÕES PARTILHADAS
   Funciona em todas as páginas administrativas.
   ============================================================ */

(() => {
    const API = "/api/v1";

    const botao = document.getElementById(
        "adminNotificationButton"
    );

    const dropdown = document.getElementById(
        "adminNotificationDropdown"
    );

    const badge = document.getElementById(
        "adminNotificationBadge"
    );

    const lista = document.getElementById(
        "adminNotificationList"
    );

    const marcarTodas = document.getElementById(
        "adminMarkAllRead"
    );

    // Esta página não possui o menu de notificações.
    if (!botao || !dropdown || !badge || !lista) {
        return;
    }

    // Evita inicializar os eventos duas vezes.
    if (botao.dataset.notificacoesInicializadas === "true") {
        return;
    }

    botao.dataset.notificacoesInicializadas = "true";

    let carregando = false;
    let temporizador = null;

    /* ========================================================
       TOKEN DE AUTENTICAÇÃO
       ======================================================== */

    function obterToken() {
        return (
            localStorage.getItem("yoka_token") ||
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken") ||
            localStorage.getItem("access_token")
        );
    }

    /* ========================================================
       FORMATAR DATA
       ======================================================== */

    function formatarData(valor) {
        if (!valor) {
            return "Data indisponível";
        }

        const data = new Date(valor);

        if (Number.isNaN(data.getTime())) {
            return "Data indisponível";
        }

        return data.toLocaleString("pt-AO", {
            dateStyle: "short",
            timeStyle: "short"
        });
    }

    /* ========================================================
       PEDIDOS À API
       ======================================================== */

    async function requisitarNotificacoes(url, opcoes = {}) {
        const token = obterToken();

        if (!token) {
            throw new Error("Sessão não encontrada.");
        }

        const resposta = await fetch(`${API}${url}`, {
            ...opcoes,
            headers: {
                ...(opcoes.headers || {}),
                Authorization: `Bearer ${token}`,
                ...(opcoes.body !== undefined
                    ? {
                        "Content-Type": "application/json"
                    }
                    : {})
            }
        });

        let dados = null;

        try {
            dados = await resposta.json();
        } catch {
            dados = null;
        }

        // Sessão expirada.
        if (resposta.status === 401) {
            [
                "yoka_token",
                "token",
                "accessToken",
                "access_token",
                "yoka_usuario"
            ].forEach(chave => {
                localStorage.removeItem(chave);
            });

            window.location.href = "./login.html";

            throw new Error("A sessão expirou.");
        }

        if (!resposta.ok) {
            throw new Error(
                dados?.mensagem ||
                `Erro ao comunicar com o servidor (${resposta.status}).`
            );
        }

        return dados;
    }

    /* ========================================================
       MOSTRAR ERROS
       ======================================================== */

    function mostrarErro(mensagem) {
        console.error("[Yoka ADM]", mensagem);

        const elemento = document.getElementById("mensagem");

        if (elemento) {
            elemento.textContent = mensagem;
            elemento.hidden = false;
            elemento.className = "mensagem erro";
        }
    }

    /* ========================================================
       FECHAR MENU
       ======================================================== */

    function fecharMenu() {
        dropdown.hidden = true;

        botao.setAttribute(
            "aria-expanded",
            "false"
        );
    }

    /* ========================================================
       ABRIR DESTINO DA NOTIFICAÇÃO
       ======================================================== */

    function abrirDestinoNotificacao(tipo, entidade) {
        if (!entidade) {
            return;
        }

        // Denúncia de música:
        // abre sempre a página exclusiva de denúncias.
        if (tipo === "song_report") {
            window.location.href =
                `./denuncias.html?reportId=${encodeURIComponent(entidade)}`;

            return;
        }

        // Denúncia de comentário:
        // abre a página de gestão de comentários.
        if (tipo === "comment_report") {
            window.location.href =
                `./comentarios.html?commentId=${encodeURIComponent(entidade)}`;

            return;
        }
    }

    /* ========================================================
       CARREGAR NOTIFICAÇÕES
       ======================================================== */

    async function carregarNotificacoes() {
        if (carregando) {
            return;
        }

        carregando = true;

        try {
            const [
                respostaLista,
                respostaContador
            ] = await Promise.all([
                requisitarNotificacoes(
                    "/notifications?limite=50"
                ),

                requisitarNotificacoes(
                    "/notifications/unread-count"
                )
            ]);

            const notificacoes =
                respostaLista?.notificacoes || [];

            const total = Number(
                respostaContador?.total || 0
            );

            // Atualizar contador.
            badge.textContent =
                total > 99 ? "99+" : String(total);

            badge.hidden = total <= 0;

            // Limpar notificações anteriores.
            lista.replaceChildren();

            // Estado vazio.
            if (notificacoes.length === 0) {
                const vazio = document.createElement("div");

                vazio.className =
                    "admin-notification-empty";

                vazio.textContent =
                    "Não tens notificações.";

                lista.appendChild(vazio);

                return;
            }

            // Criar cada notificação.
            notificacoes.forEach(notificacao => {
                const item = document.createElement("button");

                item.type = "button";

                item.className =
                    "admin-notification-item";

                if (!notificacao.is_read) {
                    item.classList.add("unread");
                }

                const titulo = document.createElement("strong");

                titulo.textContent =
                    notificacao.title || "Notificação";

                const mensagem = document.createElement("p");

                mensagem.textContent =
                    notificacao.message ||
                    "Sem detalhes adicionais.";

                const data = document.createElement("small");

                data.textContent =
                    formatarData(notificacao.created_at);

                item.append(
                    titulo,
                    mensagem,
                    data
                );

                /* ============================================
                   CLIQUE NA NOTIFICAÇÃO
                   ============================================ */

                item.addEventListener("click", async () => {
                    if (item.disabled) {
                        return;
                    }

                    item.disabled = true;

                    try {
                        // Marcar como lida antes de navegar.
                        if (!notificacao.is_read) {
                            await requisitarNotificacoes(
                                `/notifications/${encodeURIComponent(
                                    notificacao.id
                                )}/read`,
                                {
                                    method: "PUT"
                                }
                            );
                        }

                        fecharMenu();

                        const tipo =
                            notificacao.entity_type ||
                            notificacao.entityType;

                        const entidade =
                            notificacao.entity_id ||
                            notificacao.entityId;

                        // Atualizar contador e lista.
                        // Se falhar a atualização, ainda tentamos
                        // abrir o destino da notificação.
                        try {
                            await carregarNotificacoes();
                        } catch (erroAtualizacao) {
                            console.error(
                                "Erro ao atualizar notificações:",
                                erroAtualizacao
                            );
                        }

                        // Abrir página correspondente.
                        abrirDestinoNotificacao(
                            tipo,
                            entidade
                        );

                    } catch (error) {
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
                "Erro ao carregar notificações:",
                error
            );

            lista.textContent =
                "Não foi possível carregar as notificações.";

        } finally {
            carregando = false;
        }
    }

    /* ========================================================
       ABRIR E FECHAR MENU
       ======================================================== */

    botao.addEventListener("click", evento => {
        evento.preventDefault();
        evento.stopPropagation();

        const vaiAbrir = dropdown.hidden;

        dropdown.hidden = !vaiAbrir;

        botao.setAttribute(
            "aria-expanded",
            String(vaiAbrir)
        );

        if (vaiAbrir) {
            carregarNotificacoes();
        }
    });

    /* ========================================================
       CLIQUES DENTRO DO MENU
       ======================================================== */

    dropdown.addEventListener("click", evento => {
        evento.stopPropagation();
    });

    /* ========================================================
       FECHAR AO CLICAR FORA
       ======================================================== */

    document.addEventListener("click", evento => {
        if (
            !dropdown.contains(evento.target) &&
            !botao.contains(evento.target)
        ) {
            fecharMenu();
        }
    });

    /* ========================================================
       MARCAR TODAS COMO LIDAS
       ======================================================== */

    if (marcarTodas) {
        marcarTodas.addEventListener(
            "click",
            async evento => {
                evento.preventDefault();
                evento.stopPropagation();

                marcarTodas.disabled = true;

                try {
                    await requisitarNotificacoes(
                        "/notifications/read-all",
                        {
                            method: "PUT"
                        }
                    );

                    await carregarNotificacoes();

                } catch (error) {
                    mostrarErro(
                        error.message ||
                        "Não foi possível marcar as notificações."
                    );

                } finally {
                    marcarTodas.disabled = false;
                }
            }
        );
    }

    /* ========================================================
       ATUALIZAÇÃO AUTOMÁTICA
       ======================================================== */

    carregarNotificacoes();

    temporizador = window.setInterval(
        carregarNotificacoes,
        30000
    );

    /* ========================================================
       LIMPEZA AO SAIR DA PÁGINA
       ======================================================== */

    window.addEventListener("pagehide", () => {
        if (temporizador !== null) {
            window.clearInterval(temporizador);
            temporizador = null;
        }
    });

})();
