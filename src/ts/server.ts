"use strict";

import ServerClass from "../../lib/ts/server";

const Server = new ServerClass({
    ServerPort: 8888,
    ConnectionTimeout: 1000,
    Password: "xmas",
    SuccessResponseCode: 200,
    ErrorResponseCode: 404,
});

Server.on("connect", (data) => {
    return "OK";
});
