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

const HTTPS = require("https");

HTTPS.globalAgent.keepAlive = true;
HTTPS.globalAgent.keepAliveMsecs = 5000;
HTTPS.globalAgent.maxSockets = Infinity;
HTTPS.globalAgent.maxFreeSockets = 1000;

const URL = require("url");
const DNS = require("dns");
const PATH = require("path");

const baseHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, PATCH, DELETE",
  "Access-Control-Allow-Headers": "X-Requested-With, Accept-Encoding, content-type",
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
  public defaultSettings: any;

  public constructor(settings: any) {
    super(settings);

    this.Settings = Transport.combineSettings(this.Settings, this.defaultSettings);

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
          this.responceError("0.0.1", request, response, headers);
        },
        this.Settings.ConnectionTimeout
    );

    try {
      request.on("error", (_err) => {
        this.responceError("0.0.2", request, response, headers, _err);
      });

      response.on("error", (_err) => {
        this.responceError("0.0.3", request, response, headers, _err);
      });

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
        if (!response.answered) {
          response.answered = true;
          response.writeHead(this.Settings.SuccessResponseCode, headers);
          response.end();
        }
      } else {

        this.preprocessor(request).then(
            (result: any) => {
              if (result.indexOf("debug") !== -1) {
                let debug = {
                  headers: request.headers,
                  rawurl: request.url,
                  url: URL.parse(request.url, true),
                  result,
                };
                if (!response.answered) {
                  response.answered = true;
                  response.writeHead(this.Settings.SuccessResponseCode, headers);
                  response.end(JSON.stringify(debug));
                }
              } else {
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
                  IP,
                };

                this.processor(result, params, request, headers).then(
                    (_result: any) => {
                      headers["Access-Control-Allow-Origin"] = "*";
                      if (
                          _result.Params.Host
                      ) {
                        if (_result.Params.Action === "Respond") {
                          this.Respond(_result, headers, request, response);
                        } else if (_result.Params.Action === "Redirect") {
                          this.Redirect(_result, headers, request, response);
                        } else if (_result.Params.Action === "Proxy") {
                          this.Proxy(_result, headers, request, response);
                        } else {
                          this.responceError("0.0.4", request, response, headers, new Error("Unsupported action"), {
                            result,
                            params,
                            headers
                          });
                        }
                      } else {
                        this.responceError("0.0.5", request, response, headers, new Error("Host does not exist"), {
                          result,
                          params,
                          headers
                        });
                      }
                    }
                ).catch(
                    (e) => {
                      if (request.url.indexOf(".map") !== -1) {
                        this.responceError("0.0.6", request, response, headers);
                      } else {
                        this.responceError("0.0.7", request, response, headers, e, {
                          result,
                          params,
                          headers
                        });
                      }
                    }
                );
              }
            }
        ).catch(
            (e) => {
              this.responceError("0.0.8", request, response, headers, e);
            }
        );
      }
    } catch (e) {
      this.responceError("0.0.9", request, response, headers, e);
    }
  }

  public Proxy(result, headers, request, response) {
    try {
      let url = URL.parse(result.Data.link);

      url.port = url.port || url.protocol === "https:" ? 443 : 80;

      request.headers.host = url.host;

      let options = {
        headers: request.headers,
        hostname: url.host,
        method: "GET",
        path: url.path,
        port: url.port
      };

      DNS.lookup(
          options.hostname,
          (err) => {
            if (err) {
              this.responceError("0.1.1", request, response, headers, err, {
                result,
                url,
                options
              });
            } else {
              let req = (options.port === 443 ? HTTPS : HTTP).request(options, (res) => {
                res.on("error", (_err) => {
                  this.responceError("0.1.2", request, response, headers, _err, {
                    result,
                    url,
                    options
                  });
                });

                if (res.statusCode === 200) {
                  if (!response.answered) {
                    response.answered = true;
                    response.writeHead(this.Settings.SuccessResponseCode, res.headers);
                    res.pipe(response);
                  }
                } else {
                  this.responceError("0.1.3", request, response, res.headers, new Error("Proxy resource does not exist"), {
                    result,
                    url,
                    options
                  });
                }
              });

              req.on("error", (_err) => {
                this.responceError("0.1.4", request, response, headers, _err, {
                  result,
                  url,
                  options
                });
              });

              req.end();
            }
          }
      );
    } catch (e) {
      this.responceError("0.1.5", request, response, headers, e, {
        result
      });
    }
  }

  public Redirect(result, headers, request, response) {
    try {
      headers["Location"] = result.Data.link;
      if (!response.answered) {
        response.answered = true;
        response.writeHead(this.Settings.RedirectResponseCode, headers);
        response.end();
      }
    } catch (e) {
      this.responceError("0.2.1", request, response, headers, e, {
        result
      });
    }
  }

  public Respond(result, headers, request, response) {
    try {
      headers["Pragma"] = "no-cache";
      let resp = "";
      switch (result.Params.Transport) {
        case "style":
          resp = `.${result.Params.Callback} {content:"${result.Data}";}`;
          headers["Content-Type"] = "text/css; charset=utf-8";
          break;
        case "script":
          resp = 'window["' + result.Params.Callback + '"]("' + result.Data + '")';
          headers["Content-Type"] = "text/javascript; charset=utf-8";
          break;
        case "iframe":
          resp = `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>${result.Params.Callback}</title>
                </head>
                <body>
                    <script type="text/javascript">
                    var timer = setInterval(
                        function(){
                                try{
                                    if(parent &&parent.postMessage){
                                        parent.postMessage("${result.Data}","${headers["Access-Control-Allow-Origin"]}");
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
          resp = result.Data;
          headers["Content-Type"] = "text/plain; charset=utf-8";
          break;
        default:
          this.responceError("0.3.1", request, response, headers, new Error("Unsupported transport"));
      }
      if (resp) {
        ZLIB.gzip(resp, (error, _result) => {
          if (error) {
            this.responceError("0.3.2", request, response, headers, error, {
              result: _result
            });
          } else {
            headers["Content-Encoding"] = "gzip";
            headers["Content-Length"] = _result.length;
            if (!response.answered) {
              response.answered = true;
              response.writeHead(this.Settings.SuccessResponseCode, headers);
              response.end(_result);
            }
          }
        });
      } else {
        this.responceError("0.3.3", request, response, headers);
      }
    } catch (e) {
      this.responceError("0.3.4", request, response, headers, e, {
        result
      });
    }
  }

  public responceError(id, request, response, headers, e?, ...data) {
    if (
        e &&
        typeof this.Settings.ErrorHandler === "function"
    ) {
      this.Settings.ErrorHandler(e, id, data);
    }

    if (request.headers["x-real-404"]) {
      let url = URL.parse(request.headers["x-real-404"]);

      request.headers.host = url.host;

      let options = {
        headers: request.headers,
        hostname: url.host,
        method: "GET",
        path: url.path,
        port: "80"
      };

      HTTP.request(options, (res) => {
        if (!response.answered) {
          response.answered = true;
          response.writeHead(this.Settings.SuccessResponseCode, res.headers);
          res.pipe(response);
        }
      }).end();
    } else {
      if (!response.answered) {
        response.answered = true;
        response.writeHead(this.Settings.ErrorResponseCode, headers);
        response.end();
      }
    }
  }

  public processor(data, params, request, headers) {
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

              if (_data.data.Protocol) {
                params.Protocol = _data.data.Protocol;
                delete _data.data.Protocol;
              }

              if (_data.data.Host) {
                params.Host = _data.data.Host;
                delete _data.data.Host;
              }

              params.Host = this.getHostFromHeaderXRealHost(request, headers, params.Host);
              params.Host = this.getHostFromHeaderOrigin(request, headers, params.Host);
              params.Host = this.getHostFromHeaderReferer(request, headers, params.Host);
              params.Host = this.getHostFromHeaderHost(request, headers, params.Host);

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
                  reject(new Error("Transport undefined or unsupported or listener unexist"));
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
                reject(new Error("Action unsupported"));
              }
            } else {
              reject(new Error("Invalid data"));
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
      if (
          !this.Settings.IgnoredNames[path.name]
      ) {
        data.push(decodeURIComponent(path.name));
      }
      /**
       * Get data from params
       */
      data.concat(Object.keys(params.query).forEach((key) => {
        if (
            !this.Settings.IgnoredQueryParams[key]
        ) {
          data.push(params.query[key]);
        }
      }));

      /**
       * Get data from headers
       */
      Object.keys(request.headers).filter((key) => {
        return (
            !this.Settings.IgnoredRequestHeaders[key] &&
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

      request.on("error", (err) => {
        reject(err);
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
        reject(new Error("Decode failed"));
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
        reject(new Error("Encode failed"));
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
      let dec = JSON.parse(decodeURIComponent(global.escape(Buffer.from(data, "base64").toString("utf8"))).split("@", 2)[1]);
      this.cryptoModule = "base64salt";
      return dec;
    } catch (e) {
      // TODO: add logger
    }

    try {
      let dec = JSON.parse(decodeURIComponent(global.escape(Buffer.from(data, "base64").toString("utf8"))));
      this.cryptoModule = "base64+";
      return dec;
    } catch (e) {
      // TODO: add logger
    }

    try {
      let dec = JSON.parse(Buffer.from(data, "base64").toString("utf8"));
      this.cryptoModule = "base64";
      return dec;
    } catch (e) {
      // TODO: add logger
    }

    try {
      let decipher = CRYPTO.createDecipher("aes-256-ctr", password);
      let dec = decipher.update(data, "hex", "utf8");
      dec += decipher.final("utf8");
      dec = JSON.parse(dec);
      this.cryptoModule = "webcrypto";
      return dec;
    } catch (e) {
      // TODO: add logger
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
        this.cryptoModule === "base64salt"
    ) {
      try {
        return Buffer.from(global.unescape(encodeURIComponent((Math.random() * 1e8).toString(36) + "@" + JSON.stringify(data)))).toString("base64");
      } catch (e) {
        // TODO: add logger
      }
    }

    if (
        this.cryptoModule === "" ||
        this.cryptoModule === "base64+"
    ) {
      try {
        return Buffer.from(global.unescape(encodeURIComponent(JSON.stringify(data)))).toString("base64");
      } catch (e) {
        // TODO: add logger
      }
    }

    if (
        this.cryptoModule === "" ||
        this.cryptoModule === "base64"
    ) {
      try {
        return Buffer.from(JSON.stringify(data)).toString("base64");
      } catch (e) {
        // TODO: add logger
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
        // TODO: add logger
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
        // TODO: add logger
      }
    }

    return null;
  }

  public getHostFromHeaderXRealHost(request, headers, host) {
    if (
        !host &&
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
    return host;
  }

  public getHostFromHeaderOrigin(request, headers, host) {
    if (
        !host &&
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
    return host;
  }

  public getHostFromHeaderReferer(request, headers, host) {
    if (
        !host &&
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
    return host;
  }

  public getHostFromHeaderHost(request, headers, host) {
    if (
        !host &&
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
    return host;
  }
}
