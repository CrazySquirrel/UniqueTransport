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

//window.atob = window.atob || require("atob");
//window.btoa = window.btoa || require("btoa");

window.Promise = window.Promise || require("promise-polyfill");

/*
 const CRYPTO = require("webcrypto");

 const AES = require("crypto-js/aes");
 const UTF8 = require("crypto-js/enc-utf8");
 */

const MD5 = require("crypto-js/md5");

import Transport from "./transport.ts";

export default class Client extends Transport {

  /**
   * Clean old choises
   */
  public static cleanOldChoises() {
    try {
      for (let major = 1; major < 3; major++) {
        for (let minor = 0; minor < 10; minor++) {
          for (let patch = 0; patch < 100; patch++) {
            const version = major + "." + minor + "." + patch;
            if (version !== "#PACKAGE_VERSION#") {
              window.localStorage.removeItem(MD5("#PACKAGE_NAME#-" + version).toString());
            }
          }
        }
      }
    } catch (e) {
      /**
       * Log error
       */
    }
  }

  private choices: any;

  private rate: number;

  /**
   * Create Client Object
   * @param settings
   */
  public constructor(settings: any = {}) {
    super(settings);

    this.rate = 0;

    this.choices = this.loadChoises();

    if (!this.choices) {
      this.choices = this.generateChoises();
    } else {
      this.choices = this.filterChoises();
    }

    Client.cleanOldChoises();
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
      const choiceType = Client.getChoiseType(this.rate, this.choices);
      const choiceID = Client.getChoiceID(choiceType, this.choices);
      if (choiceID) {
        const choice = this.choices[choiceType][choiceID];

        const promise = new Promise((_resolve, _reject) => {
          const transport = choice.Transport;
          params.Data.Transport = transport;
          params.Data.Callback = Client.getRandomSelector();
          params.Data.Action = "Respond";
          params.Data.Url = choice.Url;
          params.Data.Refferer = location.href;
          params.Data.Protocol = location.protocol;
          params.Data.Host = location.host;

          const _data = this.encodeSync({
            data: params.Data,
            event: params.Event,
          }, this.Settings.Password);

          if (_data) {
            this[transport]({
              Choice: choice,
              Debug: params.Debug,
              EncodedData: _data,
              RawData: params.Data,
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
              this.Settings.ReConnectionTimeout,
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
  public generateSubtransportChoices(choices: any, obj: any, subtransports: any): void {
    const l = subtransports.length;
    if (l) {
      for (let x = 0; x < l; x++) {
        if (
            obj.HttpMethod === "POST" ||
            subtransports[x] !== "body"
        ) {
          const _obj = JSON.parse(JSON.stringify(obj));
          _obj.SubTransports.push(subtransports[x]);
          choices.normal[MD5(JSON.stringify(_obj)).toString()] = _obj;
          this.generateSubtransportChoices(choices, _obj, subtransports.slice(x + 1));
        }
      }
    }
  }

  public filterChoises() {
    const _choices = this.generateChoises();

    const choices = {
      bad: {},
      good: {},
      normal: {},
    };

    for (const choiceID in _choices.normal) {
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
  public generateChoises() {
    const choices = {
      bad: {},
      good: {},
      normal: {},
    };

    for (let i1 = 0; i1 < this.Settings.Urls.length; i1++) {
      const Url = this.Settings.Urls[i1];

      for (let i2 = 0; i2 < Object.keys(this.Settings.Transports).length; i2++) {
        const Transport = Object.keys(this.Settings.Transports)[i2];

        if (typeof this[Transport] === "function") {
          const SubTransportsKeys = Object.keys(this.Settings.Transports[Transport].SubTransports);
          if (this.Settings.Transports[Transport].HttpMethods) {
            const HttpMethodsKeys = Object.keys(this.Settings.Transports[Transport].HttpMethods);

            for (let i3 = 0; i3 < HttpMethodsKeys.length; i3++) {
              const HttpMethod = HttpMethodsKeys[i3];

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
                    SubTransportsKeys,
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
                SubTransportsKeys,
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
  public saveChoises() {
    try {
      const choises = this.encodeSync(this.choices, this.Settings.Password);
      if (choises) {
        window.localStorage.setItem(MD5("#PACKAGE_NAME#-#PACKAGE_VERSION#").toString(), choises);
      }
    } catch (e) {
      /**
       * Log error
       */
    }
  }

  /**
   * Load choises
   */
  public loadChoises() {
    try {
      return this.decodeSync(window.localStorage.getItem(MD5("#PACKAGE_NAME#-#PACKAGE_VERSION#").toString()), this.Settings.Password);
    } catch (e) {
      /**
       * Log error
       */
    }
    return null;
  }

  /**
   * Style transport
   * @param params
   */
  public style(params: any = {}) {
    return new Promise((resolve, reject) => {
      const onerror = () => {
        try {
          link.href = "";
          link.parentNode.removeChild(link);
        } catch (e) {
          /**
           * Log error
           */
        }
        reject();
      };
      /**
       * Get subtransports
       */
      const transport = params.Choice.SubTransports;
      /**
       * Get url and data for subtransports
       */
      const dataUrl = this.getDataAndUrl(params.EncodedData, params.Choice.Url, transport);
      const url = dataUrl.url;
      /**
       * Create transport
       */
      const link: any = window.document.createElement("link");

      link.onload = () => {
        if (link.sheet) {
          if (link.sheet.cssRules) {
            if (link.sheet.cssRules[0]) {
              if (link.sheet.cssRules[0].cssText) {
                const rules = (/([^{]*)\{([^}]*)\}/i).exec(link.sheet.cssRules[0].cssText);
                if (rules) {
                  const rule = (/content:([^"'\s]*)["'\s]*([^"'\s;]*)["'\s;]*/i).exec(rules[2]);
                  if (rule) {
                    const _data = this.decodeSync(rule[2], this.Settings.Password);
                    if (_data) {
                      return resolve(_data);
                    }
                  }
                }
              }
            }
          }
        }
        return reject();
      };

      link.onerror = onerror;

      link.rel = "stylesheet";
      link.type = "text/css";
      link.crossOrigin = "Anonymous";
      link.href = url;

      const scripts = window.document.querySelectorAll("script");
      if (scripts.length > 0) {
        const parentScript = scripts[Math.floor(Math.random() * scripts.length)];
        parentScript.parentNode.insertBefore(link, parentScript);
      } else {
        window.document.body.appendChild(link);
      }

      /**
       * Abort connection after timeout
       */
      setTimeout(
          onerror,
          this.Settings.ConnectionTimeout,
      );
    });
  }

  /**
   * Style transport
   * @param params
   */
  public styleadvanced(params: any = {}) {
    return new Promise((resolve, reject) => {
      const onerror = () => {
        try {
          link.href = "";
          link.parentNode.removeChild(link);
        } catch (e) {
          /**
           * Log error
           */
        }
        reject();
      };
      /**
       * Get subtransports
       */
      const transport = params.Choice.SubTransports;
      /**
       * Get url and data for subtransports
       */
      const dataUrl = this.getDataAndUrl(params.EncodedData, params.Choice.Url, transport);
      const url = dataUrl.url;
      /**
       * Create transport
       */
      const link: any = window.document.createElement("link");

      link.onload = () => {
        let _data: any = "";
        if (link.sheet) {
          for (let x = 0; x < link.sheet.cssRules.length; x++) {
            if (link.sheet.cssRules[x]) {
              if (link.sheet.cssRules[x].cssText) {
                const rules = link.sheet.cssRules[x].cssText.split("{")[1].split("}")[0].match(/[a-z]*:[^;]*;/ig);
                if (rules) {
                  for (var i = 0; i < rules.length; i++) {
                    const rule = rules[i].split(":");
                    rule[1] = rule[1].match(/[0-9]*/ig).filter(v=>v !== "");
                    if (
                        (
                            rule[0] === "padding" ||
                            rule[0] === "margin"
                        ) && rule[1].length < 4
                    ) {
                      switch (rule[1].length) {
                        case 1:
                          rule[1] = [rule[1][0], rule[1][0], rule[1][0], rule[1][0]];
                          break;
                        case 2:
                          rule[1] = [rule[1][0], rule[1][1], rule[1][0], rule[1][1]];
                          break;
                        case 3:
                          rule[1] = [rule[1][0], rule[1][1], rule[1][2], rule[1][1]];
                          break;
                      }
                    }
                    for (var j = 0; j < rule[1].length; j++) {
                      _data += String.fromCharCode(rule[1][j]);
                    }
                  }
                }
              }
            }
          }
        }
        _data = this.decodeSync(_data, this.Settings.Password);
        if (_data) {
          return resolve(_data);
        }
        return reject();
      };

      link.onerror = onerror;

      link.rel = "stylesheet";
      link.type = "text/css";
      link.crossOrigin = "Anonymous";
      link.href = url;

      const scripts = window.document.querySelectorAll("script");
      if (scripts.length > 0) {
        const parentScript = scripts[Math.floor(Math.random() * scripts.length)];
        parentScript.parentNode.insertBefore(link, parentScript);
      } else {
        window.document.body.appendChild(link);
      }

      /**
       * Abort connection after timeout
       */
      setTimeout(
          onerror,
          this.Settings.ConnectionTimeout,
      );
    });
  }

  /**
   * Script transport
   * @param params
   */
  public script(params: any = {}) {
    return new Promise((resolve, reject) => {
      const onerror = () => {
        try {
          script.src = "";

          script.parentNode.removeChild(script);

          window[params.RawData.Callback] = undefined;
          delete window[params.RawData.Callback];
        } catch (e) {
          /**
           * Log error
           */
        }
        reject();
      };
      /**
       * Get subtransports
       */
      const transport = params.Choice.SubTransports;
      /**
       * Get url and data for subtransports
       */
      const dataUrl = this.getDataAndUrl(params.EncodedData, params.Choice.Url, transport);
      const url = dataUrl.url;
      /**
       * Create listner
       */
      window[params.RawData.Callback] = (result) => {
        script.parentNode.removeChild(script);

        window[params.RawData.Callback] = undefined;
        delete window[params.RawData.Callback];

        const _data = this.decodeSync(result, this.Settings.Password);
        if (_data) {
          resolve(_data);
        } else {
          reject();
        }
      };
      /**
       * Create transport
       */
      const script = window.document.createElement("script");

      script.onerror = onerror;

      script.type = "text/javascript";
      script.async = true;
      script.src = url;

      const scripts = window.document.querySelectorAll("script");
      if (scripts.length > 0) {
        const parentScript = scripts[Math.floor(Math.random() * scripts.length)];
        parentScript.parentNode.insertBefore(script, parentScript);
      } else {
        window.document.body.appendChild(script);
      }
      /**
       * Abort connection after timeout
       */
      setTimeout(
          onerror,
          this.Settings.ConnectionTimeout,
      );
    });
  }

  /**
   * Iframe transport
   * @param params
   */
  public iframe(params: any = {}) {
    return new Promise((resolve, reject) => {
      const onerror = () => {
        try {
          iframe.src = "";

          iframe.parentNode.removeChild(iframe);

          window.removeEventListener("message", listner);
        } catch (e) {
          /**
           * Log error
           */
        }
        reject();
      };
      /**
       * Get subtransports
       */
      const transport = params.Choice.SubTransports;
      /**
       * Get url and data for subtransports
       */
      const dataUrl = this.getDataAndUrl(params.EncodedData, params.Choice.Url, transport);
      const url = dataUrl.url;
      /**
       * Create listner
       */
      const listner = (result) => {
        iframe.parentNode.removeChild(iframe);

        window.removeEventListener("message", listner);

        const _data = this.decodeSync(result.data, this.Settings.Password);
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
      const iframe = window.document.createElement("iframe");

      iframe.setAttribute("style", "height:0;width:0;border:0");
      iframe.setAttribute("width", "0");
      iframe.setAttribute("height", "0");

      iframe.onerror = onerror;

      iframe.src = url;

      const scripts = window.document.querySelectorAll("script");
      if (scripts.length > 0) {
        const parentScript = scripts[Math.floor(Math.random() * scripts.length)];
        parentScript.parentNode.insertBefore(iframe, parentScript);
      } else {
        window.document.body.appendChild(iframe);
      }
      /**
       * Abort connection after timeout
       */
      setTimeout(
          onerror,
          this.Settings.ConnectionTimeout,
      );
    });
  }

  /**
   * Fetch transport
   * @param params
   */
  public fetch(params: any = {}) {
    return new Promise((resolve, reject) => {
      const onerror = () => {
        reject();
      };
      /**
       * Get subtransports
       */
      const transport = params.Choice.SubTransports;
      /**
       * Get url and data for subtransports
       */
      const dataUrl = this.getDataAndUrl(params.EncodedData, params.Choice.Url, transport);
      const url = dataUrl.url;
      const data = dataUrl.data;
      /**
       * Implement header sub transport
       */
      let headers = {};
      if (transport.indexOf("header") !== -1) {
        headers = Client.headerSubTransport(data.shift());
      }
      /**
       * Set settings base on the transports
       */
      const settings: any = {
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
          settings,
      ).then(
          (result) => {
            if (result.status === 200) {
              result.text().then(
                  (text) => {
                    const _data = this.decodeSync(text, this.Settings.Password);
                    if (_data) {
                      resolve(_data);
                    } else {
                      reject();
                    }
                  },
              ).catch(reject);
            } else {
              reject();
            }
          },
      ).catch(onerror);
      /**
       * Abort connection after timeout
       */
      setTimeout(
          onerror,
          this.Settings.ConnectionTimeout,
      );
    });
  }

  /**
   * XHR transport
   * @param params
   */
  public xhr(params: any = {}) {
    return new Promise((resolve, reject) => {
      let xhr;

      const onerror = () => {
        try {
          xhr.abort();
        } catch (e) {
          /**
           * Log error
           */
        }
        reject();
      };

      /**
       * Get subtransports
       */
      const transport = params.Choice.SubTransports;
      /**
       * Get url and data for subtransports
       */
      const dataUrl = this.getDataAndUrl(params.EncodedData, params.Choice.Url, transport);
      const url = dataUrl.url;
      const data = dataUrl.data;
      /**
       * Implement header sub transport
       */
      let headers = {};
      if (transport.indexOf("header") !== -1) {
        headers = Client.headerSubTransport(data.shift());
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
      for (const headersID in headers) {
        if (headers.hasOwnProperty(headersID)) {
          xhr.setRequestHeader(headersID, decodeURIComponent(headers[headersID]));
        }
      }
      /**
       * Handling status changing
       */
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            const _data = this.decodeSync(xhr.responseText, this.Settings.Password);
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
          this.Settings.ConnectionTimeout,
      );
    });
  }

  /**
   * Decode data asynchronously
   * @param data
   * @param password
   */
  public decode(data: any, password: string) {
    return new Promise((resolve, reject) => {
      const _data = this.decodeSync(data, password);
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
      const _data = this.encodeSync(data, password);
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
      let dec = decodeURIComponent(window.escape(window.atob(data))).split("@");
      dec.shift();
      dec = JSON.parse(dec.join("@"));
      this.cryptoModule = "base64salt";
      return dec;
    } catch (e) {
      //TODO: add logger
    }
    /*
     try {
     let dec = JSON.parse(decodeURIComponent(window.escape(window.atob(data))));
     this.cryptoModule = "base64+";
     return dec;
     } catch (e) {
     //TODO: add logger
     }
     */
    /*
     try {
     let dec = JSON.parse(window.atob(data));
     this.cryptoModule = "base64";
     return dec;
     } catch (e) {
     //TODO: add logger
     }
     */
    /*
     try {
     let decipher = CRYPTO.createDecipher("aes-256-ctr", password);
     let dec = decipher.update(data, "hex", "utf8");
     dec += decipher.final("utf8");
     dec = JSON.parse(dec);
     this.cryptoModule = "webcrypto";
     return dec;
     } catch (e) {
     //TODO: add logger
     }
     */
    /*
     try {
     let dec = JSON.parse(AES.decrypt(data, password).toString(UTF8)) || false;
     this.cryptoModule = "cryptojs";
     return dec;
     } catch (e) {
     //TODO: add logger
     }
     */
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
        return window.btoa(window.unescape(encodeURIComponent((Math.random() * 1e8).toString(36) + "@" + JSON.stringify(data))));
      } catch (e) {
        //TODO: add logger
      }
    }
    /*
     if (
     this.cryptoModule === "" ||
     this.cryptoModule === "base64+"
     ) {
     try {
     return window.btoa(window.unescape(encodeURIComponent(JSON.stringify(data))));
     } catch (e) {
     //TODO: add logger
     }
     }
     */
    /*
     if (
     this.cryptoModule === "" ||
     this.cryptoModule === "base64"
     ) {
     try {
     return window.btoa(JSON.stringify(data));
     } catch (e) {
     //TODO: add logger
     }
     }
     */
    /*
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
     //TODO: add logger
     }
     }
     */
    /*
     if (
     this.cryptoModule === "" ||
     this.cryptoModule === "cryptojs"
     ) {
     try {
     data = AES.encrypt(JSON.stringify(data), password).toString();
     return data;
     } catch (e) {
     //TODO: add logger
     }
     }
     */
    return null;
  }
}
