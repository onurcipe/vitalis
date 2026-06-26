import {isPresent} from "@onurcipe/facilis";

import {MongoClient} from "mongodb";
import type {MongoClientOptions} from "mongodb";

import FrameworkError from "../../../error/FrameworkError.js";
import type Logger from "../../../core/Logger.js";
import type {Connector} from "../../../core/Connector.js";

type MongoDBConnectorArgs =
    {
        deps: MongoDBConnectorDeps;
        options: MongoDBConnectorOptions;
    };

type MongoDBConnectorDeps =
    {
        logger: Logger;
    };

type MongoDBConnectorOptions =
    {
        client: MongoDBClientOptions;
    };

type MongoDBConnectorConfig =
    {
        client: MongoDBClientOptions;
    };

type MongoDBClientOptions =
    {
        url: string;
        options?: MongoClientOptions;
    };

type MongoDBConnectorState =
    "idle" | "connecting" | "connected" | "disconnecting" | "error";

class MongoDBConnector implements Connector
{
    private readonly logger: Logger;
    private readonly config: MongoDBConnectorConfig;

    private client: MongoClient | null = null;

    private state: MongoDBConnectorState = "idle";
    private connecting: Promise<void> | null = null;
    private disconnecting: Promise<void> | null = null;

    public constructor (args: MongoDBConnectorArgs)
    {
        this.logger = args.deps.logger;

        const options: MongoDBConnectorOptions = args.options;
        this.config = {
            client: options.client,
        };
    }

    public getClient (): MongoClient | null
    {
        return this.client;
    }

    public getState (): MongoDBConnectorState
    {
        return this.state;
    }

    public async connect (): Promise<void>
    {
        while (true)
        {
            if (isPresent(this.connecting))
            {
                await this.connecting;
                return;
            }

            if (isPresent(this.disconnecting))
            {
                await this.disconnecting;
                continue;
            }

            switch (this.state)
            {
                case "idle":
                {
                    break;
                }
                case "connecting":
                {
                    throw new FrameworkError("CONNECTOR-MONGODB-CONNECT-IN_CONNECTING_STATE_WITHOUT_OPERATION", "MongoDB connector is currently in the connecting state, but there is no in-flight operation.");
                }
                case "connected":
                {
                    return;
                }
                case "disconnecting":
                {
                    throw new FrameworkError("CONNECTOR-MONGODB-CONNECT-IN_DISCONNECTING_STATE_WITHOUT_OPERATION", "MongoDB connector is currently in the disconnecting state, but there is no in-flight operation.");
                }
                case "error":
                {
                    break;
                }
            }

            break;
        }

        await this.connectOnce();
    }

    public async disconnect (): Promise<void>
    {
        while (true)
        {
            if (isPresent(this.connecting))
            {
                await this.connecting;
                continue;
            }

            if (isPresent(this.disconnecting))
            {
                await this.disconnecting;
                return;
            }

            switch (this.state)
            {
                case "idle":
                {
                    return;
                }
                case "connecting":
                {
                    throw new FrameworkError("CONNECTOR-MONGODB-DISCONNECT-IN_CONNECTING_STATE_WITHOUT_OPERATION", "MongoDB connector is currently in the connecting state, but there is no in-flight operation.");
                }
                case "connected":
                {
                    break;
                }
                case "disconnecting":
                {
                    throw new FrameworkError("CONNECTOR-MONGODB-DISCONNECT-IN_DISCONNECTING_STATE_WITHOUT_OPERATION", "MongoDB connector is currently in the disconnecting state, but there is no in-flight operation.");
                }
                case "error":
                {
                    break;
                }
            }

            break;
        }

        await this.disconnectOnce();
    }

    private async connectOnce (): Promise<void>
    {
        if (isPresent(this.connecting))
        {
            await this.connecting;
            return;
        }

        if (isPresent(this.disconnecting))
        {
            await this.disconnecting;
        }

        this.connecting = (
            async (): Promise<void> =>
            {
                await this.connectCore();
            }
        )();

        try
        {
            await this.connecting;
        }
        finally
        {
            this.connecting = null;
        }
    }

    private async disconnectOnce (): Promise<void>
    {
        if (isPresent(this.disconnecting))
        {
            await this.disconnecting;
            return;
        }

        this.disconnecting = (
            async (): Promise<void> =>
            {
                await this.disconnectCore();
            }
        )();

        try
        {
            await this.disconnecting;
        }
        finally
        {
            this.disconnecting = null;
        }
    }

    private async connectCore (): Promise<void>
    {
        const client: MongoClient = new MongoClient(this.config.client.url, this.config.client.options);

        this.state = "connecting";
        this.logger.log(2, "info", "MongoDB connector is connecting...");

        let isOk: boolean = true;

        try
        {
            await client.connect();
        }
        catch (error: unknown)
        {
            isOk = false;

            this.logger.log(0, "error", error);

            try
            {
                await client.close();
            }
            catch (closeError: unknown)
            {
                this.logger.log(0, "error", closeError);
            }
        }

        this.client = isOk ? client : null;

        this.state = isOk ? "connected" : "error";
        this.logger.log(1, "info", `MongoDB connector has ${isOk ? "connected" : "failed to connect"}.`);
    }

    private async disconnectCore (): Promise<void>
    {
        const client: MongoClient | null = this.client;

        if (!isPresent(client))
        {
            this.logger.log(2, "info", "MongoDB connector has no client to disconnect.");
            return;
        }

        this.state = "disconnecting";
        this.logger.log(2, "info", "MongoDB connector is disconnecting...");

        let isOk: boolean = true;

        try
        {
            await client.close();
        }
        catch (error: unknown)
        {
            isOk = false;

            this.logger.log(0, "error", error);
        }

        this.client = isOk ? null : client;

        this.state = isOk ? "idle" : "error";
        this.logger.log(1, "info", `MongoDB connector has ${isOk ? "disconnected" : "failed to disconnect"}.`);
    }
}

export default MongoDBConnector;

export type {
    MongoDBConnectorArgs,
    MongoDBConnectorDeps,
    MongoDBConnectorOptions,
    MongoDBConnectorConfig,

    MongoDBClientOptions,

    MongoDBConnectorState,
};
