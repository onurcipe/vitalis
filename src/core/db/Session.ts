interface Session<TSession = unknown>
{
    start (externalSession?: TSession, isEnabled?: boolean): {session?: TSession; internalSession?: TSession};

    withTransaction (callback: (session?: TSession) => Promise<void>, externalSession?: TSession, internalSession?: TSession): Promise<void>;
}

export type {
    Session,
};
