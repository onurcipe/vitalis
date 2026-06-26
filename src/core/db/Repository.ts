interface Repository<
    TRecord extends Record<string, unknown> = Record<string, unknown>,
    TPredicate = unknown,
    TMutation = Partial<TRecord>,
    TContext = undefined
>
{
    count (predicate: TPredicate, context?: TContext): Promise<number>;

    readMany (predicate: TPredicate, context?: TContext): Promise<TRecord[]>;

    readOne (predicate: TPredicate, context?: TContext): Promise<TRecord | null>;

    createOne (record: TRecord, context?: TContext): Promise<TRecord>;

    createMany (records: TRecord[], context?: TContext): Promise<TRecord[]>;

    updateOne (predicate: TPredicate, mutation: TMutation, context?: TContext): Promise<TRecord | null>;

    updateMany (predicate: TPredicate, mutation: TMutation, context?: TContext): Promise<TRecord[]>;

    deleteOne (predicate: TPredicate, context?: TContext): Promise<TRecord | null>;

    deleteMany (predicate: TPredicate, context?: TContext): Promise<TRecord[]>;
}

export type {
    Repository,
};
