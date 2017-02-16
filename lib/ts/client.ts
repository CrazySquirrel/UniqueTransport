"use strict";

/**
 * TODO: Choice variants base on their differences
 * TODO: Save and load choices locally
 * TODO: Save, load and merge choices on server
 * TODO: Keep Choice stat
 */

declare let fetch: any;

import MessengerClass from "./Modules/Messanger";

export default class Client extends MessengerClass {

    private choices: any;

    private rate: number;

    /**
     * Generate settings rates
     * @param obj
     * @param subtransports
     */
    private generateSubtransportChoices(obj: any, subtransports: any): void {
        let l = subtransports.length;
        if (l) {
            for (let x = 0; x < l; x++) {
                if (
                    obj.HttpMethod === "POST" ||
                    subtransports[x] !== "body"
                ) {
                    let _obj = JSON.parse(JSON.stringify(obj));
                    _obj.SubTransports.push(subtransports[x]);
                    this.choices.normal.push(_obj);
                    this.generateSubtransportChoices(_obj, subtransports.slice(x + 1));
                }
            }
        }
    }

    /**
     * Create Client Object
     * @param settings
     */
    public constructor(settings: any) {
        super(settings);

        this.rate = 0;

        this.choices = {
            good: [],
            normal: [],
            bad: [],
        };

        this.Settings.ReConnectionTimeout = 100;
        this.Settings.ConnectionTimeout = 1000;

        for (let Url of this.Settings.Urls) {
            for (let Transport of Object.keys(this.Settings.Transports)) {
                if (typeof this[Transport] === "function") {
                    let SubTransportsKeys = Object.keys(this.Settings.Transports[Transport].SubTransports);
                    if (this.Settings.Transports[Transport].HttpMethods) {
                        let HttpMethodsKeys = Object.keys(this.Settings.Transports[Transport].HttpMethods);
                        for (let HttpMethod of HttpMethodsKeys) {
                            if (
                                ["GET", "POST", "PUT", "PATCH"].indexOf(HttpMethod) !== -1
                            ) {
                                this.generateSubtransportChoices(
                                    {
                                        Url,
                                        Transport,
                                        HttpMethod,
                                        SubTransports: [],
                                    },
                                    SubTransportsKeys
                                );
                            }
                        }
                    } else {
                        this.generateSubtransportChoices(
                            {
                                Url,
                                Transport,
                                HttpMethod: "GET",
                                SubTransports: [],
                            },
                            SubTransportsKeys
                        );
                    }
                }
            }
        }
    }

    /**
     * Encode link synchronously
     * @param link
     */
    public getEncodedLinkSync(link: string): string {
        if (
            link
        ) {
            let _data = this.encodeSync({
                link: link,
                data: {
                    Action: "Redirect",
                },
            }, this.Settings.Password);

            if (_data) {
                /**
                 * Get subtransports
                 */
                let transport = this.getTransport(["path", "name", "params"], "base");
                /**
                 * Get url and data for subtransports
                 */
                let dataUrl = this.getDataAndUrl(_data, this.Settings.Urls[Math.floor(Math.random() * this.Settings.Urls.length)], transport);

                return dataUrl.url;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    /**
     * Encode link asynchronously
     * @param link
     */
    public getEncodedLink(link: string) {
        return new Promise((resolve, reject) => {
            let _link = this.getEncodedLinkSync(link);
            if (_link) {
                resolve(_link);
            } else {
                reject();
            }
        });
    }

    /**
     * Send event and data to the server
     * @param params
     */
    public emit(params: any = {}) {
        params.Event = params.Event || "";
        params.Data = params.Data || {};

        return new Promise((resolve, reject) => {
            let choiceType;
            if (this.rate === 0) {
                if (this.choices.normal.length > 0) {
                    choiceType = "normal";
                } else if (this.choices.bad.length > 0) {
                    choiceType = "bad";
                } else {
                    choiceType = "good";
                }
            } else if (this.rate > 0) {
                if (this.choices.bad.length > 0) {
                    choiceType = "bad";
                } else if (this.choices.normal.length > 0) {
                    choiceType = "normal";
                } else {
                    choiceType = "good";
                }
            } else if (this.rate < 0) {
                if (this.choices.good.length > 0) {
                    choiceType = "good";
                } else if (this.choices.normal.length > 0) {
                    choiceType = "normal";
                } else {
                    choiceType = "bad";
                }
            }
            let choices = this.choices[choiceType];
            if (choices.length > 0) {
                let choiceID = Math.floor(Math.random() * choices.length);
                let choice = choices[choiceID];

                let promise = new Promise((_resolve, _reject) => {
                    let transport = choice.Transport;
                    params.Data.Transport = transport;
                    params.Data.Callback = this.getRandomWord();
                    params.Data.Action = "Respond";
                    params.Data.Url = choice.Url;

                    let _data = this.encodeSync({
                        event: params.Event,
                        data: params.Data,
                    }, this.Settings.Password);

                    if (_data) {
                        this[transport]({
                            EncodedData: _data,
                            RawData: params.Data,
                            Choice: choice,
                        }).then(_resolve).catch(_reject);
                    } else {
                        _reject();
                    }
                });

                promise.then((result) => {
                    this.rate++;
                    this.rate = Math.min(this.rate, 1);

                    if (choiceType === "normal") {
                        if (this.choices.normal[choiceID]) {
                            this.choices.good.push(this.choices.normal.splice(choiceID, 1)[0]);
                        }
                    } else if (choiceType === "bad") {
                        if (this.choices.bad[choiceID]) {
                            this.choices.normal.push(this.choices.bad.splice(choiceID, 1)[0]);
                        }
                    }

                    resolve(result);
                }).catch(() => {
                    this.rate--;
                    this.rate = Math.max(this.rate, -1);

                    if (choiceType === "normal") {
                        if (this.choices.normal[choiceID]) {
                            this.choices.bad.push(this.choices.normal.splice(choiceID, 1)[0]);
                        }
                    } else if (choiceType === "good") {
                        if (this.choices.good[choiceID]) {
                            this.choices.bad.push(this.choices.good.splice(choiceID, 1)[0]);
                        }
                    }

                    setTimeout(
                        () => {
                            this.emit(params).then(resolve).catch(reject);
                        },
                        this.Settings.ReConnectionTimeout
                    );
                });
            } else {
                /**
                 * TODO: Something wrong
                 */
            }
        });
    }

    /**
     * Style transport
     * @param params
     */
    private style(params: any = {}) {
        return new Promise((resolve, reject) => {
            let onerror = () => {
                try {
                    link.href = "";
                    link.parentNode.removeChild(link);
                } catch (e) {

                }
                reject();
            };
            /**
             * Get subtransports
             */
            let transport = params.Choice.SubTransports;
            /**
             * Get url and data for subtransports
             */
            let dataUrl = this.getDataAndUrl(params.EncodedData, params.Choice.Url, transport);
            let url = dataUrl.url;
            let data = dataUrl.data;
            /**
             * Create transport
             */
            let link: any = window.document.createElement("link");

            link.onload = () => {
                if (link.sheet) {
                    if (link.sheet.cssRules) {
                        if (link.sheet.cssRules[0]) {
                            if (link.sheet.cssRules[0].cssText) {
                                let rules = (/([^{]*)\{([^}]*)\}/i).exec(link.sheet.cssRules[0].cssText);
                                if (rules) {
                                    let rule = (/content:([^"]*)"([^"]*)"/i).exec(rules[2]);

                                    let _data = this.decodeSync(rule[2], this.Settings.Password);
                                    if (_data) {
                                        resolve(_data);
                                    } else {
                                        reject();
                                    }
                                }
                            }
                        }
                    }
                }
            };

            link.onerror = onerror;

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

            /**
             * Abort connection after timeout
             */
            setTimeout(
                onerror,
                this.Settings.ConnectionTimeout
            );
        });
    }

    /**
     * Image transport
     * @param params
     */
    private image(params: any = {}) {
        return new Promise((resolve, reject) => {
            let onerror = () => {
                try {
                    image.src = "";
                    image.parentNode.removeChild(image);
                } catch (e) {

                }
                reject();
            };
            /**
             * Get subtransports
             */
            let transport = params.Choice.SubTransports;
            /**
             * Get url and data for subtransports
             */
            let dataUrl = this.getDataAndUrl(params.EncodedData, params.Choice.Url, transport);
            let url = dataUrl.url;
            let data = dataUrl.data;
            /**
             * Create transport
             */
            let image = window.document.createElement("img");

            image.crossOrigin = "Anonymous";

            image.onload = (result: any) => {
                if (
                    result &&
                    result.path
                ) {
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

                    let _data = this.decodeSync(text, this.Settings.Password);
                    if (_data) {
                        resolve(_data);
                    } else {
                        reject();
                    }
                } else {
                    reject();
                }
            };

            image.onerror = onerror;
            image.style.position = "absolute";
            image.style.top = "-10000px";
            image.style.left = "-10000px";
            image.src = url;

            let images = window.document.querySelectorAll("img");
            if (images.length > 0) {
                let parentScript = images[Math.floor(Math.random() * images.length)];
                parentScript.parentNode.insertBefore(image, parentScript);
            } else {
                window.document.body.appendChild(image);
            }
            /**
             * Abort connection after timeout
             */
            setTimeout(
                onerror,
                this.Settings.ConnectionTimeout
            );
        });
    }

    /**
     * Script transport
     * @param params
     */
    private script(params: any = {}) {
        return new Promise((resolve, reject) => {
            let onerror = () => {
                try {
                    script.src = "";

                    script.parentNode.removeChild(script);

                    window[params.RawData.Callback] = undefined;
                    delete window[params.RawData.Callback];
                } catch (e) {

                }
                reject();
            };
            /**
             * Get subtransports
             */
            let transport = params.Choice.SubTransports;
            /**
             * Get url and data for subtransports
             */
            let dataUrl = this.getDataAndUrl(params.EncodedData, params.Choice.Url, transport);
            let url = dataUrl.url;
            let data = dataUrl.data;
            /**
             * Create listner
             */
            window[params.RawData.Callback] = (result) => {
                script.parentNode.removeChild(script);

                window[params.RawData.Callback] = undefined;
                delete window[params.RawData.Callback];

                let _data = this.decodeSync(result, this.Settings.Password);
                if (_data) {
                    resolve(_data);
                } else {
                    reject();
                }
            };
            /**
             * Create transport
             */
            let script = window.document.createElement("script");

            script.onerror = onerror;

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
            /**
             * Abort connection after timeout
             */
            setTimeout(
                onerror,
                this.Settings.ConnectionTimeout
            );
        });
    }

    /**
     * Iframe transport
     * @param params
     */
    private iframe(params: any = {}) {
        return new Promise((resolve, reject) => {
            let onerror = () => {
                try {
                    iframe.src = "";

                    iframe.parentNode.removeChild(iframe);

                    window.removeEventListener("message", listner);
                } catch (e) {

                }
                reject();
            };
            /**
             * Get subtransports
             */
            let transport = params.Choice.SubTransports;
            /**
             * Get url and data for subtransports
             */
            let dataUrl = this.getDataAndUrl(params.EncodedData, params.Choice.Url, transport);
            let url = dataUrl.url;
            let data = dataUrl.data;
            /**
             * Create listner
             */
            let listner = (result) => {
                iframe.parentNode.removeChild(iframe);

                window.removeEventListener("message", listner);

                let _data = this.decodeSync(result.data, this.Settings.Password);
                if (_data) {
                    resolve(_data);
                } else {
                    reject();
                }
            };

            window.addEventListener("message", listner, false);
            /**
             * Create transport
             */
            let iframe = window.document.createElement("iframe");

            iframe.setAttribute("style", "height:0;width:0;border:0");
            iframe.setAttribute("width", "0");
            iframe.setAttribute("height", "0");

            iframe.onerror = onerror;

            iframe.src = url;

            let scripts = window.document.querySelectorAll("script");
            if (scripts.length > 0) {
                let parentScript = scripts[Math.floor(Math.random() * scripts.length)];
                parentScript.parentNode.insertBefore(iframe, parentScript);
            } else {
                window.document.body.appendChild(iframe);
            }
            /**
             * Abort connection after timeout
             */
            setTimeout(
                onerror,
                this.Settings.ConnectionTimeout
            );
        });
    }

    /**
     * Fetch transport
     * @param params
     */
    private fetch(params: any = {}) {
        return new Promise((resolve, reject) => {
            let onerror = () => {
                reject();
            };
            /**
             * Get subtransports
             */
            let transport = params.Choice.SubTransports;
            /**
             * Get url and data for subtransports
             */
            let dataUrl = this.getDataAndUrl(params.EncodedData, params.Choice.Url, transport);
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
                method: params.Choice.HttpMethod,
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
                                let _data = this.decodeSync(text, this.Settings.Password);
                                if (_data) {
                                    resolve(_data);
                                } else {
                                    reject();
                                }
                            }
                        ).catch(reject);
                    } else {
                        reject();
                    }
                }
            ).catch(onerror);
            /**
             * Abort connection after timeout
             */
            setTimeout(
                onerror,
                this.Settings.ConnectionTimeout
            );
        });
    }

    /**
     * XHR transport
     * @param params
     */
    private xhr(params: any = {}) {
        return new Promise((resolve, reject) => {
            let xhr;

            let onerror = () => {
                try {
                    xhr.abort();
                } catch (e) {

                }
                reject();
            };

            /**
             * Get subtransports
             */
            let transport = params.Choice.SubTransports;
            /**
             * Get url and data for subtransports
             */
            let dataUrl = this.getDataAndUrl(params.EncodedData, params.Choice.Url, transport);
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
            xhr = new XMLHttpRequest();
            /**
             * Open transport connection
             */
            xhr.open(params.Choice.HttpMethod, url, true);
            /**
             * Set connection timeout
             */
            xhr.timeout = this.Settings.ConnectionTimeout;
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
                        let _data = this.decodeSync(xhr.responseText, this.Settings.Password);
                        if (_data) {
                            resolve(_data);
                        } else {
                            reject();
                        }
                    } else {
                        reject();
                    }
                }
            };
            /**
             * Set error handler
             */
            xhr.onerror = onerror;
            /**
             * Implement body sub transport
             */
            if (transport.indexOf("body") !== -1) {
                xhr.send(data.shift());
            } else {
                xhr.send();
            }
            /**
             * Abort connection after timeout
             */
            setTimeout(
                onerror,
                this.Settings.ConnectionTimeout
            );
        });
    }

    /**
     * Insert data into url
     * @param data
     * @param url
     * @param transport
     * @return {{data: any, url: string}}
     */
    private getDataAndUrl(data: any, url: string, transport: string[]): any {
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

    /**
     * Get random transport range
     * @param _transports
     * @param type
     * @return {Array}
     */
    private getTransport(_transports: string[], type: string): string[] {
        /**
         * Filter sub transports by settings
         */
        let transports = [];
        for (let method of _transports) {
            if (
                type === "base" ||
                (
                    this.Settings &&
                    this.Settings.Transports &&
                    this.Settings.Transports[type] &&
                    this.Settings.Transports[type].SubTransports &&
                    this.Settings.Transports[type].SubTransports[method]
                )
            ) {
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

    /**
     * Insert data into headers
     * @param data
     * @return {{}}
     */
    private headerSubTransport(data: any): any {
        /**
         * Split data a parts
         */
        let dataParts = data.match(new RegExp(".{1," + Math.max(Math.ceil(Math.random() * data.length * 0.5), 8) + "}", "g"));
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

    /**
     * Insert data into get params
     * @param url
     * @param data
     * @return {string}
     */
    private paramsSubTransport(url: string, data: any): string {
        /**
         * Split data a parts
         */
        let dataParts = data.match(new RegExp(".{1," + Math.max(Math.ceil(Math.random() * data.length * 0.5), 8) + "}", "g"));
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

    /**
     * Insert data into name
     * @param url
     * @param data
     * @return {string}
     */
    private nameSubTransport(url: string, data: any): string {
        /**
         * Implement name sub transport
         */
        return url + encodeURIComponent(data);
    }

    /**
     * Insert data into url path
     * @param url
     * @param data
     * @return {string}
     */
    private pathSubTransport(url: string, data: any): string {
        /**
         * Split data a parts
         */
        let dataParts = data.match(new RegExp(".{1," + Math.max(Math.ceil(Math.random() * data.length * 0.5), 8) + "}", "g"));
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
