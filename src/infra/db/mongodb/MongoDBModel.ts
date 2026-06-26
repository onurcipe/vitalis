import {isPresent, isPopulated, clone, isObject, isArray} from "@onurcipe/facilis";

import MongoDBDataType from "./MongoDBDataType.js";
import type {MongoDBBsonTypeName} from "./MongoDBDataType.js";

type MongoDBModelArgs =
    {
        definition: MongoDBModelDefinition;
        options: MongoDBModelOptions;
    };

type MongoDBModelOptions =
    {
        shouldAddCommonProperties?: boolean;
        commonProperties?: {
            _id?: string;
            version?: string;
            is_soft_deleted?: string;
            created_at?: string;
            updated_at?: string;
            soft_deleted_at?: string;
        };
    };

type MongoDBModelConfig =
    {
        shouldAddCommonProperties: boolean;
        commonProperties: {
            _id: string;
            version: string;
            is_soft_deleted: string;
            created_at: string;
            updated_at: string;
            soft_deleted_at: string;
        };
    };

type MongoDBModelDefinition =
    {
        title?: string;
        description?: string;

        /* All Types */
        anyOf?: MongoDBModelDefinition[];
        oneOf?: MongoDBModelDefinition[];
        allOf?: MongoDBModelDefinition[];
        not?: MongoDBModelDefinition;

        bsonType?: MongoDBBsonTypeName | MongoDBBsonTypeName[];
        type?: "null" | "boolean" | "number" | "string" | "object" | "array";

        enum?: unknown[];

        /* Object */
        properties?: Record<string, MongoDBModelDefinition>;
        additionalProperties?: boolean | MongoDBModelDefinition;

        minProperties?: number;
        maxProperties?: number;

        required?: string[];
        patternProperties?: Record<string, unknown>;
        dependencies?: Record<string, string[] | MongoDBModelDefinition>;

        /* Array */
        items?: MongoDBModelDefinition | MongoDBModelDefinition[];
        additionalItems?: boolean | MongoDBModelDefinition;

        minItems?: number;
        maxItems?: number;

        uniqueItems?: boolean;

        /* Number */
        minimum?: number;
        maximum?: number;
        exclusiveMinimum?: boolean;
        exclusiveMaximum?: boolean;

        multipleOf?: number;

        /* String */
        minLength?: number;
        maxLength?: number;

        pattern?: string;

        /* Custom */
        forbiddenFromRoles?: string[] | "*";
    };

type MongoDBJsonSchema =
    Omit<MongoDBModelDefinition, "forbiddenFromRoles">
    &
    {
        /* All Types */
        anyOf?: MongoDBJsonSchema[];
        oneOf?: MongoDBJsonSchema[];
        allOf?: MongoDBJsonSchema[];
        not?: MongoDBJsonSchema;

        /* Object */
        properties?: Record<string, MongoDBJsonSchema>;
        additionalProperties?: boolean | MongoDBJsonSchema;

        /* Array */
        items?: MongoDBJsonSchema | MongoDBJsonSchema[];
        additionalItems?: boolean | MongoDBJsonSchema;
    };

class MongoDBModel
{
    private readonly definition: MongoDBModelDefinition;
    private readonly config: MongoDBModelConfig;

    private readonly jsonSchema: MongoDBJsonSchema;

    private static readonly FORBIDDEN_FROM_ALL_ROLES: "*" = "*";

    public constructor (args: MongoDBModelArgs)
    {
        this.definition = clone(args.definition);
        this.config = {
            shouldAddCommonProperties: args.options.shouldAddCommonProperties ?? false,
            commonProperties: {
                _id: args.options.commonProperties?._id ?? "_id",
                version: args.options.commonProperties?.version ?? "version",
                is_soft_deleted: args.options.commonProperties?.is_soft_deleted ?? "is_soft_deleted",
                created_at: args.options.commonProperties?.created_at ?? "created_at",
                updated_at: args.options.commonProperties?.updated_at ?? "updated_at",
                soft_deleted_at: args.options.commonProperties?.soft_deleted_at ?? "soft_deleted_at",
            },
        };

        if (this.config.shouldAddCommonProperties)
        {
            this.addCommonProperties();
        }

        this.jsonSchema = this.generateJsonSchema();
    }

    public getJsonSchema (): MongoDBJsonSchema
    {
        return this.jsonSchema;
    }

    private addCommonProperties (): void
    {
        this.definition.properties = this.definition.properties ?? {};
        this.definition.required = this.definition.required ?? [];

        const {_id, version, is_soft_deleted, created_at, updated_at, soft_deleted_at} = this.config.commonProperties;

        /* _id */
        if (!isPresent(this.definition.properties[_id]))
        {
            this.definition.properties[_id] = {
                bsonType: MongoDBDataType.Id,
            };
        }

        if (!this.definition.required.includes(_id))
        {
            this.definition.required.push(_id);
        }

        /* version */
        if (!isPresent(this.definition.properties[version]))
        {
            this.definition.properties[version] = {
                bsonType: MongoDBDataType.NumberInt32,
                minimum: 0,
            };
        }

        if (!this.definition.required.includes(version))
        {
            this.definition.required.push(version);
        }

        /* is_soft_deleted */
        if (!isPresent(this.definition.properties[is_soft_deleted]))
        {
            this.definition.properties[is_soft_deleted] = {
                bsonType: MongoDBDataType.Boolean,
                forbiddenFromRoles: MongoDBModel.FORBIDDEN_FROM_ALL_ROLES,
            };
        }

        if (!this.definition.required.includes(is_soft_deleted))
        {
            this.definition.required.push(is_soft_deleted);
        }

        /* created_at */
        if (!isPresent(this.definition.properties[created_at]))
        {
            this.definition.properties[created_at] = {
                bsonType: MongoDBDataType.DateTime,
                forbiddenFromRoles: MongoDBModel.FORBIDDEN_FROM_ALL_ROLES,
            };
        }

        if (!this.definition.required.includes(created_at))
        {
            this.definition.required.push(created_at);
        }

        /* updated_at */
        if (!isPresent(this.definition.properties[updated_at]))
        {
            this.definition.properties[updated_at] = {
                bsonType: MongoDBDataType.DateTime,
                forbiddenFromRoles: MongoDBModel.FORBIDDEN_FROM_ALL_ROLES,
            };
        }

        /* soft_deleted_at */
        if (!isPresent(this.definition.properties[soft_deleted_at]))
        {
            this.definition.properties[soft_deleted_at] = {
                bsonType: MongoDBDataType.DateTime,
                forbiddenFromRoles: MongoDBModel.FORBIDDEN_FROM_ALL_ROLES,
            };
        }
    }

    private generateJsonSchema (): MongoDBJsonSchema
    {
        const definition: MongoDBModelDefinition = clone(this.definition);
        this.cleanCustomProperties(definition);

        return definition as unknown as MongoDBJsonSchema;
    }

    private cleanCustomProperties (definition: MongoDBModelDefinition): void
    {
        delete definition.forbiddenFromRoles;

        if (isPopulated(definition.anyOf))
        {
            for (const nestedDefinition of definition.anyOf)
            {
                this.cleanCustomProperties(nestedDefinition);
            }
        }

        if (isPopulated(definition.oneOf))
        {
            for (const nestedDefinition of definition.oneOf)
            {
                this.cleanCustomProperties(nestedDefinition);
            }
        }

        if (isPopulated(definition.allOf))
        {
            for (const nestedDefinition of definition.allOf)
            {
                this.cleanCustomProperties(nestedDefinition);
            }
        }

        if (isPopulated(definition.not))
        {
            this.cleanCustomProperties(definition.not);
        }

        if (isPopulated(definition.properties))
        {
            for (const property in definition.properties)
            {
                if (isPopulated(definition.properties[property]))
                {
                    this.cleanCustomProperties(definition.properties[property]);
                }
            }
        }

        if (isPopulated(definition.additionalProperties) && isObject(definition.additionalProperties))
        {
            this.cleanCustomProperties(definition.additionalProperties);
        }

        if (isPopulated(definition.dependencies))
        {
            for (const property in definition.dependencies)
            {
                if (isObject(definition.dependencies[property]))
                {
                    this.cleanCustomProperties(definition.dependencies[property]!);
                }
            }
        }

        if (isPopulated(definition.items))
        {
            if (isArray(definition.items))
            {
                for (let i: number = 0; i < definition.items.length; i++)
                {
                    if (isPopulated(definition.items[i]))
                    {
                        this.cleanCustomProperties(definition.items[i]!);
                    }
                }
            }
            else
            {
                this.cleanCustomProperties(definition.items);
            }
        }

        if (isPopulated(definition.additionalItems) && isObject(definition.additionalItems))
        {
            this.cleanCustomProperties(definition.additionalItems);
        }
    }
}

export default MongoDBModel;

export type {
    MongoDBModelArgs,
    MongoDBModelOptions,
    MongoDBModelConfig,

    MongoDBModelDefinition,
    MongoDBJsonSchema,
};
