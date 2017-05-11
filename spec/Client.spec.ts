"use strict";

declare let describe: any;
declare let it: any;
declare let expect: any;
declare let require: any;

import ClientClass from "../lib/ts/client";

const Client = new ClientClass();

describe("Client", () => {

  it("Client", () => {
    expect(typeof(ClientClass)).toEqual("function");
    expect(typeof(Client)).toEqual("object");
  });
});
