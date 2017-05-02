declare abstract class Transport {
    abstract encodeSync(data: any, password: string): any;
    /**
     * Get choise type based on the rate
     */
    static getChoiseType(rate: any, choices: any): string;
    /**
     * Get choice ID
     * @param choiceType
     * @param choices
     */
    static getChoiceID(choiceType: string, choices: any): string;
    /**
     * Insert data into headers
     * @param data
     * @return {{}}
     */
    static headerSubTransport(data: any): any;
    /**
     * Insert data into name
     * @param url
     * @param data
     * @return {string}
     */
    static nameSubTransport(url: string, data: any): string;
    /**
     * Insert data into get params
     * @param url
     * @param data
     * @return {string}
     */
    static paramsSubTransport(url: string, data: any): string;
    /**
     * Insert data into url path
     * @param url
     * @param data
     * @return {string}
     */
    static pathSubTransport(url: string, data: any): string;
    /**
     * Get string chunks
     * @param data
     * @param length
     * @param offset
     * @return {Array}
     */
    static stringChunks(data: string, length: number, offset: number): string[];
    /**
     * Get random word
     * @return string
     */
    static getRandomWord(): string;
    /**
     * Check if object is empty
     * @param obj
     */
    static isObjectNotEmpty(obj: any): boolean;
    /**
     * Combine settings
     * @param settedSettings
     * @param defaultSettings
     */
    static combineSettings(settedSettings: any, defaultSettings: any): any;
    Settings: any;
    cryptoModule: any;
    constructor(settings: any);
    /**
     * Encode link synchronously
     * @param link
     */
    getEncodedLinkSync(link: string): string;
    /**
     * Encode link asynchronously
     * @param link
     */
    getEncodedLink(link: string): Promise<{}>;
    /**
     * Encode proxy link synchronously
     * @param link
     */
    getEncodedProxySync(link: string): string;
    /**
     * Encode proxy link asynchronously
     * @param link
     */
    getEncodedProxy(link: string): Promise<{}>;
    /**
     * Get random transport range
     * @param _transports
     * @param type
     * @return {Array}
     */
    getTransport(_transports: string[], type: string): string[];
    /**
     * Insert data into url
     * @param data
     * @param url
     * @param transport
     */
    getDataAndUrl(data: any, url: string, transport: string[]): any;
    defaultSettings: any;
}
export default Transport;
