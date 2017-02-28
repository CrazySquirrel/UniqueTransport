"use strict";

import ServerClass from "../../lib/ts/server";

const Server = new ServerClass({
  ServerPort: 8888,
  ConnectionTimeout: 10000,
  Password: "xmas",
  SuccessResponseCode: 200,
  RedirectResponseCode: 302,
  ErrorResponseCode: 404,
  NormalRequestHeaders: [
    "x-real-ip"
  ],
  WriteRequestLog: false,
  SubTransports: {
    path: true,
    name: true,
    params: true,
    header: true,
    body: true,
  }
});

Server.on("connect", (data, params) => {
  return new Promise((resolve, reject) => {
    setTimeout(
        () => {
          resolve("OK");
        },
        100
    );
  });
});
