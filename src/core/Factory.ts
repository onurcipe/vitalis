type Factory<TProduct, TDeps, TOptions = void> =
    (args: FactoryArgs<TDeps, TOptions>) => TProduct;

type FactoryArgs<TDeps, TOptions> =
    TOptions extends void
    ? {deps: TDeps}
    : {deps: TDeps; options: TOptions};

export type {
    Factory,

    FactoryArgs,
};
