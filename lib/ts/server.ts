"use strict";

/**
 * Import interfaces
 */
import IWindow from "../../interfaces/IWindow";
/**
 * Declare window interface
 */
declare let window: IWindow;
declare let global: any;
declare let require: any;
declare let Buffer: any;

global.Promise = global.Promise || require("promise-polyfill");
global.location = global.location || {};

const ZLIB = require("zlib");

const CRYPTO = require("webcrypto");

const AES = require("crypto-js/aes");
const UTF8 = require("crypto-js/enc-utf8");

const HTTP = require("http");

HTTP.globalAgent.keepAlive = true;
HTTP.globalAgent.keepAliveMsecs = 5000;
HTTP.globalAgent.maxSockets = Infinity;
HTTP.globalAgent.maxFreeSockets = 1000;

const URL = require("url");
const PATH = require("path");

const baseHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, PATCH, DELETE",
  "Access-Control-Allow-Headers": "X-Requested-With, content-type",
  "Access-Control-Allow-Credentials": true,
};

import Transport from "./transport.ts";

export default class Server extends Transport {

  /**
   * Get choice ID
   * @param choiceType
   * @param choices
   */
  public static getChoiceID(choiceType: string, choices: any): string {
    let keys = Object.keys(choices[choiceType]);
    return keys[keys.length * Math.random() << 0];
  }

  public listners: any;
  public NormalRequestHeaders: any;
  public IgnoredRequestPaths: any;

  public constructor(settings: any) {
    super(settings);

    this.listners = {};

    this.on("debug", (data, params) => {
      return new Promise((resolve) => {
        resolve(JSON.stringify({data, params}));
      });
    });

    if (!this.Settings.WithoutHttpServer) {
      HTTP.createServer(this.listenr.bind(this)).listen(this.Settings.ServerPort);
    }
  }

  public on(event: string, listner: Function) {
    this.listners[event] = listner;
  }

  public listenr(request, response) {
    let headers = Object.assign({}, baseHeaders);

    setTimeout(
        () => {
          response.writeHead(this.Settings.ErrorResponseCode, headers);
          response.end();
        },
        this.Settings.ConnectionTimeout
    );

    try {
      let host;

      headers["Access-Control-Allow-Origin"] = "";

      if (
          !headers["Access-Control-Allow-Origin"] &&
          request.headers["x-real-host"]
      ) {
        let origin;

        if (request.headers["x-real-host"].indexOf("http") === -1) {
          origin = URL.parse("https://" + request.headers["x-real-host"]);
        } else {
          origin = URL.parse(request.headers["x-real-host"]);
        }

        if (
            origin &&
            origin.hostname
        ) {
          host = origin.hostname;

          headers["Access-Control-Allow-Origin"] = "";

          if (origin.protocol) {
            headers["Access-Control-Allow-Origin"] += origin.protocol + "//";
          }

          if (origin.hostname) {
            headers["Access-Control-Allow-Origin"] += origin.hostname;
          }

          if (origin.port) {
            headers["Access-Control-Allow-Origin"] += ":" + origin.port;
          }
        }
      }

      if (
          !headers["Access-Control-Allow-Origin"] &&
          request.headers.origin
      ) {
        let origin;

        if (request.headers.origin.indexOf("http") === -1) {
          origin = URL.parse("https://" + request.headers.origin);
        } else {
          origin = URL.parse(request.headers.origin);
        }

        if (
            origin &&
            origin.hostname
        ) {
          host = origin.hostname;

          headers["Access-Control-Allow-Origin"] = "";

          if (origin.protocol) {
            headers["Access-Control-Allow-Origin"] += origin.protocol + "//";
          }

          if (origin.hostname) {
            headers["Access-Control-Allow-Origin"] += origin.hostname;
          }

          if (origin.port) {
            headers["Access-Control-Allow-Origin"] += ":" + origin.port;
          }
        }
      }

      if (
          !headers["Access-Control-Allow-Origin"] &&
          request.headers.referer
      ) {
        let origin;

        if (request.headers.referer.indexOf("http") === -1) {
          origin = URL.parse("https://" + request.headers.referer);
        } else {
          origin = URL.parse(request.headers.referer);
        }

        if (
            origin &&
            origin.hostname
        ) {
          host = origin.hostname;

          headers["Access-Control-Allow-Origin"] = "";

          if (origin.protocol) {
            headers["Access-Control-Allow-Origin"] += origin.protocol + "//";
          }

          if (origin.hostname) {
            headers["Access-Control-Allow-Origin"] += origin.hostname;
          }

          if (origin.port) {
            headers["Access-Control-Allow-Origin"] += ":" + origin.port;
          }
        }
      }

      if (
          !headers["Access-Control-Allow-Origin"] &&
          request.headers.host
      ) {
        let origin;

        if (request.headers.host.indexOf("http") === -1) {
          origin = URL.parse("https://" + request.headers.host);
        } else {
          origin = URL.parse(request.headers.host);
        }

        if (
            origin &&
            origin.hostname
        ) {
          host = origin.hostname;

          headers["Access-Control-Allow-Origin"] = "";

          if (origin.protocol) {
            headers["Access-Control-Allow-Origin"] += origin.protocol + "//";
          }

          if (origin.hostname) {
            headers["Access-Control-Allow-Origin"] += origin.hostname;
          }

          if (origin.port) {
            headers["Access-Control-Allow-Origin"] += ":" + origin.port;
          }
        }
      }

      if (
          host
      ) {
        if (
            request.method === "OPTIONS"
        ) {
          if (request.headers["access-control-request-headers"]) {
            if (headers["Access-Control-Allow-Headers"]) {
              headers["Access-Control-Allow-Headers"] = headers["Access-Control-Allow-Headers"].split(", ").concat(request.headers["access-control-request-headers"].split(", ")).join(", ");
            } else {
              headers["Access-Control-Allow-Headers"] = request.headers["access-control-request-headers"];
            }
          }
          response.writeHead(this.Settings.SuccessResponseCode, headers);
          response.end();
        } else {
          this.preprocessor(request).then(
              (result: any) => {
                /**
                 * SSP-892 ->
                 */
                if (result.indexOf("debug") !== -1) {
                  let debug = {
                    headers: request.headers,
                    rawurl: request.url,
                    url: URL.parse(request.url, true),
                    result,
                  };
                  response.writeHead(this.Settings.SuccessResponseCode, headers);
                  response.end(JSON.stringify(debug));
                  return false;
                }
                /**
                 * <-- SSP-892
                 */
                let IP = request.headers["x-real-ip"];
                if (!IP) {
                  let regIP = /([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})/i;
                  let resIP = (regIP).exec(request.connection.remoteAddress);
                  if (resIP) {
                    IP = resIP[0];
                  }
                }
                if (
                    !IP ||
                    IP === "127.0.0.1"
                ) {
                  IP = "95.165.148.52";
                }

                let params = {
                  Headers: request.headers,
                  Host: host,
                  IP,
                };

                this.processor(result, params).then(
                    (_result: any) => {
                      if (_result.Params.Action === "Respond") {
                        let resp = "";
                        switch (_result.Params.Transport) {
                          case "style":
                            resp = `.${_result.Params.Callback} {content:"${_result.Data}";}`;
                            headers["Content-Type"] = "text/css; charset=utf-8";
                            break;
                          case "script":
                            resp = 'window["' + _result.Params.Callback + '"]("' + _result.Data + '")';
                            headers["Content-Type"] = "text/javascript; charset=utf-8";
                            break;
                          case "iframe":
                            resp = `<!DOCTYPE html>
                                                    <html lang="en">
                                                    <head>
                                                        <meta charset="UTF-8">
                                                        <title>${_result.Params.Callback}</title>
                                                    </head>
                                                    <body>
                                                        <script type="text/javascript">
                                                        var timer = setInterval(
                                                            function(){
                                                                    try{
                                                                        if(parent &&parent.postMessage){
                                                                            parent.postMessage("${_result.Data}","${headers["Access-Control-Allow-Origin"]}");
                                                                            clearTimeout(timer);
                                                                        }
                                                                    }catch(e){}
                                                            },
                                                            100
                                                        );
                                                        </script>
                                                    </body>
                                                    </html>`;
                            headers["Content-Type"] = "text/html; charset=utf-8";
                            break;
                          case "xhr":
                          case "fetch":
                            resp = _result.Data;
                            headers["Content-Type"] = "text/plain; charset=utf-8";
                            break;
                          default:
                            response.writeHead(this.Settings.ErrorResponseCode, headers);
                            response.end();
                        }
                        if (resp) {
                          ZLIB.gzip(resp, (error, result) => {
                            if (error) {
                              response.writeHead(this.Settings.ErrorResponseCode, headers);
                              response.end();
                            } else {
                              headers["Content-Length"] = result.length;
                              response.writeHead(this.Settings.SuccessResponseCode, headers);
                              response.end(result);
                            }
                          });
                        } else {
                          response.writeHead(this.Settings.ErrorResponseCode, headers);
                          response.end();
                        }
                      } else if (_result.Params.Action === "Redirect") {
                        headers["Location"] = _result.Data.link;
                        response.writeHead(this.Settings.RedirectResponseCode, headers);
                        response.end();
                      } else if (_result.Params.Action === "Proxy") {
                        let url = URL.parse(_result.Data.link);

                        request.headers.host = url.host;

                        let options = {
                          headers: request.headers,
                          hostname: url.host,
                          method: "GET",
                          path: url.path,
                          port: "80",
                        };

                        HTTP.get(options, (res) => {
                          let body = [];

                          res.on("data", (chunk) => {
                            body.push(chunk);
                          });

                          res.on("end", () => {
                            response.writeHead(this.Settings.SuccessResponseCode, res.headers);
                            response.end(Buffer.concat(body));
                          });

                          res.on("error", () => {
                            response.writeHead(this.Settings.ErrorResponseCode, res.headers);
                            response.end();
                          });
                        });
                      } else {
                        response.writeHead(this.Settings.ErrorResponseCode, headers);
                        response.end();
                      }
                    }
                ).catch(
                    () => {
                      response.writeHead(this.Settings.ErrorResponseCode, headers);
                      response.end();
                    }
                );
              }
          ).catch(
              () => {
                response.writeHead(this.Settings.ErrorResponseCode, headers);
                response.end();
              }
          );
        }
      } else {
        response.writeHead(this.Settings.ErrorResponseCode, headers);
        response.end();
      }
    } catch (e) {
      response.writeHead(this.Settings.ErrorResponseCode, headers);
      response.end();
    }
  }

  public processor(data, params) {
    return new Promise((resolve, reject) => {
      this.decode(data, this.Settings.Password).then(
          (_data: any) => {
            if (
                _data &&
                _data.data &&
                _data.data.Action
            ) {
              if (_data.data.Transport) {
                params.Transport = _data.data.Transport;
                delete _data.data.Transport;
              }

              if (_data.data.Callback) {
                params.Callback = _data.data.Callback;
                delete _data.data.Callback;
              }

              if (_data.data.Action) {
                params.Action = _data.data.Action;
                delete _data.data.Action;
              }

              if (_data.data.Url) {
                params.Url = _data.data.Url;
                delete _data.data.Url;
              }

              if (_data.data.Refferer) {
                params.Refferer = _data.data.Refferer;
                delete _data.data.Refferer;
              }

              if (params.Action === "Respond") {
                if (
                    this.listners[_data.event] &&
                    ["xhr", "fetch", "iframe", "script", "style"].indexOf(params.Transport) !== -1
                ) {
                  new Promise(
                      (_resolve) => {
                        _resolve(this.listners[_data.event](_data.data, params));
                      }
                  ).then(
                      (result) => {
                        this.encode(result, this.Settings.Password).then(
                            (__data) => {
                              resolve({
                                Data: __data,
                                Params: params,
                              });
                            }
                        ).catch(reject);
                      }
                  ).catch(reject);
                } else {
                  reject();
                }
              } else if (params.Action === "Redirect") {
                if (
                    this.listners["redirect"]
                ) {
                  new Promise(
                      (_resolve) => {
                        _resolve(this.listners["redirect"](_data, params));
                      }
                  ).then(
                      () => {
                        resolve({
                          Data: _data,
                          Params: params,
                        });
                      }
                  ).catch(reject);
                } else {
                  resolve({
                    Data: _data,
                    Params: params,
                  });
                }
              } else if (params.Action === "Proxy") {
                if (
                    this.listners["proxy"]
                ) {
                  new Promise(
                      (_resolve) => {
                        _resolve(this.listners["proxy"](_data, params));
                      }
                  ).then(
                      () => {
                        resolve({
                          Data: _data,
                          Params: params,
                        });
                      }
                  ).catch(reject);
                } else {
                  resolve({
                    Data: _data,
                    Params: params,
                  });
                }
              } else {
                reject();
              }
            } else {
              reject();
            }
          }
      ).catch(reject);
    });
  }

  public preprocessor(request) {
    return new Promise((resolve, reject) => {
      let data = [];
      /**
       * Get data from url
       */
      let params = URL.parse(request.url, true);
      /**
       * Get data from path
       */
      let path = PATH.parse(params.pathname);
      if (
          params.pathname.lastIndexOf("/") === params.pathname.length - 1
      ) {
        path.dir = path.dir + "/" + path.name + "/";
        path.name = "";
      }
      /**
       * Get data from path
       */
      path.dir.split("/").forEach((item) => {
        if (
            !this.Settings.IgnoredRequestPaths[item]
        ) {
          data.push(decodeURIComponent(item));
        }
      });
      /**
       * Get data from name
       */
      data.push(decodeURIComponent(path.name));
      /**
       * Get data from params
       */
      data.concat(Object.keys(params.query).forEach((key) => {
        data.push(params.query[key]);
      }));

      /**
       * Get data from headers
       */
      Object.keys(request.headers).filter((key) => {
        return (
            !this.Settings.NormalRequestHeaders[key] &&
            key.indexOf("-") === -1
        );
      }).sort().forEach((key) => {
        data.push(decodeURIComponent(request.headers[key]));
      });
      /**
       * Get data from body
       */
      let buffer = [];

      request.on("data", (chunk) => {
        buffer.push(chunk);
      });

      request.on("end", () => {
        data.push(Buffer.concat(buffer).toString("utf-8"));

        resolve(data.join(""));
      });

      request.on("error", () => {
        reject();
      });
    });
  }

  /**
   * Decode data asynchronously
   * @param data
   * @param password
   */
  public decode(data: any, password: string) {
    return new Promise((resolve, reject) => {
      let _data = this.decodeSync(data, password);
      if (_data) {
        resolve(_data);
      } else {
        reject();
      }
    });
  }

  /**
   * Encode data object asynchronously
   * @param data
   * @param password
   */
  public encode(data: any, password: string) {
    return new Promise((resolve, reject) => {
      let _data = this.encodeSync(data, password);
      if (_data) {
        resolve(_data);
      } else {
        reject();
      }
    });
  }

  /**
   * Decode data synchronously
   * @param data
   * @param password
   */
  public decodeSync(data: any, password: string) {
    try {
      let dec = JSON.parse(decodeURIComponent(global.escape(Buffer.from(data, "base64").toString("utf8"))));
      this.cryptoModule = "base64+";
      return dec;
    } catch (e) {
      /**
       * TODO: add logger
       */
    }

    try {
      let dec = JSON.parse(Buffer.from(data, "base64").toString("utf8"));
      this.cryptoModule = "base64";
      return dec;
    } catch (e) {
      /**
       * TODO: add logger
       */
    }

    try {
      let decipher = CRYPTO.createDecipher("aes-256-ctr", password);
      let dec = decipher.update(data, "hex", "utf8");
      dec += decipher.final("utf8");
      dec = JSON.parse(dec);
      this.cryptoModule = "webcrypto";
      return dec;
    } catch (e) {
      /**
       * TODO: add logger
       */
    }

    try {
      let dec = JSON.parse(AES.decrypt(data, password).toString(UTF8)) || false;
      this.cryptoModule = "cryptojs";
      return dec;
    } catch (e) {
      /**
       * TODO: add logger
       */
    }

    return false;
  }

  /**
   * Encode data object synchronously
   * @param data
   * @param password
   */
  public encodeSync(data: any, password: string) {
    if (
        this.cryptoModule === "" ||
        this.cryptoModule === "base64+"
    ) {
      try {
        return Buffer.from(global.unescape(encodeURIComponent(JSON.stringify(data)))).toString("base64");
      } catch (e) {
        /**
         * TODO: add logger
         */
      }
    }

    if (
        this.cryptoModule === "" ||
        this.cryptoModule === "base64"
    ) {
      try {
        return Buffer.from(JSON.stringify(data)).toString("base64");
      } catch (e) {
        /**
         * TODO: add logger
         */
      }
    }

    if (
        this.cryptoModule === "" ||
        this.cryptoModule === "webcrypto"
    ) {
      try {
        let cipher = CRYPTO.createCipher("aes-256-ctr", password);
        let crypted = cipher.update(JSON.stringify(data), "utf8", "hex");
        crypted += cipher.final("hex");
        return crypted;
      } catch (e) {
        /**
         * TODO: add logger
         */
      }
    }

    if (
        this.cryptoModule === "" ||
        this.cryptoModule === "cryptojs"
    ) {
      try {
        data = AES.encrypt(JSON.stringify(data), password).toString();
        return data;
      } catch (e) {
        /**
         * TODO: add logger
         */
      }
    }

    return null;
  }
}
