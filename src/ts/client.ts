"use strict";

import ClientClass from "../../lib/ts/client";

const Client = new ClientClass({
  Urls: [
    "http://localhost:8888/test/",
  ],
  Password: "xmas",
  ConnectionTimeout: 10000,
  ReConnectionTimeout: 500,
  Transports: {
    style: {
      SubTransports: {
        name: true,
        params: true,
        path: true,
      },
    },
  },
});

Client.emit({
  Event: "connect",
}).then(
    (result) => {
      console.log(result);
    },
).catch(
    (e) => {

    },
);

Client.emit({
  Data: {
    link: "http://ssp.rambler.ru/acp/capirs_main.7a051727f11be9f6dbb5ad2d78a576b0.js",
  },
  Event: "download",
}).then(
    (result) => {
      console.log(result);
    },
).catch(
    (e) => {

    },
);

Client.emit({
  Debug: true,
}).then(
    (result) => {
      console.log(result);
    },
);

Client.getEncodedLink("https://www.rambler.ru/").then(
    (url) => {
      console.log(url);
    },
);

Client.getEncodedProxy("http://avatars.mds.yandex.net/get-direct/42386/HzzAM6tDCyUsG0TrUVko9g/y450").then(
    (url: any) => {
      const img = window.document.createElement("img");
      img.src = url;
      window.document.body.appendChild(img);
      console.log(url);
    },
);

Client.getEncodedProxy("https://rambler.ru/topline42/latest/bundle.css").then(
    (url: any) => {
      const link: any = window.document.createElement("link");
      link.type = "text/css";
      link.rel = "stylesheet";
      link.crossOrigin = "Anonymous";

      link.onload = () => {
        const styleSheets: any = window.document.styleSheets;
        const styleSheetsLength = styleSheets.length;
        for (let i = 0; i < styleSheetsLength; i++) {
          try {
            const styleSheet = styleSheets[i];
            if (
                styleSheet.href === link.href &&
                styleSheet.cssRules &&
                styleSheet.cssRules.length > 0
            ) {
              console.log(styleSheet);
              window.document.body.removeChild(link);
            }
          } catch (e) {

          }
        }
      };

      link.href = url;

      window.document.body.appendChild(link);
    },
);

/**
 * Speed test
 */
/*
 let counter = 0;

 setInterval(
 () => {
 console.log(counter);
 counter = 0;
 },
 1000
 );

 function connect() {
 counter++;

 Client.emit({
 Event: "connect",
 }).then(
 (result) => {
 connect();
 }
 ).catch(
 (e) => {

 }
 );
 }

 for (let i = 0; i < 50; i++) {
 connect();
 }
 */
