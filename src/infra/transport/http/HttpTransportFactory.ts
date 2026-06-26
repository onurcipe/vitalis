import type {Factory, FactoryArgs} from "../../../core/Factory.js";
import HttpTransport from "./HttpTransport.js";
import type {HttpTransportDeps, HttpTransportOptions} from "./HttpTransport.js";

type HttpTransportFactory =
    Factory<HttpTransport, HttpTransportDeps, HttpTransportOptions>;

type HttpTransportFactoryArgs =
    FactoryArgs<HttpTransportDeps, HttpTransportOptions>;

const createHttpTransport: HttpTransportFactory =
    (args: HttpTransportFactoryArgs): HttpTransport =>
    {
        return new HttpTransport(args);
    };

export default createHttpTransport;

export type {
    HttpTransportFactory,

    HttpTransportFactoryArgs,
};
