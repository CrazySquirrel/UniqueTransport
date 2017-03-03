"use strick";

declare let require: any;

const CryptoJS = require("crypto-js");

export default class Messenger {

  public Settings: any;

  /**
   * Create Messanger Super Object
   * @param settings
   */
  public constructor(settings: any = {}) {
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

  /**
   * Get choise type based on the rate
   */
  public getChoiseType(rate: any, choices: any): string {
    let choiceType;
    if (rate === 0) {
      if (Object.keys(choices.normal).length > 0) {
        choiceType = "normal";
      } else if (Object.keys(choices.bad).length > 0) {
        choiceType = "bad";
      } else {
        choiceType = "good";
      }
    } else if (rate > 0) {
      if (Object.keys(choices.bad).length > 0) {
        choiceType = "bad";
      } else if (Object.keys(choices.normal).length > 0) {
        choiceType = "normal";
      } else {
        choiceType = "good";
      }
    } else if (rate < 0) {
      if (Object.keys(choices.good).length > 0) {
        choiceType = "good";
      } else if (Object.keys(choices.normal).length > 0) {
        choiceType = "normal";
      } else {
        choiceType = "bad";
      }
    }
    return choiceType;
  }

  /**
   * Calc choise range by difference
   * @param choice
   * @param against
   * @param similar
   * @return {number}
   */
  public getChoiceRange(choice: any, against: any, similar?: any) {
    let range = 0;

    if (against && Object.keys(against).length > 0) {
      for (let _choiceID in against) {
        if (against.hasOwnProperty(_choiceID)) {
          let _choice = against[_choiceID];
          for (let prop in choice) {
            if (choice.hasOwnProperty(prop)) {
              if (
                  typeof choice[prop] === "boolean" ||
                  typeof choice[prop] === "string" ||
                  typeof choice[prop] === "number" ||
                  typeof choice[prop] === "function"
              ) {
                if (choice.Url === _choice.Url) {
                  range--;
                } else {
                  range++;
                }
              } else if (
                  typeof choice[prop] === "object" &&
                  Array.isArray(choice[prop])
              ) {
                for (let _v of choice[prop]) {
                  if (_choice[prop].indexOf(_v) !== -1) {
                    range--;
                  } else {
                    range++;
                  }
                }
              } else {
                /**
                 * TODO: unimplemented type
                 */
              }
            }
          }
        }
      }
    }

    if (similar && Object.keys(similar).length > 0) {
      for (let _choiceID in similar) {
        if (similar.hasOwnProperty(_choiceID)) {
          let _choice = similar[_choiceID];
          for (let prop in choice) {
            if (choice.hasOwnProperty(prop)) {
              if (
                  typeof choice[prop] === "boolean" ||
                  typeof choice[prop] === "string" ||
                  typeof choice[prop] === "number" ||
                  typeof choice[prop] === "function"
              ) {
                if (choice.Url === _choice.Url) {
                  range++;
                } else {
                  range--;
                }
              } else if (
                  typeof choice[prop] === "object" &&
                  Array.isArray(choice[prop])
              ) {
                for (let _v of choice[prop]) {
                  if (_choice[prop].indexOf(_v) !== -1) {
                    range++;
                  } else {
                    range--;
                  }
                }
              } else {
                /**
                 * TODO: unimplemented type
                 */
              }
            }
          }
        }
      }
    }

    return range;
  }

  /**
   * Range choises by differences
   * @param choiceType
   */
  public rangeChoises(choiceType: string, sourceChoices: any) {
    let choices = {
      good: {},
      normal: {},
      bad: {},
    };

    if (Object.keys(sourceChoices[choiceType]).length > 0) {
      for (let choiceID in sourceChoices[choiceType]) {
        if (sourceChoices[choiceType].hasOwnProperty(choiceID)) {
          let choice = sourceChoices[choiceType][choiceID];
          let range = this.getChoiceRange(choice, sourceChoices.bad);
          choices[choiceType][range] = choices[choiceType][range] || {};
          choices[choiceType][range][choiceID] = choice;
        }
      }
    }

    let keys = Object.keys(choices[choiceType]).sort().reverse();

    let _choices = choices[choiceType][keys[0]];

    if (
        Object.keys(_choices).length === 1 &&
        keys[1] &&
        choices[choiceType][keys[1]]
    ) {
      _choices = Object.assign({}, _choices, choices[choiceType][keys[1]]);
    }

    if (
        Object.keys(_choices).length === 1
    ) {
      return sourceChoices[choiceType];
    } else {
      return _choices;
    }
  }

  /**
   * Get choice ID
   * @param choiceType
   */
  public getChoiceID(choiceType: string, choices: any): string {
    let rangedChoices = choices[choiceType];
    let rangedChoicesKeys = Object.keys(rangedChoices);
    return rangedChoicesKeys[Math.floor(Math.random() * rangedChoicesKeys.length)];
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
}
