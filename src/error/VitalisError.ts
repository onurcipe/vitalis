import {isPresent} from "@onurcipe/facilis";

class VitalisError extends Error
{
    public readonly code: string;

    public constructor (code?: string, message?: string)
    {
        super(message ?? "It works on my machine.");

        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, VitalisError);
        this.code = code ?? "ERROR";
    }

    public toString (isWithError?: boolean): string
    {
        let result: string = `${this.code}\n${this.message}`;

        if (isWithError && isPresent(this.stack))
        {
            result = `${result}\n${this.stack}`;
        }

        return result;
    }

    public toObject (): Record<string, unknown>
    {
        return {
            code: this.code,
            message: this.message,
            stack: this.stack,
        };
    }
}

export default VitalisError;
