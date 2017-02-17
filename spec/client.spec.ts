"use strict";

declare let beforeEach: any;
declare let afterEach: any;
declare let describe: any;
declare let it: any;
declare let expect: any;
declare let require: any;
declare let jasmine: any;

import ClientClass from "../lib/ts/client";

describe("UniqueTransport:Client", () => {

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

  it("UniqueTransport:Client", () => {
    expect(typeof(ClientClass)).toEqual("function");
  });

  it("UniqueTransport:Client constructor", () => {
    let Client = new ClientClass({
      Urls: [
        "http://localhost:8888/test/"
      ],
      Password: "xmas"
    });

    expect(typeof(Client)).toEqual("object");
    expect(typeof(Client.getEncodedLinkSync)).toEqual("function");
    expect(typeof(Client.getEncodedLink)).toEqual("function");
    expect(typeof(Client.emit)).toEqual("function");
    expect(Client instanceof ClientClass).toBe(true);
  });

  it("UniqueTransport:Client getEncodedLinkSync", (done) => {
    let Client = new ClientClass({
      Urls: [
        "http://localhost:8888/test/"
      ],
      Password: "xmas"
    });

    let link = "http://ssp.rambler.ru/userip";

    let encodedLink: string = Client.getEncodedLinkSync(link);

    expect(typeof(encodedLink)).toEqual("string");

    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState === xhr.DONE) {
        let text = xhr.responseText;
        expect(typeof(text)).toEqual("string");
        expect((new RegExp("[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}", "ig")).test(text)).toBe(true);
        done();
      }
    };
    xhr.open("GET", encodedLink, true);
    xhr.send();
  });

  it("UniqueTransport:Client getEncodedLink", (done) => {
    let Client = new ClientClass({
      Urls: [
        "http://localhost:8888/test/"
      ],
      Password: "xmas"
    });

    let link = "http://ssp.rambler.ru/userip";

    Client.getEncodedLink(link).then((encodedLink: string) => {
      expect(typeof(encodedLink)).toEqual("string");

      let xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => {
        if (xhr.readyState === xhr.DONE) {
          let text = xhr.responseText;
          expect(typeof(text)).toEqual("string");
          expect((new RegExp("[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}", "ig")).test(text)).toBe(true);
          done();
        }
      };
      xhr.open("GET", encodedLink, true);
      xhr.send();
    });
  });

  it("UniqueTransport:Client emit", (done) => {
    let Client = new ClientClass({
      Urls: [
        "http://localhost:8888/test/"
      ],
      Password: "xmas"
    });

    let promises = [];

    for (let i = 0; i < 100; i++) {
      promises.push(Client.emit({
        Debug: true
      }));
    }

    Promise.all(promises).then((results) => {
      for (let result of results) {
        expect(typeof(result)).toEqual("string");
        result = JSON.parse(result);
        expect(result.params.Action).toEqual("Respond");
      }
      done();
    });
  });
});
