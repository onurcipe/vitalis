import HttpError from "./HttpError.js";

class HttpConflictError extends HttpError
{
    public constructor (code?: string, message?: string)
    {
        super(
            409,
            code ?? "HTTP-CONFLICT",
            message ?? "Resource state conflict.",
        );
    }
}

export default HttpConflictError;
