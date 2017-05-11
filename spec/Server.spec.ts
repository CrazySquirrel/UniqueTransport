"use strict";

declare let describe: any;
declare let it: any;
declare let expect: any;
declare let require: any;

import ServerClass from "../lib/ts/server";

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

describe("Server", () => {

  it("Server", () => {
    expect(typeof(ServerClass)).toEqual("function");
    expect(typeof(Server)).toEqual("object");
  });
});
