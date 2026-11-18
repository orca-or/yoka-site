document.addEventListener("DOMContentLoaded", async function () {

    console.log("Yoka: página da música iniciada");

    /* ============================================================
       ELEMENTOS PRINCIPAIS
    ============================================================ */

    const postDate =
        document.getElementById("songPostDate");

    const loading =
        document.getElementById("songLoading");

    const errorBox =
        document.getElementById("songError");

    const content =
        document.getElementById("songContent");

    const cover =
        document.getElementById("songCover");

        const songAd =
    document.getElementById("songAd");

    const title =
        document.getElementById("songTitle");

    const artist =
        document.getElementById("songArtist");

    const genre =
        document.getElementById("songGenre");

    const description =
        document.getElementById("songDescription");

    const plays =
        document.getElementById("songPlays");

    const likes =
        document.getElementById("songLikes");

    const audio =
        document.getElementById("songAudio");

    const status =
        document.getElementById("songStatus");

    const likeButton =
        document.getElementById("songLikeButton");

    const likeIcon =
        document.getElementById("songLikeIcon");


    /* ============================================================
       SEGUIR ARTISTA
    ============================================================ */

    const followButton =
        document.getElementById("songFollowButton");

    const followText =
        followButton?.querySelector(
            ".song-follow-text"
        );

    const followIcon =
        followButton?.querySelector(
            ".song-follow-icon"
        );

    const followersCounter =
        document.getElementById("artistFollowersCount") ||
        document.getElementById("songFollowersCount") ||
        document.getElementById("followersCount") ||
        document.querySelector(
            "[data-followers-count]"
        );

    let artistaSeguido = false;


    /* ============================================================
       COMENTÁRIOS
    ============================================================ */

    const commentInput =
        document.getElementById("commentInput");

    const commentSubmit =
        document.getElementById("commentSubmit");

    const commentsLoading =
        document.getElementById("commentsLoading");

    const commentsError =
        document.getElementById("commentsError");

    const commentsList =
        document.getElementById("commentsList");

    const commentsCount =
        document.getElementById("commentsCount");


    /* ============================================================
       FAVORITOS
    ============================================================ */

    const favoriteButton =
        document.getElementById(
            "songFavoriteButton"
        );

    const favoriteIcon =
        favoriteButton?.querySelector(
            ".song-favorite-icon"
        );

    const favoriteText =
        favoriteButton?.querySelector(
            "span:last-child"
        );

    let musicaFavorita = false;


    /* ============================================================
       URL
    ============================================================ */

    const parametros =
        new URLSearchParams(
            window.location.search
        );

    const songId =
        parametros.get("id");


    /* ============================================================
       DENUNCIAR MÚSICA — FORMULÁRIO E ENVIO À API
       Endpoint esperado: POST /songs/:id/reports
    ============================================================ */

    function iniciarDenunciaMusica() {

        const reportButton =
            document.getElementById("songReportButton");

        if (!reportButton || !songId) {
            return;
        }

        // Evita duplicar o formulário caso a inicialização seja repetida.
        if (document.getElementById("songReportModal")) {
            return;
        }

        const estilos = document.createElement("style");

        estilos.textContent = `
            .song-report-overlay {
                position: fixed;
                inset: 0;
                z-index: 99999;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 20px;
                background: rgba(0, 0, 0, .72);
            }
            .song-report-overlay.ativo { display: flex; }
            .song-report-modal {
                width: 100%;
                max-width: 480px;
                max-height: calc(100vh - 40px);
                overflow-y: auto;
                box-sizing: border-box;
                padding: 24px;
                border: 1px solid #333;
                border-radius: 14px;
                background: #181818;
                color: #fff;
                box-shadow: 0 15px 50px rgba(0,0,0,.4);
            }
            .song-report-modal h2 {
                margin: 0 0 8px;
                font-size: 21px;
            }
            .song-report-description {
                margin: 0 0 20px;
                color: #bbb;
                font-size: 14px;
                line-height: 1.5;
            }
            .song-report-modal label {
                display: block;
                margin: 14px 0 7px;
                font-size: 14px;
                font-weight: 600;
            }
            .song-report-modal select,
            .song-report-modal textarea {
                display: block;
                width: 100%;
                box-sizing: border-box;
                padding: 11px;
                border: 1px solid #444;
                border-radius: 8px;
                background: #222;
                color: #fff;
                font: inherit;
            }
            .song-report-modal textarea {
                min-height: 100px;
                resize: vertical;
            }
            .song-report-buttons {
                display: flex;
                justify-content: flex-end;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 20px;
            }
            .song-report-buttons button {
                padding: 10px 15px;
                border: 0;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
            }
            .song-report-cancel { background: #333; color: #fff; }
            .song-report-submit { background: #0a0a0a; color: #fff; }
            .song-report-submit:disabled { opacity: .6; cursor: wait; }
            .song-report-message {
                margin-top: 14px;
                font-size: 14px;
                line-height: 1.5;
            }
            @media (max-width: 480px) {
                .song-report-modal { padding: 18px; }
            }
        `;

        document.head.appendChild(estilos);

        const overlay = document.createElement("div");
        overlay.id = "songReportModal";
        overlay.className = "song-report-overlay";

        overlay.innerHTML = `
            <section class="song-report-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="songReportTitle">
                <h2 id="songReportTitle">Denunciar música</h2>
                <p class="song-report-description">
                    Ajuda-nos a manter a Yoka segura. Seleciona o motivo da denúncia.
                </p>
                <form id="songReportForm">
                    <label for="songReportReason">Motivo da denúncia</label>
                    <select id="songReportReason" name="reason" required>
                        <option value="">Seleciona um motivo</option>
                        <option value="copyright">Direitos de autor</option>
                        <option value="inappropriate">Conteúdo impróprio</option>
                        <option value="violence">Violência ou ameaças</option>
                        <option value="spam">Spam ou fraude</option>
                        <option value="other">Outro motivo</option>
                    </select>
                    <label for="songReportDescription">Descrição (opcional)</label>
                    <textarea id="songReportDescription" name="description"
                        maxlength="1000"
                        placeholder="Explica o problema, se necessário..."></textarea>
                    <div id="songReportMessage" class="song-report-message"
                        role="status" aria-live="polite"></div>
                    <div class="song-report-buttons">
                        <button type="button" id="songReportCancel"
                            class="song-report-cancel">Cancelar</button>
                        <button type="submit" id="songReportSubmit"
                            class="song-report-submit">Enviar denúncia</button>
                    </div>
                </form>
            </section>
        `;

        document.body.appendChild(overlay);

        const form = document.getElementById("songReportForm");
        const cancelButton = document.getElementById("songReportCancel");
        const submitButton = document.getElementById("songReportSubmit");
        const reasonInput = document.getElementById("songReportReason");
        const descriptionInput = document.getElementById("songReportDescription");
        const message = document.getElementById("songReportMessage");

        function obterTokenDenuncia() {
            try {
                if (typeof YokaAPI !== "undefined" &&
                    typeof YokaAPI.obterToken === "function") {
                    const token = YokaAPI.obterToken();
                    if (token) return token;
                }
            } catch (erro) {
                console.warn("Yoka: não foi possível obter token pela API.", erro);
            }

            return localStorage.getItem("yoka_token") ||
                localStorage.getItem("token") ||
                localStorage.getItem("accessToken") ||
                localStorage.getItem("access_token");
        }

        function abrirFormulario() {
            message.textContent = "";
            message.style.color = "";
            overlay.classList.add("ativo");
            reasonInput.focus();
        }

        function fecharFormulario() {
            if (submitButton.disabled) return;
            overlay.classList.remove("ativo");
            reportButton.focus();
        }

        reportButton.addEventListener("click", function () {
            if (!obterTokenDenuncia()) {
                abrirFormulario();
                message.style.color = "#ffcc80";
                message.textContent = "Inicia sessão na Yoka antes de enviar uma denúncia.";
                return;
            }
            abrirFormulario();
        });

        cancelButton.addEventListener("click", fecharFormulario);

        overlay.addEventListener("click", function (evento) {
            if (evento.target === overlay) fecharFormulario();
        });

        document.addEventListener("keydown", function (evento) {
            if (evento.key === "Escape" && overlay.classList.contains("ativo")) {
                fecharFormulario();
            }
        });

        form.addEventListener("submit", async function (evento) {
            evento.preventDefault();

            const token = obterTokenDenuncia();
            if (!token) {
                message.style.color = "#ffcc80";
                message.textContent = "Inicia sessão na Yoka para enviar a denúncia.";
                return;
            }

            const reason = reasonInput.value;
            const descriptionText = descriptionInput.value.trim();

            if (!reason) {
                message.style.color = "#ff8a80";
                message.textContent = "Seleciona o motivo da denúncia.";
                reasonInput.focus();
                return;
            }

            if (typeof YokaAPI === "undefined" ||
                typeof YokaAPI.apiRequest !== "function") {
                message.style.color = "#ff8a80";
                message.textContent = "A API da Yoka não está disponível. Atualiza a página e tenta novamente.";
                return;
            }

            submitButton.disabled = true;
            cancelButton.disabled = true;
            submitButton.textContent = "A enviar...";
            message.textContent = "";

            try {
                const resposta = await YokaAPI.apiRequest(
                    "/songs/" + encodeURIComponent(songId) + "/reports",
                    {
                        method: "POST",
                        body: JSON.stringify({
                            reason: reason,
                            description: descriptionText
                        })
                    }
                );

                if (resposta && resposta.sucesso === false) {
                    throw new Error(resposta.mensagem || resposta.message || "Não foi possível registar a denúncia.");
                }

                message.style.color = "#81c784";
                message.textContent = "Denúncia enviada com sucesso. Obrigado por ajudar a Yoka.";
                form.reset();
                submitButton.textContent = "Enviada";

window.setTimeout(function () {
    overlay.classList.remove("ativo");
    reportButton.focus();
    submitButton.disabled = false;
    cancelButton.disabled = false;
    submitButton.textContent = "Enviar denúncia";
    message.textContent = "";
    message.style.color = "";
}, 10000);

            } catch (erro) {
                console.error("Yoka: erro ao enviar denúncia:", erro);
                message.style.color = "#ff8a80";
                message.textContent = erro.message || "Não foi possível enviar a denúncia. Tenta novamente.";
                submitButton.disabled = false;
                cancelButton.disabled = false;
                submitButton.textContent = "Enviar denúncia";
            }
        });
    }

    iniciarDenunciaMusica();


const comentarioDestino =
    parametros.get("comment");

const respostaDestino =
    parametros.get("reply");



const deveTocarAutomaticamente =
    parametros.get("autoplay") !== "0";

    console.log(
        "Yoka: ID da música:",
        songId
    );

    console.log(
        "Yoka: autoplay:",
        deveTocarAutomaticamente
    );


    if (!songId) {

        mostrarErro(
            "ID da música não informado."
        );

        return;
    }


    /* ============================================================
       DADOS DA MÚSICA
    ============================================================ */

    let musica = null;


    try {

        const resposta =
            await YokaAPI.apiRequest(
                "/songs/" +
                encodeURIComponent(songId)
            );


        console.log(
            "Yoka: resposta da música:",
            resposta
        );


        if (
            !resposta ||
            !resposta.sucesso ||
            !resposta.musica
        ) {

            throw new Error(
                resposta?.mensagem ||
                "Música não encontrada."
            );
        }


        musica =
            resposta.musica;


        console.log(
            "Yoka: música carregada:",
            musica
        );


        /* ========================================================
           TÍTULO
        ======================================================== */

        if (title) {

            title.textContent =
                musica.title ||
                musica.titulo ||
                "Sem título";
        }


        /* ========================================================
           ARTISTA
        ======================================================== */

        if (artist) {

            artist.textContent =
                musica.artist_name ||
                musica.artistName ||
                musica.artist ||
                "Artista";
        }

const songArtistLink =
    document.getElementById("songArtistLink");

const artistId =
    musica.artist_id ||
    musica.artistId ||
    "";

if (songArtistLink && artistId) {

    songArtistLink.href =
        `./artist.html?id=${encodeURIComponent(artistId)}`;
}
/* ========================================================
   DATA DE PUBLICAÇÃO
======================================================== */

const songPublicationDate =
    document.getElementById("songPublicationDate");

if (songPublicationDate) {

    songPublicationDate.textContent =
        formatarDataPublicacao(
            musica.published_at ||
            musica.created_at
        );
}
        /* ========================================================
           GÊNERO
        ======================================================== */

        if (genre) {

            genre.textContent =
                musica.genre
                    ? "Gênero: " +
                      musica.genre
                    : "";
        }


        /* ========================================================
           DESCRIÇÃO
        ======================================================== */

        if (description) {

            description.textContent =
                musica.description ||
                "";
        }


        /* ========================================================
           DATA
        ======================================================== */

        if (postDate) {

            postDate.textContent =
                musica.created_at
                    ? "Publicado em " +
                      formatarDataPost(
                          musica.created_at
                      )
                    : "";
        }


        /* ========================================================
           REPRODUÇÕES
        ======================================================== */

        if (plays) {

            plays.textContent =
                "Reproduções: " +
                Number(
                    musica.plays_count ||
                    musica.plays ||
                    0
                );
        }


        /* ========================================================
           CURTIDAS
        ======================================================== */

        if (likes) {

            likes.textContent =
                Number(
                    musica.likes_count ||
                    musica.likes ||
                    0
                );
        }


        /* ========================================================
           SEGUIDORES INICIAL
        ======================================================== */

        atualizarContadorSeguidores(
            musica.followers_count ??
            musica.followers ??
            musica.seguidores ??
            null
        );


        /* ========================================================
           STATUS
        ======================================================== */

        if (status) {

            status.textContent =
                formatarStatus(
                    musica.status
                );
        }


        /* ========================================================
           CAPA
        ======================================================== */

        if (cover) {

            if (musica.cover_url) {

                cover.src =
                    obterUrlArquivo(
                        musica.cover_url
                    );

            } else {

                cover.src =
                    "/assets/images/default-cover.jpg";
            }


            cover.style.display =
                "";
        }


        /* ========================================================
           ÁUDIO
        ======================================================== */
        if (
            audio &&
            musica.audio_url
        ) {

            const urlAudio =
                obterUrlArquivo(
                    musica.audio_url
                );


            console.log(
                "Yoka: URL do áudio:",
                urlAudio
            );


            audio.src =
                urlAudio;

            audio.preload =
                "auto";

            audio.load();

        } else {

            console.warn(
                "Yoka: música sem audio_url."
            );
        }
        /* ========================================================
           MOSTRAR CONTEÚDO
        ======================================================== */

        if (loading) {

            loading.style.display =
                "none";
        }


        if (errorBox) {

            errorBox.style.display =
                "none";
        }


        if (content) {

            content.style.display =
                "flex";
        }


    } catch (erro) {

        console.error(
            "Yoka: erro ao carregar música:",
            erro
        );


        mostrarErro(
            erro.message ||
            "Não foi possível carregar a música."
        );

        return;
    }


    /* ============================================================
       UTILIZADOR ATUAL
    ============================================================ */

    function obterUsuarioAtual() {

        try {

            const token =
                YokaAPI.obterToken();


            if (!token) {

                return null;
            }


            const partes =
                token.split(".");


            if (
                partes.length !== 3
            ) {

                return null;
            }


            let base64 =
                partes[1]
                    .replace(/-/g, "+")
                    .replace(/_/g, "/");


            while (
                base64.length % 4 !== 0
            ) {

                base64 += "=";
            }


            const payload =
                JSON.parse(
                    atob(base64)
                );


            if (!payload?.sub) {

                return null;
            }


            return {

                id:
                    payload.sub

            };


        } catch (erro) {

            console.error(
                "Yoka: erro ao obter utilizador:",
                erro
            );


            return null;
        }
    }


    /* ============================================================
       ARTIST ID
    ============================================================ */

    function obterArtistId() {

        return (
            musica?.artist_id ||
            musica?.artistId ||
            null
        );
    }


    /* ============================================================
       ARTIST USER ID
    ============================================================ */

    function obterArtistUserId() {

        return (
            musica?.artist_user_id ||
            musica?.artistUserId ||
            musica?.user_id ||
            musica?.userId ||
            null
        );
    }


    /* ============================================================
       VERIFICAR SE É O PRÓPRIO ARTISTA
    ============================================================ */

    function souOProprioArtista() {

        const artistUserId =
            obterArtistUserId();

        const usuarioAtual =
            obterUsuarioAtual();


        if (
            !artistUserId ||
            !usuarioAtual?.id
        ) {

            return false;
        }


        return (
            String(usuarioAtual.id) ===
            String(artistUserId)
        );
    }


    /* ============================================================
       CONTADOR DE SEGUIDORES
    ============================================================ */

    function atualizarContadorSeguidores(
        quantidade
    ) {

        if (
            quantidade === null ||
            quantidade === undefined
        ) {

            return;
        }


        const numero =
            Number(quantidade);


        if (
            !Number.isFinite(numero)
        ) {

            return;
        }


        if (followersCounter) {

            followersCounter.textContent =
                numero;
        }


        document
            .querySelectorAll(
                "[data-followers-count]"
            )
            .forEach(
                elemento => {

                    elemento.textContent =
                        numero;
                }
            );


        document
            .querySelectorAll(
                ".artist-followers-count, .song-followers-count"
            )
            .forEach(
                elemento => {

                    elemento.textContent =
                        numero;
                }
            );
    }


    /* ============================================================
       CARREGAR CONTADOR PÚBLICO
    ============================================================ */

    async function carregarContadoresSeguidores() {

        const artistId =
            obterArtistId();


        if (!artistId) {

            console.warn(
                "Yoka: artist_id não encontrado."
            );

            return;
        }


        try {

            const resposta =
                await YokaAPI.apiRequest(
                    "/artists/" +
                    encodeURIComponent(
                        artistId
                    ) +
                    "/followers"
                );


            console.log(
                "Yoka: contador de seguidores:",
                resposta
            );


            if (
                resposta &&
                resposta.sucesso &&
                resposta.seguidores !== undefined
            ) {

                atualizarContadorSeguidores(
                    resposta.seguidores
                );
            }


        } catch (erro) {

            console.error(
                "Yoka: erro ao carregar seguidores:",
                erro
            );
        }
    }


    /* ============================================================
       ATUALIZAR BOTÃO SEGUIR
    ============================================================ */

    function atualizarBotaoSeguir(
        seguindo = false,
        seguidores = null
    ) {

        artistaSeguido =
            seguindo === true;


        if (
            seguidores !== null &&
            seguidores !== undefined
        ) {

            atualizarContadorSeguidores(
                seguidores
            );
        }


        if (!followButton) {

            return;
        }


        /* ========================================================
           DONO
        ======================================================== */

        if (souOProprioArtista()) {

            followButton.hidden =
                true;

            followButton.style.display =
                "none";

            return;
        }


        /* ========================================================
           MOSTRAR
        ======================================================== */

        followButton.hidden =
            false;

        followButton.style.display =
            "";


        if (followText) {

            followText.textContent =
                artistaSeguido
                    ? "Seguindo"
                    : "Seguir";
        }


        if (followIcon) {

            followIcon.textContent =
                artistaSeguido
                    ? "✓"
                    : "+";
        }


        followButton.classList.toggle(
            "seguindo",
            artistaSeguido
        );


        followButton.setAttribute(
            "aria-pressed",
            artistaSeguido
                ? "true"
                : "false"
        );


        followButton.setAttribute(
            "aria-label",
            artistaSeguido
                ? "Deixar de seguir artista"
                : "Seguir artista"
        );
    }


    /* ============================================================
       PREPARAR BOTÃO SEGUIR
    ============================================================ */

    function prepararBotaoSeguir() {

        if (!followButton) {

            return;
        }


        if (souOProprioArtista()) {

            followButton.hidden =
                true;

            followButton.style.display =
                "none";

            return;
        }


        followButton.hidden =
            false;

        followButton.style.display =
            "";


        atualizarBotaoSeguir(
            false
        );
    }


    /* ============================================================
       VERIFICAR FOLLOW
    ============================================================ */

    async function verificarSeguindoArtista() {

        const artistId =
            obterArtistId();


        if (!artistId) {

            return;
        }


        await carregarContadoresSeguidores();


        if (souOProprioArtista()) {

            if (followButton) {

                followButton.hidden =
                    true;

                followButton.style.display =
                    "none";
            }

            return;
        }


        if (!followButton) {

            return;
        }


        const usuarioAtual =
            obterUsuarioAtual();


        if (!usuarioAtual) {

            atualizarBotaoSeguir(
                false
            );

            return;
        }


        try {

            const resposta =
                await YokaAPI.apiRequest(
                    "/artists/" +
                    encodeURIComponent(
                        artistId
                    ) +
                    "/follow"
                );


            console.log(
                "Yoka: estado do follow:",
                resposta
            );


            if (
                resposta &&
                resposta.sucesso
            ) {

                atualizarBotaoSeguir(
                    resposta.seguindo === true,
                    resposta.seguidores
                );

            } else {

                atualizarBotaoSeguir(
                    false
                );
            }


        } catch (erro) {

            console.error(
                "Yoka: erro ao verificar follow:",
                erro
            );


            atualizarBotaoSeguir(
                false
            );
        }
    }


    /* ============================================================
       CLICK SEGUIR
    ============================================================ */

    if (followButton) {

        followButton.addEventListener(
            "click",
            async function () {

                if (
                    souOProprioArtista()
                ) {

                    followButton.hidden =
                        true;

                    followButton.style.display =
                        "none";

                    return;
                }


                const usuarioAtual =
                    obterUsuarioAtual();


                if (!usuarioAtual) {

                    alert(
                        "Faça login para seguir este artista."
                    );

                    return;
                }


                const artistId =
                    obterArtistId();


                if (!artistId) {

                    alert(
                        "Não foi possível identificar o artista."
                    );

                    return;
                }


                if (
                    followButton.disabled
                ) {

                    return;
                }


                followButton.disabled =
                    true;


                const estadoAnterior =
                    artistaSeguido;


                try {

                    const endpoint =
                        "/artists/" +
                        encodeURIComponent(
                            artistId
                        ) +
                        "/follow";


                    const resposta =
                        await YokaAPI.apiRequest(
                            endpoint,
                            {
                                method:
                                    estadoAnterior
                                        ? "DELETE"
                                        : "POST"
                            }
                        );


                    console.log(
                        "Yoka: resposta follow:",
                        resposta
                    );


                    if (
                        !resposta ||
                        !resposta.sucesso
                    ) {

                        throw new Error(
                            resposta?.mensagem ||
                            "Não foi possível alterar o seguimento."
                        );
                    }


                    atualizarBotaoSeguir(
                        resposta.seguindo === true,
                        resposta.seguidores
                    );


                } catch (erro) {

                    console.error(
                        "Yoka: erro ao alterar follow:",
                        erro
                    );


                    atualizarBotaoSeguir(
                        estadoAnterior
                    );


                    alert(
                        erro.message ||
                        "Não foi possível alterar o seguimento."
                    );


                } finally {

                    followButton.disabled =
                        false;
                }
            }
        );
    }


    /* ============================================================
       INICIALIZAR FOLLOW
    ============================================================ */

    prepararBotaoSeguir();

    await verificarSeguindoArtista();


    /* ============================================================
       PLAYER
    ============================================================ */

    iniciarPlayerYoka();


    /* ============================================================
       AUTOPLAY
    ============================================================ */

    if (
        deveTocarAutomaticamente &&
        audio &&
        audio.src
    ) {

        iniciarAutoplay();
    }


    /* ============================================================
       CURTIDA DA MÚSICA
    ============================================================ */

    let musicaCurtida = false;


    function atualizarBotaoMusica(
        curtida
    ) {

        musicaCurtida =
            curtida === true;


        if (!likeButton) {

            return;
        }


        if (likeIcon) {

            likeIcon.textContent =
                musicaCurtida
                    ? "♥"
                    : "♡";
        }


        likeButton.classList.toggle(
            "curtido",
            musicaCurtida
        );


        likeButton.setAttribute(
            "aria-pressed",
            musicaCurtida
                ? "true"
                : "false"
        );
    }


    async function verificarCurtidaMusica() {

        if (!likeButton) {

            return;
        }


        if (!YokaAPI.obterToken()) {

            atualizarBotaoMusica(
                false
            );

            return;
        }


        try {

            const resposta =
                await YokaAPI.apiRequest(
                    "/songs/" +
                    encodeURIComponent(songId) +
                    "/like"
                );


            if (
                resposta &&
                resposta.sucesso
            ) {

                atualizarBotaoMusica(
                    resposta.curtiu === true
                );


                if (
                    likes &&
                    resposta.likes_count !== undefined
                ) {

                    likes.textContent =
                        resposta.likes_count;
                }
            }


        } catch (erro) {

            console.error(
                "Yoka: erro ao verificar curtida:",
                erro
            );
        }
    }


    if (likeButton) {

        likeButton.addEventListener(
            "click",
            async function () {

                if (!YokaAPI.obterToken()) {

                    alert(
                        "Faça login para curtir esta música."
                    );

                    return;
                }


                if (
                    likeButton.disabled
                ) {

                    return;
                }


                likeButton.disabled =
                    true;


                const estadoAnterior =
                    musicaCurtida;


                try {

                    const endpoint =
                        "/songs/" +
                        encodeURIComponent(
                            songId
                        ) +
                        "/like";


                    const resposta =
                        await YokaAPI.apiRequest(
                            endpoint,
                            {
                                method:
                                    estadoAnterior
                                        ? "DELETE"
                                        : "POST"
                            }
                        );


                    if (
                        !resposta ||
                        !resposta.sucesso
                    ) {

                        throw new Error(
                            resposta?.mensagem ||
                            "Não foi possível alterar a curtida."
                        );
                    }


                    atualizarBotaoMusica(
                        resposta.curtiu === true
                    );


                    if (
                        likes &&
                        resposta.likes_count !== undefined
                    ) {

                        likes.textContent =
                            resposta.likes_count;
                    }


                } catch (erro) {

                    console.error(
                        "Yoka: erro na curtida:",
                        erro
                    );


                    atualizarBotaoMusica(
                        estadoAnterior
                    );


                    alert(
                        erro.message ||
                        "Não foi possível alterar a curtida."
                    );


                } finally {

                    likeButton.disabled =
                        false;
                }
            }
        );
    }


    await verificarCurtidaMusica();


    /* ============================================================
       FAVORITOS
    ============================================================ */

    function atualizarBotaoFavorito(
        favorita
    ) {

        musicaFavorita =
            favorita === true;


        if (!favoriteButton) {

            return;
        }


        if (favoriteIcon) {

            favoriteIcon.textContent =
                musicaFavorita
                    ? "★"
                    : "☆";
        }


        if (favoriteText) {

            favoriteText.textContent =
                musicaFavorita
                    ? "Favoritado"
                    : "Favoritos";
        }


        favoriteButton.classList.toggle(
            "favoritado",
            musicaFavorita
        );


        favoriteButton.setAttribute(
            "aria-pressed",
            musicaFavorita
                ? "true"
                : "false"
        );


        favoriteButton.setAttribute(
            "aria-label",
            musicaFavorita
                ? "Remover dos favoritos"
                : "Adicionar aos favoritos"
        );
    }


    async function verificarFavoritoMusica() {

        if (!favoriteButton) {

            return;
        }


        if (!YokaAPI.obterToken()) {

            atualizarBotaoFavorito(
                false
            );

            return;
        }


        try {

            const resposta =
                await YokaAPI.apiRequest(
                    "/favorites/song/" +
                    encodeURIComponent(
                        songId
                    )
                );


            if (
                resposta &&
                resposta.sucesso
            ) {

                atualizarBotaoFavorito(
                    resposta.favorito === true
                );
            }


        } catch (erro) {

            console.error(
                "Yoka: erro ao verificar favorito:",
                erro
            );
        }
    }


    if (favoriteButton) {

        favoriteButton.addEventListener(
            "click",
            async function () {

                if (!YokaAPI.obterToken()) {

                    alert(
                        "Faça login para adicionar músicas aos favoritos."
                    );

                    return;
                }


                if (
                    favoriteButton.disabled
                ) {

                    return;
                }


                favoriteButton.disabled =
                    true;


                const estadoAnterior =
                    musicaFavorita;


                try {

                    const endpoint =
                        "/favorites/song/" +
                        encodeURIComponent(
                            songId
                        );


                    const resposta =
                        await YokaAPI.apiRequest(
                            endpoint,
                            {
                                method:
                                    estadoAnterior
                                        ? "DELETE"
                                        : "POST"
                            }
                        );


                    if (
                        !resposta ||
                        !resposta.sucesso
                    ) {

                        throw new Error(
                            resposta?.mensagem ||
                            "Não foi possível alterar os favoritos."
                        );
                    }


                    atualizarBotaoFavorito(
                        resposta.favorito === true
                    );


                } catch (erro) {

                    console.error(
                        "Yoka: erro ao alterar favorito:",
                        erro
                    );


                    atualizarBotaoFavorito(
                        estadoAnterior
                    );


                    alert(
                        erro.message ||
                        "Não foi possível alterar o favorito."
                    );


                } finally {

                    favoriteButton.disabled =
                        false;
                }
            }
        );
    }


    await verificarFavoritoMusica();


    /* ============================================================
       REPRODUÇÕES
    ============================================================ */

    let reproducaoRegistrada =
        false;

    let tempoReproduzido =
        0;

    let ultimoTempo =
        0;

        /* ============================================================
   ANÚNCIO — PRIMEIROS 30 SEGUNDOS
============================================================ */
function mostrarAnuncio() {
    if (!songAd) {
        return;
    }

    if (cover) {
        cover.style.visibility = "hidden";
    }

    songAd.style.display = "flex";
}

function esconderAnuncio() {
    if (!songAd) {
        return;
    }

    songAd.style.display = "none";

    if (cover) {
        cover.style.visibility = "visible";
    }
}

    if (audio) {

        audio.addEventListener(
            "timeupdate",
            function () {

                if (
                    reproducaoRegistrada
                ) {

                    return;
                }


                if (
                    audio.paused ||
                    audio.ended
                ) {

                    ultimoTempo =
                        audio.currentTime;

                    return;
                }


                const atual =
                    audio.currentTime;

/* ========================================================
   ANÚNCIO — PRIMEIROS 30 SEGUNDOS
======================================================== */

if (
    !audio.paused &&
    atual < 30
) {

    mostrarAnuncio();

} else {

    esconderAnuncio();
}
                const diferenca =
                    atual -
                    ultimoTempo;


                if (
                    diferenca > 0 &&
                    diferenca < 2
                ) {

                    tempoReproduzido +=
                        diferenca;
                }


                ultimoTempo =
                    atual;


                if (
                    tempoReproduzido >= 30
                ) {

                    registrarReproducao();
                }
            }
        );


        audio.addEventListener(
            "pause",
            function () {

                ultimoTempo =
                    audio.currentTime;
            }
        );


        audio.addEventListener(
            "ended",
            function () {

                ultimoTempo =
                    0;
            }
        );
    }


function obterIdVisitante() {
    const chave = "yoka_visitor_id";

    let visitorId = localStorage.getItem(chave);

    if (
        visitorId &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(visitorId)
    ) {
        return visitorId;
    }

    if (typeof crypto.randomUUID === "function") {
        visitorId = crypto.randomUUID();
    } else {
        visitorId =
            "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
                /[xy]/g,
                function (caractere) {
                    const aleatorio = Math.random() * 16 | 0;

                    const valor =
                        caractere === "x"
                            ? aleatorio
                            : (aleatorio & 0x3 | 0x8);

                    return valor.toString(16);
                }
            );
    }

    localStorage.setItem(chave, visitorId);

    return visitorId;
}

async function registrarReproducao() {
    if (reproducaoRegistrada) {
        return;
    }

    reproducaoRegistrada = true;

    try {
        const visitorId = obterIdVisitante();

        const resposta = await YokaAPI.apiRequest(
            "/songs/" +
                encodeURIComponent(songId) +
                "/play",
            {
                method: "POST",
                headers: {
                    "X-Visitor-Id": visitorId
                }
            }
        );

        console.log(
            "Yoka: resultado da reprodução:",
            resposta
        );

        if (
            resposta &&
            resposta.sucesso &&
            resposta.plays_count !== undefined
        ) {
            if (plays) {
                plays.textContent =
                    "Reproduções: " + resposta.plays_count;
            }
        }

    } catch (erro) {
        console.error(
            "Yoka: erro ao registrar reprodução:",
            erro
        );

        reproducaoRegistrada = false;
    }
}

/* ============================================================
   ABRIR COMENTÁRIO DA NOTIFICAÇÃO
============================================================ */
/* ============================================================
   ABRIR COMENTÁRIO DA NOTIFICAÇÃO
============================================================ */

function abrirComentarioDaNotificacao() {

    /*
       A notificação pode enviar:
       comment = ID do comentário
       reply   = ID da resposta

       Se existir reply, damos prioridade a ele.
    */

    const destino =
        respostaDestino ||
        comentarioDestino;


    if (!destino) {

        return;

    }


    if (!commentsList) {

        return;

    }


    /*
       Procurar o comentário/resposta pelo ID
    */

    const elementos =
        commentsList.querySelectorAll(
            "[data-comment-id]"
        );


    let elementoEncontrado = null;


    elementos.forEach(
        elemento => {

            if (
                elementoEncontrado
            ) {

                return;

            }


            if (
                String(
                    elemento.dataset.commentId
                ) ===
                String(
                    destino
                )
            ) {

                elementoEncontrado =
                    elemento;

            }

        }
    );


    if (!elementoEncontrado) {

        console.warn(
            "Yoka: comentário da notificação não encontrado:",
            destino
        );

        return;

    }


    /*
       Remover destaque anterior
    */

    document
        .querySelectorAll(
            ".notification-comment-highlight"
        )
        .forEach(
            elemento => {

                elemento.classList.remove(
                    "notification-comment-highlight"
                );

            }
        );


    /*
       Adicionar destaque
    */

    elementoEncontrado.classList.add(
        "notification-comment-highlight"
    );


    /*
       Esperar o DOM terminar de posicionar
       e fazer scroll até o comentário
    */

    setTimeout(
        function () {

            elementoEncontrado.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "center"

            });

        },
        150
    );


    /*
       Remover destaque depois de 5 segundos
    */

    setTimeout(
        function () {

            elementoEncontrado.classList.remove(
                "notification-comment-highlight"
            );

        },
        5000
    );

}
    /* ============================================================
       COMENTÁRIOS
    ============================================================ */

    let comentarios = [];


    async function carregarComentarios() {

        if (!commentsList) {

            return;
        }


        if (commentsLoading) {

            commentsLoading.style.display =
                "block";
        }


        if (commentsError) {

            commentsError.style.display =
                "none";
        }


        try {

            const resposta =
                await YokaAPI.apiRequest(
                    "/songs/" +
                    encodeURIComponent(
                        songId
                    ) +
                    "/comments"
                );


            if (
                !resposta ||
                !resposta.sucesso
            ) {

                throw new Error(
                    resposta?.mensagem ||
                    "Não foi possível carregar os comentários."
                );
            }

comentarios =
    Array.isArray(
        resposta.comentarios
    )
        ? resposta.comentarios
        : [];

renderizarComentarios();

setTimeout(
    function () {

        abrirComentarioDaNotificacao();

    },
    200
);

        } catch (erro) {

            console.error(
                "Yoka: erro nos comentários:",
                erro
            );


            if (commentsError) {

                commentsError.textContent =
                    erro.message ||
                    "Erro ao carregar comentários.";


                commentsError.style.display =
                    "block";
            }


        } finally {

            if (commentsLoading) {

                commentsLoading.style.display =
                    "none";
            }
        }
    }


    /* ============================================================
       RENDERIZAR COMENTÁRIOS
    ============================================================ */
/* ============================================================
   RENDERIZAR COMENTÁRIOS
   SUPORTA RESPOSTAS E RESPOSTAS DE RESPOSTAS
============================================================ */

function renderizarComentarios() {

    if (!commentsList) {

        return;
    }


    commentsList.innerHTML =
        "";


    /*
       Atualizar contador
    */

    if (commentsCount) {

        commentsCount.textContent =
            comentarios.length;
    }


    /*
       Se não houver comentários
    */

    if (
        !Array.isArray(comentarios) ||
        comentarios.length === 0
    ) {

        commentsList.innerHTML =
            `
            <div class="comments-empty">
                Ainda não existem comentários.
            </div>
            `;

        return;
    }


    /*
       Criar árvore de comentários
    */

    const principais =
        comentarios.filter(
            comentario =>
                !comentario.parent_id
        );


    /*
       Função recursiva para criar
       comentários + respostas
    */

    function renderizarComentarioRecursivo(
        comentario,
        nivel = 0
    ) {

        /*
           Criar comentário
        */

        const elemento =
            criarComentarioElemento(
                comentario,
                nivel > 0
            );


        /*
           Marcar nível para CSS
        */

        elemento.dataset.nivel =
            nivel;


        /*
           Limitar segurança visual
           de indentação
        */

        const nivelVisual =
            Math.min(
                nivel,
                6
            );


        elemento.style.marginLeft =
            `${nivelVisual * 25}px`;


        /*
           Adicionar ao container
        */

        commentsList.appendChild(
            elemento
        );


        /*
           Procurar TODAS as respostas
           deste comentário
        */

        const respostas =
            comentarios.filter(
                resposta =>
                    resposta.parent_id &&
                    String(
                        resposta.parent_id
                    ) ===
                    String(
                        comentario.id
                    )
            );


        /*
           Renderizar cada resposta
        */

        respostas.forEach(
            resposta => {

                renderizarComentarioRecursivo(
                    resposta,
                    nivel + 1
                );

            }
        );
    }


    /*
       Renderizar comentários principais
    */

    principais.forEach(
        comentario => {

            renderizarComentarioRecursivo(
                comentario,
                0
            );

        }
    );


    /*
       Segurança:
       caso existam comentários com
       parent_id inválido, eles não ficam
       completamente perdidos.
    */

    const idsRenderizados =
        new Set();


    document
        .querySelectorAll(
            "#commentsList [data-comment-id]"
        )
        .forEach(
            elemento => {

                if (
                    elemento.dataset.commentId
                ) {

                    idsRenderizados.add(
                        String(
                            elemento.dataset.commentId
                        )
                    );
                }
            }
        );


    const comentariosOrfaos =
        comentarios.filter(
            comentario =>
                !idsRenderizados.has(
                    String(
                        comentario.id
                    )
                )
        );


    /*
       Renderizar órfãos no final
       para não desaparecerem.
    */

    comentariosOrfaos.forEach(
        comentario => {

            const elemento =
                criarComentarioElemento(
                    comentario,
                    true
                );


            elemento.dataset.nivel =
                "orphan";


            elemento.classList.add(
                "comment-orphan"
            );


            commentsList.appendChild(
                elemento
            );
        }
    );
}

    /* ============================================================
       CRIAR COMENTÁRIO
    ============================================================ */

    function criarComentarioElemento(
        
        comentario,
        resposta = false
    ) {
console.log("COMENTÁRIO:", comentario);
        const div =
            document.createElement(
                "div"
            );


        div.className =
            resposta
                ? "comment comment-reply"
                : "comment";


        div.dataset.commentId =
            comentario.id;


        const usuarioAtual =
            obterUsuarioAtual();


        const souDono =
            usuarioAtual &&
            String(usuarioAtual.id) ===
            String(comentario.user_id);


        const curtido =
            comentario.liked_by_user ===
            true;
let avatar = `
    <img
        src="/assets/images/default-avatar.svg"
        alt="Avatar"
        loading="lazy"
        class="comment-avatar-image"
    >
`;

if (comentario.avatar_url) {

    const avatarUrl =
        obterUrlArquivo(
            comentario.avatar_url
        );

    avatar = `
        <img
            src="${escapeHtml(avatarUrl)}"
            alt="Avatar"
            loading="lazy"
            class="comment-avatar-image"
            data-default-avatar="/assets/images/default-avatar.svg"
        >
    `;
}

        div.innerHTML =
            `
            <div class="comment-header">

                <div class="comment-user">

                    <div class="comment-avatar">
                        ${avatar}
                    </div>

                    <div class="comment-user-info">

                        <strong
    class="comment-user-name"
    ${
        comentario.artist_id ||
        comentario.artistId
            ? 'style="cursor:pointer;"'
            : ""
    }
>
    ${escapeHtml(
        comentario.user_name ||
        comentario.username ||
        "Utilizador"
    )}
</strong>
                        <span class="comment-date">

                            ${formatarData(
                                comentario.created_at
                            )}

                            ${
                                comentario.updated_at &&
                                comentario.created_at &&
                                new Date(
                                    comentario.updated_at
                                ).getTime() >
                                new Date(
                                    comentario.created_at
                                ).getTime() + 1000
                                    ? " · Editado"
                                    : ""
                            }

                        </span>

                    </div>

                </div>

            </div>


            <div
                class="comment-content"
                data-content
            >
                ${escapeHtml(
                    comentario.content
                )}
            </div>


            <div class="comment-actions">

                <button
                    type="button"
                    class="comment-like-button ${
                        curtido
                            ? "liked"
                            : ""
                    }"
                    data-action="like"
                    aria-pressed="${
                        curtido
                            ? "true"
                            : "false"
                    }"
                >

                    <span class="comment-like-icon">
                        ${
                            curtido
                                ? "♥"
                                : "♡"
                        }
                    </span>

                    <span class="comment-like-count">
                        ${
                            comentario.likes_count ||
                            0
                        }
                    </span>

                </button>


                <button
                    type="button"
                    class="comment-action-button"
                    data-action="reply"
                >
                    Responder
                </button>


${
    !souDono
        ? `
            <button
                type="button"
                class="comment-action-button comment-report-button"
                data-action="report"
                title="Denunciar comentário"
            >
                ⚑ Denunciar
            </button>
          `
        : ""
}


                ${
                    souDono
                        ? `
                            <button
                                type="button"
                                class="comment-action-button"
                                data-action="edit"
                            >
                                Editar
                            </button>

                            <button
                                type="button"
                                class="comment-action-button comment-delete-button"
                                data-action="delete"
                            >
                                Excluir
                            </button>
                          `
                        : ""
                }

            </div>


            <div
                class="comment-reply-form"
                style="display:none;"
            >

                <textarea
                    maxlength="1000"
                    rows="2"
                    placeholder="Escreva uma resposta..."
                ></textarea>


                <div class="reply-form-actions">

                    <button
                        type="button"
                        data-action="send-reply"
                    >
                        Responder
                    </button>

                    <button
                        type="button"
                        data-action="cancel-reply"
                    >
                        Cancelar
                    </button>

                </div>

            </div>
            `;

const imagemAvatar =
    div.querySelector(
        ".comment-avatar-image"
    );

if (imagemAvatar) {

    imagemAvatar.addEventListener(
        "error",
        function () {

            const avatarPadrao =
                this.dataset.defaultAvatar ||
                "/assets/images/default-avatar.svg";

            if (
                this.src.endsWith(
                    avatarPadrao
                )
            ) {
                return;
            }

            this.src =
                avatarPadrao;
        }
    );
}

const artistId =
    comentario.artist_id ||
    comentario.artistId ||
    "";
    const nomeComentario =
    div.querySelector(".comment-user-name");

if (nomeComentario && artistId) {
    nomeComentario.addEventListener("click", function () {
        window.location.href =
            `./artist.html?id=${encodeURIComponent(artistId)}`;
    });
}

if (imagemAvatar && artistId) {
    imagemAvatar.style.cursor = "pointer";

    imagemAvatar.addEventListener("click", function () {
        window.location.href =
            `./artist.html?id=${encodeURIComponent(artistId)}`;
    });
}
        /* ========================================================
           CURTIR
        ======================================================== */

        const likeBtn =
            div.querySelector(
                '[data-action="like"]'
            );


        if (likeBtn) {

            likeBtn.addEventListener(
                "click",
                function () {

                    curtirComentario(
                        comentario,
                        likeBtn
                    );
                }
            );
        }


        /* ========================================================
           RESPONDER
        ======================================================== */

        const replyBtn =
            div.querySelector(
                '[data-action="reply"]'
            );


        if (replyBtn) {

            replyBtn.addEventListener(
                "click",
                function () {

                    abrirFormularioResposta(
                        div
                    );
                }
            );
        }

/* ========================================================
   DENUNCIAR COMENTÁRIO
======================================================== */

const reportBtn =
    div.querySelector(
        '[data-action="report"]'
    );

if (reportBtn) {
    reportBtn.addEventListener(
        "click",
        function () {
            denunciarComentario(
                comentario,
                reportBtn
            );
        }
    );
}


        /* ========================================================
           EDITAR
        ======================================================== */

        const editBtn =
            div.querySelector(
                '[data-action="edit"]'
            );


        if (editBtn) {

            editBtn.addEventListener(
                "click",
                function () {

                    editarComentario(
                        comentario
                    );
                }
            );
        }


        /* ========================================================
           EXCLUIR
        ======================================================== */

        const deleteBtn =
            div.querySelector(
                '[data-action="delete"]'
            );


        if (deleteBtn) {

            deleteBtn.addEventListener(
                "click",
                function () {

                    excluirComentario(
                        comentario
                    );
                }
            );
        }


        /* ========================================================
           ENVIAR RESPOSTA
        ======================================================== */

        const sendReplyBtn =
            div.querySelector(
                '[data-action="send-reply"]'
            );


        if (sendReplyBtn) {

            sendReplyBtn.addEventListener(
                "click",
                function () {

                    enviarResposta(
                        comentario.id,
                        div
                    );
                }
            );
        }


        /* ========================================================
           CANCELAR RESPOSTA
        ======================================================== */

        const cancelReplyBtn =
            div.querySelector(
                '[data-action="cancel-reply"]'
            );


        if (cancelReplyBtn) {

            cancelReplyBtn.addEventListener(
                "click",
                function () {

                    fecharFormularioResposta(
                        div
                    );
                }
            );
        }


        return div;
    }



async function denunciarComentario(comentario, botao) {
    if (!YokaAPI.obterToken()) {
        alert("Inicia sessão para denunciar um comentário.");
        return;
    }

    if (!comentario?.id || botao.disabled) return;

    // Impede abrir duas janelas ao mesmo tempo.
    if (document.getElementById("yokaReportModal")) return;

    const motivos = [
        { codigo: "spam", texto: "Spam ou publicidade indesejada" },
        { codigo: "harassment", texto: "Assédio ou perseguição" },
        { codigo: "offensive", texto: "Conteúdo ofensivo" },
        { codigo: "inappropriate", texto: "Conteúdo impróprio" },
        { codigo: "copyright", texto: "Violação de direitos de autor" },
        { codigo: "other", texto: "Outro motivo" }
    ];

    const modal = document.createElement("div");
    modal.id = "yokaReportModal";

    modal.innerHTML = `
        <div class="yoka-report-overlay">
            <section
                class="yoka-report-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="yokaReportTitle"
            >
                <button
                    type="button"
                    class="yoka-report-close"
                    aria-label="Fechar"
                >×</button>

                <h2 id="yokaReportTitle">Denunciar comentário</h2>

                <p class="yoka-report-description">
                    Indica o motivo da denúncia. A equipa da Yoka
                    irá analisar o comentário.
                </p>

                <form id="yokaReportForm">
                    <fieldset class="yoka-report-options">
                        <legend>Qual é o motivo?</legend>

                        ${motivos.map(motivo => `
                            <label class="yoka-report-option">
                                <input
                                    type="checkbox"
                                    name="reportReason"
                                    value="${motivo.codigo}"
                                >
                                <span>${motivo.texto}</span>
                            </label>
                        `).join("")}
                    </fieldset>

                    <label
                        class="yoka-report-details-label"
                        for="yokaReportDetails"
                    >
                        Detalhes adicionais (opcional)
                    </label>

                    <textarea
                        id="yokaReportDetails"
                        maxlength="1000"
                        rows="4"
                        placeholder="Explica o que aconteceu..."
                    ></textarea>

                    <p class="yoka-report-error"
                       id="yokaReportError"
                       role="alert"
                       hidden></p>

                    <div class="yoka-report-actions">
                        <button
                            type="button"
                            class="yoka-report-cancel"
                        >Cancelar</button>

                        <button
                            type="submit"
                            class="yoka-report-submit"
                        >Enviar denúncia</button>
                    </div>
                </form>
            </section>
        </div>
    `;

    // Estilos da janela.
    if (!document.getElementById("yokaReportStyles")) {
        const style = document.createElement("style");
        style.id = "yokaReportStyles";

        style.textContent = `
            .yoka-report-overlay {
                position: fixed;
                inset: 0;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 18px;
                background: rgba(0, 0, 0, .72);
            }

            .yoka-report-dialog {
                position: relative;
                width: 100%;
                max-width: 480px;
                max-height: 90vh;
                overflow-y: auto;
                padding: 28px;
                border-radius: 16px;
                background: var(--card-bg, #181818);
                color: var(--text-color, #fff);
                box-shadow: 0 18px 60px rgba(0, 0, 0, .4);
            }

            .yoka-report-dialog h2 {
                margin: 0 30px 10px 0;
                font-size: 22px;
            }

            .yoka-report-description {
                color: var(--muted-color, #aaa);
                line-height: 1.5;
            }

            .yoka-report-close {
                position: absolute;
                top: 12px;
                right: 14px;
                border: 0;
                background: transparent;
                color: inherit;
                font-size: 28px;
                cursor: pointer;
            }

            .yoka-report-options {
                display: grid;
                gap: 12px;
                margin: 22px 0;
                padding: 0;
                border: 0;
            }

            .yoka-report-options legend {
                margin-bottom: 12px;
                font-weight: 700;
            }

            .yoka-report-option {
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;
                line-height: 1.4;
            }

            .yoka-report-option input {
                width: 17px;
                height: 17px;
                flex-shrink: 0;
                accent-color: var(--primary-color, #0a0a0a);
            }

            .yoka-report-details-label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
            }

            #yokaReportDetails {
                box-sizing: border-box;
                width: 100%;
                min-height: 100px;
                padding: 12px;
                resize: vertical;
                border: 1px solid #555;
                border-radius: 9px;
                background: var(--input-bg, #222);
                color: inherit;
                font: inherit;
            }

            .yoka-report-error {
                color: #ff7777;
                font-size: 14px;
            }

            .yoka-report-actions {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 20px;
            }

            .yoka-report-actions button {
                padding: 11px 16px;
                border: 0;
                border-radius: 8px;
                font: inherit;
                font-weight: 600;
                cursor: pointer;
            }

            .yoka-report-cancel {
                background: #0a0a0a;
                color: #fff;
            }

            .yoka-report-submit {
                background: var(--primary-color, #0a0a0a);
                color: #fff;
            }

            .yoka-report-submit:disabled {
                opacity: .6;
                cursor: wait;
            }
        `;

        document.head.appendChild(style);
    }

    document.body.appendChild(modal);

    const form = modal.querySelector("#yokaReportForm");
    const erroElemento = modal.querySelector("#yokaReportError");
    const textarea = modal.querySelector("#yokaReportDetails");
    const enviarBtn = modal.querySelector(".yoka-report-submit");

    function fecharModal() {
        modal.remove();
    }

    modal.querySelector(".yoka-report-close")
        .addEventListener("click", fecharModal);

    modal.querySelector(".yoka-report-cancel")
        .addEventListener("click", fecharModal);

    modal.querySelector(".yoka-report-overlay")
        .addEventListener("click", event => {
            if (event.target === event.currentTarget) {
                fecharModal();
            }
        });

    // Só pode ser selecionado um motivo.
    modal.querySelectorAll('input[name="reportReason"]')
        .forEach(checkbox => {
            checkbox.addEventListener("change", () => {
                if (checkbox.checked) {
                    modal.querySelectorAll(
                        'input[name="reportReason"]'
                    ).forEach(outro => {
                        if (outro !== checkbox) outro.checked = false;
                    });
                }
            });
        });

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const selecionado = modal.querySelector(
            'input[name="reportReason"]:checked'
        );

        if (!selecionado) {
            erroElemento.textContent =
                "Seleciona um motivo para a denúncia.";
            erroElemento.hidden = false;
            return;
        }

        const details = textarea.value.trim();

        if (details.length > 1000) {
            erroElemento.textContent =
                "A descrição não pode ultrapassar 1000 caracteres.";
            erroElemento.hidden = false;
            return;
        }

        enviarBtn.disabled = true;
        enviarBtn.textContent = "A enviar...";

        try {
            const endpoint =
                "/songs/" + encodeURIComponent(songId) +
                "/comments/" + encodeURIComponent(comentario.id) +
                "/report";

            const resposta = await YokaAPI.apiRequest(endpoint, {
                method: "POST",
                body: JSON.stringify({
                    reason: selecionado.value,
                    details
                })
            });

            if (!resposta || !resposta.sucesso) {
                throw new Error(
                    resposta?.mensagem ||
                    "Não foi possível enviar a denúncia."
                );
            }

            fecharModal();

            botao.textContent = "✓ Denunciado";
            botao.disabled = true;
            botao.title = "Denúncia enviada";
            botao.classList.add("reported");

            alert("Denúncia enviada com sucesso. Obrigado pelo teu contributo.");

        } catch (erro) {
            console.error("Yoka: erro ao denunciar comentário:", erro);

            erroElemento.textContent =
                erro.message || "Não foi possível enviar a denúncia.";
            erroElemento.hidden = false;

            enviarBtn.disabled = false;
            enviarBtn.textContent = "Enviar denúncia";
        }
    });
}


    /* ============================================================
       CURTIR COMENTÁRIO
    ============================================================ */

    async function curtirComentario(
        comentario,
        botao
    ) {

        if (!YokaAPI.obterToken()) {

            alert(
                "Faça login para curtir o comentário."
            );

            return;
        }


        if (
            botao.disabled
        ) {

            return;
        }


        botao.disabled =
            true;


        const curtidoAntes =
            comentario.liked_by_user ===
            true;


        try {

            const endpoint =
                "/songs/" +
                encodeURIComponent(
                    songId
                ) +
                "/comments/" +
                encodeURIComponent(
                    comentario.id
                ) +
                "/like";


            const resposta =
                await YokaAPI.apiRequest(
                    endpoint,
                    {
                        method:
                            curtidoAntes
                                ? "DELETE"
                                : "POST"
                    }
                );


            if (
                !resposta ||
                !resposta.sucesso
            ) {

                throw new Error(
                    resposta?.mensagem ||
                    "Não foi possível alterar a curtida."
                );
            }


            comentario.liked_by_user =
                resposta.curtiu === true;


            if (
                resposta.likes_count !== undefined
            ) {

                comentario.likes_count =
                    resposta.likes_count;
            }


            atualizarBotaoComentario(
                botao,
                comentario
            );


        } catch (erro) {

            console.error(
                "Yoka: erro ao curtir comentário:",
                erro
            );


            alert(
                erro.message ||
                "Não foi possível alterar a curtida."
            );


        } finally {

            botao.disabled =
                false;
        }
    }


    function atualizarBotaoComentario(
        botao,
        comentario
    ) {

        const icon =
            botao.querySelector(
                ".comment-like-icon"
            );


        const count =
            botao.querySelector(
                ".comment-like-count"
            );


        const curtido =
            comentario.liked_by_user ===
            true;


        if (icon) {

            icon.textContent =
                curtido
                    ? "♥"
                    : "♡";
        }


        if (count) {

            count.textContent =
                comentario.likes_count ||
                0;
        }


        botao.classList.toggle(
            "liked",
            curtido
        );


        botao.setAttribute(
            "aria-pressed",
            curtido
                ? "true"
                : "false"
        );
    }


    /* ============================================================
       ABRIR RESPOSTA
    ============================================================ */

    function abrirFormularioResposta(
        elemento
    ) {

        if (!YokaAPI.obterToken()) {

            alert(
                "Faça login para responder."
            );

            return;
        }


        const form =
            elemento.querySelector(
                ".comment-reply-form"
            );


        if (form) {

            form.style.display =
                "block";


            const textarea =
                form.querySelector(
                    "textarea"
                );


            if (textarea) {

                textarea.focus();
            }
        }
    }


    /* ============================================================
       FECHAR RESPOSTA
    ============================================================ */

    function fecharFormularioResposta(
        elemento
    ) {

        const form =
            elemento.querySelector(
                ".comment-reply-form"
            );


        if (form) {

            form.style.display =
                "none";


            const textarea =
                form.querySelector(
                    "textarea"
                );


            if (textarea) {

                textarea.value =
                    "";
            }
        }
    }


    /* ============================================================
       ENVIAR RESPOSTA
    ============================================================ */

    async function enviarResposta(
        parentId,
        elemento
    ) {

        if (!YokaAPI.obterToken()) {

            alert(
                "Faça login para responder."
            );

            return;
        }


        const form =
            elemento.querySelector(
                ".comment-reply-form"
            );


        const textarea =
            form?.querySelector(
                "textarea"
            );


        const texto =
            textarea?.value.trim();


        if (!texto) {

            alert(
                "Escreva uma resposta."
            );

            return;
        }


        try {

            const resposta =
                await YokaAPI.apiRequest(
                    "/songs/" +
                    encodeURIComponent(
                        songId
                    ) +
                    "/comments",
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                content:
                                    texto,

                                parent_id:
                                    parentId
                            })
                    }
                );


            if (
                !resposta ||
                !resposta.sucesso
            ) {

                throw new Error(
                    resposta?.mensagem ||
                    "Não foi possível enviar a resposta."
                );
            }


            fecharFormularioResposta(
                elemento
            );


            await carregarComentarios();


        } catch (erro) {

            console.error(
                "Yoka: erro ao enviar resposta:",
                erro
            );


            alert(
                erro.message ||
                "Não foi possível enviar a resposta."
            );
        }
    }


    /* ============================================================
       EDITAR COMENTÁRIO
    ============================================================ */

    async function editarComentario(
        comentario
    ) {

        if (!YokaAPI.obterToken()) {

            alert(
                "Faça login para editar o comentário."
            );

            return;
        }


        const novoTexto =
            prompt(
                "Editar comentário:",
                comentario.content
            );


        if (
            novoTexto ===
            null
        ) {

            return;
        }


        const texto =
            novoTexto.trim();


        if (!texto) {

            alert(
                "O comentário não pode ficar vazio."
            );

            return;
        }


        try {

            const resposta =
                await YokaAPI.apiRequest(
                    "/songs/" +
                    encodeURIComponent(
                        songId
                    ) +
                    "/comments/" +
                    encodeURIComponent(
                        comentario.id
                    ),
                    {
                        method:
                            "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                content:
                                    texto
                            })
                    }
                );


            if (
                !resposta ||
                !resposta.sucesso
            ) {

                throw new Error(
                    resposta?.mensagem ||
                    "Não foi possível editar o comentário."
                );
            }


            await carregarComentarios();


        } catch (erro) {

            console.error(
                "Yoka: erro ao editar:",
                erro
            );


            alert(
                erro.message ||
                "Não foi possível editar o comentário."
            );
        }
    }


    /* ============================================================
       EXCLUIR COMENTÁRIO
    ============================================================ */

    async function excluirComentario(
        comentario
    ) {

        if (!YokaAPI.obterToken()) {

            alert(
                "Faça login para excluir o comentário."
            );

            return;
        }


        const confirmar =
            confirm(
                "Tem certeza que deseja excluir este comentário?"
            );


        if (!confirmar) {

            return;
        }


        try {

            const resposta =
                await YokaAPI.apiRequest(
                    "/songs/" +
                    encodeURIComponent(
                        songId
                    ) +
                    "/comments/" +
                    encodeURIComponent(
                        comentario.id
                    ),
                    {
                        method:
                            "DELETE"
                    }
                );


            if (
                !resposta ||
                !resposta.sucesso
            ) {

                throw new Error(
                    resposta?.mensagem ||
                    "Não foi possível excluir o comentário."
                );
            }


            await carregarComentarios();


        } catch (erro) {

            console.error(
                "Yoka: erro ao excluir comentário:",
                erro
            );


            alert(
                erro.message ||
                "Não foi possível excluir o comentário."
            );
        }
    }


    /* ============================================================
       PUBLICAR COMENTÁRIO
    ============================================================ */

    if (
        commentSubmit &&
        commentInput
    ) {

        commentSubmit.addEventListener(
            "click",
            async function () {

                if (!YokaAPI.obterToken()) {

                    alert(
                        "Faça login para comentar."
                    );

                    return;
                }


                const texto =
                    commentInput.value.trim();


                if (!texto) {

                    alert(
                        "Escreva um comentário."
                    );

                    return;
                }


                if (
                    commentSubmit.disabled
                ) {

                    return;
                }


                commentSubmit.disabled =
                    true;


                try {

                    const resposta =
                        await YokaAPI.apiRequest(
                            "/songs/" +
                            encodeURIComponent(
                                songId
                            ) +
                            "/comments",
                            {
                                method:
                                    "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        content:
                                            texto
                                    })
                            }
                        );


                    if (
                        !resposta ||
                        !resposta.sucesso
                    ) {

                        throw new Error(
                            resposta?.mensagem ||
                            "Não foi possível publicar o comentário."
                        );
                    }


                    commentInput.value =
                        "";


                    await carregarComentarios();


                } catch (erro) {

                    console.error(
                        "Yoka: erro ao publicar comentário:",
                        erro
                    );


                    alert(
                        erro.message ||
                        "Não foi possível publicar o comentário."
                    );


                } finally {

                    commentSubmit.disabled =
                        false;
                }
            }
        );
    }

/* ============================================================
   PRÓXIMA MÚSICA AUTOMÁTICA
============================================================ */

/* ============================================================
   PRÓXIMA MÚSICA AUTOMÁTICA
============================================================ */

/* ============================================================
   PRÓXIMA MÚSICA AUTOMÁTICA — YOKA
   Evita repetir músicas já reproduzidas na sessão
============================================================ */

/* ============================================================
   PRÓXIMA MÚSICA AUTOMÁTICA — YOKA
   Mantém a fila, evita repetições e reinicia no fim do catálogo
============================================================ */

async function carregarProximaMusica() {
    try {
        console.log("Yoka: procurando próxima música...");

        const chaveHistorico = "yoka_musicas_reproduzidas";

        /*
         * 1. Ler o histórico de reprodução.
         */
        let historico = [];

        try {
            historico = JSON.parse(
                sessionStorage.getItem(chaveHistorico) || "[]"
            );

            if (!Array.isArray(historico)) {
                historico = [];
            }
        } catch (erro) {
            historico = [];
        }

        historico = historico.map(String);

        /*
         * Registar a música atual.
         */
        if (songId && !historico.includes(String(songId))) {
            historico.push(String(songId));
        }

        sessionStorage.setItem(
            chaveHistorico,
            JSON.stringify(historico)
        );

        /*
         * 2. Ler a fila de categoria, se existir.
         */
        let fila = null;

        try {
            const guardada = sessionStorage.getItem(
                YOKA_CHAVE_FILA
            );

            if (guardada) {
                fila = JSON.parse(guardada);
            }
        } catch (erro) {
            console.warn("Yoka: fila guardada inválida.", erro);
            sessionStorage.removeItem(YOKA_CHAVE_FILA);
        }

        /*
         * 3. Se existir uma fila, respeitar a sua ordem.
         */
        if (fila && Array.isArray(fila.ids) && fila.ids.length > 0) {
            const ids = [...new Set(fila.ids.map(String))];
            const indiceAtual = ids.indexOf(String(songId));

            if (indiceAtual !== -1) {
                // Procurar a próxima música da fila ainda não reproduzida.
                for (let i = indiceAtual + 1; i < ids.length; i++) {
                    const id = ids[i];

                    if (!historico.includes(id)) {
                        window.location.href =
                            "/song.html?id=" +
                            encodeURIComponent(id) +
                            "&autoplay=1";

                        return;
                    }
                }

                /*
                 * A fila terminou.
                 * Não mudar de categoria nem reiniciar automaticamente
                 * a fila de categoria.
                 */
                sessionStorage.removeItem(YOKA_CHAVE_FILA);

                console.log("Yoka: fila de reprodução concluída.");

                return;
            }

            /*
             * A música atual não pertence à fila.
             * Remover a fila antiga para não interferir na navegação.
             */
            sessionStorage.removeItem(YOKA_CHAVE_FILA);
        }

        /*
         * 4. Procurar músicas ainda não reproduzidas na barra lateral.
         */
        const musicasSidebar = document.querySelectorAll(
            ".sidebar-song-card[data-song-id]"
        );

        const idsSidebar = [];

        musicasSidebar.forEach(elemento => {
            const id = elemento.dataset.songId;

            if (
                id &&
                String(id) !== String(songId) &&
                !historico.includes(String(id)) &&
                !idsSidebar.includes(String(id))
            ) {
                idsSidebar.push(String(id));
            }
        });

        if (idsSidebar.length > 0) {
            window.location.href =
                "/song.html?id=" +
                encodeURIComponent(idsSidebar[0]) +
                "&autoplay=1";

            return;
        }

        /*
         * 5. Procurar outras músicas no servidor.
         */
        const resposta = await YokaAPI.apiRequest("/songs");

        const musicas = [
            ...(resposta?.musicas || resposta?.songs || [])
        ];

        const candidatas = [
            ...new Map(
                musicas
                    .filter(musica =>
                        musica?.id &&
                        !historico.includes(String(musica.id))
                    )
                    .map(musica => [String(musica.id), musica])
            ).values()
        ];

        if (candidatas.length > 0) {
            const indice = Math.floor(
                Math.random() * candidatas.length
            );

            const proxima = candidatas[indice];

            window.location.href =
                "/song.html?id=" +
                encodeURIComponent(proxima.id) +
                "&autoplay=1";

            return;
        }

        /*
         * 6. REPEAT:
         * Todas as músicas disponíveis já foram reproduzidas.
         * Limpar o histórico e voltar a explorar o catálogo.
         */
        sessionStorage.removeItem(chaveHistorico);

        // Tentar uma música diferente na barra lateral.
        const alternativas = [...idsSidebar];

        if (alternativas.length > 0) {
            const indice = Math.floor(
                Math.random() * alternativas.length
            );

            window.location.href =
                "/song.html?id=" +
                encodeURIComponent(alternativas[indice]) +
                "&autoplay=1";

            return;
        }

        // Última alternativa: repetir a música atual.
        if (songId) {
            window.location.href =
                "/song.html?id=" +
                encodeURIComponent(songId) +
                "&autoplay=1";

            return;
        }

        console.log("Yoka: não existem músicas disponíveis.");

    } catch (erro) {
        console.error(
            "Yoka: erro ao carregar próxima música:",
            erro
        );
    }
}

    /* ============================================================
       PLAYER YOKA
    ============================================================ */
/* ============================================================
   PLAYER YOKA
============================================================ */

function iniciarPlayerYoka() {

    const playerAudio =
        document.getElementById(
            "songAudio"
        );

    const playButton =
        document.getElementById(
            "playerPlayButton"
        );

    const progress =
        document.getElementById(
            "playerProgress"
        );

    const currentTime =
        document.getElementById(
            "playerCurrentTime"
        );

    const duration =
        document.getElementById(
            "playerDuration"
        );

    const volume =
        document.getElementById(
            "playerVolume"
        );

    const muteButton =
        document.getElementById(
            "playerMuteButton"
        );

    const player =
        document.querySelector(
            ".yoka-player"
        );


const yokaFoiAtualizacao =
    performance.getEntriesByType("navigation")[0]?.type === "reload";

    if (
        !playerAudio ||
        !playButton ||
        !progress ||
        !currentTime ||
        !duration ||
        !volume ||
        !muteButton ||
        !player
    ) {

        console.warn(
            "Yoka: elementos do player não encontrados."
        );

        return;
    }


/* ========================================================
   YOKA — GUARDAR E RESTAURAR A POSIÇÃO DA MÚSICA
======================================================== */

const parametrosYoka = new URLSearchParams(window.location.search);
const idMusicaAtual = parametrosYoka.get("id");


const chavePosicaoYoka = idMusicaAtual
    ? "yoka_posicao_musica_" + idMusicaAtual
    : null;

if (!yokaFoiAtualizacao && chavePosicaoYoka) {
    localStorage.removeItem(chavePosicaoYoka);
}


let restauracaoConcluida = false;

function lerEstadoPosicaoYoka() {
    if (!chavePosicaoYoka) return null;

    try {
        return JSON.parse(
            localStorage.getItem(chavePosicaoYoka) || "null"
        );
    } catch (erro) {
        console.warn("Yoka: erro ao ler a posição guardada.", erro);
        return null;
    }
}

function guardarEstadoPosicaoYoka(estavaATocar) {
    if (!chavePosicaoYoka || !restauracaoConcluida) return;

    if (!Number.isFinite(playerAudio.currentTime)) return;

    try {
        localStorage.setItem(
            chavePosicaoYoka,
            JSON.stringify({
                tempo: playerAudio.currentTime,
                estavaATocar:
                    typeof estavaATocar === "boolean"
                        ? estavaATocar
                        : !playerAudio.paused && !playerAudio.ended
            })
        );
    } catch (erro) {
        console.warn("Yoka: erro ao guardar a posição.", erro);
    }
}

function restaurarPosicaoYoka() {
if (
    restauracaoConcluida ||
    !chavePosicaoYoka ||
    !yokaFoiAtualizacao
) {
    restauracaoConcluida = true;
    return;
}

    if (
        !Number.isFinite(playerAudio.duration) ||
        playerAudio.duration <= 0
    ) {
        return;
    }

    const estado = lerEstadoPosicaoYoka();

    try {
        if (estado && Number.isFinite(estado.tempo)) {
            const tempo = Math.max(
                0,
                Math.min(
                    estado.tempo,
                    Math.max(0, playerAudio.duration - 0.25)
                )
            );

            playerAudio.currentTime = tempo;
            progress.max = playerAudio.duration;
            progress.value = tempo;
            currentTime.textContent = formatarTempo(tempo);

            console.log(
                "Yoka: posição recuperada:",
                formatarTempo(tempo)
            );
        }

        restauracaoConcluida = true;

        // Continua automaticamente apenas se estava a tocar.
        if (
            estado &&
            estado.estavaATocar === true
        ) {
            playerAudio.play().catch(() => {
                console.log(
                    "Yoka: clica em Reproduzir para continuar a música."
                );
            });
        }
    } catch (erro) {
        console.error("Yoka: erro ao restaurar a posição.", erro);
    }
}

playerAudio.addEventListener("loadedmetadata", restaurarPosicaoYoka);
playerAudio.addEventListener("durationchange", restaurarPosicaoYoka);

// Não guardar o tempo inicial antes de tentar restaurar o anterior.
playerAudio.addEventListener("timeupdate", () => {
    guardarEstadoPosicaoYoka();
});

playerAudio.addEventListener("play", () => {
    guardarEstadoPosicaoYoka(true);
});

playerAudio.addEventListener("pause", () => {
    if (!playerAudio.ended) {
        guardarEstadoPosicaoYoka(false);
    }
});

window.addEventListener("pagehide", () => {
    guardarEstadoPosicaoYoka();
});

// Se o áudio já estiver carregado, tentar restaurar imediatamente.
if (playerAudio.readyState >= 1) {
    restaurarPosicaoYoka();
}

    /* ========================================================
       FORMATAR TEMPO
    ======================================================== */

    function formatarTempo(
        segundos
    ) {

        if (
            !Number.isFinite(
                segundos
            ) ||
            segundos < 0
        ) {

            return "0:00";
        }


        const minutos =
            Math.floor(
                segundos / 60
            );


        const segundosRestantes =
            Math.floor(
                segundos % 60
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


    /* ========================================================
       ATUALIZAR DURAÇÃO REAL
    ======================================================== */

    function atualizarDuracao() {

        const tempo =
            playerAudio.duration;


        console.log(
            "Yoka: duração detectada:",
            tempo
        );


        /*
           Verificar se a duração é realmente válida.
        */

        if (
            Number.isFinite(tempo) &&
            tempo > 0
        ) {

            /*
               Mostrar duração real.
            */

            duration.textContent =
                formatarTempo(
                    tempo
                );


            /*
               IMPORTANTE:
               A barra passa a ter como máximo
               exatamente a duração da música.
            */

            progress.min =
                0;

            progress.max =
                tempo;


            /*
               Se o currentTime estiver fora
               do limite, corrigimos.
            */

            if (
                playerAudio.currentTime >
                tempo
            ) {

                playerAudio.currentTime =
                    tempo;
            }


            console.log(
                "Yoka: duração real aplicada:",
                formatarTempo(tempo)
            );
        }
    }


    /* ========================================================
       PLAY / PAUSE
    ======================================================== */

    playButton.addEventListener(
        "click",
        async function () {

            try {

                if (
                    playerAudio.paused
                ) {

                    await playerAudio.play();

                } else {

                    playerAudio.pause();
                }

            } catch (erro) {

                console.error(
                    "Yoka: erro ao reproduzir:",
                    erro
                );
            }
        }
    );


    /* ========================================================
       PLAY
    ======================================================== */

    playerAudio.addEventListener(
        "play",
        function () {

            playButton.textContent =
                "❚❚";


            playButton.setAttribute(
                "aria-label",
                "Pausar"
            );


            player.classList.add(
                "playing"
            );
        }
    );


    /* ========================================================
       PAUSE
    ======================================================== */

    playerAudio.addEventListener(
        "pause",
        function () {

            playButton.textContent =
                "▶";


            playButton.setAttribute(
                "aria-label",
                "Reproduzir"
            );


            player.classList.remove(
                "playing"
            );
        }
    );


    /* ========================================================
       DURAÇÃO REAL
    ======================================================== */

    playerAudio.addEventListener(
        "loadedmetadata",
        function () {

            atualizarDuracao();
        }
    );


    /*
       durationchange é importante porque alguns
       navegadores atualizam a duração depois
       do loadedmetadata.
    */

    playerAudio.addEventListener(
        "durationchange",
        function () {

            atualizarDuracao();
        }
    );


    /*
       loadeddata ajuda quando o áudio já foi
       carregado antes do listener ser registado.
    */

    playerAudio.addEventListener(
        "loadeddata",
        function () {

            atualizarDuracao();
        }
    );


    /* ========================================================
       TIMEUPDATE
    ======================================================== */

    playerAudio.addEventListener(
        "timeupdate",
        function () {

            const tempo =
                playerAudio.currentTime;


            /*
               Atualizar contador atual.
            */

            currentTime.textContent =
                formatarTempo(
                    tempo
                );


            /*
               Atualizar barra.
            */

            if (
                Number.isFinite(
                    playerAudio.duration
                ) &&
                playerAudio.duration > 0
            ) {

                progress.max =
                    playerAudio.duration;
            }


            progress.value =
                tempo;
        }
    );


    /* ========================================================
       ENDED
    ======================================================== */

    playerAudio.addEventListener(
        "ended",
        function () {

            console.log(
                "Yoka: áudio terminou realmente."
            );


            playButton.textContent =
                "▶";


            playButton.setAttribute(
                "aria-label",
                "Reproduzir"
            );


            player.classList.remove(
                "playing"
            );


            /*
               Voltar a barra para o início.
            */

            progress.value =
                0;


            currentTime.textContent =
                "0:00";


            /*
               IMPORTANTE:
               Não alterar duration aqui.
               A duração continua sendo a duração
               real da música.
            */

            atualizarDuracao();


            /*
               Só depois do evento ended
               carregamos a próxima música.
            */

            carregarProximaMusica();
        }
    );


    /* ========================================================
       ALTERAR POSIÇÃO DA MÚSICA
    ======================================================== */

    progress.addEventListener(
        "input",
        function () {

            const novoTempo =
                Number(
                    progress.value
                );


            if (
                Number.isFinite(
                    novoTempo
                )
            ) {

                playerAudio.currentTime =
                    novoTempo;
            }
        }
    );


    /* ========================================================
       VOLUME
    ======================================================== */

    volume.addEventListener(
        "input",
        function () {

            const valor =
                Number(
                    volume.value
                );


            if (
                Number.isFinite(
                    valor
                )
            ) {

                playerAudio.volume =
                    valor;


                playerAudio.muted =
                    valor === 0;


                atualizarIconeVolume();
            }
        }
    );


    /* ========================================================
       MUTE
    ======================================================== */

    muteButton.addEventListener(
        "click",
        function () {

            playerAudio.muted =
                !playerAudio.muted;


            atualizarIconeVolume();
        }
    );


    /* ========================================================
       ÍCONE DO VOLUME
    ======================================================== */

    function atualizarIconeVolume() {

        if (
            playerAudio.muted ||
            playerAudio.volume === 0
        ) {

            muteButton.textContent =
                "🔇";

            return;
        }


        if (
            playerAudio.volume < 0.5
        ) {

            muteButton.textContent =
                "🔉";

            return;
        }


        muteButton.textContent =
            "🔊";
    }


    /* ========================================================
       VOLUME INICIAL
    ======================================================== */

    const volumeInicial =
        Number(
            volume.value
        );


    playerAudio.volume =
        Number.isFinite(
            volumeInicial
        )
            ? volumeInicial
            : 1;


    atualizarIconeVolume();


    /* ========================================================
       ESTADO INICIAL DO CONTADOR
    ======================================================== */

    currentTime.textContent =
        "0:00";


    /*
       NÃO colocamos duration = 0:00 aqui.

       Se a duração já estiver disponível,
       usamos imediatamente.
    */

    if (
        Number.isFinite(
            playerAudio.duration
        ) &&
        playerAudio.duration > 0
    ) {

        atualizarDuracao();
    }


    /*
       Se o áudio já tiver metadados disponíveis,
       readyState >= 1 significa que podemos
       tentar obter a duração imediatamente.
    */

    if (
        playerAudio.readyState >= 1
    ) {

        atualizarDuracao();
    }
}


    /* ============================================================
       AUTOPLAY
    ============================================================ */

    async function iniciarAutoplay() {

        if (
            !audio ||
            !audio.src
        ) {

            return;
        }


        try {

            await audio.play();


            console.log(
                "Yoka: autoplay iniciado."
            );


            return;

        } catch (erro) {

            console.log(
                "Yoka: autoplay bloqueado pelo navegador."
            );
        }


        const eventos =
            [
                "canplay",
                "canplaythrough",
                "loadeddata"
            ];


        let tentativaFinalizada =
            false;


        const tentar =
            async function () {

                if (
                    tentativaFinalizada
                ) {

                    return;
                }


                try {

                    await audio.play();


                    tentativaFinalizada =
                        true;


                    eventos.forEach(
                        evento => {

                            audio.removeEventListener(
                                evento,
                                tentar
                            );
                        }
                    );


                    console.log(
                        "Yoka: autoplay iniciado após carregamento."
                    );


                } catch (erro) {

                    console.log(
                        "Yoka: navegador exige interação do utilizador."
                    );
                }
            };


        eventos.forEach(
            evento => {

                audio.addEventListener(
                    evento,
                    tentar
                );
            }
        );
    }


    /* ============================================================
       PARTILHAR MÚSICA
    ============================================================ */

    const shareButton =
        document.getElementById(
            "songShareButton"
        );

    const shareMenu =
        document.getElementById(
            "songShareMenu"
        );


    function obterLinkMusica() {

        return window.location.href;
    }


    function obterTextoPartilha() {

        const titulo =
            musica?.title ||
            musica?.titulo ||
            "Música";


        const artistaNome =
            musica?.artist_name ||
            musica?.artistName ||
            musica?.artist ||
            "Artista";


        return (
            `🎵 Ouça "${titulo}" de ${artistaNome} no Yoka`
        );
    }


    if (
        shareButton &&
        shareMenu
    ) {

        shareButton.addEventListener(
            "click",
            function (evento) {

                evento.stopPropagation();


                shareMenu.classList.toggle(
                    "active"
                );


                const aberto =
                    shareMenu.classList.contains(
                        "active"
                    );


                shareButton.setAttribute(
                    "aria-expanded",
                    aberto
                        ? "true"
                        : "false"
                );
            }
        );


        shareMenu
            .querySelectorAll(
                ".song-share-icon-button"
            )
            .forEach(
                botao => {

                    botao.addEventListener(
                        "click",
                        async function (evento) {

                            evento.stopPropagation();


                            const tipo =
                                botao.dataset.share;


                            const link =
                                obterLinkMusica();


                            const texto =
                                obterTextoPartilha();


                            if (
                                tipo ===
                                "facebook"
                            ) {

                                const url =
                                    "https://www.facebook.com/sharer/sharer.php?u=" +
                                    encodeURIComponent(
                                        link
                                    );


                                window.open(
                                    url,
                                    "_blank",
                                    "width=600,height=500"
                                );
                            }


                            else if (
                                tipo ===
                                "whatsapp"
                            ) {

                                const mensagem =
                                    texto +
                                    "\n\n" +
                                    link;


                                const url =
                                    "https://wa.me/?text=" +
                                    encodeURIComponent(
                                        mensagem
                                    );


                                window.open(
                                    url,
                                    "_blank"
                                );
                            }


                            else if (
                                tipo ===
                                "x"
                            ) {

                                const url =
                                    "https://twitter.com/intent/tweet?text=" +
                                    encodeURIComponent(
                                        texto
                                    ) +
                                    "&url=" +
                                    encodeURIComponent(
                                        link
                                    );


                                window.open(
                                    url,
                                    "_blank",
                                    "width=600,height=500"
                                );
                            }


                            else if (
                                tipo ===
                                "copy"
                            ) {

                                try {

                                    await navigator.clipboard.writeText(
                                        link
                                    );


                                    mostrarMensagemPartilha(
                                        "Link copiado!"
                                    );


                                } catch (erro) {

                                    const campo =
                                        document.createElement(
                                            "textarea"
                                        );


                                    campo.value =
                                        link;


                                    campo.style.position =
                                        "fixed";

                                    campo.style.left =
                                        "-9999px";


                                    document.body.appendChild(
                                        campo
                                    );


                                    campo.focus();

                                    campo.select();


                                    try {

                                        document.execCommand(
                                            "copy"
                                        );


                                        mostrarMensagemPartilha(
                                            "Link copiado!"
                                        );

                                    } catch {

                                        alert(
                                            "Copie este link:\n\n" +
                                            link
                                        );
                                    }


                                    campo.remove();
                                }
                            }


                            shareMenu.classList.remove(
                                "active"
                            );


                            shareButton.setAttribute(
                                "aria-expanded",
                                "false"
                            );
                        }
                    );
                }
            );


        document.addEventListener(
            "click",
            function () {

                shareMenu.classList.remove(
                    "active"
                );


                shareButton.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        );
    }


    /* ============================================================
       MENSAGEM DE PARTILHA
    ============================================================ */

    function mostrarMensagemPartilha(
        mensagem
    ) {

        let box =
            document.getElementById(
                "yokaShareMessage"
            );


        if (!box) {

            box =
                document.createElement(
                    "div"
                );


            box.id =
                "yokaShareMessage";


            box.style.position =
                "fixed";


            box.style.left =
                "50%";


            box.style.bottom =
                "30px";


            box.style.transform =
                "translateX(-50%)";


            box.style.zIndex =
                "99999";


            box.style.padding =
                "10px 18px";


            box.style.borderRadius =
                "10px";


            box.style.background =
                "#222";


            box.style.color =
                "#fff";


            box.style.fontSize =
                "14px";


            box.style.boxShadow =
                "0 6px 20px rgba(0,0,0,.2)";


            document.body.appendChild(
                box
            );
        }


        box.textContent =
            mensagem;


        box.style.display =
            "block";


        clearTimeout(
            box._timer
        );


        box._timer =
            setTimeout(
                function () {

                    box.style.display =
                        "none";

                },
                2200
            );
    }


    /* ============================================================
       SIDEBAR
    ============================================================ */

    const API_BASE =
        "https://wairujyynjohterkqort.supabase.co/functions/v1/yoka";


    /* ============================================================
       TOKEN SIDEBAR
    ============================================================ */

    function obterTokenSidebar() {

        if (
            typeof YokaAPI !==
            "undefined" &&
            typeof YokaAPI.obterToken ===
            "function"
        ) {

            return YokaAPI.obterToken();
        }


        return (
            localStorage.getItem(
                "yoka_token"
            ) ||
            localStorage.getItem(
                "token"
            ) ||
            localStorage.getItem(
                "accessToken"
            ) ||
            null
        );
    }


    /* ============================================================
       REQUISIÇÃO SIDEBAR
    ============================================================ */

    async function requisicaoSidebar(
        endpoint,
        opcoes = {}
    ) {

        /*
           Preferimos YokaAPI para manter
           a mesma autenticação do resto
           da página.
        */

        if (
            typeof YokaAPI !==
            "undefined" &&
            typeof YokaAPI.apiRequest ===
            "function"
        ) {

            return YokaAPI.apiRequest(
                endpoint,
                opcoes
            );
        }


        const token =
            obterTokenSidebar();


        const headers = {
            ...(opcoes.headers || {})
        };


        if (
            !(opcoes.body instanceof FormData)
        ) {

            headers["Content-Type"] =
                "application/json";
        }


        if (token) {

            headers.Authorization =
                `Bearer ${token}`;
        }


        const resposta =
            await fetch(
                API_BASE +
                endpoint,
                {
                    ...opcoes,
                    headers
                }
            );


        let dados =
            null;


        try {

            dados =
                await resposta.json();

        } catch {

            dados =
                null;
        }


        if (!resposta.ok) {

            throw new Error(
                dados?.mensagem ||
                "Erro ao comunicar com o servidor."
            );
        }


        return dados;
    }


    /* ============================================================
       ESCAPAR HTML
    ============================================================ */

    function escaparHTML(
        valor
    ) {

        if (
            valor === null ||
            valor === undefined
        ) {

            return "";
        }


        return String(valor)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }


    /* ============================================================
       URL DE ARQUIVO DA SIDEBAR
    ============================================================ */

    function urlArquivo(
        url
    ) {

        if (!url) {

            return "/assets/images/default-cover.jpg";
        }


        return obterUrlArquivo(
            url
        );
    }


    /* ============================================================
       CARD DA SIDEBAR
    ============================================================ */

function criarSidebarSongCard(musicaSidebar) {
    if (!musicaSidebar) {
        return "";
    }

    const id = musicaSidebar.id;

    if (!id) {
        console.warn(
            "Yoka: música da sidebar sem ID:",
            musicaSidebar
        );
        return "";
    }

    const titulo =
        musicaSidebar.title ||
        musicaSidebar.titulo ||
        "Sem título";

    const artistaNome =
        musicaSidebar.artist_name ||
        musicaSidebar.artistName ||
        musicaSidebar.artist ||
        "Artista";

    const genero =
        musicaSidebar.genre ||
        musicaSidebar.genero ||
        "";

    const capa = urlArquivo(
        musicaSidebar.cover_url ||
        musicaSidebar.coverUrl ||
        musicaSidebar.cover
    );

    return `
        <article
            class="sidebar-song-card"
            data-song-id="${escaparHTML(id)}"
        >
            <a
                href="/song.html?id=${encodeURIComponent(id)}&autoplay=1"
                class="sidebar-song-link"
            >
                <div class="sidebar-song-cover-wrapper">

                    <img
                        class="sidebar-song-cover"
                        src="${escaparHTML(capa)}"
                        alt="${escaparHTML(titulo)}"
                        loading="lazy"
                    >

                    ${
                        genero
                            ? `
                                <span class="sidebar-song-genre">
                                    ${escaparHTML(genero)}
                                </span>
                            `
                            : ""
                    }

                </div>

                <div class="sidebar-song-info">
                    <h3 class="sidebar-song-title">
                        ${escaparHTML(titulo)}
                    </h3>

                    <p class="sidebar-song-artist">
                        ${escaparHTML(artistaNome)}
                    </p>
                </div>
            </a>
        </article>
    `;
}

    /* ============================================================
       RENDERIZAR SIDEBAR
    ============================================================ */

    function renderizarSidebarLista(
        elemento,
        musicas,
        mensagemVazia
    ) {

        if (!elemento) {

            return;
        }


        if (
            !Array.isArray(musicas) ||
            musicas.length === 0
        ) {

            elemento.innerHTML =
                `
                <div class="sidebar-empty">
                    ${escaparHTML(
                        mensagemVazia
                    )}
                </div>
                `;

            return;
        }


        elemento.innerHTML =
            musicas
                .map(
                    criarSidebarSongCard
                )
                .join("");
    }


    /* ============================================================
       MAIS MÚSICAS DO ARTISTA
    ============================================================ */

    async function carregarMusicasDoArtistaSidebar(
        musicaId
    ) {

        const elemento =
            document.getElementById(
                "artistSongsList"
            );


        if (
            !elemento ||
            !musicaId
        ) {

            return;
        }


        elemento.innerHTML =
            `
            <div class="sidebar-loading">
                Carregando...
            </div>
            `;


        try {

            const dados =
                await requisicaoSidebar(
                    "/songs/" +
                    encodeURIComponent(
                        musicaId
                    ) +
                    "/artist"
                );


            renderizarSidebarLista(
                elemento,
                dados?.musicas ||
                dados?.songs ||
                [],
                "Nenhuma outra música encontrada."
            );


        } catch (erro) {

            console.error(
                "Yoka: erro ao carregar músicas do artista:",
                erro
            );


            elemento.innerHTML =
                `
                <div class="sidebar-error">
                    Não foi possível carregar.
                </div>
                `;
        }
    }


    /* ============================================================
       FAVORITOS SIDEBAR
    ============================================================ */

    async function carregarFavoritosSidebar() {

        const elemento =
            document.getElementById(
                "favoritesSongsList"
            );


        if (!elemento) {

            return;
        }


        if (!obterTokenSidebar()) {

            elemento.innerHTML =
                `
                <div class="sidebar-empty">
                    Faça login para ver os favoritos.
                </div>
                `;

            return;
        }


        elemento.innerHTML =
            `
            <div class="sidebar-loading">
                Carregando favoritos...
            </div>
            `;


        try {

            const dados =
                await requisicaoSidebar(
                    "/songs/favorites"
                );


            renderizarSidebarLista(
                elemento,
                dados?.musicas ||
                dados?.songs ||
                [],
                "Ainda não tens músicas favoritas."
            );


        } catch (erro) {

            console.error(
                "Yoka: erro ao carregar favoritos:",
                erro
            );


            elemento.innerHTML =
                `
                <div class="sidebar-error">
                    Não foi possível carregar os favoritos.
                </div>
                `;
        }
    }
function atualizarEstadoBotoesLista() {
    let categoriaAtiva = null;

    try {
        const filaGuardada = sessionStorage.getItem(
            "yoka_sidebar_playlist"
        );

        if (filaGuardada) {
            const fila = JSON.parse(filaGuardada);
            categoriaAtiva = fila.categoria || null;
        }
    } catch (erro) {
        console.warn(
            "Não foi possível verificar a lista ativa.",
            erro
        );
    }

    const botoes = [
        {
            id: "playArtistSongsButton",
            categoria: "artist"
        },
        {
            id: "playFavoritesSongsButton",
            categoria: "favorites"
        }
    ];

    botoes.forEach(({ id, categoria }) => {
        const botao = document.getElementById(id);

        if (!botao) return;

        const ativo = categoriaAtiva === categoria;

        botao.classList.toggle("ativo", ativo);
        botao.setAttribute("aria-pressed", String(ativo));

        botao.textContent = ativo
            ? "■ Desativar lista"
            : "▶ Ouvir lista";
    });
}

function desativarFilaCategoria() {
    try {
        sessionStorage.removeItem("yoka_sidebar_playlist");
    } catch (erro) {
        console.error(
            "Yoka: erro ao desativar a lista:",
            erro
        );
    }

    atualizarEstadoBotoesLista();
}

function configurarBotoesLista() {
    const botoes = [
        {
            id: "playArtistSongsButton",
            categoria: "artist"
        },
        {
            id: "playFavoritesSongsButton",
            categoria: "favorites"
        }
    ];

    botoes.forEach(({ id, categoria }) => {
        const botao = document.getElementById(id);

        if (!botao || botao.dataset.listaToggleConfigurado) {
            return;
        }

        botao.dataset.listaToggleConfigurado = "true";

        botao.addEventListener("click", function () {
            if (botao.classList.contains("ativo")) {
                desativarFilaCategoria();
                return;
            }

            iniciarFilaCategoria(categoria);
        });
    });

    atualizarEstadoBotoesLista();
}



/* ============================================================
   YOKA — FILAS DE REPRODUÇÃO POR CATEGORIA
============================================================ */

const YOKA_CHAVE_FILA = "yoka_sidebar_playlist";

function obterIdsSidebar(elementoId) {
    const elemento = document.getElementById(elementoId);

    if (!elemento) return [];

    return [
        ...elemento.querySelectorAll(
            ".sidebar-song-card[data-song-id]"
        )
    ]
        .map(card => card.dataset.songId)
        .filter(Boolean)
        .filter((id, indice, lista) =>
            lista.indexOf(id) === indice
        );
}

function iniciarFilaCategoria(categoria) {
    let ids = [];

    if (categoria === "artist") {
        // Inclui a música atual e as restantes do artista.
        ids = [
            String(songId),
            ...obterIdsSidebar("artistSongsList")
        ];
    }

    if (categoria === "favorites") {
        ids = obterIdsSidebar("favoritesSongsList");
    }

    // Evita músicas repetidas na fila.
    ids = ids
        .filter(Boolean)
        .filter((id, indice, lista) =>
            lista.indexOf(id) === indice
        );

    if (ids.length === 0) {
        alert(
            categoria === "favorites"
                ? "Não tens músicas favoritas para reproduzir."
                : "Não existem músicas deste artista para reproduzir."
        );
        return;
    }

    const fila = {
        categoria,
        ids
    };

    try {
        sessionStorage.setItem(
            YOKA_CHAVE_FILA,
            JSON.stringify(fila)
        );
    } catch (erro) {
        console.error(
            "Yoka: não foi possível guardar a fila:",
            erro
        );
        return;
    }
atualizarEstadoBotoesLista();
    const primeiraMusica = ids[0];

   
if (String(songId) === String(primeiraMusica)) {
    const audio = document.getElementById("songAudio");

    if (audio && audio.paused) {
        audio.play().catch(erro => {
            console.error(
                "Yoka: não foi possível iniciar a reprodução:",
                erro
            );
        });
    }

    return;
}


    window.location.href =
        "/song.html?id=" +
        encodeURIComponent(primeiraMusica) +
        "&autoplay=1";
}

configurarBotoesLista();

    /* ============================================================
       SUGESTÕES
    ============================================================ */

    async function carregarSugestoesSidebar(
        musicaId
    ) {

        const elemento =
            document.getElementById(
                "suggestionsSongsList"
            );


        if (
            !elemento ||
            !musicaId
        ) {

            return;
        }


        elemento.innerHTML =
            `
            <div class="sidebar-loading">
                Carregando sugestões...
            </div>
            `;


        try {

            const dados =
                await requisicaoSidebar(
                    "/songs/" +
                    encodeURIComponent(
                        musicaId
                    ) +
                    "/suggestions"
                );


            renderizarSidebarLista(
                elemento,
                dados?.musicas ||
                dados?.songs ||
                [],
                "Nenhuma sugestão encontrada."
            );


        } catch (erro) {

            console.error(
                "Yoka: erro ao carregar sugestões:",
                erro
            );


            elemento.innerHTML =
                `
                <div class="sidebar-error">
                    Não foi possível carregar.
                </div>
                `;
        }
    }


    /* ============================================================
       INICIALIZAR SIDEBAR
    ============================================================ */

    async function inicializarSidebar(
        musicaId
    ) {

        if (!musicaId) {

            return;
        }


        await Promise.allSettled([
            carregarMusicasDoArtistaSidebar(
                musicaId
            ),

            carregarFavoritosSidebar(),

            carregarSugestoesSidebar(
                musicaId
            )
        ]);
    }

function formatarDataPublicacao(data) {

    if (!data) {
        return "";
    }

    const dataPublicacao = new Date(data);

    if (Number.isNaN(dataPublicacao.getTime())) {
        return "";
    }

    const agora = new Date();

    const diferencaMs =
        agora.getTime() -
        dataPublicacao.getTime();

    const diferencaSegundos =
        Math.floor(diferencaMs / 1000);

    const diferencaMinutos =
        Math.floor(diferencaSegundos / 60);

    const diferencaHoras =
        Math.floor(diferencaMinutos / 60);

    const diferencaDias =
        Math.floor(diferencaHoras / 24);


    if (diferencaMs < 0) {

        return dataPublicacao.toLocaleDateString(
            "pt-PT",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

    }


    if (diferencaSegundos < 60) {
        return "agora";
    }


    if (diferencaMinutos < 60) {

        return diferencaMinutos === 1
            ? "há 1 minuto"
            : `há ${diferencaMinutos} minutos`;

    }


    if (diferencaHoras < 24) {

        return diferencaHoras === 1
            ? "há 1 hora"
            : `há ${diferencaHoras} horas`;

    }


    if (diferencaDias === 1) {
        return "ontem";
    }


    if (diferencaDias < 7) {
        return `há ${diferencaDias} dias`;
    }


    if (diferencaDias < 30) {

        const semanas =
            Math.floor(diferencaDias / 7);

        return semanas === 1
            ? "há 1 semana"
            : `há ${semanas} semanas`;

    }


    if (diferencaDias < 365) {

        const meses =
            Math.floor(diferencaDias / 30);

        return meses === 1
            ? "há 1 mês"
            : `há ${meses} meses`;

    }


    return dataPublicacao.toLocaleDateString(
        "pt-PT",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );
}
    /* ============================================================
       DATAS
    ============================================================ */

    function formatarData(
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
                day:
                    "2-digit",

                month:
                    "2-digit",

                year:
                    "numeric",

                hour:
                    "2-digit",

                minute:
                    "2-digit"
            }
        );
    }


    function formatarDataPost(
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


        return dataObj.toLocaleDateString(
            "pt-PT",
            {
                day:
                    "2-digit",

                month:
                    "2-digit",

                year:
                    "numeric"
            }
        );
    }


    /* ============================================================
       ESCAPAR HTML
    ============================================================ */

    function escapeHtml(
        valor
    ) {

        return String(
            valor ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }


    /* ============================================================
       URL DOS ARQUIVOS
    ============================================================ */

    function obterUrlArquivo(
        caminho
    ) {

        if (!caminho) {

            return "";
        }


        if (
            caminho.startsWith(
                "http://"
            ) ||
            caminho.startsWith(
                "https://"
            ) ||
            caminho.startsWith(
                "data:"
            ) ||
            caminho.startsWith(
                "blob:"
            )
        ) {

            return caminho;
        }


        /*
           Se o backend devolver:
           /uploads/capas/abc.jpg
        */

        let origem =
            "";


        if (
            typeof YokaAPI !==
            "undefined" &&
            YokaAPI.API_BASE_URL
        ) {

            origem =
                YokaAPI.API_BASE_URL
                    .replace(
                        /\/api\/v1\/?$/,
                        ""
                    );
        }


        /*
           Caminho absoluto.
        */

        if (
            caminho.startsWith("/")
        ) {

            return origem +
                caminho;
        }


        /*
           Caminho relativo.
        */

        return origem +
            "/" +
            caminho.replace(
                /^\/+/,
                ""
            );
    }


    /* ============================================================
       STATUS
    ============================================================ */

    function formatarStatus(
        valor
    ) {

        switch (valor) {

            case "published":
                return "Publicada";

            case "draft":
                return "Rascunho";

            case "archived":
                return "Arquivada";

            default:
                return valor ||
                    "Sem estado";
        }
    }






function atualizarReflexoCapa() {
    const capa = document.querySelector(".song-cover");
    const container = document.querySelector(".song-cover-container");

    if (!capa || !container) {
        console.warn("Yoka: capa ou contentor não encontrado.");
        return;
    }

    function aplicarFundo() {
        const imagem = capa.currentSrc || capa.src;

        if (imagem) {
            container.style.backgroundImage = `url("${imagem}")`;
            container.style.backgroundSize = "cover";
            container.style.backgroundPosition = "center";
            container.style.setProperty("--cover-bg", `url("${imagem}")`);
        }
    }

    aplicarFundo();

    capa.addEventListener("load", aplicarFundo);

    new MutationObserver(aplicarFundo).observe(capa, {
        attributes: true,
        attributeFilter: ["src"]
    });
}

atualizarReflexoCapa();



function atualizarReflexoPublicidade() {
    const capa = document.querySelector(".song-cover");
    const anuncio = document.getElementById("songAd");

    if (!capa || !anuncio) return;

    function aplicarReflexo() {
        const imagem = capa.currentSrc || capa.src;

        if (imagem) {
            anuncio.style.setProperty(
                "--cover-bg",
                `url("${imagem}")`
            );
        }
    }

    aplicarReflexo();

    capa.addEventListener("load", aplicarReflexo);

    new MutationObserver(aplicarReflexo).observe(capa, {
        attributes: true,
        attributeFilter: ["src"]
    });
}

document.addEventListener(
    "DOMContentLoaded",
    atualizarReflexoPublicidade
);
















    
    /* ============================================================
       MOSTRAR ERRO
    ============================================================ */

    function mostrarErro(
        mensagem
    ) {

        if (loading) {

            loading.style.display =
                "none";
        }


        if (content) {

            content.style.display =
                "none";
        }


        if (errorBox) {

            errorBox.style.display =
                "block";


            errorBox.textContent =
                mensagem;
        }
    }


    /* ============================================================
       INICIAR COMENTÁRIOS
    ============================================================ */

    await carregarComentarios();


    /* ============================================================
       INICIAR SIDEBAR
    ============================================================ */

    await inicializarSidebar(
        songId
    );


    /* ============================================================
       FINAL
    ============================================================ */

    console.log(
        "Yoka: página da música carregada."
    );

});






