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

if (!root.location) {
  root.location = {
    origin: "",
  };
}

abstract class Transport {

  /**
   * Get choise type based on the rate
   */
  public static getChoiseType(rate: any, choices: any): string {
    if (rate === 0) {
      if (Transport.isObjectNotEmpty(choices.normal)) {
        return "normal";
      } else if (Transport.isObjectNotEmpty(choices.bad)) {
        return "bad";
      } else {
        return "good";
      }
    } else if (rate > 0) {
      if (Transport.isObjectNotEmpty(choices.bad)) {
        return "bad";
      } else if (Transport.isObjectNotEmpty(choices.normal)) {
        return "normal";
      } else {
        return "good";
      }
    } else if (rate < 0) {
      if (Transport.isObjectNotEmpty(choices.good)) {
        return "good";
      } else if (Transport.isObjectNotEmpty(choices.normal)) {
        return "normal";
      } else {
        return "bad";
      }
    }
  }

  /**
   * Get choice ID
   * @param choiceType
   * @param choices
   */
  public static getChoiceID(choiceType: string, choices: any): string {
    const keys = Object.keys(choices[choiceType]);
    return keys[keys.length * Math.random() << 0];
  }

  /**
   * Insert data into headers
   * @param data
   * @return {{}}
   */
  public static headerSubTransport(data: any): any {
    /**
     * Split data a parts
     */
    const length = data.length;
    const offset = Math.max(Math.ceil(Math.random() * length * 0.5), 8);
    const dataParts = Transport.stringChunks(data, Math.ceil(length / offset), offset);
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
      keys.push(Transport.getRandomWord());
    }
    keys = keys.sort();
    /**
     * Format get params object
     */
    const params = {};
    for (let i = 0; i < dataParts.length; i++) {
      params[keys[i]] = dataParts[i];
    }
    /**
     * Implement header sub transport
     */
    return params;
  }

  /**
   * Insert data into name
   * @param url
   * @param data
   * @return {string}
   */
  public static nameSubTransport(url: string, data: any): string {
    /**
     * Implement name sub transport
     */
    return url + encodeURIComponent(data);
  }

  /**
   * Insert data into get params
   * @param url
   * @param data
   * @return {string}
   */
  public static paramsSubTransport(url: string, data: any): string {
    /**
     * Split data a parts
     */
    const length = data.length;
    const offset = Math.max(Math.ceil(Math.random() * length * 0.5), 8);
    const dataParts = Transport.stringChunks(data, Math.ceil(length / offset), offset);
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
      keys.push(Transport.getRandomWord());
    }
    keys = keys.sort();
    /**
     * Format get params object
     */
    const params = {};
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
   * Insert data into url path
   * @param url
   * @param data
   * @return {string}
   */
  public static pathSubTransport(url: string, data: any): string {
    /**
     * Split data a parts
     */
    const length = data.length;
    const offset = Math.max(Math.ceil(Math.random() * length * 0.5), 8);
    const dataParts = Transport.stringChunks(data, Math.ceil(length / offset), offset);
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
   * @param offset
   * @return {Array}
   */
  public static stringChunks(data: string, length: number, offset: number): string[] {
    const _data = [];
    for (let i = 0; i < length; i++) {
      _data.push(data.substr(i * offset, offset));
    }
    return _data;
  }

  /**
   * Get random word
   * @return string
   */
  public static getRandomWord(): string {
    const word = Math.random().toString(36).replace(/[^a-z]+/g, "");
    return word.substr(0, 4 + Math.floor(Math.random() * word.length * 0.5));
  }

  public static getRandomSelector(): string {
    return [
      Transport.getRandomWord(),
      "-",
      Date.now().toString(36).replace(/[^a-z]+/g, ""),
      "-",
      Math.round((root.performance || Date).now() * 1e8).toString(36).replace(/[^a-z]+/g, ""),
    ].join("");
  }

  /**
   * Check if object is empty
   * @param obj
   */
  public static isObjectNotEmpty(obj) {
    for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Combine settings
   * @param settedSettings
   * @param defaultSettings
   */
  public static combineSettings(settedSettings: any, defaultSettings: any): any {
    let settings;
    if (
        (
            typeof settedSettings === "boolean" ||
            typeof settedSettings === "number" ||
            typeof settedSettings === "string" ||
            typeof settedSettings === "function" ||
            typeof settedSettings === "boolean" ||
            (
                typeof settedSettings === "object" &&
                settedSettings
            )
        ) && (
            typeof settedSettings === typeof defaultSettings
        )
    ) {
      settings = settedSettings;
      if (
          typeof settedSettings === "object"
      ) {
        for (const prop in defaultSettings) {
          if (defaultSettings.hasOwnProperty(prop)) {
            settings[prop] = Transport.combineSettings(settings[prop], defaultSettings[prop]);
          }
        }
      }
    } else {
      settings = defaultSettings;
    }
    return settings;
  }

  public Settings: any;

  public cryptoModule: any;

  public defaultSettings: any = {
    StrictSSL: false,
    GZIP: true,
    XAccelRedirect: "",
    ProxyCachePath: "",
    ProxyCacheTimeout: 60 * 60 * 1000,
    ServerType: "http",
    HTTPSKeyPath: "",
    HTTPSCertPath: "",
    MaxProxySize: 1024 * 1024 * 1024,
    ConnectionTimeout: 10000,
    ProxyTimeout: 10000,
    IgnoredQueryParams: {
      "safe": true,
      "utm_medium": true,
      "utm_source": true,
      "utm_campaign": true,
      "utm_term": true,
      "utm_content": true,
    },
    IgnoredNames: {
      "safe": true,
    },
    IgnoredRequestPaths: {
      "test": true,
      "xmas": true,
      "weekend": true,
      "reobtain": true,
      "uniform": true,
      "barflies": true,
      "abduces": true,
      "suitor": true,
      "yachted": true,
      "safe": true,
    },
    IgnoredRequestHeaders: {
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
      "x-real-404": true,
      "x-real-ip": true,
      "x-requested-with": true,
      "x-turbo-id": true,
      "x-wap-profile": true,
      "x-yandex-turbo": true,
      "safe": true,
      "range": true,
      "if-range": true,
      "forwarded": true,
    },
    OptimizeImages: false,
    Password: "xmas",
    ReConnectionTimeout: 500,
    Transports: {
      fetch: {
        HttpMethods: {
          GET: true,
          PATCH: true,
          POST: true,
          PUT: true,
        },
        SubTransports: {
          body: true,
          header: true,
          name: true,
          params: true,
          path: true,
        },
      },
      iframe: {
        SubTransports: {
          name: true,
          params: true,
          path: true,
        },
      },
      script: {
        SubTransports: {
          name: true,
          params: true,
          path: true,
        },
      },
      style: {
        SubTransports: {
          name: true,
          params: true,
          path: true,
        },
      },
      styleadvanced: {
        SubTransports: {
          name: true,
          params: true,
          path: true,
        },
      },
      xhr: {
        HttpMethods: {
          GET: true,
          PATCH: true,
          POST: true,
          PUT: true,
        },
        SubTransports: {
          body: true,
          header: true,
          name: true,
          params: true,
          path: true,
        },
      },
    },
    Urls: [
      root.location.origin + "/",
    ],
    WithoutHttpServer: false,
  };

  public constructor(settings: any) {
    this.Settings = settings;

    this.cryptoModule = "";
  }

  /**
   * Encode link synchronously
   * @param link
   */
  public getEncodedLinkSync(link: string): string {
    if (
        link
    ) {
      const _data = this.encodeSync({
        data: {
          Action: "Redirect",
          Refferer: location.href,
          Protocol: location.protocol,
          Host: location.host,
        },
        link,
      }, this.Settings.Password);

      if (_data) {
        /**
         * Get subtransports
         */
        const transport = this.getTransport(["path", "name", "params"], "base");
        /**
         * Get url and data for subtransports
         */
        const dataUrl = this.getDataAndUrl(_data, this.Settings.Urls[Math.floor(Math.random() * this.Settings.Urls.length)], transport);

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
      const _link = this.getEncodedLinkSync(link);
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
      const _data = this.encodeSync({
        data: {
          Action: "Proxy",
          Refferer: location.href,
          Protocol: location.protocol,
          Host: location.host,
        },
        link,
      }, this.Settings.Password);

      if (_data) {
        /**
         * Get subtransports
         */
        const transport = this.getTransport(["path", "name", "params"], "base");
        /**
         * Get url and data for subtransports
         */
        const dataUrl = this.getDataAndUrl(_data, this.Settings.Urls[Math.floor(Math.random() * this.Settings.Urls.length)], transport);

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
      const _link = this.getEncodedProxySync(link);
      if (_link) {
        resolve(_link);
      } else {
        reject();
      }
    });
  }

  /**
   * Get random transport range
   * @param _transports
   * @param type
   * @return {Array}
   */
  public getTransport(_transports: string[], type: string): string[] {
    /**
     * Filter sub transports by settings
     */
    const transports = [];
    for (let j = 0; j < _transports.length; j++) {
      const method = _transports[j];
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
    const transport = [];
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
   * Insert data into url
   * @param data
   * @param url
   * @param transport
   */
  public getDataAndUrl(data: any, url: string, transport: string[]): any {
    /**
     * Split data a parts
     */
    const length = transport.length;
    data = Transport.stringChunks(data, length, Math.ceil(data.length / length));
    /**
     * Implement path sub transport
     */
    if (transport.indexOf("path") !== -1) {
      url = Transport.pathSubTransport(url, data.shift());
    }
    /**
     * Implement path sub transport
     */
    if (transport.indexOf("name") !== -1) {
      url = Transport.nameSubTransport(url, data.shift());
    }
    /**
     * Implement path sub transport
     */
    if (transport.indexOf("params") !== -1) {
      url = Transport.paramsSubTransport(url, data.shift());
    }

    return {
      data,
      url,
    };
  }

  public abstract encodeSync(data: any, password: string);
}

export default Transport;
