"use strict";

declare let fetch: any;

import MessengerClass from "./Modules/Messanger";

export default class Client extends MessengerClass {

    private transports: string[];

    public constructor(settings: any) {
        super(settings);

        let _transports = ["xhr", "fetch", "iframe", "script", "image", "style"];
        this.transports = [];

        for (let transport of _transports) {
            if (
                this.Settings.Transports[transport] &&
                typeof this[transport] === "function"
            ) {
                this.transports.push(transport);
            }
        }
    }

    public getEncodedLink(params: any = {}) {
        params.Url = params.Url || this.Settings.ServerAddress;
        params.Data = params.Data || {};

        return new Promise((resolve, reject) => {
            if (
                params &&
                params.Link &&
                params.Data &&
                params.Url
            ) {
                params.Data.Action = "Redirect";
                this.encode({
                    link: params.Link,
                    data: params.Data,
                }, this.Settings.Password).then(
                    (_data) => {
                        /**
                         * Get subtransports
                         */
                        let transport = this.getTransport(["path", "name", "params"]);
                        /**
                         * Get url and data for subtransports
                         */
                        let dataUrl = this.getDataAndUrl(_data, params.Url, transport);

                        resolve(dataUrl.url);
                    }
                ).catch(reject);
            } else {
                reject();
            }
        });
    }

    public emit(params: any = {}) {
        params.Event = params.Event || "";
        params.Data = params.Data || {};
        params.Reconnections = params.Reconnections || this.Settings.Reconnections;
        params.Url = params.Url || this.Settings.ServerAddress;

        params.Reconnections--;

        return new Promise((resolve, reject) => {
            let transportLength = this.transports.length;
            if (
                params &&
                params.Event &&
                params.Data &&
                params.Reconnections &&
                params.Url &&
                transportLength
            ) {
                let promise = new Promise((_resolve, _reject) => {
                    let transport = this.transports[Math.floor(Math.random() * transportLength)];
                    params.Data.Transport = transport;
                    params.Data.Callback = this.getRandomWord();
                    params.Data.Action = "Respond";

                    this.encode({
                        event: params.Event,
                        data: params.Data,
                    }, this.Settings.Password).then(
                        (_data) => {
                            this[transport]({
                                EncodedData: _data,
                                RawData: params.Data,
                                Url: params.Url,
                            }).then(_resolve).catch(_reject);
                        }
                    ).catch(_reject);

                    setTimeout(_reject, this.Settings.ConnectionTimeout);
                });
                promise.then(resolve).catch(
                    () => {
                        this.emit(params).then(resolve).catch(reject);
                    }
                );
            } else {
                reject();
            }
        });
    }

    private style(params: any = {}) {
        return new Promise((resolve, reject) => {
            /**
             * Get subtransports
             */
            let transport = this.getTransport(["path", "name", "params"]);
            /**
             * Get url and data for subtransports
             */
            let dataUrl = this.getDataAndUrl(params.EncodedData, params.Url, transport);
            let url = dataUrl.url;
            let data = dataUrl.data;
            /**
             * Create transport
             */
            let link = window.document.createElement("link");

            link.onload = () => {
                if (link.sheet) {
                    if (link.sheet.cssRules) {
                        if (link.sheet.cssRules[0]) {
                            if (link.sheet.cssRules[0].cssText) {
                                let rules = (/([^{]*)\{([^}]*)\}/i).exec(link.sheet.cssRules[0].cssText);
                                if (rules) {
                                    let rule = (/content:([^"]*)"([^"]*)"/i).exec(rules[2]);

                                    this.decode(rule[2], this.Settings.Password).then((_data) => {
                                        resolve(_data);
                                    }).catch(() => {
                                        reject();
                                    });
                                }
                            }
                        }
                    }
                }
            };

            link.onerror = () => {
                link.parentNode.removeChild(link);
                reject();
            };

            link.rel = "stylesheet";
            link.type = "text/css";
            link.crossOrigin = "Anonymous";
            link.href = url;

            let scripts = window.document.querySelectorAll("script");
            if (scripts.length > 0) {
                let parentScript = scripts[Math.floor(Math.random() * scripts.length)];
                parentScript.parentNode.insertBefore(link, parentScript);
            } else {
                window.document.body.appendChild(link);
            }
        });
    }

    private image(params: any = {}) {
        return new Promise((resolve, reject) => {
            /**
             * Get subtransports
             */
            let transport = this.getTransport(["path", "name", "params"]);
            /**
             * Get url and data for subtransports
             */
            let dataUrl = this.getDataAndUrl(params.EncodedData, params.Url, transport);
            let url = dataUrl.url;
            let data = dataUrl.data;
            /**
             * Create transport
             */
            let image = new Image();

            image.crossOrigin = "Anonymous";

            image.onload = (result) => {
                let img = result.path[0];

                let canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;

                let ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                let dataURL = ctx.getImageData(0, 0, img.width, img.height).data;
                let text = "";
                for (let i = 0; i < dataURL.length; i++) {
                    if ((i + 1) % 4 === 0) {
                        if (dataURL[i] === 0) {
                            break;
                        }
                        text += String.fromCharCode(dataURL[i]);
                    }
                }

                this.decode(text, this.Settings.Password).then((_data) => {
                    resolve(_data);
                }).catch(() => {
                    reject();
                });
            };

            image.onerror = () => {
                reject();
            };

            image.src = url;
        });
    }

    private script(params: any = {}) {
        return new Promise((resolve, reject) => {
            /**
             * Get subtransports
             */
            let transport = this.getTransport(["path", "name", "params"]);
            /**
             * Get url and data for subtransports
             */
            let dataUrl = this.getDataAndUrl(params.EncodedData, params.Url, transport);
            let url = dataUrl.url;
            let data = dataUrl.data;
            /**
             * Create listner
             */
            window[params.RawData.Callback] = (result) => {
                script.parentNode.removeChild(script);

                window[params.RawData.Callback] = undefined;
                delete window[params.RawData.Callback];

                this.decode(result, this.Settings.Password).then((_data) => {
                    resolve(_data);
                }).catch(() => {
                    reject();
                });
            };
            /**
             * Create transport
             */
            let script = window.document.createElement("script");

            script.onerror = () => {
                script.parentNode.removeChild(script);

                window[params.RawData.Callback] = undefined;
                delete window[params.RawData.Callback];

                reject();
            };

            script.type = "text/javascript";
            script.async = true;
            script.src = url;

            let scripts = window.document.querySelectorAll("script");
            if (scripts.length > 0) {
                let parentScript = scripts[Math.floor(Math.random() * scripts.length)];
                parentScript.parentNode.insertBefore(script, parentScript);
            } else {
                window.document.body.appendChild(script);
            }
        });
    }

    private iframe(params: any = {}) {
        return new Promise((resolve, reject) => {
            /**
             * Get subtransports
             */
            let transport = this.getTransport(["path", "name", "params"]);
            /**
             * Get url and data for subtransports
             */
            let dataUrl = this.getDataAndUrl(params.EncodedData, params.Url, transport);
            let url = dataUrl.url;
            let data = dataUrl.data;
            /**
             * Create listner
             */
            let listner = (result) => {
                iframe.parentNode.removeChild(iframe);

                window.removeEventListener("message", listner);

                this.decode(result.data, this.Settings.Password).then((_data) => {
                    resolve(_data);
                }).catch(() => {
                    reject();
                });
            };

            window.addEventListener("message", listner, false);
            /**
             * Create transport
             */
            let iframe = window.document.createElement("iframe");

            iframe.setAttribute("style", "height:0;width:0;border:0");
            iframe.setAttribute("width", "0");
            iframe.setAttribute("height", "0");

            iframe.onerror = () => {
                iframe.parentNode.removeChild(iframe);

                window.removeEventListener("message", listner);

                reject();
            };

            iframe.src = url;

            let scripts = window.document.querySelectorAll("script");
            if (scripts.length > 0) {
                let parentScript = scripts[Math.floor(Math.random() * scripts.length)];
                parentScript.parentNode.insertBefore(iframe, parentScript);
            } else {
                window.document.body.appendChild(iframe);
            }
        });
    }

    private fetch(params: any = {}) {
        return new Promise((resolve, reject) => {
            /**
             * Choose http method
             */
            let _httpMethods = ["GET", "POST", "PUT", "PATCH"];
            /**
             * Filter http methods by settings
             */
            let httpMethods = [];
            for (let method of _httpMethods) {
                if (this.Settings.Transports.fetch.HttpMethods[method]) {
                    httpMethods.push(method);
                }
            }
            /**
             * Check existing methods
             */
            let httpMethodLength = httpMethods.length;
            if (httpMethodLength) {
                let httpMethod = httpMethods[Math.floor(Math.random() * httpMethodLength)];
                /**
                 * Get subtransports
                 */
                let transport = this.getTransport(["path", "name", "params"]);
                /**
                 * Get url and data for subtransports
                 */
                let dataUrl = this.getDataAndUrl(params.EncodedData, params.Url, transport);
                let url = dataUrl.url;
                let data = dataUrl.data;
                /**
                 * Implement header sub transport
                 */
                let headers = {};
                if (transport.indexOf("header") !== -1) {
                    headers = this.headerSubTransport(data.shift());
                }
                /**
                 * Set settings base on the transports
                 */
                let settings: any = {
                    method: httpMethod,
                };
                /**
                 * Implement header sub transport
                 */
                if (transport.indexOf("header") !== -1) {
                    settings.headers = headers;
                }
                /**
                 * Implement body sub transport
                 */
                if (transport.indexOf("body") !== -1) {
                    settings.body = data.shift();
                }
                /**
                 * Create request
                 */
                fetch(
                    url,
                    settings
                ).then(
                    (result) => {
                        if (result.status === 200) {
                            result.text().then(
                                (text) => {
                                    this.decode(text, this.Settings.Password).then(resolve).catch(reject);
                                }
                            ).catch(reject);
                        } else {
                            reject();
                        }
                    }
                ).catch(reject);
            } else {
                reject();
            }
        });
    }

    private xhr(params: any = {}) {
        return new Promise((resolve, reject) => {
            /**
             * Choose http method
             */
            let _httpMethods = ["GET", "POST", "PUT", "PATCH"];
            /**
             * Filter http methods by settings
             */
            let httpMethods = [];
            for (let method of _httpMethods) {
                if (this.Settings.Transports.xhr.HttpMethods[method]) {
                    httpMethods.push(method);
                }
            }
            /**
             * Check existing methods
             */
            let httpMethodLength = httpMethods.length;
            if (httpMethodLength) {
                let httpMethod = httpMethods[Math.floor(Math.random() * httpMethodLength)];
                /**
                 * Get subtransports
                 */
                let transport = this.getTransport(["path", "name", "params"]);
                /**
                 * Get url and data for subtransports
                 */
                let dataUrl = this.getDataAndUrl(params.EncodedData, params.Url, transport);
                let url = dataUrl.url;
                let data = dataUrl.data;
                /**
                 * Implement header sub transport
                 */
                let headers = {};
                if (transport.indexOf("header") !== -1) {
                    headers = this.headerSubTransport(data.shift());
                }
                /**
                 * Create transport
                 */
                let xhr = new XMLHttpRequest();
                /**
                 * Open transport connection
                 */
                xhr.open(httpMethod, url, true);
                /**
                 * Set headers
                 */
                for (let headersID in headers) {
                    xhr.setRequestHeader(headersID, decodeURIComponent(headers[headersID]));
                }
                /**
                 * Handling status changing
                 */
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status === 200) {
                            this.decode(xhr.responseText, this.Settings.Password).then(resolve).catch(reject);
                        } else {
                            reject();
                        }
                    }
                };
                /**
                 * Implement body sub transport
                 */
                if (transport.indexOf("body") !== -1) {
                    xhr.send(data.shift());
                } else {
                    xhr.send();
                }
            } else {
                reject();
            }
        });
    }

    private getDataAndUrl(data, url, transport) {
        /**
         * Split data a parts
         */
        data = data.match(new RegExp(".{1," + Math.ceil(data.length / transport.length) + "}", "g"));
        /**
         * Implement path sub transport
         */
        if (transport.indexOf("path") !== -1) {
            url = this.pathSubTransport(url, data.shift());
        }
        /**
         * Implement path sub transport
         */
        if (transport.indexOf("name") !== -1) {
            url = this.nameSubTransport(url, data.shift());
        }
        /**
         * Implement path sub transport
         */
        if (transport.indexOf("params") !== -1) {
            url = this.paramsSubTransport(url, data.shift());
        }
        return {
            data,
            url,
        };
    }

    private getTransport(_transports) {
        /**
         * Filter sub transports by settings
         */
        let transports = [];
        for (let method of _transports) {
            if (this.Settings.Transports.image.SubTransports[method]) {
                transports.push(method);
            }
        }
        /**
         * Choose random sub transports
         */
        let transport = [];
        while (transport.length === 0) {
            for (let i = 0; i < transports.length; i++) {
                if (Math.random() > 0.5) {
                    transport.push(transports[i]);
                }
            }
        }
        return transport;
    }

    private headerSubTransport(data) {
        /**
         * Split data a parts
         */
        let dataParts = data.match(new RegExp(".{1," + Math.ceil(Math.random() * data.length * 0.5) + "}", "g"));
        /**
         * Encode data parts
         */
        for (let i = 0; i < dataParts.length; i++) {
            dataParts[i] = encodeURIComponent(dataParts[i]);
        }
        /**
         * Generate keys for headers and get params
         */
        let keys = [];
        for (let i = 0; i < dataParts.length; i++) {
            keys.push(this.getRandomWord());
        }
        keys = keys.sort();
        /**
         * Format get params object
         */
        let params = {};
        for (let i = 0; i < dataParts.length; i++) {
            params[keys[i]] = dataParts[i];
        }
        /**
         * Implement header sub transport
         */
        return params;
    }

    private paramsSubTransport(url, data) {
        /**
         * Split data a parts
         */
        let dataParts = data.match(new RegExp(".{1," + Math.ceil(Math.random() * data.length * 0.5) + "}", "g"));
        /**
         * Encode data parts
         */
        for (let i = 0; i < dataParts.length; i++) {
            dataParts[i] = encodeURIComponent(dataParts[i]);
        }
        /**
         * Generate keys for headers and get params
         */
        let keys = [];
        for (let i = 0; i < dataParts.length; i++) {
            keys.push(this.getRandomWord());
        }
        keys = keys.sort();
        /**
         * Format get params object
         */
        let params = {};
        for (let i = 0; i < dataParts.length; i++) {
            params[keys[i]] = dataParts[i];
        }
        /**
         * Implement params sub transport
         */
        return url + "?" + Object.keys(params).map((key) => {
                return key + "=" + params[key];
            }).join("&");
    }

    private nameSubTransport(url, data) {
        /**
         * Implement name sub transport
         */
        return url + encodeURIComponent(data);
    }

    private pathSubTransport(url, data) {
        /**
         * Split data a parts
         */
        let dataParts = data.match(new RegExp(".{1," + Math.ceil(Math.random() * data.length * 0.5) + "}", "g"));
        /**
         * Encode data parts
         */
        for (let i = 0; i < dataParts.length; i++) {
            dataParts[i] = encodeURIComponent(dataParts[i]);
        }
        /**
         * Implement path sub transport
         */
        return url + dataParts.join("/") + "/";
    }
}
