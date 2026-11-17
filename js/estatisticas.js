"use strict";

/*
|--------------------------------------------------------------------------
| CONFIGURAÇÃO
|--------------------------------------------------------------------------
*/





/*
|--------------------------------------------------------------------------
| ELEMENTOS
|--------------------------------------------------------------------------
*/

let elements = {};


/*
|--------------------------------------------------------------------------
| TOKEN
|--------------------------------------------------------------------------
*/

function obterToken() {

    return (
        localStorage.getItem("token") ||
        localStorage.getItem("yoka_token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token")
    );
}


/*
|--------------------------------------------------------------------------
| REQUEST
|--------------------------------------------------------------------------
*/

async function apiFetch(endpoint) {

    const token = obterToken();

    if (!token) {
        throw new Error(
            "Faça login para acessar as estatísticas."
        );
    }

    const response = await fetch(
     `${window.YokaAPI.API_BASE_URL}${endpoint}`,
        {
            method: "GET",

            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            }
        }
    );

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error(
            "Resposta inválida do servidor."
        );
    }

    if (!response.ok || data.sucesso === false) {

        throw new Error(
            data.mensagem ||
            `Erro ${response.status} ao carregar os dados.`
        );
    }

    return data;
}


/*
|--------------------------------------------------------------------------
| FORMATAÇÃO
|--------------------------------------------------------------------------
*/

function numero(valor) {

    const valorNumerico = Number(valor) || 0;

    return valorNumerico.toLocaleString("pt-AO");
}


function escaparHTML(valor) {

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatarData(data) {

    if (!data) {
        return "";
    }

    const partes = String(data).split("-");

    if (partes.length !== 3) {
        return String(data);
    }

    return `${partes[2]}/${partes[1]}`;
}


function formatarStatus(status) {

    const estados = {

        published: {
            texto: "Publicada",
            classe: "status-published"
        },

        draft: {
            texto: "Rascunho",
            classe: "status-draft"
        },

        archived: {
            texto: "Arquivada",
            classe: "status-archived"
        }
    };

    return estados[status] || {

        texto: status || "Desconhecido",
        classe: ""
    };
}


/*
|--------------------------------------------------------------------------
| RESUMO
|--------------------------------------------------------------------------
*/

function renderizarResumo(resumo) {

    elements.totalMusicas.textContent =
        numero(resumo.total_musicas);

    elements.totalReproducoes.textContent =
        numero(resumo.total_reproducoes);

    elements.totalCurtidas.textContent =
        numero(resumo.total_curtidas);

    elements.totalSeguidores.textContent =
        numero(resumo.total_seguidores);

    elements.totalComentarios.textContent =
        numero(resumo.total_comentarios);
}


/*
|--------------------------------------------------------------------------
| GRÁFICOS DE BARRAS
|--------------------------------------------------------------------------
*/

function renderizarGrafico(
    container,
    dados,
    valueKey,
    vazioTexto = "Sem dados no período."
) {

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (
        !Array.isArray(dados) ||
        dados.length === 0
    ) {

        container.innerHTML = `
            <div class="chart-empty">
                ${escaparHTML(vazioTexto)}
            </div>
        `;

        return;
    }


    const valores = dados.map(
        item => Number(item[valueKey]) || 0
    );


    const maiorValor =
        Math.max(...valores, 1);


    const chart =
        document.createElement("div");

    chart.className =
        "simple-chart";


    const bars =
        document.createElement("div");

    bars.className =
        "chart-bars";


    dados.forEach(item => {

        const valor =
            Number(item[valueKey]) || 0;


        const altura =
            valor > 0
                ? Math.max(
                    (valor / maiorValor) * 100,
                    4
                )
                : 2;


        const wrapper =
            document.createElement("div");

        wrapper.className =
            "chart-bar-wrapper";


        wrapper.title =
            `${formatarData(item.data)}: ${numero(valor)}`;


        const value =
            document.createElement("div");

        value.className =
            "chart-bar-value";


        if (valor > 0) {
            value.textContent =
                numero(valor);
        }


        const bar =
            document.createElement("div");

        bar.className =
            "chart-bar";


        bar.style.height =
            `${altura}%`;


        const label =
            document.createElement("div");

        label.className =
            "chart-label";


        label.textContent =
            formatarData(item.data);


        label.title =
            item.data || "";


        wrapper.appendChild(value);
        wrapper.appendChild(bar);
        wrapper.appendChild(label);

        bars.appendChild(wrapper);
    });


    chart.appendChild(bars);

    container.appendChild(chart);
}


/*
|--------------------------------------------------------------------------
| TABELA DE MÚSICAS
|--------------------------------------------------------------------------
*/


function renderizarMusicas(musicas) {

    elements.songsTableBody.innerHTML = "";

    if (!Array.isArray(musicas) || musicas.length === 0) {
        elements.noSongs.hidden = false;
        return;
    }

    elements.noSongs.hidden = true;

    musicas.forEach(musica => {

        const tr = document.createElement("tr");

        const status = formatarStatus(musica.status);

        const capa = musica.cover_url || DEFAULT_COVER;

        const nome = escaparHTML(
            musica.title || "Sem título"
        );

        const genero = escaparHTML(
            musica.genre || "Sem género"
        );

        tr.innerHTML = `
            <td>
                <div class="song-cell">
                    <img
                        class="song-cover"
                        src="${escaparHTML(capa)}"
                        alt=""
                        loading="lazy"
                    >

                    <div>
                        <div class="song-name">${nome}</div>
                        <div class="song-genre">${genero}</div>
                    </div>
                </div>
            </td>

            <td>
                <span class="status-badge ${status.classe}">
                    ${escaparHTML(status.texto)}
                </span>
            </td>

            <td>${numero(musica.reproducoes)}</td>
            <td>${numero(musica.curtidas)}</td>
            <td>${numero(musica.comentarios)}</td>
        `;

        const imagem = tr.querySelector(".song-cover");

        imagem.addEventListener("error", function () {

            if (this.dataset.fallbackAplicado === "true") {
                return;
            }

            this.dataset.fallbackAplicado = "true";
            this.src = DEFAULT_COVER;
        });

        elements.songsTableBody.appendChild(tr);
    });
}



/*
|--------------------------------------------------------------------------
| CARREGAR ESTATÍSTICAS
|--------------------------------------------------------------------------
*/

async function carregarEstatisticas() {

    const dias =
        Number(elements.period.value) || 30;


    elements.loading.hidden = false;
    elements.error.hidden = true;
    elements.content.hidden = true;


    try {

        console.log(
            "[Yoka] Carregando estatísticas..."
        );



const resultados = await Promise.allSettled([
    apiFetch("/stats/artist"),
    apiFetch("/stats/artist/songs"),
    apiFetch(`/stats/artist/evolution?dias=${dias}`)
]);

const [resumoResultado, musicasResultado, evolucaoResultado] = resultados;

if (musicasResultado.status === "rejected") {
    throw new Error(
        `Não foi possível carregar as músicas: ${
            musicasResultado.reason?.message || "erro desconhecido"
        }`
    );
}

const resumoResponse =
    resumoResultado.status === "fulfilled"
        ? resumoResultado.value
        : {};

const musicasResponse = musicasResultado.value;

const evolucaoResponse =
    evolucaoResultado.status === "fulfilled"
        ? evolucaoResultado.value
        : {};

resultados.forEach((resultado, indice) => {
    if (resultado.status === "rejected") {
        const pedidos = [
            "/stats/artist",
            "/stats/artist/songs",
            `/stats/artist/evolution?dias=${dias}`
        ];

        console.error(
            `[Yoka] Falha no pedido ${pedidos[indice]}:`,
            resultado.reason
        );
    }
});



        console.log(
            "[Yoka] Estatísticas recebidas:",
            {
                resumo: resumoResponse,
                musicas: musicasResponse,
                evolucao: evolucaoResponse
            }
        );


        renderizarResumo(
            resumoResponse.resumo || {}
        );


        renderizarMusicas(
            musicasResponse.musicas || []
        );


        const evolucao =
            evolucaoResponse.evolucao || {};


        renderizarGrafico(

            elements.playsChart,

            evolucao.reproducoes || [],

            "reproducoes",

            "Ainda não existem reproduções neste período."
        );


        renderizarGrafico(

            elements.likesChart,

            evolucao.curtidas || [],

            "curtidas",

            "Ainda não existem curtidas neste período."
        );


        renderizarGrafico(

            elements.followersChart,

            evolucao.seguidores || [],

            "novos_seguidores",

            "Ainda não existem novos seguidores neste período."
        );


        renderizarGrafico(

            elements.commentsChart,

            evolucao.comentarios || [],

            "comentarios",

            "Ainda não existem comentários neste período."
        );


        elements.loading.hidden = true;

        elements.content.hidden = false;


        console.log(
            "[Yoka] Estatísticas carregadas com sucesso."
        );

    } catch (erro) {
console.error("[Yoka] Erro ao carregar estatísticas:", {
    mensagem: erro.message,
    stack: erro.stack,
    erro: erro
});

        elements.loading.hidden = true;

        elements.content.hidden = true;

        elements.error.hidden = false;


        elements.error.textContent =
            erro.message ||
            "Não foi possível carregar as estatísticas.";
    }
}




(() => {
    "use strict";

    const avatarButton = document.getElementById("userAvatarButton");
    const dropdown = document.getElementById("userDropdown");
    const avatar = document.getElementById("headerAvatar");
    const userMenu = document.getElementById("userMenu");
    const logoutButton = document.getElementById("logoutButton");
    const profileMenuLink = document.getElementById("profileMenuLink");

    const DEFAULT_AVATAR = "./assets/images/default-avatar.svg";

    if (!avatarButton || !dropdown || !avatar || !userMenu) {
        console.warn("Yoka: elementos do menu do avatar não encontrados.");
        return;
    }

    function obterTokenAvatar() {
        return (
            localStorage.getItem("token") ||
            localStorage.getItem("yoka_token") ||
            localStorage.getItem("accessToken") ||
            localStorage.getItem("access_token")
        );
    }

    function obterHeadersAvatar() {
        const token = obterTokenAvatar();

        return token
            ? {
                Accept: "application/json",
                Authorization: `Bearer ${token}`
            }
            : { Accept: "application/json" };
    }

    async function carregarAvatar() {
        if (!obterTokenAvatar()) {
            userMenu.classList.add("hidden");
            return;
        }

        try {
            const resposta = await fetch("/api/v1/auth/me", {
                method: "GET",
                headers: obterHeadersAvatar()
            });

            if (!resposta.ok) {
                throw new Error("Não foi possível carregar o utilizador.");
            }

            const dados = await resposta.json();

            const utilizador =
                dados.usuario ||
                dados.user ||
                dados.utilizador ||
                dados.data ||
                dados;

            avatar.src =
                utilizador.avatar_url ||
                utilizador.avatar ||
                utilizador.foto ||
                DEFAULT_AVATAR;

            userMenu.classList.remove("hidden");
        } catch (erro) {
            console.error("Yoka: erro ao carregar avatar:", erro);
            avatar.src = DEFAULT_AVATAR;
        }
    }

    avatar.onerror = () => {
        avatar.onerror = null;
        avatar.src = DEFAULT_AVATAR;
    };

    avatarButton.addEventListener("click", (event) => {
        event.stopPropagation();

        const abrir = dropdown.classList.contains("hidden");

        dropdown.classList.toggle("hidden", !abrir);
        avatarButton.setAttribute("aria-expanded", String(abrir));
    });

    document.addEventListener("click", (event) => {
        if (!userMenu.contains(event.target)) {
            dropdown.classList.add("hidden");
            avatarButton.setAttribute("aria-expanded", "false");
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            dropdown.classList.add("hidden");
            avatarButton.setAttribute("aria-expanded", "false");
        }
    });

    if (profileMenuLink) {
        profileMenuLink.addEventListener("click", async (event) => {
            event.preventDefault();

            const token = obterTokenAvatar();

            if (!token) {
                window.location.href = "./login.html";
                return;
            }

            try {
                const resposta = await fetch("/api/v1/artists/me", {
                    method: "GET",
                    headers: obterHeadersAvatar()
                });

                const dados = await resposta.json();

                if (!resposta.ok) {
                    throw new Error(
                        dados.mensagem ||
                        "Não foi possível carregar o perfil."
                    );
                }

                const perfil =
                    dados.perfil ||
                    dados.artist ||
                    dados.artista ||
                    dados.data ||
                    dados.dados;

                if (!perfil || !perfil.id) {
                    throw new Error("Perfil de artista não encontrado.");
                }

                window.location.href =
                    `./artist.html?id=${encodeURIComponent(perfil.id)}`;
            } catch (erro) {
                console.error("Yoka: erro ao abrir perfil:", erro);
                alert(erro.message || "Não foi possível abrir o perfil.");
            }
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            [
                "token",
                "yoka_token",
                "accessToken",
                "access_token"
            ].forEach((chave) => localStorage.removeItem(chave));

            window.location.href = "./index.html";
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", carregarAvatar, {
            once: true
        });
    } else {
        carregarAvatar();
    }
})();













/*
|--------------------------------------------------------------------------
| INICIALIZAÇÃO
|--------------------------------------------------------------------------
*/

function iniciarEstatisticas() {
console.log("[Yoka] Início do carregamento", new Date().toISOString());
    console.log(
        "[Yoka] Inicializando página de estatísticas..."
    );


    elements = {

        loading:
            document.getElementById(
                "statsLoading"
            ),

        error:
            document.getElementById(
                "statsError"
            ),

        content:
            document.getElementById(
                "statsContent"
            ),

        period:
            document.getElementById(
                "periodSelect"
            ),

        totalMusicas:
            document.getElementById(
                "totalMusicas"
            ),

        totalReproducoes:
            document.getElementById(
                "totalReproducoes"
            ),

        totalCurtidas:
            document.getElementById(
                "totalCurtidas"
            ),

        totalSeguidores:
            document.getElementById(
                "totalSeguidores"
            ),

        totalComentarios:
            document.getElementById(
                "totalComentarios"
            ),

        playsChart:
            document.getElementById(
                "playsChart"
            ),

        likesChart:
            document.getElementById(
                "likesChart"
            ),

        followersChart:
            document.getElementById(
                "followersChart"
            ),

        commentsChart:
            document.getElementById(
                "commentsChart"
            ),

        songsTableBody:
            document.getElementById(
                "songsTableBody"
            ),

        noSongs:
            document.getElementById(
                "noSongs"
            )
    };


    /*
    |--------------------------------------------------------------------------
    | VERIFICAÇÃO DO HTML
    |--------------------------------------------------------------------------
    */

    const elementosObrigatorios = [

        "loading",
        "error",
        "content",
        "period",
        "totalMusicas",
        "totalReproducoes",
        "totalCurtidas",
        "totalSeguidores",
        "totalComentarios",
        "playsChart",
        "likesChart",
        "followersChart",
        "commentsChart",
        "songsTableBody",
        "noSongs"
    ];


    const faltando =
        elementosObrigatorios.filter(
            nome => !elements[nome]
        );


    if (faltando.length > 0) {

        console.error(
            "[Yoka] Elementos não encontrados:",
            faltando
        );

        return;
    }


    /*
    |--------------------------------------------------------------------------
    | EVENTO DO PERÍODO
    |--------------------------------------------------------------------------
    */

    elements.period.addEventListener(
        "change",
        carregarEstatisticas
    );


    /*
    |--------------------------------------------------------------------------
    | PRIMEIRA CARGA
    |--------------------------------------------------------------------------
    */
/*
|--------------------------------------------------------------------------
| PRIMEIRA CARGA — DIAGNÓSTICO
|--------------------------------------------------------------------------
*/

console.log("[Yoka] Diagnóstico inicial:", {
    periodo: elements.period.value,
    tokenExiste: Boolean(obterToken()),
    apiBase: window.YokaAPI?.API_BASE_URL,
    tabelaExiste: Boolean(elements.songsTableBody),
    mensagemVaziaExiste: Boolean(elements.noSongs)
});

carregarEstatisticas();
}
/*
|--------------------------------------------------------------------------
| DOM READY
|--------------------------------------------------------------------------
*/

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarEstatisticas
    );

} else {

    iniciarEstatisticas();
}
