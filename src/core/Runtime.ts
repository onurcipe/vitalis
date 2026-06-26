import process from "node:process";

import {isPresent, isPopulated} from "@onurcipe/facilis";

import FrameworkError from "../error/FrameworkError.js";
import AbortError from "../error/AbortError.js";
import Registry from "./Registry.js";
import type Logger from "./Logger.js";
import Aborter from "./Aborter.js";
import type {Connector} from "./Connector.js";
import type {Transport} from "./Transport.js";

type RuntimeArgs =
    {
        deps: RuntimeDeps;
        options?: RuntimeOptions;
    };

type RuntimeDeps =
    {
        logger: Logger;
    };

type RuntimeOptions =
    {
        isTerminateProcess?: boolean;
        init?: RuntimeInitHook;
        connectors?: RuntimeConnectorCreator[];
        transports?: RuntimeTransportCreator[];
        ready?: RuntimeReadyHook;
    };

type RuntimeConfig =
    {
        isTerminateProcess: boolean;
        init: RuntimeInitHook | null;
        connectors: RuntimeConnectorCreator[];
        transports: RuntimeTransportCreator[];
        ready: RuntimeReadyHook | null;
    };

type RuntimeInitHook =
    (runtime: Runtime) => Promise<void>;

type RuntimeConnectorCreator =
    (runtime: Runtime) => Connector;

type RuntimeTransportCreator =
    (runtime: Runtime) => Transport;

type RuntimeReadyHook =
    (runtime: Runtime) => Promise<void>;

type RuntimeState =
    "idle" | "starting" | "running" | "stopping" | "error";

class Runtime
{
    private readonly registry: Registry = new Registry();

    private readonly logger: Logger;
    private readonly config: RuntimeConfig;

    private readonly aborter: Aborter = new Aborter();

    private connectors: Connector[] = [];
    private transports: Transport[] = [];

    private state: RuntimeState = "idle";
    private starting: Promise<void> | null = null;
    private stopping: Promise<void> | null = null;
    private isProcessHandlersInstalled: boolean = false;

    public constructor (args: RuntimeArgs)
    {
        this.logger = args.deps.logger;

        const options: RuntimeOptions = args.options ?? {};
        this.config = {
            isTerminateProcess: options.isTerminateProcess ?? true,
            init: options.init ?? null,
            connectors: options.connectors ?? [],
            transports: options.transports ?? [],
            ready: options.ready ?? null,
        };
    }

    public getRegistry (): Registry
    {
        return this.registry;
    }

    public getState (): RuntimeState
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
                    throw new FrameworkError("RUNTIME-START-IN_STARTING_STATE_WITHOUT_OPERATION", "Runtime is currently in the starting state, but there is no in-flight operation.");
                }
                case "running":
                {
                    return;
                }
                case "stopping":
                {
                    throw new FrameworkError("RUNTIME-START-IN_STOPPING_STATE_WITHOUT_OPERATION", "Runtime is currently in the stopping state, but there is no in-flight operation.");
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
                    throw new FrameworkError("RUNTIME-STOP-IN_STARTING_STATE_WITHOUT_OPERATION", "Runtime is currently in the starting state, but there is no in-flight operation.");
                }
                case "running":
                {
                    break;
                }
                case "stopping":
                {
                    throw new FrameworkError("RUNTIME-STOP-IN_STOPPING_STATE_WITHOUT_OPERATION", "Runtime is currently in the stopping state, but there is no in-flight operation.");
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

        this.aborter.abort("stop");

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
        this.aborter.reset();

        this.state = "starting";
        this.logger.log(2, "info", "Runtime is starting...");

        this.installProcessHandlers();

        const isRunInitOk: boolean = await this.runInit();
        const isConnectConnectorsOk: boolean = await this.connectConnectors();
        const isStartTransportsOk: boolean = await this.startTransports();
        const isRunReadyOk: boolean = await this.runReady();

        const isOk: boolean = isRunInitOk && isConnectConnectorsOk && isStartTransportsOk && isRunReadyOk;

        this.state = isOk ? "running" : "error";
        this.logger.log(1, "info", `Runtime has ${isOk ? "started" : "started with errors, so it will be stopped."}.`);

        if (!isOk)
        {
            await this.stopOnce();
        }
    }

    private async stopCore (): Promise<void>
    {
        this.state = "stopping";
        this.logger.log(2, "info", "Runtime is stopping...");

        const isStopTransportsOk: boolean = await this.stopTransports();
        const isDisconnectConnectorsOk: boolean = await this.disconnectConnectors();
        this.registry.clear();
        this.uninstallProcessHandlers();

        const isOk: boolean = isStopTransportsOk && isDisconnectConnectorsOk;

        this.state = isOk ? "idle" : "error";
        this.logger.log(1, "info", `Runtime has ${isOk ? "stopped" : `failed to stop${this.config.isTerminateProcess ? ", so the process will be terminated" : ""}`}.`);

        if (!isOk && this.config.isTerminateProcess)
        {
            this.terminateProcess(1);
        }
    }

    private logAbort (): void
    {
        if (!this.aborter.isAborted())
        {
            return;
        }

        const reason: string | null = this.aborter.getReason();

        this.logger.log(1, "info", `Runtime has aborted${isPresent(reason) ? ` (reason: ${reason})` : ""}.`);
    }

    private handleUnhandledRejection: (reason: unknown, promise: Promise<unknown>) => Promise<void> = async (reason: unknown, promise: Promise<unknown>): Promise<void> =>
    {
        this.state = "error";
        this.logger.log(0, "error", {reason, promise});

        try
        {
            await this.stopOnce();
        }
        catch (error: unknown)
        {
            this.logger.log(0, "error", error);
        }

        if (this.config.isTerminateProcess)
        {
            this.terminateProcess(1);
        }
    };

    private handleUncaughtException: (error: Error, origin: NodeJS.UncaughtExceptionOrigin) => Promise<void> = async (error: Error, origin: NodeJS.UncaughtExceptionOrigin): Promise<void> =>
    {
        this.state = "error";
        this.logger.log(0, "error", {error, origin});

        try
        {
            await this.stopOnce();
        }
        catch (error: unknown)
        {
            this.logger.log(0, "error", error);
        }

        if (this.config.isTerminateProcess)
        {
            this.terminateProcess(1);
        }
    };

    private handleProcessInterruptSignal: () => Promise<void> = async (): Promise<void> =>
    {
        this.aborter.abort("SIGINT", {isOverride: true});

        try
        {
            await this.stopOnce();
        }
        catch (error: unknown)
        {
            this.logger.log(0, "error", error);
        }

        if (this.config.isTerminateProcess)
        {
            this.terminateProcess(0);
        }
    };

    private handleProcessTerminateSignal: () => Promise<void> = async (): Promise<void> =>
    {
        this.aborter.abort("SIGTERM", {isOverride: true});

        try
        {
            await this.stopOnce();
        }
        catch (error: unknown)
        {
            this.logger.log(0, "error", error);
        }

        if (this.config.isTerminateProcess)
        {
            this.terminateProcess(0);
        }
    };

    private installProcessHandlers (): void
    {
        if (this.isProcessHandlersInstalled)
        {
            return;
        }

        this.logger.log(2, "info", "Runtime is installing the process handlers...");

        process.on("unhandledRejection", this.handleUnhandledRejection);
        process.on("uncaughtException", this.handleUncaughtException);
        process.once("SIGINT", this.handleProcessInterruptSignal);
        process.once("SIGTERM", this.handleProcessTerminateSignal);

        this.isProcessHandlersInstalled = true;

        this.logger.log(1, "info", "Runtime has installed the process handlers.");
    }

    private uninstallProcessHandlers (): void
    {
        if (!this.isProcessHandlersInstalled)
        {
            return;
        }

        this.logger.log(2, "info", `Runtime is uninstalling the process handlers...`);

        process.off("unhandledRejection", this.handleUnhandledRejection);
        process.off("uncaughtException", this.handleUncaughtException);
        process.off("SIGINT", this.handleProcessInterruptSignal);
        process.off("SIGTERM", this.handleProcessTerminateSignal);

        this.isProcessHandlersInstalled = false;

        this.logger.log(1, "info", "Runtime has uninstalled the process handlers.");
    }

    private async runInit (): Promise<boolean>
    {
        let isOk: boolean = true;

        if (!isPresent(this.config.init))
        {
            return isOk;
        }

        this.logger.log(2, "info", "Runtime is running the init hook...");

        try
        {
            await this.aborter.await(this.config.init(this));
        }
        catch (error: unknown)
        {
            isOk = false;

            this.logAbort();

            if (!(error instanceof AbortError))
            {
                this.logger.log(0, "error", error);
            }
        }

        this.logger.log(1, "info", `Runtime has ${isOk ? "run" : "failed to run"} the init hook.`);

        return isOk;
    }

    private async connectConnectors (): Promise<boolean>
    {
        if (!isPopulated(this.config.connectors))
        {
            return true;
        }

        this.logger.log(2, "info", `Runtime is connecting the connectors...`);

        let okCount: number = 0;
        const totalCount: number = this.config.connectors.length;

        for (let i: number = 0; i < this.config.connectors.length; i++)
        {
            const createConnector: RuntimeConnectorCreator = this.config.connectors[i]!;

            try
            {
                const connector: Connector = createConnector(this);
                this.connectors.push(connector);

                await this.aborter.await(connector.connect());

                okCount++;
            }
            catch (error: unknown)
            {
                if (this.aborter.isAborted())
                {
                    this.logAbort();
                    break;
                }

                if (!(error instanceof AbortError))
                {
                    this.logger.log(0, "error", error);
                }
            }
        }

        this.logger.log(1, "info", `Runtime has ${okCount === totalCount ? "connected" : okCount > 0 ? `connected ${okCount}/${totalCount}` : "failed to connect"} the connectors.`);

        return okCount === totalCount;
    }

    private async disconnectConnectors (): Promise<boolean>
    {
        if (this.connectors.length === 0)
        {
            return true;
        }

        this.logger.log(2, "info", "Runtime is disconnecting connectors...");

        let okCount: number = 0;
        const totalCount: number = this.connectors.length;

        for (let i: number = this.connectors.length - 1; i >= 0; i--)
        {
            const connector: Connector = this.connectors[i]!;

            try
            {
                await connector.disconnect();
                this.connectors.splice(i, 1);
                okCount++;
            }
            catch (error: unknown)
            {
                this.logger.log(0, "error", error);
            }
        }

        this.logger.log(1, "info", `Runtime has ${okCount === totalCount ? "disconnected" : okCount > 0 ? `disconnected ${okCount}/${totalCount}` : "failed to disconnect"} the connectors.`);

        return okCount === totalCount;
    }

    private async startTransports (): Promise<boolean>
    {
        if (!isPopulated(this.config.transports))
        {
            return true;
        }

        this.logger.log(2, "info", `Runtime is starting the transports...`);

        let okCount: number = 0;
        const totalCount: number = this.config.transports.length;

        for (let i: number = 0; i < this.config.transports.length; i++)
        {
            const createTransport: RuntimeTransportCreator = this.config.transports[i]!;

            try
            {
                const transport: Transport = createTransport(this);
                this.transports.push(transport);

                await this.aborter.await(transport.start());

                okCount++;
            }
            catch (error: unknown)
            {
                if (this.aborter.isAborted())
                {
                    this.logAbort();
                    break;
                }

                if (!(error instanceof AbortError))
                {
                    this.logger.log(0, "error", error);
                }
            }
        }

        this.logger.log(1, "info", `Runtime has ${okCount === totalCount ? "started" : okCount > 0 ? `started ${okCount}/${totalCount}` : "failed to start"} the transports.`);

        return okCount === totalCount;
    }

    private async stopTransports (): Promise<boolean>
    {
        if (this.transports.length === 0)
        {
            return true;
        }

        this.logger.log(2, "info", "Runtime is stopping the transports...");

        let okCount: number = 0;
        const totalCount: number = this.transports.length;

        for (let i: number = this.transports.length - 1; i >= 0; i--)
        {
            const transport: Transport = this.transports[i]!;

            try
            {
                await transport.stop();
                this.transports.splice(i, 1);
                okCount++;
            }
            catch (error: unknown)
            {
                this.logger.log(0, "error", error);
            }
        }

        this.logger.log(1, "info", `Runtime has ${okCount === totalCount ? "stopped" : okCount > 0 ? `stopped ${okCount}/${totalCount}` : "failed to stop"} the transports.`);

        return okCount === totalCount;
    }

    private async runReady (): Promise<boolean>
    {
        let isOk: boolean = true;

        if (!isPresent(this.config.ready))
        {
            return isOk;
        }

        this.logger.log(2, "info", "Runtime is running the ready hook...");

        try
        {
            await this.aborter.await(this.config.ready(this));
        }
        catch (error: unknown)
        {
            isOk = false;

            this.logAbort();

            if (!(error instanceof AbortError))
            {
                this.logger.log(0, "error", error);
            }
        }

        this.logger.log(1, "info", `Runtime has ${isOk ? "run" : "failed to run"} the ready hook.`);

        return isOk;
    }

    private terminateProcess (exitCode: number): void
    {
        this.logger.log(2, "info", `Runtime is terminating the process (exit code: ${exitCode})...`);

        process.exit(exitCode);
    }
}

export default Runtime;

export type {
    RuntimeArgs,
    RuntimeDeps,
    RuntimeOptions,
    RuntimeConfig,

    RuntimeInitHook,
    RuntimeConnectorCreator,
    RuntimeTransportCreator,
    RuntimeReadyHook,

    RuntimeState,
};
