import VitalisError from "../VitalisError.js";

class RecordNotFoundError extends VitalisError
{
    public constructor (code?: string, message?: string)
    {
        super(
            code ?? "RECORD-NOT_FOUND",
            message ?? "Record was not found. It may have been deleted, or it may have never existed.",
        );
    }
}

export default RecordNotFoundError;
