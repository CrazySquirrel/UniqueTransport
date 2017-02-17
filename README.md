
# Unique Transport

[![npm version](https://badge.fury.io/js/UniqueTransport.svg)](https://github.com/CrazySquirrel/UniqueTransport)
[![Code Climate](https://codeclimate.com/github/CrazySquirrel/UniqueTransport/badges/gpa.svg)](https://codeclimate.com/github/CrazySquirrel/UniqueTransport)
[![Test Coverage](https://codeclimate.com/github/CrazySquirrel/UniqueTransport/badges/coverage.svg)](https://codeclimate.com/github/CrazySquirrel/UniqueTransport/coverage)
[![Issue Count](https://codeclimate.com/github/CrazySquirrel/UniqueTransport/badges/issue_count.svg)](https://codeclimate.com/github/CrazySquirrel/UniqueTransport)
[![Donate](https://img.shields.io/badge/donate-%E2%99%A5-red.svg)](http://crazysquirrel.ru/support/)

This plugin is designed to deliver a message from Alice to Bob at any cost.

## Description

The basic idea of the script is that there are two devices (client Alice and the server Bob).
Alice needs to send a message to Bob and get his data. While there is a third party that
monitors the traffic between Alice and Bob and does some queries.

Thus to send the message using multiple channels:

* __xhr__ support http methods GET, POST, PUT, PATH and data transfer path, file name, parameters, headers and request body.
* __fetch__ - support http methods GET, POST, PUT, PATH and data transfer path, file name, parameters, headers and request body.
* __iframe__ - data communication path, the file name and parameters.
* __script__ - data communication path, the file name and parameters.
* __image__ - data communication path, the file name and parameters.
* __style__ - with data transfer in the path, the file name and parameters.

Channel transmission method and transmission parts data are selected randomly. Data requests are performed until.

## Build

The repository contains pre-compiled files, but if you want to add your files and compile, then run the following commands in the repository folder.

* npm install
* npm run production

or

* npm run development

The build required NodeJs version 6 or higher.

## Usage

For details, see /src/ts/**.

### Client

```TypeScript
import ClientClass from "../../lib/ts/client";

const Client = new ClientClass();

Client.emit().then(
    (result) => {
        console.log(result);
    }
);
```

### Server

```TypeScript
import ServerClass from "../../lib/ts/server";

const Server = new ServerClass();

// Listened event name and callback
Server.on("connect", (data) => {
    return "OK";
});

```

## Settings

### Client

Main settings

```TypeScript
{
    ServerAddress: "http://127.0.0.1:8888/", // Default connection address
    ConnectionTimeout: 1000, // Connection timeout
    Password: "xmas", // Password
    Reconnections: 10, // Default reconnection
    Transports: { // Transports: If some settings of the transport or the whole transport is not needed, then it should be set to false go is to remove from the settings.
        xhr: {
            HttpMethods: {
                GET: true,
                POST: true,
                PUT: true,
                PATCH: true,
            },
            SubTransports: {
                path: true,
                name: true,
                params: true,
                header: true,
                body: true,
            },
        },
        fetch: {
            HttpMethods: {
                GET: true,
                POST: true,
                PUT: true,
                PATCH: true,
            },
            SubTransports: {
                path: true,
                name: true,
                params: true,
                header: true,
                body: true,
            },
        },
        iframe: {
            SubTransports: {
                path: true,
                name: true,
                params: true,
            },
        },
        script: {
            SubTransports: {
                path: true,
                name: true,
                params: true,
            },
        },
        image: {
            SubTransports: {
                path: true,
                name: true,
                params: true,
            },
        },
        style: {
            SubTransports: {
                path: true,
                name: true,
                params: true,
            },
        }
    },
}
```

Emit settings

```TypeScript
{
    Event: "connect", // Event name [required]
    Data: {}, // Data [optional]
    Url: "http://127.0.0.1:8888/test/", // Connection url [optional]
    Reconnections: 10, // Max reconnections [optional]
}
```

### Server

Main settings

```TypeScript
{
    ServerPort: 8888, // Port to listen on
    ConnectionTimeout: 1000, // Connection timeout
    Password: "xmas", // Password
    SuccessResponseCode: 200, // Success http response code
    ErrorResponseCode: 404, // Error http response code
}
```
