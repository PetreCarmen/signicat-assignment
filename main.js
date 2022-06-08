fetch = require('node-fetch'); //incarc modulele in node
atob = require('atob');

const username = process.env.USERNAME; //accesam variabilele de env ca sa luam username si password
const password = process.env.PASSWORD;
const credentials = btoa(username + ":" + password); //le transf in base64 pt basic auth


let currentToken = null;
fetch("https://api.signicat.io/oauth/connect/token", { //request la url, rezultatul e un promise
    method: "POST",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + credentials,
        "Accept": "*/*"
    },
    body: "grant_type=client_credentials"
}).then(r => r.json()) // citesc body-ul responseului si il parsez (json -> object)
    .then(accessTokenResponse => {
        console.log("accessTokenResponse", accessTokenResponse);
        currentToken = accessTokenResponse['access_token']

        const sessionRequestBody = { //din postman
            "flow": "redirect",
            "allowedProviders": [
                "no_bankid_netcentric",
                "no_bankid_mobile"
            ],
            "include": [
                "name",
                "date_of_birth"
            ],
            "redirectSettings": {
                "successUrl": "https://developer.signicat.io/landing-pages/identification-success.html",
                "abortUrl": "https://developer.signicat.io/landing-pages/something-wrong.html",
                "errorUrl": "https://developer.signicat.io/landing-pages/something-wrong.html"
            }
        };

        return fetch("https://api.signicat.io/identification/v2/sessions", {  // cream sesiunea
            method: "POST",
            headers: {
                'Authorization': "Bearer " + accessTokenResponse['access_token'],
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sessionRequestBody),
        }).then(r => {
            return r.json().then(session => { //citesc body, il parsez ca json (json->obj)
                return [accessTokenResponse, session]
            });
        });
    }).then(([accessTokenResponse, session]) => {
    console.log("session", session);
    return new Promise(resolve => { //return promise care peste 60s trimite acesstokenresp, session
        setTimeout(() => {
            resolve([accessTokenResponse, session])
        }, 60000)
    })
}).then(([accessTokenResponse, session]) => { //check daca s-a auth cu ID-ul
        fetch(`https://api.signicat.io/identification/v2/sessions/${session.id}`, {
            method: 'GET',
            headers: {
                'Authorization': "Bearer " + accessTokenResponse['access_token'],
            }
        }).then(r => r.json()).then(responseBody => console.log("responseBody", responseBody))
            .catch(err => console.log("no auth on this session yet", err));
    }
);

