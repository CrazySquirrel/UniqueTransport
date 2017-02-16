"use strick";

declare let require: any;

const CryptoJS = require("crypto-js");

export default class Messenger {

    public Settings: any;

    /**
     * Create Messanger Super Object
     * @param settings
     */
    public constructor(settings: any) {
        this.Settings = settings;
    }

    /**
     * Get random word
     * @return string
     */
    public getRandomWord(): string {
        let word = CryptoJS.MD5((new Date()).getTime().toString(36) + "-" + Math.round(Math.random() * 1e16).toString(36)).toString().split("");
        for (let i = 0; i < word.length; i++) {
            if (isFinite(parseInt(word[i], 10))) {
                word[i] = String.fromCharCode(word[i].charCodeAt(0) + 50);
            }
        }
        word = word.slice(0, 4 + Math.floor(Math.random() * word.length * 0.5));
        return word.join("");
    }

    /**
     * Decode data synchronously
     * @param data
     * @param password
     */
    public decodeSync(data: any, password: string) {
        let DecodedData;
        if (typeof data === "object" && Array.isArray(data)) {
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
     * Decode data string
     * @param data
     * @param password
     * @return string | boolean
     */
    private decodeString(data: string, password: string): string | boolean {
        try {
            data = CryptoJS.AES.decrypt(data, password).toString(CryptoJS.enc.Utf8);
            if (data) {
                data = JSON.parse(data);
                if (data) {
                    return data;
                }
            }
            return false;
        } catch (e) {
            return false;
        }
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

    /**
     * Encode data object synchronously
     * @param data
     * @param password
     */
    public encodeSync(data: any, password: string) {
        try {
            data = JSON.stringify(data);
            data = CryptoJS.AES.encrypt(data, password).toString();
            return data;
        } catch (e) {
            return null;
        }
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
}
