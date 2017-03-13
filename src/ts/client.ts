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