"use strict";

import ClientClass from "../../lib/ts/client";

const Client = new ClientClass({
    Urls: [
        "http://localhost:8888/test/"
    ],
    Password: "xmas",
    Transports: {
        xhr: {
            HttpMethods: {
                GET: true,
                POST: true,
                PUT: true,
                PATCH: true,
            },
            SubTransports: {
                path: true,
                name: true,
                params: true,
                header: true,
                body: true,
            }
        },
        fetch: {
            HttpMethods: {
                GET: true,
                POST: true,
                PUT: true,
                PATCH: true,
            },
            SubTransports: {
                path: true,
                name: true,
                params: true,
                header: true,
                body: true,
            }
        },
        iframe: {
            SubTransports: {
                path: true,
                name: true,
                params: true
            }
        },
        script: {
            SubTransports: {
                path: true,
                name: true,
                params: true
            }
        },
        image: {
            SubTransports: {
                path: true,
                name: true,
                params: true
            }
        },
        style: {
            SubTransports: {
                path: true,
                name: true,
                params: true
            }
        }
    }
});

setInterval(
    () => {
        Client.emit({
            Event: "connect",
        }).then(
            (result) => {
                //console.log(result);
            }
        ).catch(
            (e) => {

            }
        );
    },
    100
);

Client.emit({
    Event: "connect",
}).then(
    (result) => {
        //console.log(result);
    }
).catch(
    (e) => {

    }
);

Client.getEncodedLink("http://ad.yandex.com/").then(
    (url) => {
        //console.log(url);
    }
);
