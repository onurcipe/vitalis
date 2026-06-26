import VitalisError from "../VitalisError.js";

class RecordVersionMismatchError extends VitalisError
{
    public constructor (code?: string, message?: string)
    {
        super(
            code ?? "RECORD-VERSION_MISMATCH",
            message ?? "Record was modified after you last read it.",
        );
    }
}

export default RecordVersionMismatchError;
