type MongoDBBsonTypeName =
    "null" |
    "bool" |
    "int" | "long" | "double" | "decimal" |
    "string" |
    "binData" |
    "date" | "timestamp" |
    "regex" |
    "javascript" |
    "objectId" |
    "object" | "array";

class MongoDBDataType
{
    protected constructor () {}

    public static readonly Null: "null" = "null" satisfies MongoDBBsonTypeName;

    public static readonly Boolean: "bool" = "bool" satisfies MongoDBBsonTypeName;

    public static readonly NumberInt32: "int" = "int" satisfies MongoDBBsonTypeName;
    public static readonly NumberInt64: "long" = "long" satisfies MongoDBBsonTypeName;
    public static readonly NumberFloat64: "double" = "double" satisfies MongoDBBsonTypeName;
    public static readonly NumberFloat128: "decimal" = "decimal" satisfies MongoDBBsonTypeName;

    public static readonly String: "string" = "string" satisfies MongoDBBsonTypeName;

    public static readonly Binary: "binData" = "binData" satisfies MongoDBBsonTypeName;

    public static readonly DateTime: "date" = "date" satisfies MongoDBBsonTypeName;
    public static readonly Timestamp: "timestamp" = "timestamp" satisfies MongoDBBsonTypeName;

    public static readonly Regex: "regex" = "regex" satisfies MongoDBBsonTypeName;

    public static readonly JavaScript: "javascript" = "javascript" satisfies MongoDBBsonTypeName;

    public static readonly Id: "objectId" = "objectId" satisfies MongoDBBsonTypeName;

    public static readonly Object: "object" = "object" satisfies MongoDBBsonTypeName;
    public static readonly Array: "array" = "array" satisfies MongoDBBsonTypeName;
}

export default MongoDBDataType;

export type {
    MongoDBBsonTypeName,
};
