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
  IgnoredRequestPaths: {
    "test": true,
    "xmas": true,
    "weekend": true,
    "reobtain": true,
    "uniform": true,
    "barflies": true,
    "abduces": true,
    "suitor": true,
    "yachted": true
  },
  NormalRequestHeaders: {
    "accept": true,
    "accept-encoding": true,
    "accept-language": true,
    "cache-control": true,
    "chrome-proxy": true,
    "connection": true,
    "content-length": true,
    "content-type": true,
    "cookie": true,
    "dnt": true,
    "from": true,
    "host": true,
    "origin": true,
    "pragma": true,
    "proxy-authorization": true,
    "referer": true,
    "rvbd-csh": true,
    "rvbd-ssh": true,
    "save-data": true,
    "surrogate-capability": true,
    "te": true,
    "upgrade-insecure-requests": true,
    "user-agent": true,
    "via": true,
    "x-authenticated-groups": true,
    "x-authenticated-use": true,
    "x-bluecoat-via": true,
    "x-compress": true,
    "x-forwarded-for": true,
    "x-forwarded-proto": true,
    "x-imforwards": true,
    "x-iws-via": true,
    "x-real-host": true,
    "x-real-404": true,
    "x-real-ip": true,
    "x-requested-with": true,
    "x-turbo-id": true,
    "x-wap-profile": true,
    "x-yandex-turbo": true
  },
  OptimizeImages: false,
  WithoutHttpServer: false
});

Server.Settings.Urls = [
  "/test/"
];

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

Server.getEncodedLink("https://www.rambler.ru/").then(
    (url) => {
      console.log(url);
    }
);

Server.getEncodedProxy("http://avatars.mds.yandex.net/get-direct/42386/HzzAM6tDCyUsG0TrUVko9g/y450").then(
    (url: any) => {
      console.log(url);
    }
);
