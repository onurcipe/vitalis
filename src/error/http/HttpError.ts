import VitalisError from "../VitalisError.js";

class HttpError extends VitalisError
{
    public readonly statusCode: number;

    public constructor (statusCode?: number, code?: string, message?: string)
    {
        super(
            code ?? "HTTP",
            message ?? "Something went wrong, but I'm not telling you what.",
        );

        this.statusCode = statusCode ?? 500;
    }
}

export default HttpError;
