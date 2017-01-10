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
            if (typeof data === "object" && Array.isArray(data)) {
                this.decodeArray(data, password).then(resolve).catch(reject);
            } else if (typeof data === "string") {
                this.decodeString(data, password).then(resolve).catch(reject);
            } else {
                reject();
            }
        });
    }

    private decodeString(data, password) {
        return new Promise((resolve, reject) => {
            try {
                resolve(JSON.parse(CryptoJS.AES.decrypt(data, password).toString(CryptoJS.enc.Utf8)));
            } catch (e) {
                reject();
            }
        });
    }

    private decodeArray(data, password, round = 0) {
        return new Promise((resolve, reject) => {
            /**
             * Tray to decode
             */
            try {
                data.shift();
                resolve(JSON.parse(CryptoJS.AES.decrypt(data.join(""), password).toString(CryptoJS.enc.Utf8)));
            } catch (e) {
                reject();
                /*
                if (
                    round < this.Settings.MaxErrorCorrections &&
                    data.length > 1
                ) {
                    let counter = 0;
                    for (let i = 0; i < data.length; i++) {
                        let _data = [].concat(data);
                        _data.splice(i, 1);
                        this.decodeArray(_data, password, round + 1).then(resolve).catch(
                            () => {
                                counter++;
                                if (counter === data.length) {
                                    reject();
                                }
                            }
                        );
                    }
                } else {
                    reject();
                }
                */
            }
        });
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
