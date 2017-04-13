"use strict";

import ClientClass from "../../lib/ts/client";

const Client = new ClientClass({
  Urls: [
    "http://localhost:8888/test/"
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
      }
    },
  }
});

Client.emit({
  Event: "connect",
}).then(
    (result) => {
      console.log(result);
    }
).catch(
    (e) => {

    }
);

Client.emit({
  Debug: true
}).then(
    (result) => {
      console.log(result);
    }
);

Client.getEncodedLink("https://www.rambler.ru/").then(
    (url) => {
      console.log(url);
    }
);

Client.getEncodedProxy("http://avatars.mds.yandex.net/get-direct/42386/HzzAM6tDCyUsG0TrUVko9g/y450").then(
    (url: any) => {
      let img = window.document.createElement("img");
      img.src = url;
      window.document.body.appendChild(img);
      console.log(url);
    }
);

Client.getEncodedProxy("https://weather.rambler.ru/static/v2.6.1/dist/rambler-weather.min.css?v2.6.1").then(
    (url: any) => {
      let link = window.document.createElement("link");
      link.type = "text/css";
      link.rel = "stylesheet";
      link.crossOrigin = "Anonymous";

      link.onload = () => {
        let styleSheets = window.document.styleSheets;
        let styleSheetsLength = styleSheets.length;
        for (let i = 0; i < styleSheetsLength; i++) {
          try {
            let styleSheet = styleSheets[i];
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
    }
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