
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("adminSearchForm");
    const input = document.getElementById("adminSearchInput");
    const results = document.getElementById("adminSearchResults");

    if (!form || !input || !results) return;

    const API_BASE = "/api/v1";

    /*
     * CONFIGURAÇÃO DOS DETALHES
     *
     * Ajusta estes caminhos aos nomes reais das páginas
     * de detalhe existentes na pasta adm.
     */
   const PAGINA_DETALHE_ARTISTA = "./artista-detalhes.html";
const PAGINA_DETALHE_MUSICA = "./musica-detalhes.html";
    const paginas = [
        {
            nome: "Dashboard",
            descricao: "Estatísticas e administração",
            url: "./dashboard.html",
            termos: "painel inicio estatisticas"
        },
        {
            nome: "Usuários",
            descricao: "Gerir usuários",
            url: "./usuarios.html",
            termos: "contas utilizadores"
        },
        {
            nome: "Músicas",
            descricao: "Gerir músicas e publicações",
            url: "./musicas.html",
            termos: "faixas cancoes"
        },
        {
            nome: "Artistas",
            descricao: "Gerir artistas",
            url: "./artistas.html",
            termos: "cantores perfis musicais"
        },
        {
            nome: "Comentários",
            descricao: "Moderar comentários",
            url: "./comentarios.html",
            termos: "denuncias moderacao"
        },
        {
            nome: "Notificações",
            descricao: "Gerir notificações",
            url: "./notificacoes.html",
            termos: "avisos mensagens"
        }
    ];

    let artistas = [];
    let musicas = [];

    let dadosCarregados = false;
    let carregamento = null;
    let ultimaPesquisa = 0;

    function obterToken() {
        return (
            localStorage.getItem("yoka_token") ||
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken") ||
            localStorage.getItem("access_token")
        );
    }

    async function apiFetch(url) {
        const token = obterToken();

        if (!token) {
            throw new Error(
                "Sessão administrativa não encontrada."
            );
        }

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        let dados = {};

        try {
            dados = await response.json();
        } catch {
            // Resposta sem JSON.
        }

        if (!response.ok) {
            throw new Error(
                dados.mensagem ||
                dados.message ||
                "Não foi possível consultar os dados."
            );
        }

        return dados;
    }

    async function carregarDados() {
        if (dadosCarregados) return;

        if (carregamento) {
            return carregamento;
        }

        carregamento = (async () => {
            const respostas = await Promise.all([
                apiFetch(`${API_BASE}/admin/artists`),
                apiFetch(`${API_BASE}/admin/songs`)
            ]);

            artistas = Array.isArray(respostas[0].artistas)
                ? respostas[0].artistas
                : [];

            musicas = Array.isArray(respostas[1].musicas)
                ? respostas[1].musicas
                : [];

            dadosCarregados = true;
        })();

        try {
            await carregamento;
        } finally {
            carregamento = null;
        }
    }

    function normalizar(valor) {
        return String(valor || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLocaleLowerCase("pt")
            .trim();
    }

    /*
     * Construir o endereço do detalhe do artista.
     * O ID pode estar no próprio registo ou no objeto user.
     */
    function obterUrlArtista(artista) {
        const id =
            artista.id ||
            artista.artist_id ||
            artista.artistId ||
            artista.user_id ||
            artista.userId ||
            artista.user?.id;

        if (!id) return "./artistas.html";

        return `${PAGINA_DETALHE_ARTISTA}?id=${encodeURIComponent(id)}`;
    }

    /*
     * Construir o endereço do detalhe da música.
     */
    function obterUrlMusica(musica) {
        const id =
            musica.id ||
            musica.song_id ||
            musica.songId;

        if (!id) return "./musicas.html";

        return `${PAGINA_DETALHE_MUSICA}?id=${encodeURIComponent(id)}`;
    }

    function criarResultado(nome, descricao, url) {
        const link = document.createElement("a");

        link.className = "admin-search-result";
        link.href = url;

        const titulo = document.createElement("strong");
        titulo.textContent = nome;

        const detalhe = document.createElement("small");
        detalhe.textContent = descricao;

        link.append(titulo, detalhe);

        return link;
    }

    function mostrarResultados(termo) {
        results.replaceChildren();

        const consulta = normalizar(termo);

        if (!consulta) {
            results.hidden = true;
            return;
        }

        const encontrados = [];

        // Secções administrativas.
        paginas.forEach(pagina => {
            const texto = normalizar(
                `${pagina.nome} ${pagina.descricao} ${pagina.termos}`
            );

            if (texto.includes(consulta)) {
                encontrados.push({
                    nome: pagina.nome,
                    descricao: pagina.descricao,
                    url: pagina.url
                });
            }
        });

        // Artistas reais.
        artistas.forEach(artista => {
            const nome =
                artista.artist_name ||
                artista.artistName ||
                "";

            const nomeUsuario =
                artista.user_name ||
                artista.userName ||
                artista.name ||
                "";

            const email =
                artista.user_email ||
                artista.userEmail ||
                artista.email ||
                "";

            const texto = normalizar(
                `${nome} ${nomeUsuario} ${email}`
            );

            if (texto.includes(consulta)) {
                encontrados.push({
                    nome: nome || nomeUsuario || "Artista",
                    descricao:
                        nomeUsuario && nomeUsuario !== nome
                            ? `Artista · ${nomeUsuario}`
                            : "Artista registado na Yoka",
                    url: obterUrlArtista(artista)
                });
            }
        });

        // Músicas reais.
        musicas.forEach(musica => {
            const titulo =
                musica.title ||
                musica.titulo ||
                musica.name ||
                "Música sem título";

            const nomeArtista =
                musica.artist_name ||
                musica.artistName ||
                musica.artist ||
                "";

            const texto = normalizar(
                `${titulo} ${nomeArtista}`
            );

            if (texto.includes(consulta)) {
                encontrados.push({
                    nome: titulo,
                    descricao: nomeArtista
                        ? `Música · ${nomeArtista}`
                        : "Música registada na Yoka",
                    url: obterUrlMusica(musica)
                });
            }
        });

        if (encontrados.length === 0) {
            const vazio = document.createElement("div");

            vazio.className = "admin-search-empty";
            vazio.textContent =
                "Nenhum artista, música ou secção encontrada.";

            results.appendChild(vazio);
            results.hidden = false;
            return;
        }

        encontrados.slice(0, 30).forEach(item => {
            results.appendChild(
                criarResultado(
                    item.nome,
                    item.descricao,
                    item.url
                )
            );
        });

        results.hidden = false;
    }

    async function pesquisar() {
        const termo = input.value.trim();
        const pesquisaAtual = ++ultimaPesquisa;

        if (!termo) {
            results.hidden = true;
            results.replaceChildren();
            return;
        }

        mostrarResultados(termo);

        try {
            await carregarDados();

            if (pesquisaAtual !== ultimaPesquisa) return;

            mostrarResultados(input.value);
        } catch (error) {
            console.error(
                "Erro na pesquisa administrativa:",
                error
            );

            if (pesquisaAtual !== ultimaPesquisa) return;

            results.replaceChildren();

            const aviso = document.createElement("div");

            aviso.className = "admin-search-empty";
            aviso.textContent =
                "Não foi possível pesquisar artistas e músicas. Verifica a sessão e tenta novamente.";

            results.appendChild(aviso);
            results.hidden = false;
        }
    }

    input.addEventListener("input", pesquisar);

    form.addEventListener("submit", event => {
        event.preventDefault();
        pesquisar();
    });

    document.addEventListener("click", event => {
        if (!form.parentElement.contains(event.target)) {
            results.hidden = true;
        }
    });

    input.addEventListener("focus", () => {
        if (input.value.trim()) {
            pesquisar();
        }
    });
});
