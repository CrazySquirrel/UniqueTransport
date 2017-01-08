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
            try {
                resolve(JSON.parse(CryptoJS.AES.decrypt(data, password).toString(CryptoJS.enc.Utf8)));
            } catch (e) {
                if (data.length > 0) {
                    this.decode(data.substr(1), password).then(resolve).catch(reject);
                } else {
                    reject();
                }
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
