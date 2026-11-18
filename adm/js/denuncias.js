
"use strict";

(() => {
    const API_BASE = "https://wairujyynjohterkqort.supabase.co/functions/v1/yoka";

    const lista = document.getElementById("reportsList");
    const mensagem = document.getElementById("reportsMessage");
    const filtro = document.getElementById("reportsStatusFilter");
    const botaoAtualizar = document.getElementById("btnAtualizarDenuncias");

    let carregando = false;

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
            throw new Error("A sessão expirou.");
        }

        if (!resposta.ok) {
            throw new Error(
                dados?.mensagem ||
                `Erro do servidor (${resposta.status}).`
            );
        }

        return dados;
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

    function nomeMotivo(motivo) {
        const motivos = {
            copyright: "Direitos de autor",
            inappropriate: "Conteúdo inadequado",
            violence: "Violência",
            spam: "Spam",
            other: "Outro motivo"
        };

        return motivos[motivo] || motivo || "Não especificado";
    }

    function nomeEstado(estado) {
        const estados = {
            pending: "Pendente",
            reviewing: "Em análise",
            resolved: "Resolvida",
            rejected: "Rejeitada"
        };

        return estados[estado] || estado || "Desconhecido";
    }

    function mostrarMensagem(texto, erro = false) {
        mensagem.textContent = texto;
        mensagem.hidden = !texto;
        mensagem.className = erro
            ? "mensagem erro"
            : "mensagem";
    }

    function mostrarEstadoLista(texto, erro = false) {
        mensagem.hidden = true;
        lista.replaceChildren();

        const aviso = document.createElement("p");
        aviso.className = "reports-message";
        aviso.textContent = texto;

        if (erro) aviso.classList.add("error");

        lista.appendChild(aviso);
    }

    function criarCard(denuncia) {
        const card = document.createElement("article");
        card.className = "report-card";
        card.dataset.reportId = String(denuncia.id);

        const topo = document.createElement("div");
        topo.className = "report-top";

        const tituloArea = document.createElement("div");
        const titulo = document.createElement("h4");
        titulo.textContent = denuncia.song_title || "Música sem título";

        const motivo = document.createElement("p");
        motivo.textContent = `Motivo: ${nomeMotivo(denuncia.reason)}`;

        tituloArea.append(titulo, motivo);

        const estado = document.createElement("span");
        estado.className = "report-status";
        estado.textContent = nomeEstado(denuncia.status);

        topo.append(tituloArea, estado);
        card.appendChild(topo);

        const meta = document.createElement("div");
        meta.className = "report-meta";

        [
            ["Artista", denuncia.artist_name],
            ["Denunciante", denuncia.reporter_name],
            ["E-mail", denuncia.reporter_email],
            ["Recebida em", formatarData(denuncia.created_at)]
        ].forEach(([rotulo, valor]) => {
            const linha = document.createElement("div");
            linha.textContent = `${rotulo}: ${valor || "Não disponível"}`;
            meta.appendChild(linha);
        });

        card.appendChild(meta);

        if (denuncia.description) {
            const descricao = document.createElement("p");
            descricao.className = "report-description";
            descricao.textContent = `Descrição: ${denuncia.description}`;
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
                mostrarMensagem("Seleciona um estado diferente do atual.", true);
                return;
            }

            if (!window.confirm(
                `Alterar o estado para "${nomeEstado(novoEstado)}"?`
            )) {
                return;
            }

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

                mostrarMensagem("Estado da denúncia atualizado.");
                await carregarDenuncias();
            } catch (error) {
                mostrarMensagem(error.message, true);
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

    async function carregarDenuncias() {
        if (carregando) return;

        carregando = true;
        botaoAtualizar.disabled = true;
        filtro.disabled = true;

        mostrarEstadoLista("A carregar denúncias...");

        try {
            const estado = filtro.value;
            const query = estado
                ? `?status=${encodeURIComponent(estado)}`
                : "";

            const resposta = await requisicao(`/admin/reports${query}`);
            const denuncias = resposta?.denuncias || [];

            lista.replaceChildren();

            if (denuncias.length === 0) {
                mostrarEstadoLista("Não existem denúncias para este filtro.");
                return;
            }

            denuncias.forEach(denuncia => {
                lista.appendChild(criarCard(denuncia));
            });

            abrirDenunciaDaUrl();
        } catch (error) {
            console.error("Erro ao carregar denúncias:", error);
            mostrarEstadoLista(
                error.message || "Não foi possível carregar as denúncias.",
                true
            );
        } finally {
            carregando = false;
            botaoAtualizar.disabled = false;
            filtro.disabled = false;
        }
    }

    function abrirDenunciaDaUrl() {
        const reportId = new URLSearchParams(window.location.search)
            .get("reportId");

        if (!reportId) return;

        const card = Array.from(
            lista.querySelectorAll(".report-card")
        ).find(item => item.dataset.reportId === reportId);

        if (!card) {
            mostrarMensagem(
                "A denúncia indicada não está nesta lista. Verifica o filtro ou as tuas permissões.",
                true
            );
            return;
        }

        card.classList.add("report-highlight");
        card.scrollIntoView({ behavior: "smooth", block: "center" });

        setTimeout(() => {
            card.classList.remove("report-highlight");
        }, 6000);
    }

    filtro.addEventListener("change", carregarDenuncias);
    botaoAtualizar.addEventListener("click", carregarDenuncias);

    async function iniciar() {
        try {
            const resposta = await requisicao("/auth/me");
            const usuario = resposta?.usuario || resposta?.user;

            const nome = document.getElementById("adminName");

            if (nome && usuario) {
                nome.textContent =
                    usuario.name || usuario.nome || "Administrador";
            }

            await carregarDenuncias();
        } catch (error) {
            console.error("Erro ao iniciar página de denúncias:", error);

            if (!mensagem.textContent) {
                mostrarMensagem(error.message, true);
            }
        }
    }

    iniciar();
})();
