
"use strict";

/*
|--------------------------------------------------------------------------
| CONFIGURAÃ‡ÃƒO DA API â€” YOKA
|--------------------------------------------------------------------------
*/


const API_BASE_URL = "https://yoka-d1e1.onrender.com/api/v1";


/*
|--------------------------------------------------------------------------
| TOKEN
|--------------------------------------------------------------------------
*/

function obterToken() {
    return localStorage.getItem("yoka_token");
}


function guardarToken(token) {
    localStorage.setItem("yoka_token", token);
}


function removerToken() {
    localStorage.removeItem("yoka_token");
}


/*
|--------------------------------------------------------------------------
| REQUISIÃ‡Ã•ES Ã€ API
|--------------------------------------------------------------------------
*/

async function apiRequest(endpoint, options = {}) {

    const token = obterToken();

    const headers = {
        ...(options.headers || {})
    };

    /*
    |----------------------------------------------------------------------
    | JSON
    |----------------------------------------------------------------------
    */

    if (
        options.body &&
        !(options.body instanceof FormData) &&
        !headers["Content-Type"]
    ) {
        headers["Content-Type"] = "application/json";
    }

    /*
    |----------------------------------------------------------------------
    | AUTENTICAÃ‡ÃƒO JWT
    |----------------------------------------------------------------------
    */

    if (token && !headers.Authorization) {
        headers.Authorization = `Bearer ${token}`;
    }

    /*
    |----------------------------------------------------------------------
    | PEDIDO AO SERVIDOR
    |----------------------------------------------------------------------
    */

    let resposta;

    try {

        resposta = await fetch(
            API_BASE_URL + endpoint,
            {
                ...options,
                headers
            }
        );

    } catch (error) {

        const erro = new Error(
            "NÃ£o foi possÃ­vel ligar ao servidor da Yoka. Verifica a ligaÃ§Ã£o e tenta novamente."
        );

        erro.status = 0;
        erro.causa = error;

        throw erro;
    }

    /*
    |----------------------------------------------------------------------
    | LER RESPOSTA
    |----------------------------------------------------------------------
    */

    let dados;

    try {

        dados = await resposta.json();

    } catch {

        dados = {
            sucesso: false,
            mensagem: "Resposta invÃ¡lida do servidor."
        };
    }

    /*
    |----------------------------------------------------------------------
    | ERROS HTTP
    |--------------------------------------------------------------------------
    | Um erro 429 nÃ£o apaga o token.
    | Erros 403, 404 e 500 tambÃ©m nÃ£o apagam o token.
    |--------------------------------------------------------------------------
    */

    if (!resposta.ok) {

        const erro = new Error(
            dados.mensagem ||
            "Erro na comunicaÃ§Ã£o com o servidor."
        );

        erro.status = resposta.status;
        erro.dados = dados;

        throw erro;
    }

    return dados;
}


/*
|--------------------------------------------------------------------------
| EXPORTAR
|--------------------------------------------------------------------------
*/

window.YokaAPI = {
    API_BASE_URL,
    apiRequest,
    obterToken,
    guardarToken,
    removerToken
};


