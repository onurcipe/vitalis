import VitalisError from "./VitalisError.js";

class FrameworkError extends VitalisError
{
    public constructor (code?: string, message?: string)
    {
        super(
            code ?? "FRAMEWORK",
            message ?? "It's not a bug, it's a feature.",
        );
    }
}

export default FrameworkError;
