import HttpError from "./HttpError.js";

class HttpInternalServerError extends HttpError
{
    public constructor (code?: string, message?: string)
    {
        super(
            500,
            code ?? "HTTP-INTERNAL_SERVER",
            message ?? "We failed to process your valid request.",
        );
    }
}

export default HttpInternalServerError;
