"use strict";

import ServerClass from "../../lib/ts/server";

const Server = new ServerClass({
    ServerPort: 8888,
    ConnectionTimeout: 1000,
    Password: "xmas",
    SuccessResponseCode: 200,
    RedirectResponseCode: 302,
    ErrorResponseCode: 404,
    NormalRequestHeaders: [

    ],
    SubTransports: {
        path: true,
        name: true,
        params: true,
        header: true,
        body: true,
    }
});

Server.on("connect", (data, params) => {
    return "OK";
});
