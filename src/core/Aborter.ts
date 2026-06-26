import {isPresent, isPopulated} from "@onurcipe/facilis";

import AbortError from "../error/AbortError.js";

class Aborter
{
    private controller: AbortController = new AbortController();
    private reason: string | null = null;

    public getSignal (): AbortSignal
    {
        return this.controller.signal;
    }

    public isAborted (): boolean
    {
        return this.controller.signal.aborted;
    }

    public getReason (): string | null
    {
        return this.reason;
    }

    public abort (reason?: string, options?: {isOverride?: boolean}): void
    {
        const isOverride: boolean = options?.isOverride ?? false;

        if (isPopulated(reason) && (!isPresent(this.reason) || isOverride))
        {
            this.reason = reason;
        }

        if (!this.controller.signal.aborted)
        {
            this.controller.abort();
        }
    }

    public reset (): void
    {
        this.controller = new AbortController();
        this.reason = null;
    }

    public async await<T> (promise: Promise<T>): Promise<T>
    {
        const signal: AbortSignal = this.controller.signal;

        if (signal.aborted)
        {
            throw new AbortError();
        }

        return await new Promise<T>(
            (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: unknown) => void): void =>
            {
                const onAbort: () => void = (): void =>
                {
                    signal.removeEventListener("abort", onAbort);
                    reject(new AbortError());
                };

                signal.addEventListener("abort", onAbort, {once: true});

                promise.then(
                    (value: T): void =>
                    {
                        signal.removeEventListener("abort", onAbort);
                        resolve(value);
                    },
                    (error: unknown): void =>
                    {
                        signal.removeEventListener("abort", onAbort);
                        reject(error);
                    },
                );
            },
        );
    }
}

export default Aborter;
