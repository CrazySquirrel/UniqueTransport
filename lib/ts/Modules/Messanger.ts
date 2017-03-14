"use strick";

declare let require: any;
declare let Buffer: any;
declare let window: any;
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

root.atob = root.atob || require("atob");
root.btoa = root.btoa || require("btoa");

const CRYPTO = require("webcrypto");

const AES = require("crypto-js/aes");
const UTF8 = require("crypto-js/enc-utf8");

export default class Messenger {

  public Settings: any;
  public cryptoModule: string;

  /**
   * Create Messanger Super Object
   * @param settings
   */
  public constructor(settings: any = {}) {
    this.Settings = settings;
    this.cryptoModule = "";
  }

  /**
   * Get random word
   * @return string
   */
  public getRandomWord(): string {
    let word = Math.random().toString(36).replace(/[^a-z]+/g, "");
    return word.substr(0, 4 + Math.floor(Math.random() * word.length * 0.5));
  }

  /**
   * Combine settings
   * @param settedSettings
   * @param defaultSettings
   * @return {any}
   */
  public combineSettings(settedSettings: any, defaultSettings: any): any {
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
            settings[prop] = this.combineSettings(settings[prop], defaultSettings[prop]);
          }
        }
      }
    } else {
      settings = defaultSettings;
    }
    return settings;
  }

  /**
   * Decode data synchronously
   * @param data
   * @param password
   */
  public decodeSync(data: any, password: string) {
    let DecodedData;
    if (Array.isArray(data)) {
      DecodedData = this.decodeArray(data, password);
    } else if (typeof data === "string") {
      DecodedData = this.decodeString(data, password);
    }
    if (DecodedData) {
      return DecodedData;
    } else {
      return null;
    }
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
   * Encode data object synchronously
   * @param data
   * @param password
   */
  public encodeSync(data: any, password: string) {
    if (
        this.cryptoModule === "" ||
        this.cryptoModule === "cryptojs"
    ) {
      try {
        data = AES.encrypt(JSON.stringify(data), password).toString();
        return data;
      } catch (e) {
        /**
         * TODO: add logger
         */
      }
    }

    if (
        this.cryptoModule === "" ||
        this.cryptoModule === "base64+"
    ) {
      try {
        if (typeof Buffer !== "undefined") {
          return Buffer.from(root.unescape(encodeURIComponent(JSON.stringify(data)))).toString("base64");
        } else {
          return root.btoa(root.unescape(encodeURIComponent(JSON.stringify(data))));
        }
      } catch (e) {
        /**
         * TODO: add logger
         */
      }
    }

    if (
        this.cryptoModule === "" ||
        this.cryptoModule === "base64"
    ) {
      try {
        if (typeof Buffer !== "undefined") {
          return Buffer.from(JSON.stringify(data)).toString("base64");
        } else {
          return root.btoa(JSON.stringify(data));
        }
      } catch (e) {
        /**
         * TODO: add logger
         */
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
        /**
         * TODO: add logger
         */
      }
    }

    return null;
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
   * Get choise type based on the rate
   */
  public getChoiseType(rate: any, choices: any): string {
    if (rate === 0) {
      if (this.isObjectNotEmpty(choices.normal)) {
        return "normal";
      } else if (this.isObjectNotEmpty(choices.bad)) {
        return "bad";
      } else {
        return "good";
      }
    } else if (rate > 0) {
      if (this.isObjectNotEmpty(choices.bad)) {
        return "bad";
      } else if (this.isObjectNotEmpty(choices.normal)) {
        return "normal";
      } else {
        return "good";
      }
    } else if (rate < 0) {
      if (this.isObjectNotEmpty(choices.good)) {
        return "good";
      } else if (this.isObjectNotEmpty(choices.normal)) {
        return "normal";
      } else {
        return "bad";
      }
    }
  }

  /**
   * Check if object is empty
   * @param obj
   */
  public isObjectNotEmpty(obj) {
    for (let prop in obj) {
      return true;
    }
    return false;
  }

  /**
   * Get choice ID
   * @param choiceType
   */
  public getChoiceID(choiceType: string, choices: any): string {
    let keys = Object.keys(choices[choiceType]);
    return keys[keys.length * Math.random() << 0];
  }

  /**
   * Decode data string
   * @param data
   * @param password
   * @return string | boolean
   */
  private decodeString(data: string, password: string): string | boolean {
    try {
      let dec = JSON.parse(AES.decrypt(data, password).toString(UTF8)) || false;
      this.cryptoModule = "cryptojs";
      return dec;
    } catch (e) {
      /**
       * TODO: add logger
       */
    }

    try {
      let dec;
      if (typeof Buffer !== "undefined") {
        dec = JSON.parse(decodeURIComponent(root.escape(Buffer.from(data, "base64").toString("utf8"))));
      } else {
        dec = JSON.parse(decodeURIComponent(root.escape(root.atob(data))));
      }
      this.cryptoModule = "base64+";
      return dec;
    } catch (e) {
      /**
       * TODO: add logger
       */
    }

    try {
      let dec;
      if (typeof Buffer !== "undefined") {
        dec = JSON.parse(Buffer.from(data, "base64").toString("utf8"));
      } else {
        dec = JSON.parse(root.atob(data));
      }
      this.cryptoModule = "base64";
      return dec;
    } catch (e) {
      /**
       * TODO: add logger
       */
    }

    try {
      let decipher = CRYPTO.createDecipher("aes-256-ctr", password);
      let dec = decipher.update(data, "hex", "utf8");
      dec += decipher.final("utf8");
      dec = JSON.parse(dec);
      this.cryptoModule = "webcrypto";
      return dec;
    } catch (e) {
      /**
       * TODO: add logger
       */
    }

    return false;
  }

  /**
   * Decode data as array
   * @param data
   * @param password
   * @return string | boolean
   */
  private decodeArray(data: string[], password: string): string | boolean {
    let DecodedData;
    /**
     * Decode data in normal statement
     */
    DecodedData = this.decodeString(data.join(""), password);
    if (DecodedData) {
      return DecodedData;
    }
    /**
     * Tray to fix one error
     */
    for (let i = 0; i < data.length; i++) {
      DecodedData = [].concat(data);
      DecodedData.splice(i, 1);
      DecodedData = this.decodeString(DecodedData.join(""), password);
      if (DecodedData) {
        return DecodedData;
      }
    }
    /**
     * Tray to fix two error
     */
    for (let x = 0; x < data.length; x++) {
      let _data = [].concat(data);
      _data.splice(x, 1);

      for (let y = 0; y < _data.length; y++) {
        DecodedData = [].concat(_data);
        DecodedData.splice(y, 1);
        DecodedData = this.decodeString(DecodedData.join(""), password);
        if (DecodedData) {
          return DecodedData;
        }
      }
    }
    /**
     * Return false;
     */
    return false;
  }
}
