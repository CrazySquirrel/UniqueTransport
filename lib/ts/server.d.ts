import Transport from "./transport.ts";
export default class Server extends Transport {
    /**
     * Get choice ID
     * @param choiceType
     * @param choices
     */
    static getChoiceID(choiceType: string, choices: any): string;
    listners: any;
    proxyShit: any;
    defaultSettings: any;
    constructor(settings?: any);
    on(event: string, listner: any): void;
    listenr(request: any, response: any): void;
    Proxy(result: any, headers: any, request: any, response: any, depth?: number): void;
    Redirect(result: any, headers: any, request: any, response: any): void;
    Respond(result: any, headers: any, request: any, response: any): void;
    responceError(id: any, request: any, response: any, headers: any, e?: any, ...data: any[]): void;
    processor(data: any, params: any, request: any, headers: any): Promise<{}>;
    preprocessor(request: any): Promise<{}>;
    download(data: any, headers: any, request: any, depth?: number): Promise<{}>;
    /**
     * Decode data asynchronously
     * @param data
     * @param password
     */
    decode(data: any, password: string): Promise<{}>;
    /**
     * Encode data object asynchronously
     * @param data
     * @param password
     */
    encode(data: any, password: string): Promise<{}>;
    /**
     * Decode data synchronously
     * @param data
     * @param password
     */
    decodeSync(data: any, password: string): any;
    /**
     * Encode data object synchronously
     * @param data
     * @param password
     */
    encodeSync(data: any, password: string): any;
    getHostFromHeaderXRealHost(request: any, params: any): any;
    getHostFromHeaderOrigin(request: any, params: any): any;
    getHostFromHeaderReferer(request: any, params: any): any;
    getHostFromParamsReferer(request: any, params: any): any;
    getHostFromHeaderHost(request: any, params: any): any;
    ErrorHandler(e: any, id: any, data: any): void;
    private replaceRelativePathInCss(base, css);
}
