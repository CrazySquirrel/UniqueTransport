"use strict";

declare let describe: any;
declare let it: any;
declare let expect: any;
declare let require: any;

import ClientClass from "../lib/ts/client";

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

describe("Client", () => {

  it("Client", () => {
    expect(typeof(ClientClass)).toEqual("function");
    expect(typeof(Client)).toEqual("object");
  });
});
