import VitalisError from "../VitalisError.js";

class RecordMultipleFoundError extends VitalisError
{
    public constructor (code?: string, message?: string)
    {
        super(
            code ?? "RECORD-MULTIPLE_FOUND",
            message ?? "Multiple records were found when only one was expected.",
        );
    }
}

export default RecordMultipleFoundError;
