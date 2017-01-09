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
});

Server.on("connect", (data, params) => {
    return "OK";
});
