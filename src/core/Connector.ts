interface Connector
{
    connect (): Promise<void>;

    disconnect (): Promise<void>;
}

export type {
    Connector,
};
