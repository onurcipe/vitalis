import {isPresent, isBoolean, toBoolean, isNumber, toNumber, isString, toString, isDate, toDate, isObject, isArray} from "@onurcipe/facilis";

import VitalisError from "../error/VitalisError.js";
import FrameworkError from "../error/FrameworkError.js";
import UserError from "../error/UserError.js";
import RecordNotFoundError from "../error/record/RecordNotFoundError.js";
import RecordMultipleFoundError from "../error/record/RecordMultipleFoundError.js";
import RecordVersionMismatchError from "../error/record/RecordVersionMismatchError.js";
import HttpError from "../error/http/HttpError.js";
import HttpBadRequestError from "../error/http/HttpBadRequestError.js";
import HttpForbiddenError from "../error/http/HttpForbiddenError.js";
import HttpNotFoundError from "../error/http/HttpNotFoundError.js";
import HttpConflictError from "../error/http/HttpConflictError.js";
import HttpInternalServerError from "../error/http/HttpInternalServerError.js";

type ControllerArgs =
    {
        options?: ControllerOptions;
    };

type ControllerOptions =
    {
        parseId?: (value: unknown) => unknown;
    };

type ControllerConfig =
    {
        parseId: (value: unknown) => unknown;
    };

type Schema =
    | DataTypeAny
    | DataTypeNull
    | DataTypePrimitive
    | DataTypeObject
    | DataTypeArray;

type DataTypeAny =
    "*";

type DataTypeNull =
    "Null";

type DataTypePrimitive =
    "Boolean" | "Number" | "String" | "Date" | "Id";

type DataTypeObject =
    {
        [field: string]: Schema;
    };

type DataTypeArray =
    Schema[];

type ExpectedDataType =
    "Any" | "Null" | "Primitive" | "Object" | "Array";

type SentDataType =
    "Undefined" | "Null" | "Primitive" | "Object" | "Array";

type ErrorResponseBody =
    {
        code: string;
        message: string;
    };

class Controller
{
    protected readonly config: ControllerConfig;

    public constructor (args?: ControllerArgs)
    {
        const options: ControllerOptions = args?.options ?? {};
        this.config = {
            parseId: options.parseId ?? ((value: unknown): unknown => value),
        };
    }

    public parseField (sentValue: unknown, schema: Schema, isOptional: boolean = false): unknown
    {
        const sentDataType: SentDataType = Controller.getSentDataType(sentValue);
        const expectedDataType: ExpectedDataType = Controller.getExpectedDataType(schema);

        if (sentDataType === "Undefined")
        {
            if (isOptional)
            {
                return undefined;
            }
            else
            {
                throw new HttpBadRequestError("FIELD-REQUIRED_NOT_SENT", "Field is required but was not sent.");
            }
        }

        if (expectedDataType === "Any")
        {
            return sentValue;
        }

        if (isOptional && sentDataType === "Null")
        {
            return null;
        }

        switch (expectedDataType)
        {
            case "Null":
            {
                if (sentDataType !== "Null")
                {
                    throw new HttpBadRequestError("FIELD-INVALID-MUST_BE_NULL", "Expected a null but something else was sent.");
                }

                return null;
            }
            case "Primitive":
            {
                if (sentDataType !== "Primitive")
                {
                    throw new HttpBadRequestError("FIELD-INVALID-MUST_BE_PRIMITIVE", "Expected a primitive but something else was sent.");
                }

                return this.parsePrimitive(sentValue, schema as DataTypePrimitive);
            }
            case "Object":
            {
                if (sentDataType !== "Object")
                {
                    throw new HttpBadRequestError("FIELD-INVALID-MUST_BE_OBJECT", "Expected an object but something else was sent.");
                }

                return this.parseObject(sentValue as Record<string, unknown>, schema as DataTypeObject);
            }
            case "Array":
            {
                if (sentDataType !== "Array")
                {
                    throw new HttpBadRequestError("FIELD-INVALID-MUST_BE_ARRAY", "Expected an array but something else was sent.");
                }

                return this.parseArray(sentValue as unknown[], schema as DataTypeArray);
            }
        }
    }

    private parsePrimitive (value: unknown, schema: DataTypePrimitive): unknown
    {
        switch (schema)
        {
            case "Boolean":
            {
                const parsed: boolean | null = toBoolean(value);

                if (isBoolean(parsed))
                {
                    return parsed;
                }

                throw new HttpBadRequestError("FIELD-INVALID-MUST_BE_BOOLEAN", "Expected a boolean but something else was sent.");
            }
            case "Number":
            {
                const parsed: number | null = toNumber(value);

                if (isNumber(parsed))
                {
                    return parsed;
                }

                throw new HttpBadRequestError("FIELD-INVALID-MUST_BE_NUMBER", "Expected a number but something else was sent.");
            }
            case "String":
            {
                const parsed: string | null = toString(value);

                if (isString(parsed))
                {
                    return parsed;
                }

                throw new HttpBadRequestError("FIELD-INVALID-MUST_BE_STRING", "Expected a string but something else was sent.");
            }
            case "Date":
            {
                const parsed: Date | null = toDate(value);

                if (isDate(parsed))
                {
                    return parsed;
                }

                throw new HttpBadRequestError("FIELD-INVALID-MUST_BE_DATE", "Expected a date but something else was sent.");
            }
            case "Id":
            {
                return this.config.parseId(value);
            }
        }
    }

    private parseObject (sentObject: Record<string, unknown>, schema: DataTypeObject): Record<string, unknown>
    {
        const sentFields: Set<string> = new Set(Object.keys(sentObject));
        const schemaFields: string[] = Object.keys(schema);

        if (schemaFields.length === 0)
        {
            throw new UserError("CONTROLLER-FIELD-OBJECT-EMPTY", "Schema when object must have at least 1 field.");
        }

        for (const sentField of sentFields)
        {
            if (!schemaFields.includes(sentField) && !schemaFields.includes(`.${sentField}`))
            {
                throw new HttpForbiddenError("FIELD-NOT_ALLOWED_SENT", `Field ${sentField} is not allowed.`);
            }
        }

        const parsedObject: Record<string, unknown> = {};

        for (const schemaField of schemaFields)
        {
            const isOptional: boolean = schemaField.startsWith(".");
            const fieldName: string = isOptional ? schemaField.slice(1) : schemaField;
            const fieldValue: unknown = sentObject[fieldName];
            const fieldSchema: Schema = schema[schemaField]!;

            const result: unknown = this.parseField(fieldValue, fieldSchema, isOptional);

            if (result !== undefined)
            {
                parsedObject[fieldName] = result;
            }
        }

        return parsedObject;
    }

    private parseArray (sentArray: unknown[], schema: DataTypeArray): unknown[]
    {
        if (schema.length !== 1 || !isPresent(schema[0]))
        {
            throw new UserError("CONTROLLER-FIELD-ARRAY-EMPTY", "Schema when array must have exactly 1 field.");
        }

        const parsedArray: unknown[] = [];

        for (let i: number = 0; i < sentArray.length; i++)
        {
            const fieldValue: unknown = sentArray[i];
            const fieldSchema: Schema = schema[0];

            parsedArray.push(this.parseField(fieldValue, fieldSchema));
        }

        return parsedArray;
    }

    public toHttpError (error: unknown): HttpError
    {
        if (error instanceof HttpError)
        {
            return error;
        }

        if (error instanceof FrameworkError)
        {
            return new HttpInternalServerError(error.code, error.message);
        }

        if (error instanceof UserError)
        {
            return new HttpInternalServerError(error.code, error.message);
        }

        if (error instanceof RecordNotFoundError)
        {
            return new HttpNotFoundError(error.code, error.message);
        }

        if (error instanceof RecordMultipleFoundError)
        {
            return new HttpConflictError(error.code, error.message);
        }

        if (error instanceof RecordVersionMismatchError)
        {
            return new HttpConflictError(error.code, error.message);
        }

        if (error instanceof VitalisError)
        {
            return new HttpInternalServerError(error.code, error.message);
        }

        if (error instanceof Error)
        {
            return new HttpInternalServerError(undefined, error.message);
        }

        return new HttpInternalServerError();
    }

    public toErrorResponseBody (error: HttpError): ErrorResponseBody
    {
        return {
            code: error.code,
            message: error.message,
        };
    }

    private static getSentDataType (sentValue: unknown): SentDataType
    {
        if (sentValue === undefined)
        {
            return "Undefined";
        }

        if (sentValue === null)
        {
            return "Null";
        }

        if (isObject(sentValue))
        {
            return "Object";
        }

        if (isArray(sentValue))
        {
            return "Array";
        }

        return "Primitive";
    }

    private static getExpectedDataType (schema: Schema): ExpectedDataType
    {
        if (isString(schema))
        {
            switch (schema)
            {
                case "*":
                {
                    return "Any";
                }
                case "Null":
                {
                    return "Null";
                }
                case "Boolean":
                case "Number":
                case "String":
                case "Date":
                {
                    return "Primitive";
                }
                case "Id":
                {
                    return "Primitive";
                }
            }
        }

        if (isObject(schema))
        {
            return "Object";
        }

        if (isArray(schema))
        {
            return "Array";
        }

        throw new UserError("CONTROLLER-DATA_TYPE-INVALID", "Schema data type is invalid.");
    }
}

export default Controller;

export type {
    ControllerArgs,
    ControllerOptions,
    ControllerConfig,

    Schema,
    DataTypeAny,
    DataTypeNull,
    DataTypePrimitive,
    DataTypeObject,
    DataTypeArray,

    ExpectedDataType,
    SentDataType,

    ErrorResponseBody,
};
