import HttpError from "./HttpError.js";

class HttpNotFoundError extends HttpError
{
    public constructor (code?: string, message?: string)
    {
        super(
            404,
            code ?? "HTTP-NOT_FOUND",
            message ?? "Resource not found.",
        );
    }
}

export default HttpNotFoundError;
