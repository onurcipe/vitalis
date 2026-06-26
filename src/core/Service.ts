import {isPresent, isPopulated, isObject, isArray} from "@onurcipe/facilis";

import RecordNotFoundError from "../error/record/RecordNotFoundError.js";
import RecordMultipleFoundError from "../error/record/RecordMultipleFoundError.js";
import RecordVersionMismatchError from "../error/record/RecordVersionMismatchError.js";
import type {Repository} from "./db/Repository.js";
import type {Session} from "./db/Session.js";

type ServiceArgs<
    TRecord extends Record<string, unknown> = Record<string, unknown>,
    TPredicate = unknown,
    TMutation = Partial<TRecord>,
    TContext = undefined,
    TSession = unknown,
> =
    {
        deps: ServiceDeps<TRecord, TPredicate, TMutation, TContext, TSession>;
        options?: ServiceOptions;
    };

type ServiceDeps<
    TRecord extends Record<string, unknown> = Record<string, unknown>,
    TPredicate = unknown,
    TMutation = Partial<TRecord>,
    TContext = undefined,
    TSession = unknown,
> =
    {
        repository: Repository<TRecord, TPredicate, TMutation, TContext>;
        session: Session<TSession>;
    };

type ServiceOptions =
    {
        commonProperties?: {
            _id?: string;
            version?: string;
            is_soft_deleted?: string;
            created_at?: string;
            updated_at?: string;
            soft_deleted_at?: string;
        };
        fieldSchema?: FieldSchema;
        shouldRaiseRecordExistenceErrors?: boolean;
    };

type ServiceConfig =
    {
        commonProperties: {
            _id: string;
            version: string;
            is_soft_deleted: string;
            created_at: string;
            updated_at: string;
            soft_deleted_at: string;
        };
        fieldSchema: FieldSchema | undefined;
        shouldRaiseRecordExistenceErrors: boolean;
    };

type FieldSchema =
    {
        isForbidden?: boolean;
        properties?: Record<string, FieldSchema>;
        items?: FieldSchema | FieldSchema[];
    };

type CountHooks<TPredicate = unknown, TContext = undefined, TSession = unknown> =
    {
        isSessionEnabled?: boolean;
        bearer?: unknown;
        beforeCount?: (predicate: TPredicate, context: TContext | undefined, session?: TSession) => Promise<void>;
        afterCount?: (count: number, session?: TSession) => Promise<void>;
    };

type ReadManyHooks<TRecord extends Record<string, unknown> = Record<string, unknown>, TPredicate = unknown, TContext = undefined, TSession = unknown> =
    {
        isSessionEnabled?: boolean;
        shouldKeepForbiddenFields?: boolean;
        bearer?: unknown;
        beforeReadMany?: (predicate: TPredicate, context: TContext | undefined, session?: TSession) => Promise<void>;
        afterReadMany?: (records: TRecord[], session?: TSession) => Promise<void>;
    };

type ReadOneHooks<TRecord extends Record<string, unknown> = Record<string, unknown>, TPredicate = unknown, TContext = undefined, TSession = unknown> =
    {
        isSessionEnabled?: boolean;
        shouldRaiseRecordExistenceErrors?: boolean;
        shouldKeepForbiddenFields?: boolean;
        bearer?: unknown;
        beforeReadOne?: (predicate: TPredicate, context: TContext | undefined, session?: TSession) => Promise<void>;
        afterReadOne?: (record: TRecord | null, session?: TSession) => Promise<void>;
    };

type ReadOneByIdHooks<TRecord extends Record<string, unknown> = Record<string, unknown>, TSession = unknown> =
    {
        isSessionEnabled?: boolean;
        shouldRaiseRecordExistenceErrors?: boolean;
        shouldKeepForbiddenFields?: boolean;
        bearer?: unknown;
        beforeReadOne?: (_id: unknown, session?: TSession) => Promise<void>;
        afterReadOne?: (record: TRecord | null, session?: TSession) => Promise<void>;
    };

type ReadOneByIdAndVersionHooks<TRecord extends Record<string, unknown> = Record<string, unknown>, TSession = unknown> =
    {
        isSessionEnabled?: boolean;
        shouldRaiseRecordExistenceErrors?: boolean;
        shouldKeepForbiddenFields?: boolean;
        bearer?: unknown;
        beforeReadOne?: (_id: unknown, version: number, session?: TSession) => Promise<void>;
        afterReadOne?: (record: TRecord | null, session?: TSession) => Promise<void>;
    };

type CreateOneHooks<TRecord extends Record<string, unknown> = Record<string, unknown>, TMutation = Partial<TRecord>, TSession = unknown> =
    {
        isSessionEnabled?: boolean;
        shouldKeepForbiddenFields?: boolean;
        bearer?: unknown;
        beforeCreateOne?: (mutation: TMutation, session?: TSession) => Promise<void>;
        afterCreateOne?: (record: TRecord, session?: TSession) => Promise<void>;
    };

type UpdateOneHooks<TRecord extends Record<string, unknown> = Record<string, unknown>, TPredicate = unknown, TMutation = Partial<TRecord>, TSession = unknown> =
    {
        isSessionEnabled?: boolean;
        shouldRaiseRecordExistenceErrors?: boolean;
        shouldKeepForbiddenFields?: boolean;
        bearer?: unknown;
        beforeReadMany?: (predicate: TPredicate, session?: TSession) => Promise<void>;
        afterReadMany?: (records: TRecord[], session?: TSession) => Promise<void>;
        beforeUpdateOne?: (record: TRecord, mutation: TMutation, session?: TSession) => Promise<void>;
        afterUpdateOne?: (record: TRecord | null, session?: TSession) => Promise<void>;
    };

type UpdateOneByIdAndVersionHooks<TRecord extends Record<string, unknown> = Record<string, unknown>, TMutation = Partial<TRecord>, TSession = unknown> =
    {
        isSessionEnabled?: boolean;
        shouldRaiseRecordExistenceErrors?: boolean;
        shouldKeepForbiddenFields?: boolean;
        bearer?: unknown;
        beforeReadOne?: (_id: unknown, version: number, session?: TSession) => Promise<void>;
        afterReadOne?: (record: TRecord | null, session?: TSession) => Promise<void>;
        beforeUpdateOne?: (record: TRecord, mutation: TMutation, session?: TSession) => Promise<void>;
        afterUpdateOne?: (record: TRecord | null, session?: TSession) => Promise<void>;
    };

type SoftDeleteOneHooks<TRecord extends Record<string, unknown> = Record<string, unknown>, TPredicate = unknown, TMutation = Partial<TRecord>, TSession = unknown> =
    {
        isSessionEnabled?: boolean;
        shouldRaiseRecordExistenceErrors?: boolean;
        shouldKeepForbiddenFields?: boolean;
        bearer?: unknown;
        beforeReadMany?: (predicate: TPredicate, session?: TSession) => Promise<void>;
        afterReadMany?: (records: TRecord[], session?: TSession) => Promise<void>;
        beforeUpdateOne?: (record: TRecord, mutation: TMutation, session?: TSession) => Promise<void>;
        afterUpdateOne?: (record: TRecord | null, session?: TSession) => Promise<void>;
    };

type SoftDeleteOneByIdAndVersionHooks<TRecord extends Record<string, unknown> = Record<string, unknown>, TMutation = Partial<TRecord>, TSession = unknown> =
    {
        isSessionEnabled?: boolean;
        shouldRaiseRecordExistenceErrors?: boolean;
        shouldKeepForbiddenFields?: boolean;
        bearer?: unknown;
        beforeReadOne?: (_id: unknown, version: number, session?: TSession) => Promise<void>;
        afterReadOne?: (record: TRecord | null, session?: TSession) => Promise<void>;
        beforeUpdateOne?: (record: TRecord, mutation: TMutation, session?: TSession) => Promise<void>;
        afterUpdateOne?: (record: TRecord | null, session?: TSession) => Promise<void>;
    };

type DeleteOneHooks<TRecord extends Record<string, unknown> = Record<string, unknown>, TPredicate = unknown, TSession = unknown> =
    {
        isSessionEnabled?: boolean;
        shouldRaiseRecordExistenceErrors?: boolean;
        shouldKeepForbiddenFields?: boolean;
        bearer?: unknown;
        beforeReadMany?: (predicate: TPredicate, session?: TSession) => Promise<void>;
        afterReadMany?: (records: TRecord[], session?: TSession) => Promise<void>;
        beforeDeleteOne?: (record: TRecord, session?: TSession) => Promise<void>;
        afterDeleteOne?: (record: TRecord | null, session?: TSession) => Promise<void>;
    };

type DeleteOneByIdAndVersionHooks<TRecord extends Record<string, unknown> = Record<string, unknown>, TSession = unknown> =
    {
        isSessionEnabled?: boolean;
        shouldRaiseRecordExistenceErrors?: boolean;
        shouldKeepForbiddenFields?: boolean;
        bearer?: unknown;
        beforeReadOne?: (_id: unknown, version: number, session?: TSession) => Promise<void>;
        afterReadOne?: (record: TRecord | null, session?: TSession) => Promise<void>;
        beforeDeleteOne?: (record: TRecord, session?: TSession) => Promise<void>;
        afterDeleteOne?: (record: TRecord | null, session?: TSession) => Promise<void>;
    };

class Service<
    TRecord extends Record<string, unknown> = Record<string, unknown>,
    TPredicate = unknown,
    TMutation = Partial<TRecord>,
    TContext = undefined,
    TSession = unknown,
>
{
    public readonly repository: Repository<TRecord, TPredicate, TMutation, TContext>;
    public readonly session: Session<TSession>;
    protected readonly config: ServiceConfig;

    public constructor (args: ServiceArgs<TRecord, TPredicate, TMutation, TContext, TSession>)
    {
        this.repository = args.deps.repository;
        this.session = args.deps.session;

        const options: ServiceOptions = args.options ?? {};
        this.config = {
            commonProperties: {
                _id: options.commonProperties?._id ?? "_id",
                version: options.commonProperties?.version ?? "version",
                is_soft_deleted: options.commonProperties?.is_soft_deleted ?? "is_soft_deleted",
                created_at: options.commonProperties?.created_at ?? "created_at",
                updated_at: options.commonProperties?.updated_at ?? "updated_at",
                soft_deleted_at: options.commonProperties?.soft_deleted_at ?? "soft_deleted_at",
            },
            fieldSchema: options.fieldSchema,
            shouldRaiseRecordExistenceErrors: options.shouldRaiseRecordExistenceErrors ?? false,
        };
    }

    private checkRecordSingularity (record: TRecord | null, shouldRaiseRecordExistenceErrorsByHook?: boolean): void
    {
        if (isPresent(shouldRaiseRecordExistenceErrorsByHook))
        {
            if (shouldRaiseRecordExistenceErrorsByHook && !isPresent(record))
            {
                throw new RecordNotFoundError("SERVICE-RECORD-NOT_FOUND");
            }
        }
        else
        {
            if (this.config.shouldRaiseRecordExistenceErrors && !isPresent(record))
            {
                throw new RecordNotFoundError("SERVICE-RECORD-NOT_FOUND");
            }
        }
    }

    private checkRecordsSingularity (records: TRecord[], shouldRaiseRecordExistenceErrorsByHook?: boolean): TRecord | null
    {
        if (isPresent(shouldRaiseRecordExistenceErrorsByHook))
        {
            if (shouldRaiseRecordExistenceErrorsByHook)
            {
                switch (records.length)
                {
                    case 0:
                    {
                        throw new RecordNotFoundError("SERVICE-RECORD-NOT_FOUND");
                    }
                    case 1:
                    {
                        return records[0] ?? null;
                    }
                    default:
                    {
                        throw new RecordMultipleFoundError("SERVICE-RECORD-MULTIPLE_FOUND");
                    }
                }
            }
        }
        else
        {
            if (this.config.shouldRaiseRecordExistenceErrors)
            {
                switch (records.length)
                {
                    case 0:
                    {
                        throw new RecordNotFoundError("SERVICE-RECORD-NOT_FOUND");
                    }
                    case 1:
                    {
                        return records[0] ?? null;
                    }
                    default:
                    {
                        throw new RecordMultipleFoundError("SERVICE-RECORD-MULTIPLE_FOUND");
                    }
                }
            }
        }

        if (records.length === 1)
        {
            return records[0] ?? null;
        }
        else
        {
            return null;
        }
    }

    private checkRecordVersion (record: TRecord, predicateVersion: number): void
    {
        const recordVersion: number = record[this.config.commonProperties.version] as number;

        if (recordVersion < predicateVersion)
        {
            throw new RecordVersionMismatchError("SERVICE-RECORD-VERSION_BEHIND", `Record may have been rolled back after you last read it (current: v${recordVersion} your: v${predicateVersion}).`);
        }
        else if (recordVersion > predicateVersion)
        {
            throw new RecordVersionMismatchError("SERVICE-RECORD-VERSION_AHEAD", `Record was modified after you last read it (current: v${recordVersion} your: v${predicateVersion}).`);
        }
    }

    protected toContext (session?: TSession, context?: TContext): TContext | undefined
    {
        if (isPresent(session))
        {
            if (isPresent(context))
            {
                return {...context, session} as unknown as TContext;
            }

            return {session} as unknown as TContext;
        }

        return context;
    }

    public removeForbiddenFields (record: TRecord): void
    {
        if (!isPresent(this.config.fieldSchema))
        {
            return;
        }

        if (this.config.fieldSchema.isForbidden)
        {
            for (const property in record)
            {
                delete record[property];
            }

            return;
        }

        this.removeForbiddenFieldsFromObject(record, this.config.fieldSchema);
    }

    private removeForbiddenFieldsFromObject (object: Record<string, unknown>, schema: FieldSchema): void
    {
        if (!isPresent(schema.properties))
        {
            return;
        }

        for (const property in object)
        {
            const propertySchema: FieldSchema | undefined = schema.properties[property];

            if (!isPresent(propertySchema))
            {
                continue;
            }

            if (propertySchema.isForbidden)
            {
                delete object[property];
            }
            else if (isPresent(propertySchema.properties) && isPresent(object[property]) && isObject(object[property]))
            {
                this.removeForbiddenFieldsFromObject(object[property] as Record<string, unknown>, propertySchema);
            }
            else if (isPresent(propertySchema.items) && isArray(object[property]))
            {
                this.removeForbiddenFieldsFromArray(object[property] as unknown[], propertySchema);
            }
        }
    }

    private removeForbiddenFieldsFromArray (array: unknown[], schema: FieldSchema): void
    {
        if (!isPresent(schema.items))
        {
            return;
        }

        if (isArray(schema.items))
        {
            // Multi schema: each index has its own schema.
            for (let i: number = 0; i < array.length && i < schema.items.length; i++)
            {
                const itemSchema: FieldSchema = schema.items[i]!;

                if (itemSchema.isForbidden)
                {
                    array.splice(i, 1);
                    i--;
                }
                else if (isPresent(itemSchema.properties) && isPresent(array[i]) && isObject(array[i]))
                {
                    this.removeForbiddenFieldsFromObject(array[i] as Record<string, unknown>, itemSchema);
                }
                else if (isPresent(itemSchema.items) && isArray(array[i]))
                {
                    this.removeForbiddenFieldsFromArray(array[i] as unknown[], itemSchema);
                }
            }
        }
        else
        {
            // Single schema.
            const itemSchema: FieldSchema = schema.items;

            if (itemSchema.isForbidden)
            {
                array.length = 0;
                return;
            }

            for (let i: number = 0; i < array.length; i++)
            {
                if (isPresent(itemSchema.properties) && isPresent(array[i]) && isObject(array[i]))
                {
                    this.removeForbiddenFieldsFromObject(array[i] as Record<string, unknown>, itemSchema);
                }
                else if (isPresent(itemSchema.items) && isArray(array[i]))
                {
                    this.removeForbiddenFieldsFromArray(array[i] as unknown[], itemSchema);
                }
            }
        }
    }

    public async count (predicate: TPredicate, context?: TContext, externalSession?: TSession, hooks?: CountHooks<TPredicate, TContext, TSession>): Promise<number>
    {
        hooks = hooks ?? {};
        hooks.bearer = hooks.bearer ?? {};

        (predicate as Record<string, unknown>)[this.config.commonProperties.is_soft_deleted] = false;

        let count!: number;
        const {session, internalSession} = this.session.start(externalSession, hooks.isSessionEnabled);
        await this.session.withTransaction(
            async (): Promise<void> =>
            {
                isPresent(hooks!.beforeCount) ? await hooks!.beforeCount(predicate, context, session) : undefined;
                count = await this.repository.count(predicate, this.toContext(session, context));
                isPresent(hooks!.afterCount) ? await hooks!.afterCount(count, session) : undefined;
            },
            externalSession,
            internalSession,
        );

        return count;
    }

    public async readMany (predicate: TPredicate, context?: TContext, externalSession?: TSession, hooks?: ReadManyHooks<TRecord, TPredicate, TContext, TSession>): Promise<TRecord[]>
    {
        hooks = hooks ?? {};
        hooks.bearer = hooks.bearer ?? {};

        const {is_soft_deleted} = this.config.commonProperties;
        (predicate as Record<string, unknown>)[is_soft_deleted] = false;

        let records!: TRecord[];
        const {session, internalSession} = this.session.start(externalSession, hooks.isSessionEnabled);
        await this.session.withTransaction(
            async (): Promise<void> =>
            {
                isPresent(hooks!.beforeReadMany) ? await hooks!.beforeReadMany(predicate, context, session) : undefined;
                records = await this.repository.readMany(predicate, this.toContext(session, context));
                isPresent(hooks!.afterReadMany) ? await hooks!.afterReadMany(records, session) : undefined;

                if (!hooks!.shouldKeepForbiddenFields && isPopulated(records))
                {
                    for (const record of records)
                    {
                        if (isPresent(record))
                        {
                            this.removeForbiddenFields(record);
                        }
                    }
                }
            },
            externalSession,
            internalSession,
        );

        return records;
    }

    public async readOne (predicate: TPredicate, context?: TContext, externalSession?: TSession, hooks?: ReadOneHooks<TRecord, TPredicate, TContext, TSession>): Promise<TRecord | null>
    {
        hooks = hooks ?? {};
        hooks.bearer = hooks.bearer ?? {};

        (predicate as Record<string, unknown>)[this.config.commonProperties.is_soft_deleted] = false;

        let record!: TRecord | null;
        const {session, internalSession} = this.session.start(externalSession, hooks.isSessionEnabled);
        await this.session.withTransaction(
            async (): Promise<void> =>
            {
                isPresent(hooks!.beforeReadOne) ? await hooks!.beforeReadOne(predicate, context, session) : undefined;
                record = await this.repository.readOne(predicate, this.toContext(session, context));
                isPresent(hooks!.afterReadOne) ? await hooks!.afterReadOne(record, session) : undefined;

                this.checkRecordSingularity(record, hooks!.shouldRaiseRecordExistenceErrors);

                if (!hooks!.shouldKeepForbiddenFields && isPresent(record))
                {
                    this.removeForbiddenFields(record);
                }
            },
            externalSession,
            internalSession,
        );

        return record;
    }

    public async readOneById (_id: unknown, externalSession?: TSession, hooks?: ReadOneByIdHooks<TRecord, TSession>): Promise<TRecord | null>
    {
        hooks = hooks ?? {};
        hooks.bearer = hooks.bearer ?? {};

        let record!: TRecord | null;
        const {session, internalSession} = this.session.start(externalSession, hooks.isSessionEnabled);
        await this.session.withTransaction(
            async (): Promise<void> =>
            {
                isPresent(hooks!.beforeReadOne) ? await hooks!.beforeReadOne(_id, session) : undefined;
                record = await this.repository.readOne({[this.config.commonProperties._id]: _id, [this.config.commonProperties.is_soft_deleted]: false} as TPredicate, this.toContext(session));
                isPresent(hooks!.afterReadOne) ? await hooks!.afterReadOne(record, session) : undefined;

                this.checkRecordSingularity(record, hooks!.shouldRaiseRecordExistenceErrors);

                if (!hooks!.shouldKeepForbiddenFields && isPresent(record))
                {
                    this.removeForbiddenFields(record);
                }
            },
            externalSession,
            internalSession,
        );

        return record;
    }

    public async readOneByIdAndVersion (_id: unknown, version: number, externalSession?: TSession, hooks?: ReadOneByIdAndVersionHooks<TRecord, TSession>): Promise<TRecord | null>
    {
        hooks = hooks ?? {};
        hooks.bearer = hooks.bearer ?? {};

        let record!: TRecord | null;
        const {session, internalSession} = this.session.start(externalSession, hooks.isSessionEnabled);
        await this.session.withTransaction(
            async (): Promise<void> =>
            {
                isPresent(hooks!.beforeReadOne) ? await hooks!.beforeReadOne(_id, version, session) : undefined;
                record = await this.repository.readOne({[this.config.commonProperties._id]: _id, [this.config.commonProperties.is_soft_deleted]: false} as TPredicate, this.toContext(session));
                isPresent(hooks!.afterReadOne) ? await hooks!.afterReadOne(record, session) : undefined;

                this.checkRecordSingularity(record, hooks!.shouldRaiseRecordExistenceErrors);

                if (isPresent(record))
                {
                    this.checkRecordVersion(record, version);
                }

                if (!hooks!.shouldKeepForbiddenFields && isPresent(record))
                {
                    this.removeForbiddenFields(record);
                }
            },
            externalSession,
            internalSession,
        );

        return record;
    }

    public async createOne (mutation: TMutation, externalSession?: TSession, hooks?: CreateOneHooks<TRecord, TMutation, TSession>): Promise<TRecord>
    {
        hooks = hooks ?? {};
        hooks.bearer = hooks.bearer ?? {};

        let record!: TRecord;
        const {session, internalSession} = this.session.start(externalSession, hooks.isSessionEnabled);
        await this.session.withTransaction(
            async (): Promise<void> =>
            {
                mutation = {
                    ...mutation,
                    [this.config.commonProperties.version]: 0,
                    [this.config.commonProperties.is_soft_deleted]: false,
                    [this.config.commonProperties.created_at]: new Date(),
                } as TMutation;

                isPresent(hooks!.beforeCreateOne) ? await hooks!.beforeCreateOne(mutation, session) : undefined;
                record = await this.repository.createOne(mutation as unknown as TRecord, this.toContext(session));
                isPresent(hooks!.afterCreateOne) ? await hooks!.afterCreateOne(record, session) : undefined;

                if (!hooks!.shouldKeepForbiddenFields && isPresent(record))
                {
                    this.removeForbiddenFields(record);
                }
            },
            externalSession,
            internalSession,
        );

        return record;
    }

    public async updateOne (predicate: TPredicate, mutation: TMutation, externalSession?: TSession, hooks?: UpdateOneHooks<TRecord, TPredicate, TMutation, TSession>): Promise<TRecord | null>
    {
        hooks = hooks ?? {};
        hooks.bearer = hooks.bearer ?? {};

        (predicate as Record<string, unknown>)[this.config.commonProperties.is_soft_deleted] = false;

        let record!: TRecord | null;
        const {session, internalSession} = this.session.start(externalSession, hooks.isSessionEnabled);
        await this.session.withTransaction(
            async (): Promise<void> =>
            {
                isPresent(hooks!.beforeReadMany) ? await hooks!.beforeReadMany(predicate, session) : undefined;
                const records: TRecord[] = await this.repository.readMany(predicate, this.toContext(session));
                isPresent(hooks!.afterReadMany) ? await hooks!.afterReadMany(records, session) : undefined;

                record = this.checkRecordsSingularity(records, hooks!.shouldRaiseRecordExistenceErrors);

                if (isPresent(record))
                {
                    const recordVersion: number = record[this.config.commonProperties.version] as number;

                    mutation = {
                        ...mutation,
                        [this.config.commonProperties.version]: recordVersion + 1,
                        [this.config.commonProperties.updated_at]: new Date(),
                    } as TMutation;

                    isPresent(hooks!.beforeUpdateOne) ? await hooks!.beforeUpdateOne(record, mutation, session) : undefined;
                    record = await this.repository.updateOne({[this.config.commonProperties._id]: record[this.config.commonProperties._id], [this.config.commonProperties.version]: recordVersion} as TPredicate, mutation, this.toContext(session));
                    isPresent(hooks!.afterUpdateOne) ? await hooks!.afterUpdateOne(record, session) : undefined;

                    if (!hooks!.shouldKeepForbiddenFields && isPresent(record))
                    {
                        this.removeForbiddenFields(record);
                    }
                }
            },
            externalSession,
            internalSession,
        );

        return record;
    }

    public async updateOneByIdAndVersion (_id: unknown, version: number, mutation: TMutation, externalSession?: TSession, hooks?: UpdateOneByIdAndVersionHooks<TRecord, TMutation, TSession>): Promise<TRecord | null>
    {
        hooks = hooks ?? {};
        hooks.bearer = hooks.bearer ?? {};

        let record!: TRecord | null;
        const {session, internalSession} = this.session.start(externalSession, hooks.isSessionEnabled);
        await this.session.withTransaction(
            async (): Promise<void> =>
            {
                isPresent(hooks!.beforeReadOne) ? await hooks!.beforeReadOne(_id, version, session) : undefined;
                record = await this.repository.readOne({[this.config.commonProperties._id]: _id, [this.config.commonProperties.is_soft_deleted]: false} as TPredicate, this.toContext(session));
                isPresent(hooks!.afterReadOne) ? await hooks!.afterReadOne(record, session) : undefined;

                this.checkRecordSingularity(record, hooks!.shouldRaiseRecordExistenceErrors);

                if (isPresent(record))
                {
                    this.checkRecordVersion(record, version);

                    const recordVersion: number = record[this.config.commonProperties.version] as number;

                    mutation = {
                        ...mutation,
                        [this.config.commonProperties.version]: recordVersion + 1,
                        [this.config.commonProperties.updated_at]: new Date(),
                    } as TMutation;

                    isPresent(hooks!.beforeUpdateOne) ? await hooks!.beforeUpdateOne(record, mutation, session) : undefined;
                    record = await this.repository.updateOne({[this.config.commonProperties._id]: _id, [this.config.commonProperties.version]: version, [this.config.commonProperties.is_soft_deleted]: false} as TPredicate, mutation, this.toContext(session));
                    isPresent(hooks!.afterUpdateOne) ? await hooks!.afterUpdateOne(record, session) : undefined;

                    if (!hooks!.shouldKeepForbiddenFields && isPresent(record))
                    {
                        this.removeForbiddenFields(record);
                    }
                }
            },
            externalSession,
            internalSession,
        );

        return record;
    }

    public async softDeleteOne (predicate: TPredicate, externalSession?: TSession, hooks?: SoftDeleteOneHooks<TRecord, TPredicate, TMutation, TSession>): Promise<TRecord | null>
    {
        hooks = hooks ?? {};
        hooks.bearer = hooks.bearer ?? {};

        (predicate as Record<string, unknown>)[this.config.commonProperties.is_soft_deleted] = false;

        let record!: TRecord | null;
        const {session, internalSession} = this.session.start(externalSession, hooks.isSessionEnabled);
        await this.session.withTransaction(
            async (): Promise<void> =>
            {
                isPresent(hooks!.beforeReadMany) ? await hooks!.beforeReadMany(predicate, session) : undefined;
                const records: TRecord[] = await this.repository.readMany(predicate, this.toContext(session));
                isPresent(hooks!.afterReadMany) ? await hooks!.afterReadMany(records, session) : undefined;

                record = this.checkRecordsSingularity(records, hooks!.shouldRaiseRecordExistenceErrors);

                if (isPresent(record))
                {
                    const recordVersion: number = record[this.config.commonProperties.version] as number;

                    const softDeleteMutation: TMutation = {
                        [this.config.commonProperties.version]: recordVersion + 1,
                        [this.config.commonProperties.is_soft_deleted]: true,
                        [this.config.commonProperties.soft_deleted_at]: new Date(),
                    } as unknown as TMutation;

                    isPresent(hooks!.beforeUpdateOne) ? await hooks!.beforeUpdateOne(record, softDeleteMutation, session) : undefined;
                    record = await this.repository.updateOne({[this.config.commonProperties._id]: record[this.config.commonProperties._id], [this.config.commonProperties.version]: recordVersion} as TPredicate, softDeleteMutation, this.toContext(session));
                    isPresent(hooks!.afterUpdateOne) ? await hooks!.afterUpdateOne(record, session) : undefined;

                    if (!hooks!.shouldKeepForbiddenFields && isPresent(record))
                    {
                        this.removeForbiddenFields(record);
                    }
                }
            },
            externalSession,
            internalSession,
        );

        return record;
    }

    public async softDeleteOneByIdAndVersion (_id: unknown, version: number, externalSession?: TSession, hooks?: SoftDeleteOneByIdAndVersionHooks<TRecord, TMutation, TSession>): Promise<TRecord | null>
    {
        hooks = hooks ?? {};
        hooks.bearer = hooks.bearer ?? {};

        let record!: TRecord | null;
        const {session, internalSession} = this.session.start(externalSession, hooks.isSessionEnabled);
        await this.session.withTransaction(
            async (): Promise<void> =>
            {
                isPresent(hooks!.beforeReadOne) ? await hooks!.beforeReadOne(_id, version, session) : undefined;
                record = await this.repository.readOne({[this.config.commonProperties._id]: _id, [this.config.commonProperties.is_soft_deleted]: false} as TPredicate, this.toContext(session));
                isPresent(hooks!.afterReadOne) ? await hooks!.afterReadOne(record, session) : undefined;

                this.checkRecordSingularity(record, hooks!.shouldRaiseRecordExistenceErrors);

                if (isPresent(record))
                {
                    this.checkRecordVersion(record, version);

                    const recordVersion: number = record[this.config.commonProperties.version] as number;

                    const softDeleteMutation: TMutation = {
                        [this.config.commonProperties.version]: recordVersion + 1,
                        [this.config.commonProperties.is_soft_deleted]: true,
                        [this.config.commonProperties.soft_deleted_at]: new Date(),
                    } as unknown as TMutation;

                    isPresent(hooks!.beforeUpdateOne) ? await hooks!.beforeUpdateOne(record, softDeleteMutation, session) : undefined;
                    record = await this.repository.updateOne({[this.config.commonProperties._id]: _id, [this.config.commonProperties.version]: version, [this.config.commonProperties.is_soft_deleted]: false} as TPredicate, softDeleteMutation, this.toContext(session));
                    isPresent(hooks!.afterUpdateOne) ? await hooks!.afterUpdateOne(record, session) : undefined;

                    if (!hooks!.shouldKeepForbiddenFields && isPresent(record))
                    {
                        this.removeForbiddenFields(record);
                    }
                }
            },
            externalSession,
            internalSession,
        );

        return record;
    }

    public async deleteOne (predicate: TPredicate, externalSession?: TSession, hooks?: DeleteOneHooks<TRecord, TPredicate, TSession>): Promise<TRecord | null>
    {
        hooks = hooks ?? {};
        hooks.bearer = hooks.bearer ?? {};

        (predicate as Record<string, unknown>)[this.config.commonProperties.is_soft_deleted] = false;

        let record!: TRecord | null;
        const {session, internalSession} = this.session.start(externalSession, hooks.isSessionEnabled);
        await this.session.withTransaction(
            async (): Promise<void> =>
            {
                isPresent(hooks!.beforeReadMany) ? await hooks!.beforeReadMany(predicate, session) : undefined;
                const records: TRecord[] = await this.repository.readMany(predicate, this.toContext(session));
                isPresent(hooks!.afterReadMany) ? await hooks!.afterReadMany(records, session) : undefined;

                record = this.checkRecordsSingularity(records, hooks!.shouldRaiseRecordExistenceErrors);

                if (isPresent(record))
                {
                    const recordVersion: number = record[this.config.commonProperties.version] as number;

                    isPresent(hooks!.beforeDeleteOne) ? await hooks!.beforeDeleteOne(record, session) : undefined;
                    record = await this.repository.deleteOne({[this.config.commonProperties._id]: record[this.config.commonProperties._id], [this.config.commonProperties.version]: recordVersion} as TPredicate, this.toContext(session));
                    isPresent(hooks!.afterDeleteOne) ? await hooks!.afterDeleteOne(record, session) : undefined;

                    if (!hooks!.shouldKeepForbiddenFields && isPresent(record))
                    {
                        this.removeForbiddenFields(record);
                    }
                }
            },
            externalSession,
            internalSession,
        );

        return record;
    }

    public async deleteOneByIdAndVersion (_id: unknown, version: number, externalSession?: TSession, hooks?: DeleteOneByIdAndVersionHooks<TRecord, TSession>): Promise<TRecord | null>
    {
        hooks = hooks ?? {};
        hooks.bearer = hooks.bearer ?? {};

        let record!: TRecord | null;
        const {session, internalSession} = this.session.start(externalSession, hooks.isSessionEnabled);
        await this.session.withTransaction(
            async (): Promise<void> =>
            {
                isPresent(hooks!.beforeReadOne) ? await hooks!.beforeReadOne(_id, version, session) : undefined;
                record = await this.repository.readOne({[this.config.commonProperties._id]: _id, [this.config.commonProperties.is_soft_deleted]: false} as TPredicate, this.toContext(session));
                isPresent(hooks!.afterReadOne) ? await hooks!.afterReadOne(record, session) : undefined;

                this.checkRecordSingularity(record, hooks!.shouldRaiseRecordExistenceErrors);

                if (isPresent(record))
                {
                    this.checkRecordVersion(record, version);

                    isPresent(hooks!.beforeDeleteOne) ? await hooks!.beforeDeleteOne(record, session) : undefined;
                    record = await this.repository.deleteOne({[this.config.commonProperties._id]: _id, [this.config.commonProperties.version]: version, [this.config.commonProperties.is_soft_deleted]: false} as TPredicate, this.toContext(session));
                    isPresent(hooks!.afterDeleteOne) ? await hooks!.afterDeleteOne(record, session) : undefined;

                    if (!hooks!.shouldKeepForbiddenFields && isPresent(record))
                    {
                        this.removeForbiddenFields(record);
                    }
                }
            },
            externalSession,
            internalSession,
        );

        return record;
    }
}

export default Service;

export type {
    ServiceArgs,
    ServiceDeps,
    ServiceOptions,
    ServiceConfig,

    FieldSchema,

    CountHooks,
    ReadManyHooks,
    ReadOneHooks,
    ReadOneByIdHooks,
    ReadOneByIdAndVersionHooks,
    CreateOneHooks,
    UpdateOneHooks,
    UpdateOneByIdAndVersionHooks,
    SoftDeleteOneHooks,
    SoftDeleteOneByIdAndVersionHooks,
    DeleteOneHooks,
    DeleteOneByIdAndVersionHooks,
};
