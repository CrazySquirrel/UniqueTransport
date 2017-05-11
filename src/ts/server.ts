"use strict";

import ServerClass from "../../lib/ts/server";

const Server = new ServerClass({
  ErrorHandler: (...data) => {
    console.log(data);
  },
  ServerPort: 8888,
  ConnectionTimeout: 10000,
  Password: "xmas",
  SuccessResponseCode: 200,
  RedirectResponseCode: 302,
  ErrorResponseCode: 404,
  WriteRequestLog: false,
  SubTransports: {
    path: true,
    name: true,
    params: true,
    header: true,
    body: true,
  },
  OptimizeImages: false,
  WithoutHttpServer: false,
});

Server.Settings.Urls = [
  "/test/",
];

Server.on("connect", (data, params) => {
  return new Promise((resolve, reject) => {
    setTimeout(
        () => {
          resolve("OK");
        },
        100,
    );
  });
});

Server.getEncodedLink("https://www.rambler.ru/").then(
    (url) => {
      console.log(url);
    },
);

Server.getEncodedProxy("http://avatars.mds.yandex.net/get-direct/42386/HzzAM6tDCyUsG0TrUVko9g/y450").then(
    (url: any) => {
      console.log(url);
    },
);
