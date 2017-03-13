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
declare let fetch: any;
declare let require: any;

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

if (typeof root.location === "undefined") {
  root.location = {};
}

const CRYPTO = require("webcrypto");

import MessengerClass from "./Modules/Messanger";

export default class Client extends MessengerClass {

  private choices: any;

  private rate: number;

  private defaultSettings: any = {
    Urls: [
      root.location.origin + "/"
    ],
    Password: "xmas",
    ReConnectionTimeout: 500,
    ConnectionTimeout: 10000,
    Transports: {
      xhr: {
        HttpMethods: {
          GET: true,
          POST: true,
          PUT: true,
          PATCH: true,
        },
        SubTransports: {
          path: true,
          name: true,
          params: true,
          header: true,
          body: true,
        }
      },
      fetch: {
        HttpMethods: {
          GET: true,
          POST: true,
          PUT: true,
          PATCH: true,
        },
        SubTransports: {
          path: true,
          name: true,
          params: true,
          header: true,
          body: true,
        }
      },
      iframe: {
        SubTransports: {
          path: true,
          name: true,
          params: true
        }
      },
      script: {
        SubTransports: {
          path: true,
          name: true,
          params: true
        }
      },
      style: {
        SubTransports: {
          path: true,
          name: true,
          params: true
        }
      }
    }
  };

  /**
   * Create Client Object
   * @param settings
   */
  public constructor(settings: any = {}) {
    super(settings);

    this.rate = 0;

    this.Settings = this.combineSettings(this.Settings, this.defaultSettings);

    this.choices = this.loadChoises();

    if (!this.choices) {
      this.choices = this.generateChoises();
    } else {
      this.choices = this.filterChoises();
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
   * Encode proxy link synchronously
   * @param link
   */
  public getEncodedProxySync(link: string): string {
    if (
        link
    ) {
      let _data = this.encodeSync({
        link: link,
        data: {
          Action: "Proxy",
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
   * Encode proxy link asynchronously
   * @param link
   */
  public getEncodedProxy(link: string) {
    return new Promise((resolve, reject) => {
      let _link = this.getEncodedProxySync(link);
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
    params.Debug = params.Debug || false;

    /**
     * Debug mode
     */
    if (params.Debug) {
      params.Event = "debug";
    }

    return new Promise((resolve, reject) => {
      let choiceType = this.getChoiseType(this.rate, this.choices);
      let choiceID = this.getChoiceID(choiceType, this.choices);
      if (choiceID) {
        let choice = this.choices[choiceType][choiceID];

        let promise = new Promise((_resolve, _reject) => {
          let transport = choice.Transport;
          params.Data.Transport = transport;
          params.Data.Callback = this.getRandomWord() + "-" + Date.now() + "-" + performance.now();
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
              Debug: params.Debug,
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
              this.choices.good[choiceID] = this.choices.normal[choiceID];
              delete this.choices.normal[choiceID];
            }
          } else if (choiceType === "bad") {
            if (this.choices.bad[choiceID]) {
              this.choices.normal[choiceID] = this.choices.bad[choiceID];
              delete this.choices.bad[choiceID];
            }
          }

          this.saveChoises();

          this.Settings.ConnectionTimeout = this.defaultSettings.ConnectionTimeout;
          this.Settings.ReConnectionTimeout = this.defaultSettings.ReConnectionTimeout;

          resolve(result);
        }).catch(() => {
          this.rate--;
          this.rate = Math.max(this.rate, -1);

          if (choiceType === "normal") {
            if (this.choices.normal[choiceID]) {
              this.choices.bad[choiceID] = this.choices.normal[choiceID];
              delete this.choices.normal[choiceID];
            }
          } else if (choiceType === "good") {
            if (this.choices.good[choiceID]) {
              this.choices.bad[choiceID] = this.choices.good[choiceID];
              delete this.choices.good[choiceID];
            }
          }

          this.saveChoises();

          setTimeout(
              () => {
                this.emit(params).then(resolve).catch(reject);
              },
              this.Settings.ReConnectionTimeout
          );

          this.Settings.ConnectionTimeout = this.Settings.ConnectionTimeout * 2;
          this.Settings.ReConnectionTimeout = this.Settings.ReConnectionTimeout * 2;
        });
      } else {
        if (this.rate === 0) {
          this.rate = 1;
        } else if (this.rate > 0) {
          this.rate = -1;
        } else if (this.rate < 0) {
          this.rate = 0;
        }
      }
    });
  }

  /**
   * Generate settings rates
   * @param choices
   * @param obj
   * @param subtransports
   */
  private generateSubtransportChoices(choices: any, obj: any, subtransports: any): void {
    let l = subtransports.length;
    if (l) {
      for (let x = 0; x < l; x++) {
        if (
            obj.HttpMethod === "POST" ||
            subtransports[x] !== "body"
        ) {
          let _obj = JSON.parse(JSON.stringify(obj));
          _obj.SubTransports.push(subtransports[x]);
          choices.normal[CRYPTO.createHash("md5").update(JSON.stringify(_obj)).digest('hex')] = _obj;
          this.generateSubtransportChoices(choices, _obj, subtransports.slice(x + 1));
        }
      }
    }
  }

  private filterChoises() {
    let _choices = this.generateChoises();

    let choices = {
      good: {},
      normal: {},
      bad: {},
    };

    for (let choiceID in _choices.normal) {
      if (_choices.normal.hasOwnProperty(choiceID)) {
        if (this.choices.good[choiceID]) {
          choices.good[choiceID] = _choices.normal[choiceID];
        } else if (this.choices.bad[choiceID]) {
          choices.bad[choiceID] = _choices.normal[choiceID];
        } else {
          choices.normal[choiceID] = _choices.normal[choiceID];
        }
      }
    }

    return choices;
  }

  /**
   * Generate choises
   */
  private generateChoises() {
    let choices = {
      good: {},
      normal: {},
      bad: {},
    };

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
                    choices,
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
                choices,
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

    return choices;
  }

  /**
   * Save choises
   */
  private saveChoises() {
    try {
      let choises = this.encodeSync(this.choices, this.Settings.Password);
      if (choises) {
        window.localStorage.setItem(CRYPTO.createHash("md5").update("#PACKAGE_NAME#-#PACKAGE_VERSION#").digest("hex"), choises);
      }
    } catch (e) {

    }
  }

  /**
   * Load choises
   */
  private loadChoises() {
    try {
      return this.decodeSync(window.localStorage.getItem(CRYPTO.createHash("md5").update("#PACKAGE_NAME#-#PACKAGE_VERSION#").digest("hex")), this.Settings.Password);
    } catch (e) {

    }
    return null;
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
    let length = transport.length;
    data = this.stringChunks(data, length, Math.ceil(data.length / length));
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
    let length = data.length;
    let offset = Math.max(Math.ceil(Math.random() * length * 0.5), 8);
    let dataParts = this.stringChunks(data, Math.ceil(length / offset), offset);
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
    let length = data.length;
    let offset = Math.max(Math.ceil(Math.random() * length * 0.5), 8);
    let dataParts = this.stringChunks(data, Math.ceil(length / offset), offset);
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
    let length = data.length;
    let offset = Math.max(Math.ceil(Math.random() * length * 0.5), 8);
    let dataParts = this.stringChunks(data, Math.ceil(length / offset), offset);
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

  /**
   * Get string chunks
   * @param data
   * @param length
   * @return {Array}
   */
  private stringChunks(data: string, length: number, offset: number): string[] {
    let _data = [];
    for (let i = 0; i < length; i++) {
      _data.push(data.substr(i * offset, offset));
    }
    return _data;
  }
}
