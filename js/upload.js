
document.addEventListener("DOMContentLoaded", () => {

    const token = YokaAPI.obterToken();

    /*
    |----------------------------------------------------------------------
    | VERIFICAR LOGIN
    |----------------------------------------------------------------------
    */

    if (!token) {
        window.location.href = "login.html";
        return;
    }


    /*
    |----------------------------------------------------------------------
    | ELEMENTOS
    |----------------------------------------------------------------------
    */

    const form =
        document.getElementById("uploadForm");

    const mensagem =
        document.getElementById("uploadMensagem");

    const botao =
        document.getElementById("btnUpload");

    const progressContainer =
        document.getElementById("uploadProgressContainer");

    const progressBar =
        document.getElementById("uploadProgressBar");

    const progressText =
        document.getElementById("uploadProgressText");

    const usuarioNome =
        document.getElementById("usuarioNome");


    /*
    |----------------------------------------------------------------------
    | MOSTRAR UTILIZADOR
    |----------------------------------------------------------------------
    */

    try {

        const salvo =
            localStorage.getItem("yoka_usuario");

        if (salvo && usuarioNome) {

            const usuario =
                JSON.parse(salvo);

            usuarioNome.textContent =
                usuario.name || "Usuário";
        }

    } catch (erro) {

        console.error(
            "Erro ao ler utilizador:",
            erro
        );
    }


    /*
    |----------------------------------------------------------------------
    | VERIFICAR FORMULÁRIO
    |----------------------------------------------------------------------
    */

    if (!form) {

        console.error(
            "Formulário de upload não encontrado."
        );

        return;
    }


    /*
    |----------------------------------------------------------------------
    | SUBMIT
    |----------------------------------------------------------------------
    */

    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            /*
            |--------------------------------------------------------------
            | ARQUIVOS
            |--------------------------------------------------------------
            */

            const audioInput =
                document.getElementById("audio");

            const coverInput =
                document.getElementById("cover");


            const audio =
                audioInput?.files?.[0];

            const cover =
                coverInput?.files?.[0];


            /*
            |--------------------------------------------------------------
            | VALIDAR ÁUDIO
            |--------------------------------------------------------------
            */

            if (!audio) {

                mostrarMensagem(
                    "Selecione o arquivo de áudio.",
                    true
                );

                return;
            }


            /*
            |--------------------------------------------------------------
            | VALIDAR CAPA
            |--------------------------------------------------------------
            */

            if (!cover) {

                mostrarMensagem(
                    "Selecione a capa da música.",
                    true
                );

                return;
            }


            /*
            |--------------------------------------------------------------
            | LIMITE DO ÁUDIO
            |--------------------------------------------------------------
            */

            const limiteAudio =
                50 * 1024 * 1024;


            if (audio.size > limiteAudio) {

                mostrarMensagem(
                    "O áudio não pode ultrapassar 50 MB.",
                    true
                );

                return;
            }


            /*
            |--------------------------------------------------------------
            | LIMPAR MENSAGEM
            |--------------------------------------------------------------
            */

            if (mensagem) {

                mensagem.style.display =
                    "none";

                mensagem.textContent =
                    "";
            }


            /*
            |--------------------------------------------------------------
            | FORMDATA
            |--------------------------------------------------------------
            */

            const formData =
                new FormData(form);


            /*
            |--------------------------------------------------------------
            | BLOQUEAR BOTÃO
            |--------------------------------------------------------------
            */

            botao.disabled =
                true;

            botao.textContent =
                "Enviando...";


            if (progressContainer) {

                progressContainer.style.display =
                    "block";
            }


            atualizarProgresso(0);


            try {

                /*
                ==========================================================
                ETAPA 1
                ENVIAR ARQUIVOS + DADOS
                ==========================================================
                */

                const resultado =
                    await enviarUpload(
                        formData,
                        token
                    );


                console.log(
                    "Upload concluído:",
                    resultado
                );


                if (
                    !resultado ||
                    !resultado.sucesso
                ) {

                    throw new Error(
                        resultado?.mensagem ||
                        "Não foi possível enviar a música."
                    );
                }


                /*
                ==========================================================
                OBTER MÚSICA
                ==========================================================
                */

                const musica =
                    resultado.musica;


                if (
                    !musica ||
                    !musica.id
                ) {

                    throw new Error(
                        "A música foi enviada, mas o servidor não retornou o ID da música."
                    );
                }


                const musicaId =
                    musica.id;


                console.log(
                    "ID da música criada:",
                    musicaId
                );


                /*
                ==========================================================
                ETAPA 2
                PUBLICAR AUTOMATICAMENTE
                ==========================================================
                */

                botao.textContent =
                    "Publicando...";


                atualizarProgresso(100);


                const resultadoPublicacao =
                    await publicarMusica(
                        musicaId,
                        token
                    );


                console.log(
                    "Publicação concluída:",
                    resultadoPublicacao
                );


                if (
                    !resultadoPublicacao ||
                    !resultadoPublicacao.sucesso
                ) {

                    throw new Error(
                        resultadoPublicacao?.mensagem ||
                        "A música foi enviada, mas não foi possível publicá-la."
                    );
                }


                /*
                ==========================================================
                ETAPA 3
                BUSCAR PERFIL DO ARTISTA
                ==========================================================
                */

                botao.textContent =
                    "Concluído";


                mostrarMensagem(
                    "Música enviada e publicada com sucesso!",
                    false
                );


                const perfil =
                    await buscarMeuPerfil(token);


                console.log(
                    "Perfil do artista:",
                    perfil
                );


                /*
                ==========================================================
                REDIRECIONAR PARA O PERFIL
                ==========================================================
                */

                if (
                    perfil &&
                    perfil.id
                ) {

                    setTimeout(() => {

                        window.location.href =
                            `artist.html?id=${encodeURIComponent(
                                perfil.id
                            )}`;

                    }, 1000);

                    return;
                }


                /*
                ==========================================================
                CASO NÃO ENCONTRE O PERFIL
                ==========================================================
                */

                console.warn(
                    "Perfil do artista não encontrado."
                );


                setTimeout(() => {

                    window.location.href =
                        "artist.html";

                }, 1000);


            } catch (erro) {

                console.error(
                    "Erro no upload/publicação:",
                    erro
                );


                mostrarMensagem(
                    erro.message ||
                    "Erro ao enviar ou publicar a música.",
                    true
                );


                botao.disabled =
                    false;


                botao.textContent =
                    "Enviar música";


                atualizarProgresso(0);
            }

        }
    );


    /*
    |----------------------------------------------------------------------
    | ENVIAR UPLOAD
    |----------------------------------------------------------------------
    */

    function enviarUpload(
        formData,
        token
    ) {

        return new Promise(
            (resolve, reject) => {

                const xhr =
                    new XMLHttpRequest();


                xhr.open(
                    "POST",
                    `${YokaAPI.API_BASE_URL}/songs/upload`
                );


                /*
                |----------------------------------------------------------
                | JWT
                |----------------------------------------------------------
                */

                xhr.setRequestHeader(
                    "Authorization",
                    `Bearer ${token}`
                );


                /*
                |----------------------------------------------------------
                | PROGRESSO
                |----------------------------------------------------------
                */

                xhr.upload.addEventListener(
                    "progress",
                    (event) => {

                        if (
                            event.lengthComputable
                        ) {

                            const porcentagem =
                                Math.round(
                                    (
                                        event.loaded /
                                        event.total
                                    ) * 100
                                );


                            atualizarProgresso(
                                porcentagem
                            );
                        }

                    }
                );


                /*
                |----------------------------------------------------------
                | RESPOSTA
                |----------------------------------------------------------
                */

                xhr.addEventListener(
                    "load",
                    () => {

                        let dados;


                        try {

                            dados =
                                JSON.parse(
                                    xhr.responseText
                                );

                        } catch (erro) {

                            reject(
                                new Error(
                                    "Resposta inválida do servidor."
                                )
                            );

                            return;
                        }


                        if (
                            xhr.status >= 200 &&
                            xhr.status < 300
                        ) {

                            resolve(
                                dados
                            );

                        } else {

                            const erro =
                                new Error(
                                    dados.mensagem ||
                                    "Erro no upload."
                                );


                            erro.status =
                                xhr.status;


                            reject(
                                erro
                            );
                        }

                    }
                );


                /*
                |----------------------------------------------------------
                | ERRO DE REDE
                |----------------------------------------------------------
                */

                xhr.addEventListener(
                    "error",
                    () => {

                        reject(
                            new Error(
                                "Não foi possível conectar ao servidor."
                            )
                        );

                    }
                );


                /*
                |----------------------------------------------------------
                | ABORTADO
                |----------------------------------------------------------
                */

                xhr.addEventListener(
                    "abort",
                    () => {

                        reject(
                            new Error(
                                "Upload cancelado."
                            )
                        );

                    }
                );


                /*
                |----------------------------------------------------------
                | ENVIAR
                |----------------------------------------------------------
                */

                xhr.send(
                    formData
                );

            }
        );

    }


    /*
    |----------------------------------------------------------------------
    | PUBLICAR MÚSICA
    |----------------------------------------------------------------------
    */

    async function publicarMusica(
        musicaId,
        token
    ) {

        if (!musicaId) {

            throw new Error(
                "ID da música não informado."
            );
        }


        console.log(
            "Publicando automaticamente:",
            musicaId
        );


        const resposta =
            await fetch(
                `${YokaAPI.API_BASE_URL}/songs/${encodeURIComponent(musicaId)}/publish`,
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        let dados;


        try {

            dados =
                await resposta.json();

        } catch (erro) {

            throw new Error(
                "Resposta inválida do servidor ao publicar a música."
            );
        }


        console.log(
            "Resposta da publicação:",
            dados
        );


        if (!resposta.ok) {

            const erro =
                new Error(
                    dados.mensagem ||
                    "Não foi possível publicar a música."
                );


            erro.status =
                resposta.status;


            throw erro;
        }


        if (!dados.sucesso) {

            throw new Error(
                dados.mensagem ||
                "Não foi possível publicar a música."
            );
        }


        return dados;
    }


    /*
    |----------------------------------------------------------------------
    | BUSCAR MEU PERFIL DE ARTISTA
    |----------------------------------------------------------------------
    */

    async function buscarMeuPerfil(token) {

        const resposta =
            await fetch(
                `${YokaAPI.API_BASE_URL}/artists/me`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        let dados;


        try {

            dados =
                await resposta.json();

        } catch (erro) {

            throw new Error(
                "Resposta inválida do servidor ao buscar o perfil."
            );
        }


        console.log(
            "Resposta /artists/me:",
            dados
        );


        if (!resposta.ok) {

            throw new Error(
                dados.mensagem ||
                "Não foi possível encontrar o perfil do artista."
            );
        }


        if (!dados.sucesso) {

            throw new Error(
                dados.mensagem ||
                "Não foi possível encontrar o perfil do artista."
            );
        }


        /*
        |--------------------------------------------------------------
        | O BACKEND PODE RETORNAR:
        |
        | { sucesso:true, perfil:{...} }
        |
        | ou diretamente os dados do perfil.
        |--------------------------------------------------------------
        */

        if (
            dados.perfil &&
            dados.perfil.id
        ) {

            return dados.perfil;
        }


        if (dados.id) {

            return dados;
        }


        throw new Error(
            "O servidor não retornou o ID do perfil do artista."
        );
    }


    /*
    |----------------------------------------------------------------------
    | ATUALIZAR PROGRESSO
    |----------------------------------------------------------------------
    */

    function atualizarProgresso(
        porcentagem
    ) {

        if (progressBar) {

            progressBar.style.width =
                `${porcentagem}%`;
        }


        if (progressText) {

            progressText.textContent =
                `${porcentagem}%`;
        }
    }


    /*
    |----------------------------------------------------------------------
    | MOSTRAR MENSAGEM
    |----------------------------------------------------------------------
    */

    function mostrarMensagem(
        texto,
        erro
    ) {

        if (!mensagem) {
            return;
        }


        mensagem.textContent =
            texto;


        mensagem.style.display =
            "block";


        mensagem.style.color =
            erro
                ? "#dc2626"
                : "#16a34a";
    }

});

