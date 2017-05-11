"use strict";
import ServerClass from "../lib/ts/server";
const Server = new ServerClass({
    ErrorHandler: (...data) => {
        console.log(data);
    },
    ServerPort: 8888,
    ConnectionTimeout: 10000,
    Password: "xmas",
    SuccessResponseCode: 200,
    RedirectResponseCode: 302,
    ErrorResponseCode: 404,
    WriteRequestLog: false,
    SubTransports: {
        path: true,
        name: true,
        params: true,
        header: true,
        body: true,
    },
    OptimizeImages: false,
    WithoutHttpServer: false,
});
describe("Server", () => {
    it("Server", () => {
        expect(typeof (ServerClass)).toEqual("function");
        expect(typeof (Server)).toEqual("object");
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VydmVyLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJTZXJ2ZXIuc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7QUFPYixPQUFPLFdBQVcsTUFBTSxrQkFBa0IsQ0FBQztBQUUzQyxNQUFNLE1BQU0sR0FBRyxJQUFJLFdBQVcsQ0FBQztJQUM3QixZQUFZLEVBQUUsQ0FBQyxHQUFHLElBQUk7UUFDcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNwQixDQUFDO0lBQ0QsVUFBVSxFQUFFLElBQUk7SUFDaEIsaUJBQWlCLEVBQUUsS0FBSztJQUN4QixRQUFRLEVBQUUsTUFBTTtJQUNoQixtQkFBbUIsRUFBRSxHQUFHO0lBQ3hCLG9CQUFvQixFQUFFLEdBQUc7SUFDekIsaUJBQWlCLEVBQUUsR0FBRztJQUN0QixlQUFlLEVBQUUsS0FBSztJQUN0QixhQUFhLEVBQUU7UUFDYixJQUFJLEVBQUUsSUFBSTtRQUNWLElBQUksRUFBRSxJQUFJO1FBQ1YsTUFBTSxFQUFFLElBQUk7UUFDWixNQUFNLEVBQUUsSUFBSTtRQUNaLElBQUksRUFBRSxJQUFJO0tBQ1g7SUFDRCxjQUFjLEVBQUUsS0FBSztJQUNyQixpQkFBaUIsRUFBRSxLQUFLO0NBQ3pCLENBQUMsQ0FBQztBQUVILFFBQVEsQ0FBQyxRQUFRLEVBQUU7SUFFakIsRUFBRSxDQUFDLFFBQVEsRUFBRTtRQUNYLE1BQU0sQ0FBQyxPQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDaEQsTUFBTSxDQUFDLE9BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMzQyxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIn0=