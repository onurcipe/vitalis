import {isObject} from "@onurcipe/facilis";

import type {Request, Response} from "express";

import type HttpError from "../../../error/http/HttpError.js";
import HttpBadRequestError from "../../../error/http/HttpBadRequestError.js";
import HttpForbiddenError from "../../../error/http/HttpForbiddenError.js";
import Controller from "../../../core/Controller.js";
import type {ControllerArgs, Schema, ErrorResponseBody} from "../../../core/Controller.js";

type RequestElementName =
    "headers" | "pathParameters" | "queryString" | "body";

type RequestSchema =
    {
        [E in RequestElementName | `.${RequestElementName}`]?: Schema;
    };

type ParsedRequest =
    {
        [E in RequestElementName]?: unknown;
    };

class ExpressAdapter extends Controller
{
    private static readonly REQUEST_ELEMENT_MAP: Record<RequestElementName, (request: Request) => unknown> =
        {
            headers: (request: Request): unknown => request.headers,
            pathParameters: (request: Request): unknown => request.params,
            queryString: (request: Request): unknown => request.query,
            body: (request: Request): unknown => request.body,
        };

    public constructor (args?: ControllerArgs)
    {
        super(args);
    }

    public parseRequest (request: Request, schema: RequestSchema): ParsedRequest
    {
        const parsedRequest: ParsedRequest = {};

        const requestElementNames: RequestElementName[] = ["headers", "pathParameters", "queryString", "body"];

        for (const requestElementName of requestElementNames)
        {
            const requiredKey: string = requestElementName;
            const optionalKey: string = `.${requestElementName}`;

            const isRequired: boolean = requiredKey in schema;
            const isOptional: boolean = optionalKey in schema;
            const isForbidden: boolean = !isRequired && !isOptional;

            const sentValue: unknown = ExpressAdapter.REQUEST_ELEMENT_MAP[requestElementName](request);
            const isSent: boolean = ExpressAdapter.isRequestElementSent(sentValue);

            if (isForbidden)
            {
                if (isSent)
                {
                    throw new HttpForbiddenError("REQUEST_ELEMENT-FORBIDDEN", `Request element ${requestElementName} is not allowed.`);
                }

                continue;
            }

            if (isRequired)
            {
                if (!isSent)
                {
                    throw new HttpBadRequestError("REQUEST_ELEMENT-REQUIRED_NOT_SENT", `Request element ${requestElementName} is required but was not sent.`);
                }

                const requestElementSchema: Schema = schema[requiredKey as keyof RequestSchema]!;
                parsedRequest[requestElementName] = this.parseField(sentValue, requestElementSchema);
                continue;
            }

            if (isOptional)
            {
                if (!isSent)
                {
                    continue;
                }

                const requestElementSchema: Schema = schema[optionalKey as keyof RequestSchema]!;
                parsedRequest[requestElementName] = this.parseField(sentValue, requestElementSchema);
                continue;
            }
        }

        return parsedRequest;
    }

    public sendResponse (response: Response, statusCode: number, data?: unknown): void
    {
        if (data !== undefined)
        {
            response.status(statusCode).json(data);
        }
        else
        {
            response.status(statusCode).end();
        }
    }

    public sendErrorResponse (response: Response, error: unknown): void
    {
        const httpError: HttpError = this.toHttpError(error);
        const body: ErrorResponseBody = this.toErrorResponseBody(httpError);

        response.status(httpError.statusCode).json(body);
    }

    private static isRequestElementSent (value: unknown): boolean
    {
        if (value === undefined)
        {
            return false;
        }

        if (isObject(value) && Object.keys(value).length === 0)
        {
            return false;
        }

        return true;
    }
}

export default ExpressAdapter;

export type {
    RequestElementName,
    RequestSchema,
    ParsedRequest,
};
