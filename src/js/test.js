"use strict";

const HTTP = require("http");
const Agent = require("agentkeepalive");
const keepaliveAgent = new Agent({
  keepAlive: true,
  keepAliveMsecs: 1000,
  freeSocketKeepAliveTimeout: 30000,
  timeout: 60000,
  maxSockets: 100,
  maxFreeSockets: 10
});

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
    path: "/suitor/U2FsdGVkX1%2BviY1BkVDfeUXDDnijEgLL0s6R31d%2FyGehYJ0Al5Og%2FhMWAlbRGKUBzPRyfkw7XEPYKKTvkbVjci4Pk%2BAKFDSdtURW%2BxOP7WO%2BUfqsveJnjlfLI%2FW1u4Zxv7vLSvgX0E6zsg2S0Cmrw0lB8hRJeMxK3MVMp8X8mOmfGTUSdN9DYs3w57g%2BOTx6v%2BCxf2ghUTRZ?cafhcdbhddeec=gGO8AJ6V%2B3kIvU9CsCary1%2FpnARGkRgdgvBDOUde4%2B4u&cdckcebkc=r2%2BLSuoFn%2BGlPeg7i3CxrTQL6vb2uyrHyWOl8X0ZJOTH&debfe=ttFPt%2FNhvONW1iYyy6G4a7qipxt9XoTpH3JCC1rKMMi9&hjekdjdfaehdddakkfc=OeBmqx%2FVEDgsW2w4wvz%2FUjP%2Fggte%2FUweanbIcaltKkAU&iaidjfaccdibe=wUm44aiVsj43y7hU%2FCuqeLXEVA%3D%3D",
    headers: {
      "x-real-ip": "192.168.39.171",
      "host": "weekend.rambler.ru",
      "connection": "close",
      "x-real-host": "weekend.rambler.ru",
      "upgrade-insecure-requests": "1",
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "accept-encoding": "gzip, deflate, sdch, br",
      "accept-language": "en-US,en;q=0.8"
    },
    agent: keepaliveAgent
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

connect();
