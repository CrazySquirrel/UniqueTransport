"use strick";

declare var require: any;

const CryptoJS = require("crypto-js");

export default class Messenger {

    public Settings: any;

    public constructor(settings: any) {
        this.Settings = settings;
    }

    public getRandomWord() {
        let word = CryptoJS.MD5((new Date()).getTime().toString(36) + "-" + Math.round(Math.random() * 1e16).toString(36)).toString().split("");
        for (let i = 0; i < word.length; i++) {
            if (isFinite(parseInt(word[i], 10))) {
                word[i] = String.fromCharCode(word[i].charCodeAt(0) + 50);
            }
        }
        word = word.slice(0, 4 + Math.floor(Math.random() * word.length * 0.5));
        return word.join("");
    }

    public decode(data, password) {
        return new Promise((resolve, reject) => {
            let DecodedData;
            if (typeof data === "object" && Array.isArray(data)) {
                DecodedData = this.decodeArray(data, password);
            } else if (typeof data === "string") {
                DecodedData = this.decodeString(data, password);
            }
            if (DecodedData) {
                resolve(DecodedData);
            } else {
                reject();
            }
        });
    }

    private decodeString(data, password) {
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

    private decodeArray(data, password) {
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

    public encode(data, password) {
        return new Promise((resolve, reject) => {
            try {
                data = JSON.stringify(data);
                data = CryptoJS.AES.encrypt(data, password).toString();
                resolve(data);
            } catch (e) {
                reject();
            }
        });
    }
}
