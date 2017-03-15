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
            let version = major + "." + minor + "." + patch;
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
      let choiceType = Client.getChoiseType(this.rate, this.choices);
      let choiceID = Client.getChoiceID(choiceType, this.choices);
      if (choiceID) {
        let choice = this.choices[choiceType][choiceID];

        let promise = new Promise((_resolve, _reject) => {
          let transport = choice.Transport;
          params.Data.Transport = transport;
          params.Data.Callback = Client.getRandomWord() + "-" + Date.now() + "-" + performance.now();
          params.Data.Action = "Respond";
          params.Data.Url = choice.Url;

          let _data = this.encodeSync({
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
  public generateSubtransportChoices(choices: any, obj: any, subtransports: any): void {
    let l = subtransports.length;
    if (l) {
      for (let x = 0; x < l; x++) {
        if (
            obj.HttpMethod === "POST" ||
            subtransports[x] !== "body"
        ) {
          let _obj = JSON.parse(JSON.stringify(obj));
          _obj.SubTransports.push(subtransports[x]);
          choices.normal[MD5(JSON.stringify(_obj)).toString()] = _obj;
          this.generateSubtransportChoices(choices, _obj, subtransports.slice(x + 1));
        }
      }
    }
  }

  public filterChoises() {
    let _choices = this.generateChoises();

    let choices = {
      bad: {},
      good: {},
      normal: {},
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
  public generateChoises() {
    let choices = {
      bad: {},
      good: {},
      normal: {},
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
  public saveChoises() {
    try {
      let choises = this.encodeSync(this.choices, this.Settings.Password);
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
      let onerror = () => {
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
      let transport = params.Choice.SubTransports;
      /**
       * Get url and data for subtransports
       */
      let dataUrl = this.getDataAndUrl(params.EncodedData, params.Choice.Url, transport);
      let url = dataUrl.url;
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
  public script(params: any = {}) {
    return new Promise((resolve, reject) => {
      let onerror = () => {
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
      let transport = params.Choice.SubTransports;
      /**
       * Get url and data for subtransports
       */
      let dataUrl = this.getDataAndUrl(params.EncodedData, params.Choice.Url, transport);
      let url = dataUrl.url;
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
  public iframe(params: any = {}) {
    return new Promise((resolve, reject) => {
      let onerror = () => {
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
      let transport = params.Choice.SubTransports;
      /**
       * Get url and data for subtransports
       */
      let dataUrl = this.getDataAndUrl(params.EncodedData, params.Choice.Url, transport);
      let url = dataUrl.url;
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
  public fetch(params: any = {}) {
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
        headers = Client.headerSubTransport(data.shift());
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
  public xhr(params: any = {}) {
    return new Promise((resolve, reject) => {
      let xhr;

      let onerror = () => {
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
      let dec = JSON.parse(decodeURIComponent(window.escape(window.atob(data))));
      this.cryptoModule = "base64+";
      return dec;
    } catch (e) {
      //TODO: add logger
    }
    /*
     try {
     let dec = JSON.parse(window.atob(data));
     this.cryptoModule = "base64";
     return dec;
     } catch (e) {
     //TODO: add logger
     }

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
        this.cryptoModule === "base64+"
    ) {
      try {
        return window.btoa(window.unescape(encodeURIComponent(JSON.stringify(data))));
      } catch (e) {
        //TODO: add logger
      }
    }
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
