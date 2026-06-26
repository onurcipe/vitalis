import {isPresent, formatUtcDate, formatUtcTime} from "@onurcipe/facilis";

import VitalisError from "../error/VitalisError.js";
import UserError from "../error/UserError.js";

type LoggerOptions =
    {
        isEnabled?: boolean;
        verbosity?: number; // non-negative integer
        targets?: LogTarget[];
    };

type LoggerConfig =
    {
        isEnabled: boolean;
        verbosity: number;
        targets: LogTarget[];
    };

type LogTarget =
    "console";

type LogLevel =
    "info" | "warning" | "error";

class Logger
{
    private readonly config: LoggerConfig;

    public constructor (options?: LoggerOptions)
    {
        if (isPresent(options?.verbosity) && (!Number.isSafeInteger(options.verbosity) || options.verbosity < 0))
        {
            throw new UserError("LOGGER-VERBOSITY-INVALID", "Logger verbosity must be a non-negative integer.");
        }

        this.config = {
            isEnabled: options?.isEnabled ?? true,
            verbosity: options?.verbosity ?? 0,
            targets: options?.targets ?? ["console"],
        };
    }

    public log (verbosity: number, level: LogLevel, payload: unknown): void
    {
        try
        {
            if (!this.config.isEnabled)
            {
                return;
            }

            if (verbosity > this.config.verbosity)
            {
                return;
            }

            const timestamp: number = Date.now();

            for (const target of this.config.targets)
            {
                switch (target)
                {
                    case "console":
                    {
                        this.logToConsole(timestamp, level, payload);
                        break;
                    }
                }
            }
        }
        catch (error: unknown)
        {
            // Logger must never crash the app.
        }
    }

    private logToConsole (timestamp: number, level: LogLevel, payload: unknown): void
    {
        const timestampText: string = `${formatUtcDate(timestamp)} ${formatUtcTime(timestamp)} UTC`;
        const levelText: string = level.toUpperCase();

        let payloadText: string = "";

        if (isPresent(payload))
        {
            payloadText = payload instanceof VitalisError ? payload.toString() : String(payload);
        }

        const message: string = `${timestampText}: [${levelText}] ${payloadText}`;

        switch (level)
        {
            case "info":
            {
                console.info(message);
                break;
            }
            case "warning":
            {
                console.warn(message);
                break;
            }
            case "error":
            {
                console.error(message);
                break;
            }
        }
    }
}

export default Logger;

export type {
    LoggerOptions,
    LoggerConfig,

    LogTarget,
    LogLevel,
};
