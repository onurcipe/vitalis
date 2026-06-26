type RegistryToken<T = unknown> =
    {
        readonly key: symbol;
    };

class Registry
{
    private readonly items: Map<symbol, unknown> = new Map();

    public static createToken<T = unknown> (description: string): RegistryToken<T>
    {
        return {
            key: Symbol(description),
        };
    }

    public has<T> (token: RegistryToken<T>): boolean
    {
        return this.items.has(token.key);
    }

    public get<T> (token: RegistryToken<T>): T | undefined
    {
        return this.items.get(token.key) as T | undefined;
    }

    public getOrThrow<T> (token: RegistryToken<T>, createError: () => Error): T
    {
        if (!this.items.has(token.key))
        {
            throw createError();
        }

        return this.items.get(token.key) as T;
    }

    public set<T> (token: RegistryToken<T>, value: T): void
    {
        this.items.set(token.key, value);
    }

    public setOnce<T> (token: RegistryToken<T>, value: T, createError: () => Error): void
    {
        if (this.items.has(token.key))
        {
            throw createError();
        }

        this.items.set(token.key, value);
    }

    public getOrSet<T> (token: RegistryToken<T>, createValue: () => T): T
    {
        if (this.items.has(token.key))
        {
            return this.items.get(token.key) as T;
        }

        const value: T = createValue();
        this.items.set(token.key, value);

        return value;
    }

    public delete<T> (token: RegistryToken<T>): boolean
    {
        return this.items.delete(token.key);
    }

    public clear (): void
    {
        this.items.clear();
    }
}

export default Registry;

export type {
    RegistryToken,
};
