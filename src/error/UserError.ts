import VitalisError from "./VitalisError.js";

class UserError extends VitalisError
{
    public constructor (code?: string, message?: string)
    {
        super(
            code ?? "USER",
            message ?? "PEBKAC detected.",
        );
    }
}

export default UserError;
