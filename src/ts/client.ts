"use strict";

import ClientClass from "../../lib/ts/client";

const Client = new ClientClass({
    ServerAddress: location.protocol + "//" + location.host + "/",
    ConnectionTimeout: 1000,
    ReConnectionTimeout: 100,
    Password: "xmas",
    Reconnections: 100,
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

Client.emit({
    Event: "connect",
    Url: "http://127.0.0.1:8888/test/",
}).then(
    (result) => {
        console.log(result);
    }
).catch(
    (e) => {

    }
);


Client.getEncodedLink({
    Url: "http://127.0.0.1:8888/test/",
    Link: "http://ad.yandex.com/"
}).then(
    (url) => {
        console.log(url);
    }
);
