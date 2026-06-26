// error/

// -- vitalis error
export {default as VitalisError} from "./error/VitalisError.js";

// -- framework error
export {default as FrameworkError} from "./error/FrameworkError.js";

// -- user error
export {default as UserError} from "./error/UserError.js";

// -- abort error
export {default as AbortError} from "./error/AbortError.js";

// -- record/

// ---- record not found error
export {default as RecordNotFoundError} from "./error/record/RecordNotFoundError.js";

// ---- record multiple found error
export {default as RecordMultipleFoundError} from "./error/record/RecordMultipleFoundError.js";

// ---- record version mismatch error
export {default as RecordVersionMismatchError} from "./error/record/RecordVersionMismatchError.js";

// -- http/

// ---- http error
export {default as HttpError} from "./error/http/HttpError.js";

// ---- http bad request error
export {default as HttpBadRequestError} from "./error/http/HttpBadRequestError.js";

// ---- http unauthorized error
export {default as HttpUnauthorizedError} from "./error/http/HttpUnauthorizedError.js";

// ---- http forbidden error
export {default as HttpForbiddenError} from "./error/http/HttpForbiddenError.js";

// ---- http not found error
export {default as HttpNotFoundError} from "./error/http/HttpNotFoundError.js";

// ---- http conflict error
export {default as HttpConflictError} from "./error/http/HttpConflictError.js";

// ---- http internal server error
export {default as HttpInternalServerError} from "./error/http/HttpInternalServerError.js";

// core/

// -- registry
export {default as Registry} from "./core/Registry.js";
export type {
    RegistryToken,
} from "./core/Registry.js";

// -- logger
export {default as Logger} from "./core/Logger.js";
export type {
    LoggerOptions,
    LoggerConfig,

    LogTarget,
    LogLevel,
} from "./core/Logger.js";

// -- aborter
export {default as Aborter} from "./core/Aborter.js";

// -- factory
export type {
    Factory,

    FactoryArgs,
} from "./core/Factory.js";

// -- connector
export type {
    Connector,
} from "./core/Connector.js";

// -- transport
export type {
    Transport,
} from "./core/Transport.js";

// -- runtime
export {default as Runtime} from "./core/Runtime.js";
export type {
    RuntimeArgs,
    RuntimeDeps,
    RuntimeOptions,
    RuntimeConfig,

    RuntimeInitHook,
    RuntimeConnectorCreator,
    RuntimeTransportCreator,
    RuntimeReadyHook,

    RuntimeState,
} from "./core/Runtime.js";

// infra/

// -- connector/

// ---- mongodb/

// ------ mongodb connector
export {default as MongoDBConnector} from "./infra/connector/mongodb/MongoDBConnector.js";
export type {
    MongoDBConnectorArgs,
    MongoDBConnectorDeps,
    MongoDBConnectorOptions,
    MongoDBConnectorConfig,

    MongoDBClientOptions,

    MongoDBConnectorState,
} from "./infra/connector/mongodb/MongoDBConnector.js";

// ------ mongodb connector factory
export {default as createMongoDBConnector} from "./infra/connector/mongodb/MongoDBConnectorFactory.js";
export type {
    MongoDBConnectorFactory,

    MongoDBConnectorFactoryArgs,
} from "./infra/connector/mongodb/MongoDBConnectorFactory.js";

// -- transport/

// ---- http/

// ------ http transport
export {default as HttpTransport} from "./infra/transport/http/HttpTransport.js";
export type {
    HttpTransportArgs,
    HttpTransportDeps,
    HttpTransportOptions,
    HttpTransportConfig,

    HttpServerOptions,
    HttpsServerOptions,

    HttpTransportState,
} from "./infra/transport/http/HttpTransport.js";

// ------ http transport factory
export {default as createHttpTransport} from "./infra/transport/http/HttpTransportFactory.js";
export type {
    HttpTransportFactory,

    HttpTransportFactoryArgs,
} from "./infra/transport/http/HttpTransportFactory.js";

// core/

// -- db/

// ---- repository
export type {
    Repository,
} from "./core/db/Repository.js";

// ---- session
export type {
    Session,
} from "./core/db/Session.js";

// infra/

// -- db/

// ---- mongodb/

// ------ mongodb data type
export {default as MongoDBDataType} from "./infra/db/mongodb/MongoDBDataType.js";
export type {
    MongoDBBsonTypeName,
} from "./infra/db/mongodb/MongoDBDataType.js";

// ------ mongodb model
export {default as MongoDBModel} from "./infra/db/mongodb/MongoDBModel.js";
export type {
    MongoDBModelArgs,
    MongoDBModelOptions,
    MongoDBModelConfig,

    MongoDBModelDefinition,
    MongoDBJsonSchema,
} from "./infra/db/mongodb/MongoDBModel.js";

// ------ mongodb gateway
export {default as MongoDBGateway} from "./infra/db/mongodb/MongoDBGateway.js";
export type {
    MongoDBGatewayArgs,
    MongoDBGatewayDeps,
    MongoDBGatewayOptions,
    MongoDBGatewayConfig,
} from "./infra/db/mongodb/MongoDBGateway.js";

// ------ mongodb repository
export {default as MongoDBRepository} from "./infra/db/mongodb/MongoDBRepository.js";
export type {
    MongoDBRepositoryArgs,
    MongoDBRepositoryDeps,

    MongoDBContext,
    MongoDBDottedObject,
} from "./infra/db/mongodb/MongoDBRepository.js";

// ------ mongodb session
export {default as MongoDBSession} from "./infra/db/mongodb/MongoDBSession.js";
export type {
    MongoDBSessionArgs,
    MongoDBSessionDeps,
    MongoDBSessionOptions,
} from "./infra/db/mongodb/MongoDBSession.js";

// core/

// -- service
export {default as Service} from "./core/Service.js";
export type {
    ServiceArgs,
    ServiceDeps,
    ServiceOptions,
    ServiceConfig,

    FieldSchema,

    CountHooks,
    ReadManyHooks,
    ReadOneHooks,
    ReadOneByIdHooks,
    ReadOneByIdAndVersionHooks,
    CreateOneHooks,
    UpdateOneHooks,
    UpdateOneByIdAndVersionHooks,
    SoftDeleteOneHooks,
    SoftDeleteOneByIdAndVersionHooks,
    DeleteOneHooks,
    DeleteOneByIdAndVersionHooks,
} from "./core/Service.js";

// -- controller
export {default as Controller} from "./core/Controller.js";
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
} from "./core/Controller.js";

// infra/

// -- web/

// ---- express/

// ------ express adapter
export {default as ExpressAdapter} from "./infra/web/express/ExpressAdapter.js";
export type {
    RequestElementName,
    RequestSchema,
    ParsedRequest,
} from "./infra/web/express/ExpressAdapter.js";
