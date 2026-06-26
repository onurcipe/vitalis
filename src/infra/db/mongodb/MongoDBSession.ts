import {isPresent} from "@onurcipe/facilis";

import type {
    MongoClient,
    ClientSession, TransactionOptions,
} from "mongodb";

import type {Session} from "../../../core/db/Session.js";

type MongoDBSessionArgs =
    {
        deps: MongoDBSessionDeps;
        options?: MongoDBSessionOptions;
    };

type MongoDBSessionDeps =
    {
        client: MongoClient;
    };

type MongoDBSessionOptions =
    {
        transactionOptions?: TransactionOptions;
    };

type MongoDBSessionConfig =
    {
        transactionOptions: TransactionOptions | undefined;
    };

class MongoDBSession implements Session<ClientSession>
{
    private readonly client: MongoClient;
    private readonly config: MongoDBSessionConfig;

    public constructor (args: MongoDBSessionArgs)
    {
        this.client = args.deps.client;
        this.config = {
            transactionOptions: args.options?.transactionOptions,
        };
    }

    public start (externalSession?: ClientSession, isEnabled?: boolean): {session?: ClientSession, internalSession?: ClientSession}
    {
        // 1) Reuse the external session.
        if (isPresent(externalSession))
        {
            return {
                session: externalSession,
            };
        }

        // 2) Create a new internal session if enabled.
        const shouldStartSession: boolean = isPresent(isEnabled) && isEnabled;

        if (shouldStartSession)
        {
            const internalSession: ClientSession = this.client.startSession();

            return {
                session: internalSession,
                internalSession,
            };
        }

        // 3) No session.
        return {};
    }

    public async withTransaction (callback: (session?: ClientSession) => Promise<void>, externalSession?: ClientSession, internalSession?: ClientSession): Promise<void>
    {
        // 1) Run with an external session.
        if (isPresent(externalSession))
        {
            await callback(externalSession);

            if (isPresent(internalSession))
            {
                await internalSession.endSession();
            }

            return;
        }

        // 2) Run with the internal session created.
        if (isPresent(internalSession))
        {
            try
            {
                await internalSession.withTransaction(callback, this.config.transactionOptions);
            }
            finally
            {
                await internalSession.endSession();
            }

            return;
        }

        // 3) Run without any session.
        await callback();
    };
}

export default MongoDBSession;

export type {
    MongoDBSessionArgs,
    MongoDBSessionDeps,
    MongoDBSessionOptions,
};
