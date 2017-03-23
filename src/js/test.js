"use strict";

const HTTP = require("http");

HTTP.globalAgent.keepAlive = true;
HTTP.globalAgent.keepAliveMsecs = 5000;
HTTP.globalAgent.maxSockets = Infinity;
HTTP.globalAgent.maxFreeSockets = 1000;

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

  let options = {
    port: "8888",
    hostname: "localhost",
    method: "GET",
    path: "/test/eyJkYXRhIjp7IkFjdGlvbiI6IlByb3h5In/0sImxpbmsiOiJodHRwOi8vYXZhdGFycy5t/ZHMueW/FuZGV4Lm5ldC9nZXQtZGlyZWN0LzQyMzg2L0h6ekFNNnREQ3lVc0cwVHJVVmtvOWcveTQ1MCJ9",
    headers: {
      "Accept": "*/*",
      "Accept-Encoding": "gzip, deflate, sdch, br",
      "Accept-Language": "en-US,en;q=0.8",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Host": "localhost:8888",
      "Origin": "http://localhost:8080",
      "Pragma": "no-cache",
      "Referer": "http://localhost:8080/dist/",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36"
    }
  };

  HTTP.get(options, (res) => {
    res.on("data", () => {

    });
    res.on("end", () => {
      connect();
    });
    res.on("error", () => {
      connect();
    });
  });
}

for (let i = 0; i < 100; i++) {
  connect();
}
