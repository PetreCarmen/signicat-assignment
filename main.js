// import fetch from 'node-fetch';
fetch = require('node-fetch')
atob = require('atob');

// https://api.signicat.io/identification/v2/sessions

const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const credentials = btoa(username + ":" + password);
fetch("https://api.signicat.io/oauth/connect/token", {
    method: "POST",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + credentials,
        "Accept": "*/*"
    },
    body: "grant_type=client_credentials"
}).then(r => r.json())
    .then(accessTokenResponse => {
        console.log(accessTokenResponse);

        const sessionRequestBody = {
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

        return fetch("https://api.signicat.io/identification/v2/sessions", {
            method: "POST",
            headers: {
                'Authorization': "Bearer " + accessTokenResponse['access_token'],
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sessionRequestBody),
        }).then(r => r.json());
    }).then(x => console.log(x));
