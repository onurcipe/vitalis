import {isPresent, isObject} from "@onurcipe/facilis";

import type {Db, Collection} from "mongodb";

import UserError from "../../../error/UserError.js";
import type MongoDBModel from "./MongoDBModel.js";

type MongoDBGatewayArgs =
    {
        deps: MongoDBGatewayDeps;
        options: MongoDBGatewayOptions;
    };

type MongoDBGatewayDeps =
    {
        db: Db;
        model: MongoDBModel;
    };

type MongoDBGatewayOptions =
    {
        collectionName: string;
        validationLevel?: "off" | "moderate" | "strict";
        validationAction?: "warn" | "error" | "errorAndLog";
    };

type MongoDBGatewayConfig =
    {
        collectionName: string;
        validationLevel: "off" | "moderate" | "strict";
        validationAction: "warn" | "error" | "errorAndLog";
    };

class MongoDBGateway
{
    private readonly db: Db;
    private readonly model: MongoDBModel;
    private readonly config: MongoDBGatewayConfig;

    private readonly collection: Collection;

    public constructor (args: MongoDBGatewayArgs)
    {
        this.db = args.deps.db;
        this.model = args.deps.model;
        this.config = {
            collectionName: args.options.collectionName,
            validationLevel: args.options.validationLevel ?? "strict",
            validationAction: args.options.validationAction ?? "error",
        };

        this.collection = this.db.collection(this.config.collectionName);
    }

    public getCollection (): Collection
    {
        return this.collection;
    }

    public async sync (): Promise<void>
    {
        const isCollectionExist: boolean = (await this.db.listCollections({name: this.config.collectionName}, {nameOnly: true}).toArray()).length > 0;

        const options: Record<string, unknown> = {
            validator: {$jsonSchema: this.model.getJsonSchema()},
            validationLevel: this.config.validationLevel,
            validationAction: this.config.validationAction,
        };

        try
        {
            if (isCollectionExist)
            {
                await this.db.command({collMod: this.config.collectionName, ...options});
            }
            else
            {
                await this.db.createCollection(this.config.collectionName, options);
            }
        }
        catch (error: unknown)
        {
            const isFailedToParse: boolean = isObject(error) && isPresent(error.code) && error.code === 9;

            if (isFailedToParse)
            {
                throw new UserError("GATEWAY-MONGODB-SYNC-JSON_SCHEMA-INVALID", `MongoDB gateway has failed to validate the MongoDB JSON schema for ${this.db.databaseName}.${this.config.collectionName}.`);
            }

            throw error;
        }
    }
}

export default MongoDBGateway;

export type {
    MongoDBGatewayArgs,
    MongoDBGatewayDeps,
    MongoDBGatewayOptions,
    MongoDBGatewayConfig,
};
