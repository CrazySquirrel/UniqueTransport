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

let root: any;

if (typeof window === "undefined") {
  if (typeof global !== "undefined") {
    root = global;
  } else {
    root = {};
  }
} else {
  root = window;
}

if (!root.Promise) {
  root.Promise = require("promise-polyfill");
}

const HTTP = require("http");

HTTP.globalAgent.keepAlive = true;
HTTP.globalAgent.keepAliveMsecs = 1000;
HTTP.globalAgent.maxSockets = 1000;
HTTP.globalAgent.maxFreeSockets = 1000;

const URL = require("url");
const PNG = require("pngjs").PNG;
const PATH = require("path");
const FS = require("fs");

const baseHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, PATCH, DELETE",
  "Access-Control-Allow-Headers": "X-Requested-With, content-type",
  "Access-Control-Allow-Credentials": true,
};

import MessengerClass from "./Modules/Messanger";

export default class Server extends MessengerClass {

  private listners: any;
  private RequestLogStream: any;
  private NormalRequestHeaders: any;
  private IgnoredRequestPaths: any;

  public constructor(settings: any) {
    super(settings);

    this.listners = {};

    this.IgnoredRequestPaths = {
      "test": true,
      "xmas": true,
      "weekend": true,
      "reobtain": true,
      "uniform": true,
      "barflies": true,
      "abduces": true,
      "suitor": true,
      "yachted": true
    };

    if (this.Settings.IgnoredRequestPaths) {
      Object.keys(this.Settings.IgnoredRequestPaths).forEach((key) => {
        this.IgnoredRequestPaths[key] = true;
      });
    }

    this.NormalRequestHeaders = {
      "accept": true,
      "accept-encoding": true,
      "accept-language": true,
      "cache-control": true,
      "chrome-proxy": true,
      "connection": true,
      "content-length": true,
      "content-type": true,
      "cookie": true,
      "dnt": true,
      "from": true,
      "host": true,
      "origin": true,
      "pragma": true,
      "proxy-authorization": true,
      "referer": true,
      "rvbd-csh": true,
      "rvbd-ssh": true,
      "save-data": true,
      "surrogate-capability": true,
      "te": true,
      "upgrade-insecure-requests": true,
      "user-agent": true,
      "via": true,
      "x-authenticated-groups": true,
      "x-authenticated-use": true,
      "x-bluecoat-via": true,
      "x-compress": true,
      "x-forwarded-for": true,
      "x-forwarded-proto": true,
      "x-imforwards": true,
      "x-iws-via": true,
      "x-real-host": true,
      "x-real-ip": true,
      "x-requested-with": true,
      "x-turbo-id": true,
      "x-wap-profile": true,
      "x-yandex-turbo": true
    };

    if (this.Settings.NormalRequestHeaders) {
      Object.keys(this.Settings.NormalRequestHeaders).forEach((key) => {
        this.NormalRequestHeaders[key] = true;
      });
    }

    if (this.Settings.WriteRequestLog) {
      this.RequestLogStream = FS.createWriteStream("RequestLog.tmp", {"flags": "a"});
    }

    this.on("debug", (data, params) => {
      return new Promise((resolve, reject) => {
        resolve(JSON.stringify({data, params}));
      });
    });

    HTTP.createServer(this.listenr.bind(this)).listen(this.Settings.ServerPort);
  }

  public on(event: string, listner: Function) {
    this.listners[event] = listner;
  }

  private listenr(request, response) {
    let headers = Object.assign({}, baseHeaders);

    setTimeout(
        () => {
          response.writeHead(this.Settings.ErrorResponseCode, headers);
          response.end();
        },
        this.Settings.ConnectionTimeout
    );

    try {
      if (this.Settings.WriteRequestLog) {
        this.RequestLogStream.write(JSON.stringify({
              url: request.url,
              headers: request.headers,
            }) + "\r\n");
      }

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
          if (request.headers['access-control-request-headers']) {
            if (headers["Access-Control-Allow-Headers"]) {
              headers["Access-Control-Allow-Headers"] = headers["Access-Control-Allow-Headers"].split(", ").concat(request.headers['access-control-request-headers'].split(", ")).join(", ");
            } else {
              headers["Access-Control-Allow-Headers"] = request.headers['access-control-request-headers'];
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
                    rawurl: request.url,
                    url: URL.parse(request.url, true),
                    headers: request.headers,
                    result: result,
                  };
                  response.writeHead(this.Settings.SuccessResponseCode, headers);
                  response.write(JSON.stringify(debug));
                  response.end();
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
                  IP: IP,
                  Headers: request.headers,
                  Host: host,
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
                          case "image":
                            let size = Math.ceil(Math.sqrt(_result.Data.length) * 2);
                            let rgb_data = new Buffer(size * size);
                            for (let i = 0; i < rgb_data.length; i++) {
                              rgb_data[i] = 0;
                            }
                            for (let y = 0; y < size; y++) {
                              for (let x = 0; x < size; x++) {
                                let idx = (size * y + x) << 2;
                                rgb_data[idx + 3] = _result.Data.charCodeAt(Math.floor(idx / 4));
                              }
                            }
                            let png = new PNG({
                              width: size,
                              height: size,
                              filterType: 4,
                            });
                            png.data = rgb_data;
                            resp = PNG.sync.write(png);
                            headers["Content-Type"] = "image/png";
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
                          default:
                            resp = _result.Data;
                            headers["Content-Type"] = "text/plain; charset=utf-8";
                        }
                        headers["Content-Length"] = resp.length;
                        response.writeHead(this.Settings.SuccessResponseCode, headers);
                        response.write(resp);
                        response.end();
                      } else if (_result.Params.Action === "Redirect") {
                        headers["Location"] = _result.Data.link;
                        response.writeHead(this.Settings.RedirectResponseCode, headers);
                        response.end();
                      } else if (_result.Params.Action === "Proxy") {
                        let url = URL.parse(_result.Data.link);

                        request.headers.host = url.host;

                        let options = {
                          port: "80",
                          hostname: url.host,
                          method: "GET",
                          path: url.path,
                          headers: request.headers
                        };

                        let _request = HTTP.get(options, (res) => {
                          let body = [];

                          res.on("data", (chunk) => {
                            body.push(chunk);
                          });

                          res.on("end", () => {
                            response.writeHead(this.Settings.SuccessResponseCode, res.headers);
                            response.end(Buffer.concat(body));
                          });

                          res.on("error", (e) => {
                            response.writeHead(this.Settings.ErrorResponseCode, res.headers);
                            response.end();
                          });
                        });

                        _request.shouldKeepAlive = true;
                      } else {
                        response.writeHead(this.Settings.ErrorResponseCode, headers);
                        response.end();
                      }
                    }
                ).catch(
                    (e) => {
                      response.writeHead(this.Settings.ErrorResponseCode, headers);
                      response.end();
                    }
                );
              }
          ).catch(
              (e) => {
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

  private processor(data, params) {
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

              if (params.Action === "Respond") {
                if (
                    this.listners[_data.event]
                ) {
                  new Promise(
                      (_resolve, _reject) => {
                        _resolve(this.listners[_data.event](_data.data, params));
                      }
                  ).then(
                      (result) => {
                        this.encode(result, this.Settings.Password).then(
                            (_data) => {
                              resolve({
                                Params: params,
                                Data: _data,
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
                      (_resolve, _reject) => {
                        _resolve(this.listners["redirect"](_data, params));
                      }
                  ).then(
                      () => {
                        resolve({
                          Params: params,
                          Data: _data,
                        });
                      }
                  ).catch(reject);
                } else {
                  resolve({
                    Params: params,
                    Data: _data,
                  });
                }
              } else if (params.Action === "Proxy") {
                if (
                    this.listners["proxy"]
                ) {
                  new Promise(
                      (_resolve, _reject) => {
                        _resolve(this.listners["proxy"](_data, params));
                      }
                  ).then(
                      () => {
                        resolve({
                          Params: params,
                          Data: _data,
                        });
                      }
                  ).catch(reject);
                } else {
                  resolve({
                    Params: params,
                    Data: _data,
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

  private preprocessor(request) {
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
            !this.IgnoredRequestPaths[item]
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
            !this.NormalRequestHeaders[key] &&
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

      request.on("error", (e) => {
        reject();
      });
    });
  }
}
