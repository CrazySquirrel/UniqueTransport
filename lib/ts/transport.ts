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
    origin: ""
  };
}

abstract class Transport {

  abstract encodeSync(data: any, password: string);

  /**
   * Insert data into headers
   * @param data
   * @return {{}}
   */
  public static headerSubTransport(data: any): any {
    /**
     * Split data a parts
     */
    let length = data.length;
    let offset = Math.max(Math.ceil(Math.random() * length * 0.5), 8);
    let dataParts = Transport.stringChunks(data, Math.ceil(length / offset), offset);
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
    let length = data.length;
    let offset = Math.max(Math.ceil(Math.random() * length * 0.5), 8);
    let dataParts = Transport.stringChunks(data, Math.ceil(length / offset), offset);
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
   * Insert data into url path
   * @param url
   * @param data
   * @return {string}
   */
  public static pathSubTransport(url: string, data: any): string {
    /**
     * Split data a parts
     */
    let length = data.length;
    let offset = Math.max(Math.ceil(Math.random() * length * 0.5), 8);
    let dataParts = Transport.stringChunks(data, Math.ceil(length / offset), offset);
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
    let _data = [];
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
    let word = Math.random().toString(36).replace(/[^a-z]+/g, "");
    return word.substr(0, 4 + Math.floor(Math.random() * word.length * 0.5));
  }

  /**
   * Check if object is empty
   * @param obj
   */
  public static isObjectNotEmpty(obj) {
    for (let prop in obj) {
      return true;
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
        for (let prop in defaultSettings) {
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

  private defaultSettings: any = {
    ConnectionTimeout: 10000,
    IgnoredRequestPaths: {
      "test": true,
      "xmas": true,
      "weekend": true,
      "reobtain": true,
      "uniform": true,
      "barflies": true,
      "abduces": true,
      "suitor": true,
      "yachted": true
    },
    NormalRequestHeaders: {
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
    },
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
        }
      },
      iframe: {
        SubTransports: {
          name: true,
          params: true,
          path: true,
        }
      },
      script: {
        SubTransports: {
          name: true,
          params: true,
          path: true,
        }
      },
      style: {
        SubTransports: {
          name: true,
          params: true,
          path: true,
        }
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
        }
      },
    },
    Urls: [
      root.location.origin + "/"
    ],
  };

  public constructor(settings: any) {
    this.Settings = settings;

    this.Settings = Transport.combineSettings(this.Settings, this.defaultSettings);

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
      let _data = this.encodeSync({
        data: {
          Action: "Redirect",
        },
        link,
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
        data: {
          Action: "Proxy",
        },
        link
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
   * Get random transport range
   * @param _transports
   * @param type
   * @return {Array}
   */
  public getTransport(_transports: string[], type: string): string[] {
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
   * Insert data into url
   * @param data
   * @param url
   * @param transport
   */
  public getDataAndUrl(data: any, url: string, transport: string[]): any {
    /**
     * Split data a parts
     */
    let length = transport.length;
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
}

export default Transport;
