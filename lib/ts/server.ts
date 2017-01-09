"use strict";

declare let require: any;

const HTTP = require("http");
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
    private NormalRequestHeaders: any;

    public constructor(settings: any) {
        super(settings);

        this.listners = {};

        this.NormalRequestHeaders = [
            "host",
            "connection",
            "content-length",
            "pragma",
            "cache-control",
            "origin",
            "user-agent",
            "content-type",
            "accept",
            "referer",
            "accept-encoding",
            "accept-language",
            "cookie",
            "upgrade-insecure-requests",
        ].concat(this.Settings.NormalRequestHeaders || []);

        HTTP.createServer(this.listenr.bind(this)).listen(this.Settings.ServerPort);
    }

    public on(event: string, listner: Function) {
        this.listners[event] = listner;
    }

    private listenr(request, response) {
        let headers = Object.assign({}, baseHeaders);

        let host;

        headers["Access-Control-Allow-Origin"] = false;

        if (
            !headers["Access-Control-Allow-Origin"] &&
            request.headers.origin
        ) {
            let origin = URL.parse(request.headers.origin);
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
            let origin = URL.parse(request.headers.referer);
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
            !headers["Access-Control-Allow-Origin"]
        ) {
            headers["Access-Control-Allow-Origin"] = "*";
            host = "*";
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
                    (result) => {

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
                            (_result) => {
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
                                    response.end(resp);
                                } else if (_result.Params.Action === "Redirect") {
                                    headers["Location"] = _result.Data.link;
                                    response.writeHead(this.Settings.RedirectResponseCode, headers);
                                    response.end();
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
                );
            }
        } else {
            response.writeHead(this.Settings.ErrorResponseCode, headers);
            response.end();
        }

        setTimeout(
            () => {
                response.writeHead(this.Settings.ErrorResponseCode, headers);
                response.end();
            },
            this.Settings.ConnectionTimeout
        );
    }

    private processor(data, params) {
        return new Promise((resolve, reject) => {
            this.decode(data, this.Settings.Password).then(
                (_data) => {
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
                            resolve({
                                Params: params,
                                Data: _data,
                            });
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
            let data = [
                this.getDataFromPath(request),
                this.getDataFromName(request),
                this.getDataFromParameters(request),
                this.getDataFromHeader(request),
            ];
            /**
             * Get data from body
             */
            let buffer = [];

            request.on("data", (data) => {
                buffer.push(data.toString())
            });

            request.on("end", () => {
                data.push(buffer.join(""));

                data = data.filter((item) => {
                    return item.length > 0
                });

                resolve(data.join(""));
            });

            request.on("error", () => {
                reject();
            });
        });
    }

    private getDataFromName(request) {
        /**
         * Get data from url
         */
        let params = URL.parse(request.url, true);
        /**
         * Get data from path
         */
        let path = PATH.parse(params.pathname);

        if (
            path
        ) {
            if (
                params.pathname.lastIndexOf("/") === params.pathname.length - 1
            ) {
                path.dir = path.dir + "/" + path.name + "/";
                path.name = "";
            }

            return decodeURIComponent(path.name);
        } else {
            return "";
        }
    }

    private getDataFromPath(request) {
        /**
         * Get data from url
         */
        let params = URL.parse(request.url, true);
        /**
         * Get data from path
         */
        let path = PATH.parse(params.pathname);

        if (
            path
        ) {
            if (
                params.pathname.lastIndexOf("/") === params.pathname.length - 1
            ) {
                path.dir = path.dir + "/" + path.name + "/";
                path.name = "";
            }

            return path.dir.split("/").map((item) => {
                return decodeURIComponent(item);
            }).join("");
        } else {
            return "";
        }
    }

    private getDataFromParameters(request) {
        /**
         * Get data from url
         */
        let params = URL.parse(request.url, true);
        /**
         * Get data from get parameters
         */
        if (
            params &&
            Object.keys(params.query).length > 0
        ) {
            return Object.keys(params.query).map((key) => {
                return params.query[key];
            }).join("");
        } else {
            return "";
        }
    }

    private getDataFromHeader(request) {
        /**
         * Get data from headers
         */
        let _headerBuffer = {};
        for (let header in request.headers) {
            if (
                request.headers.hasOwnProperty(header) &&
                this.NormalRequestHeaders.indexOf(header) === -1
            ) {
                _headerBuffer[header] = (request.headers[header]);
            }
        }
        let headerBuffer = [];
        Object.keys(_headerBuffer).sort().map((key) => {
            headerBuffer.push(_headerBuffer[key);
        });
        return headerBuffer.join("");
    }
}
