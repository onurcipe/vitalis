import type {AddressInfo} from "node:net";
import {createServer as createHttpServer} from "node:http";
import type {RequestListener, Server as HttpServer} from "node:http";
import {createServer as createHttpsServer} from "node:https";
import type {Server as HttpsServer} from "node:https";

import {isPresent} from "@onurcipe/facilis";

import FrameworkError from "../../../error/FrameworkError.js";
import UserError from "../../../error/UserError.js";
import type Logger from "../../../core/Logger.js";
import type {Transport} from "../../../core/Transport.js";

type HttpTransportArgs =
    {
        deps: HttpTransportDeps;
        options: HttpTransportOptions;
    };

type HttpTransportDeps =
    {
        logger: Logger;
    };

type HttpTransportOptions =
    {
        server: HttpServerOptions | HttpsServerOptions;
        requestListener: RequestListener;
    };

type HttpTransportConfig =
    {
        server: HttpServerOptions | HttpsServerOptions;
        requestListener: RequestListener;
    };

type HttpServerOptions =
    {
        scheme: "http";
        port: number;
    };

type HttpsServerOptions =
    {
        scheme: "https";
        port: number;
        sslTlsCertificate: {
            key: string | Buffer;
            cert: string | Buffer;
            ca?: string | Buffer | string[] | Buffer[];
        };
    };

type HttpTransportState =
    "idle" | "starting" | "running" | "stopping" | "error";

class HttpTransport implements Transport
{
    private readonly logger: Logger;
    private readonly config: HttpTransportConfig;

    private server: HttpServer | HttpsServer | null = null;

    private state: HttpTransportState = "idle";
    private starting: Promise<void> | null = null;
    private stopping: Promise<void> | null = null;

    public constructor (args: HttpTransportArgs)
    {
        this.logger = args.deps.logger;

        const options: HttpTransportOptions = args.options;
        switch (options.server.scheme)
        {
            case "http":
            {
                this.config = {
                    server: {
                        scheme: options.server.scheme,
                        port: options.server.port,
                    },
                    requestListener: options.requestListener,
                };
                break;
            }
            case "https":
            {
                this.config = {
                    server: {
                        scheme: options.server.scheme,
                        port: options.server.port,
                        sslTlsCertificate: options.server.sslTlsCertificate,
                    },
                    requestListener: options.requestListener,
                };
                break;
            }
            default:
            {
                throw new UserError("TRANSPORT-HTTP-SCHEME-INVALID", "HTTP transport scheme must be http or https.");
            }
        }
    }

    public getServer (): HttpServer | HttpsServer | null
    {
        return this.server;
    }

    public getState (): HttpTransportState
    {
        return this.state;
    }

    public async start (): Promise<void>
    {
        while (true)
        {
            if (isPresent(this.starting))
            {
                await this.starting;
                return;
            }

            if (isPresent(this.stopping))
            {
                await this.stopping;
                continue;
            }

            switch (this.state)
            {
                case "idle":
                {
                    break;
                }
                case "starting":
                {
                    throw new FrameworkError("TRANSPORT-HTTP-START-IN_STARTING_STATE_WITHOUT_OPERATION", "HTTP transport is currently in the starting state, but there is no in-flight operation.");
                }
                case "running":
                {
                    return;
                }
                case "stopping":
                {
                    throw new FrameworkError("TRANSPORT-HTTP-START-IN_STOPPING_STATE_WITHOUT_OPERATION", "HTTP transport is currently in the stopping state, but there is no in-flight operation.");
                }
                case "error":
                {
                    break;
                }
            }

            break;
        }

        await this.startOnce();
    }

    public async stop (): Promise<void>
    {
        while (true)
        {
            if (isPresent(this.starting))
            {
                await this.starting;
                continue;
            }

            if (isPresent(this.stopping))
            {
                await this.stopping;
                return;
            }

            switch (this.state)
            {
                case "idle":
                {
                    return;
                }
                case "starting":
                {
                    throw new FrameworkError("TRANSPORT-HTTP-STOP-IN_STARTING_STATE_WITHOUT_OPERATION", "HTTP transport is currently in the starting state, but there is no in-flight operation.");
                }
                case "running":
                {
                    break;
                }
                case "stopping":
                {
                    throw new FrameworkError("TRANSPORT-HTTP-STOP-IN_STOPPING_STATE_WITHOUT_OPERATION", "HTTP transport is currently in the stopping state, but there is no in-flight operation.");
                }
                case "error":
                {
                    break;
                }
            }

            break;
        }

        await this.stopOnce();
    }

    private async startOnce (): Promise<void>
    {
        if (isPresent(this.starting))
        {
            await this.starting;
            return;
        }

        if (isPresent(this.stopping))
        {
            await this.stopping;
        }

        this.starting = (
            async (): Promise<void> =>
            {
                await this.startCore();
            }
        )();

        try
        {
            await this.starting;
        }
        finally
        {
            this.starting = null;
        }
    }

    private async stopOnce (): Promise<void>
    {
        if (isPresent(this.stopping))
        {
            await this.stopping;
            return;
        }

        this.stopping = (
            async (): Promise<void> =>
            {
                await this.stopCore();
            }
        )();

        try
        {
            await this.stopping;
        }
        finally
        {
            this.stopping = null;
        }
    }

    private async startCore (): Promise<void>
    {
        const server: HttpServer | HttpsServer = this.config.server.scheme === "http"
                                                 ? createHttpServer(this.config.requestListener)
                                                 : createHttpsServer(this.config.server.sslTlsCertificate, this.config.requestListener);

        this.state = "starting";
        this.logger.log(2, "info", `HTTP transport is starting the server...`);

        let isOk: boolean = true;

        try
        {
            await this.listen(server);

            server.on("error", this.handleError);
        }
        catch (error: unknown)
        {
            isOk = false;

            this.logger.log(0, "error", error);

            try
            {
                await this.close(server);
            }
            catch (closeError: unknown)
            {
                this.logger.log(0, "error", closeError);
            }
        }

        this.server = isOk ? server : null;

        this.state = isOk ? "running" : "error";
        this.logger.log(1, "info", `HTTP transport has ${isOk ? `started the ${this.config.server.scheme.toUpperCase()} server on port ${(server.address() as AddressInfo).port}` : "failed to start the server"}.`);
    }

    private async stopCore (): Promise<void>
    {
        const server: HttpServer | HttpsServer | null = this.server;

        if (!isPresent(server))
        {
            this.logger.log(2, "info", "HTTP transport has no server to stop.");
            return;
        }

        this.state = "stopping";
        this.logger.log(2, "info", "HTTP transport is stopping the server...");

        let isOk: boolean = true;

        try
        {
            server.off("error", this.handleError);

            await this.close(server);
        }
        catch (error: unknown)
        {
            isOk = false;

            this.logger.log(0, "error", error);
        }

        this.server = isOk ? null : server;

        this.state = isOk ? "idle" : "error";
        this.logger.log(1, "info", `HTTP transport has ${isOk ? "stopped" : "failed to stop"} the server.`);
    }

    private handleError: (error: Error) => void = (error: Error): void =>
    {
        this.logger.log(0, "error", error);
    };

    private async listen (server: HttpServer | HttpsServer): Promise<void>
    {
        await new Promise<void>(
            (resolve: (value: void | PromiseLike<void>) => void, reject: (reason?: unknown) => void): void =>
            {
                const handleListening: () => void = (): void =>
                {
                    server.off("error", handleError);
                    resolve();
                };

                const handleError: (error: Error) => void = (error: Error): void =>
                {
                    server.off("listening", handleListening);
                    reject(error);
                };

                server.once("listening", handleListening);
                server.once("error", handleError);

                server.listen(this.config.server.port);
            },
        );
    }

    private async close (server: HttpServer | HttpsServer): Promise<void>
    {
        await new Promise<void>(
            (resolve: (value: void | PromiseLike<void>) => void, reject: (reason?: unknown) => void): void =>
            {
                const handleClose: () => void = (): void =>
                {
                    server.off("error", handleError);
                    resolve();
                };

                const handleError: (error: Error) => void = (error: Error): void =>
                {
                    server.off("close", handleClose);
                    reject(error);
                };

                server.once("close", handleClose);
                server.once("error", handleError);

                server.close();
            },
        );
    }
}

export default HttpTransport;

export type {
    HttpTransportArgs,
    HttpTransportDeps,
    HttpTransportOptions,
    HttpTransportConfig,

    HttpServerOptions,
    HttpsServerOptions,

    HttpTransportState,
};
