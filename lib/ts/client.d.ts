import Transport from "./transport.ts";
export default class Client extends Transport {
    /**
     * Clean old choises
     */
    static cleanOldChoises(): void;
    private choices;
    private rate;
    /**
     * Create Client Object
     * @param settings
     */
    constructor(settings?: any);
    /**
     * Send event and data to the server
     * @param params
     */
    emit(params?: any): Promise<{}>;
    /**
     * Generate settings rates
     * @param choices
     * @param obj
     * @param subtransports
     */
    generateSubtransportChoices(choices: any, obj: any, subtransports: any): void;
    filterChoises(): {
        bad: {};
        good: {};
        normal: {};
    };
    /**
     * Generate choises
     */
    generateChoises(): {
        bad: {};
        good: {};
        normal: {};
    };
    /**
     * Save choises
     */
    saveChoises(): void;
    /**
     * Load choises
     */
    loadChoises(): any;
    /**
     * Style transport
     * @param params
     */
    style(params?: any): Promise<{}>;
    /**
     * Script transport
     * @param params
     */
    script(params?: any): Promise<{}>;
    /**
     * Iframe transport
     * @param params
     */
    iframe(params?: any): Promise<{}>;
    /**
     * Fetch transport
     * @param params
     */
    fetch(params?: any): Promise<{}>;
    /**
     * XHR transport
     * @param params
     */
    xhr(params?: any): Promise<{}>;
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
}
