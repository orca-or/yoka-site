document.addEventListener("DOMContentLoaded", async function () {

    const token = YokaAPI.obterToken();

    /*
    ============================================================
    VERIFICAR LOGIN
    ============================================================
    */

    if (!token) {
        window.location.href = "login.html";
        return;
    }


    /*
    ============================================================
    ELEMENTOS
    ============================================================
    */

    const usuarioNome =
        document.getElementById("usuarioNome");

    const nomeArtista =
        document.getElementById("nomeArtista");

    const estadoConta =
        document.getElementById("estadoConta");

    const btnSair =
        document.getElementById("btnSair");

    const listaMusicas =
        document.getElementById("listaMusicas");

    const musicasLoading =
        document.getElementById("musicasLoading");

    const semMusicas =
        document.getElementById("semMusicas");

    const erroMusicas =
        document.getElementById("erroMusicas");


    let usuario = null;


    /*
    ============================================================
    UTILIZADOR GUARDADO
    ============================================================
    */

    try {

        const salvo =
            localStorage.getItem("yoka_usuario");

        if (salvo) {

            usuario =
                JSON.parse(salvo);

        }

    } catch (erro) {

        console.error(
            "Erro ao ler utilizador:",
            erro
        );

    }


    /*
    ============================================================
    MOSTRAR UTILIZADOR
    ============================================================
    */

    if (usuario) {

        if (usuarioNome) {

            usuarioNome.textContent =
                usuario.name || "Utilizador";

        }

        if (nomeArtista) {

            nomeArtista.textContent =
                usuario.name || "Utilizador";

        }

    }


    /*
    ============================================================
    BUSCAR UTILIZADOR ATUAL
    ============================================================
    */

    try {

        const resposta =
            await YokaAPI.apiRequest(
                "/auth/me"
            );


        if (
            resposta.sucesso &&
            resposta.usuario
        ) {

            usuario =
                resposta.usuario;


            localStorage.setItem(
                "yoka_usuario",
                JSON.stringify(usuario)
            );


            if (usuarioNome) {

                usuarioNome.textContent =
                    usuario.name || "Utilizador";

            }


            if (nomeArtista) {

                nomeArtista.textContent =
                    usuario.name || "Utilizador";

            }

        }


        /*
        ========================================================
        ESTADO DA CONTA
        ========================================================
        */

        if (estadoConta) {

            const ativa =
                usuario &&
                usuario.is_active;


            estadoConta.textContent =
                ativa
                    ? "Conta ativa"
                    : "Conta desativada";


            estadoConta.style.color =
                ativa
                    ? "#16a34a"
                    : "#dc2626";

        }

    } catch (erro) {

        console.error(
            "Erro ao carregar utilizador:",
            erro
        );


        if (erro.status === 401) {

            YokaAPI.removerToken();

            localStorage.removeItem(
                "yoka_usuario"
            );

            window.location.href =
                "login.html";

            return;
        }

    }


    /*
    ============================================================
    CARREGAR MÚSICAS
    ============================================================
    */

    await carregarMinhasMusicas();


    /*
    ============================================================
    LOGOUT
    ============================================================
    */

    if (btnSair) {

        btnSair.addEventListener(
            "click",
            function () {

                YokaAPI.removerToken();

                localStorage.removeItem(
                    "yoka_usuario"
                );

                window.location.href =
                    "login.html";

            }
        );

    }


    /*
    ============================================================
    CARREGAR MINHAS MÚSICAS
    ============================================================
    */

    async function carregarMinhasMusicas() {

        console.log(
            "Dashboard: iniciando carregamento das músicas"
        );


        if (musicasLoading) {

            musicasLoading.style.display =
                "block";

            musicasLoading.textContent =
                "Carregando músicas...";

        }


        if (listaMusicas) {

            listaMusicas.innerHTML = "";

        }


        if (semMusicas) {

            semMusicas.style.display =
                "none";

        }


        if (erroMusicas) {

            erroMusicas.style.display =
                "none";

        }


        try {

            console.log(
                "Dashboard: chamando /songs/my"
            );


            const resposta =
                await YokaAPI.apiRequest(
                    "/songs/my"
                );


            console.log(
                "Dashboard: resposta:",
                resposta
            );


            if (musicasLoading) {

                musicasLoading.style.display =
                    "none";

            }


            if (!resposta.sucesso) {

                throw new Error(
                    resposta.mensagem ||
                    "Não foi possível carregar as músicas."
                );

            }


            const musicas =
                Array.isArray(
                    resposta.musicas
                )
                    ? resposta.musicas
                    : [];


            console.log(
                "Dashboard: total de músicas:",
                musicas.length
            );


            /*
            ========================================================
            NENHUMA MÚSICA
            ========================================================
            */

            if (musicas.length === 0) {

                if (semMusicas) {

                    semMusicas.style.display =
                        "block";

                }

                return;
            }


            /*
            ========================================================
            MOSTRAR MÚSICAS
            ========================================================
            */

            musicas.forEach(
                function (musica) {

                    criarCardMusica(
                        musica
                    );

                }
            );


        } catch (erro) {

            console.error(
                "Erro ao carregar músicas:",
                erro
            );


            if (musicasLoading) {

                musicasLoading.style.display =
                    "none";

            }


            if (erro.status === 401) {

                YokaAPI.removerToken();

                localStorage.removeItem(
                    "yoka_usuario"
                );

                window.location.href =
                    "login.html";

                return;
            }


            if (erroMusicas) {

                erroMusicas.style.display =
                    "block";

                erroMusicas.textContent =
                    erro.message ||
                    "Não foi possível carregar as músicas.";

            }

        }

    }


    /*
    ============================================================
    CRIAR CARD DA MÚSICA
    ============================================================
    */

    function criarCardMusica(musica) {

        if (!listaMusicas) {
            return;
        }


        const card =
            document.createElement("article");


        card.className =
            "dashboard-music-card";


        /*
        ========================================================
        CLICAR NO CARD
        ========================================================
        */

        card.style.cursor =
            "pointer";


        card.addEventListener(
            "click",
            function () {

                window.location.href =
                    "song.html?id=" +
                    encodeURIComponent(
                        musica.id
                    );

            }
        );


        /*
        ========================================================
        CAPA
        ========================================================
        */

        const cover =
            document.createElement("div");


        cover.className =
            "dashboard-music-cover";


        if (musica.cover_url) {

            const imagem =
                document.createElement("img");


            imagem.src =
                obterUrlArquivo(
                    musica.cover_url
                );


            imagem.alt =
                musica.title ||
                "Capa da música";


            imagem.loading =
                "lazy";


            cover.appendChild(
                imagem
            );

        } else {

            cover.textContent =
                "♪";

        }


        /*
        ========================================================
        INFORMAÇÕES
        ========================================================
        */

        const info =
            document.createElement("div");


        info.className =
            "dashboard-music-info";


        /*
        ========================================================
        TÍTULO
        ========================================================
        */

        const titulo =
            document.createElement("h3");


        titulo.textContent =
            musica.title ||
            "Sem título";


        info.appendChild(
            titulo
        );


        /*
        ========================================================
        GÊNERO
        ========================================================
        */

        if (musica.genre) {

            const genero =
                document.createElement("p");


            genero.textContent =
                "Gênero: " +
                musica.genre;


            info.appendChild(
                genero
            );

        }


        /*
        ========================================================
        ESTATÍSTICAS
        ========================================================
        */

        const estatisticas =
            document.createElement("div");


        estatisticas.className =
            "dashboard-music-stats";


        const plays =
            document.createElement("span");


        plays.textContent =
            "Plays: " +
            (musica.plays_count || 0);


        const likes =
            document.createElement("span");


        likes.textContent =
            "Likes: " +
            (musica.likes_count || 0);


        estatisticas.appendChild(
            plays
        );


        estatisticas.appendChild(
            likes
        );


        info.appendChild(
            estatisticas
        );


        /*
        ========================================================
        STATUS
        ========================================================
        */

        const estado =
            document.createElement("span");


        estado.className =
            "dashboard-music-status";


        estado.textContent =
            formatarStatus(
                musica.status
            );


        info.appendChild(
            estado
        );


        /*
        ========================================================
        DURAÇÃO
        ========================================================
        */

        if (
            musica.duration_seconds !== null &&
            musica.duration_seconds !== undefined
        ) {

            const duracao =
                document.createElement("span");


            duracao.className =
                "dashboard-music-duration";


            duracao.textContent =
                formatarDuracao(
                    musica.duration_seconds
                );


            info.appendChild(
                duracao
            );

        }


        /*
        ========================================================
        ÁREA DE AÇÕES
        ========================================================
        */

        const acoes =
            document.createElement("div");


        acoes.className =
            "dashboard-music-actions";


        /*
        ========================================================
        BOTÃO PUBLICAR
        ========================================================
        */

        if (
            musica.status === "draft"
        ) {

            const botaoPublicar =
                document.createElement("button");


            botaoPublicar.type =
                "button";


            botaoPublicar.className =
                "dashboard-publish-button";


            botaoPublicar.textContent =
                "Publicar";


            /*
            ----------------------------------------------------
            IMPEDIR QUE O CLIQUE ABRA song.html
            ----------------------------------------------------
            */

            botaoPublicar.addEventListener(
                "click",
                async function (event) {

                    event.preventDefault();

                    event.stopPropagation();


                    await publicarMusica(
                        musica.id,
                        botaoPublicar,
                        estado
                    );

                }
            );


            acoes.appendChild(
                botaoPublicar
            );

        }


        /*
        ========================================================
        BOTÃO ARQUIVAR
        ========================================================
        */

        if (
            musica.status === "published"
        ) {

            const botaoArquivar =
                document.createElement("button");


            botaoArquivar.type =
                "button";


            botaoArquivar.className =
                "dashboard-archive-button";


            botaoArquivar.textContent =
                "Arquivar";


            botaoArquivar.addEventListener(
                "click",
                async function (event) {

                    event.preventDefault();

                    event.stopPropagation();


                    await arquivarMusica(
                        musica.id,
                        botaoArquivar,
                        estado
                    );

                }
            );


            acoes.appendChild(
                botaoArquivar
            );

        }


        /*
        ========================================================
        ADICIONAR AÇÕES
        ========================================================
        */

        if (
            acoes.children.length > 0
        ) {

            info.appendChild(
                acoes
            );

        }


        /*
        ========================================================
        MONTAR CARD
        ========================================================
        */

        card.appendChild(
            cover
        );


        card.appendChild(
            info
        );


        listaMusicas.appendChild(
            card
        );

    }


    /*
    ============================================================
    PUBLICAR MÚSICA
    ============================================================
    */

    async function publicarMusica(
        musicaId,
        botao,
        estadoElemento
    ) {

        if (!musicaId) {

            console.error(
                "ID da música não informado."
            );

            return;

        }


        console.log(
            "Dashboard: publicando música:",
            musicaId
        );


        /*
        ========================================================
        DESATIVAR BOTÃO
        ========================================================
        */

        botao.disabled =
            true;

        botao.textContent =
            "Publicando...";


        try {

            /*
            ====================================================
            CHAMAR API
            ====================================================
            */

            const resposta =
                await YokaAPI.apiRequest(
                    `/songs/${encodeURIComponent(musicaId)}/publish`,
                    {
                        method: "POST"
                    }
                );


            console.log(
                "Dashboard: resposta publicação:",
                resposta
            );


            /*
            ====================================================
            VERIFICAR RESPOSTA
            ====================================================
            */

            if (
                !resposta ||
                !resposta.sucesso
            ) {

                throw new Error(
                    resposta?.mensagem ||
                    "Não foi possível publicar a música."
                );

            }


            /*
            ====================================================
            SUCESSO
            ====================================================
            */

            console.log(
                "Dashboard: música publicada com sucesso:",
                resposta.musica
            );


            if (estadoElemento) {

                estadoElemento.textContent =
                    "Publicada";

            }


            botao.textContent =
                "Publicada";


            botao.disabled =
                true;


            /*
            ====================================================
            RECARREGAR DASHBOARD
            ====================================================
            */

            setTimeout(
                async function () {

                    await carregarMinhasMusicas();

                },
                500
            );


        } catch (erro) {

            console.error(
                "Erro ao publicar música:",
                erro
            );


            /*
            ====================================================
            ERRO 401
            ====================================================
            */

            if (
                erro.status === 401
            ) {

                YokaAPI.removerToken();

                localStorage.removeItem(
                    "yoka_usuario"
                );

                window.location.href =
                    "login.html";

                return;

            }


            /*
            ====================================================
            RESTAURAR BOTÃO
            ====================================================
            */

            botao.disabled =
                false;

            botao.textContent =
                "Publicar";


            alert(
                erro.message ||
                "Não foi possível publicar a música."
            );

        }

    }


    /*
    ============================================================
    ARQUIVAR MÚSICA
    ============================================================
    */

    async function arquivarMusica(
        musicaId,
        botao,
        estadoElemento
    ) {

        if (!musicaId) {
            return;
        }


        const confirmar =
            window.confirm(
                "Tem certeza que deseja arquivar esta música?"
            );


        if (!confirmar) {
            return;
        }


        botao.disabled =
            true;

        botao.textContent =
            "Arquivando...";


        try {

            const resposta =
                await YokaAPI.apiRequest(
                    `/songs/${encodeURIComponent(musicaId)}/archive`,
                    {
                        method: "POST"
                    }
                );


            if (
                !resposta ||
                !resposta.sucesso
            ) {

                throw new Error(
                    resposta?.mensagem ||
                    "Não foi possível arquivar a música."
                );

            }


            console.log(
                "Dashboard: música arquivada:",
                resposta.musica
            );


            if (estadoElemento) {

                estadoElemento.textContent =
                    "Arquivada";

            }


            botao.textContent =
                "Arquivada";


            botao.disabled =
                true;


            setTimeout(
                async function () {

                    await carregarMinhasMusicas();

                },
                500
            );


        } catch (erro) {

            console.error(
                "Erro ao arquivar música:",
                erro
            );


            if (
                erro.status === 401
            ) {

                YokaAPI.removerToken();

                localStorage.removeItem(
                    "yoka_usuario"
                );

                window.location.href =
                    "login.html";

                return;

            }


            botao.disabled =
                false;

            botao.textContent =
                "Arquivar";


            alert(
                erro.message ||
                "Não foi possível arquivar a música."
            );

        }

    }


    /*
    ============================================================
    URL DOS ARQUIVOS
    ============================================================
    */

    function obterUrlArquivo(caminho) {

        if (!caminho) {
            return "";
        }


        if (
            caminho.startsWith("http://") ||
            caminho.startsWith("https://")
        ) {

            return caminho;

        }


        const origem =
            YokaAPI.API_BASE_URL.replace(
                "/api/v1",
                ""
            );


        return origem +
            caminho;

    }


    /*
    ============================================================
    FORMATAR DURAÇÃO
    ============================================================
    */

    function formatarDuracao(segundos) {

        const total =
            Number(segundos);


        if (
            !Number.isFinite(total) ||
            total < 0
        ) {

            return "0:00";

        }


        const minutos =
            Math.floor(
                total / 60
            );


        const segundosRestantes =
            Math.floor(
                total % 60
            );


        return (
            minutos +
            ":" +
            String(
                segundosRestantes
            ).padStart(
                2,
                "0"
            )
        );

    }


    /*
    ============================================================
    FORMATAR STATUS
    ============================================================
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
                return status || "Sem estado";

        }

    }

});