interface Transport
{
    start (): Promise<void>;

    stop (gracefulTimeout?: number): Promise<void>;
}

export type {
    Transport,
};
