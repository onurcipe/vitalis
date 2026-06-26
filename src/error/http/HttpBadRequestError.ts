import HttpError from "./HttpError.js";

class HttpBadRequestError extends HttpError
{
    public constructor (code?: string, message?: string)
    {
        super(
            400,
            code ?? "HTTP-BAD_REQUEST",
            message ?? "Request is invalid.",
        );
    }
}

export default HttpBadRequestError;
