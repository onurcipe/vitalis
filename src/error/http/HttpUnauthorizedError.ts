import HttpError from "./HttpError.js";

class HttpUnauthorizedError extends HttpError
{
    public constructor (code?: string, message?: string)
    {
        super(
            401,
            code ?? "HTTP-UNAUTHORIZED",
            message ?? "Authentication required.",
        );
    }
}

export default HttpUnauthorizedError;
