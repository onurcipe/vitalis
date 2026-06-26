import HttpError from "./HttpError.js";

class HttpForbiddenError extends HttpError
{
    public constructor (code?: string, message?: string)
    {
        super(
            403,
            code ?? "HTTP-FORBIDDEN",
            message ?? "Access denied.",
        );
    }
}

export default HttpForbiddenError;
