import VitalisError from "./VitalisError.js";

class AbortError extends VitalisError
{
    public constructor (code?: string, message?: string)
    {
        super(
            code ?? "ABORT",
            message ?? "Mission aborted.",
        );
    }
}

export default AbortError;
