type InnerShallowing<Value, Replacement, Replace extends boolean, Allow> =
  Value extends Allow ?
    Value :
    Value extends (readonly (infer U)[]) ?
      Replace extends true ? Replacement : Replacement | InnerShallowing<U, Replacement, Replace, Allow>[] :
      Value extends { [key: string]: any } ?
        Replace extends true ? Replacement : Replacement | { [P in keyof Value]: InnerShallowing<Value[P], Replacement, Replace, Allow> } :
        Value;

export type Shallowing<Value, Replacement, Replace extends boolean = false, Allow = Date> =
  Value extends Array<infer U> ? Array<Shallowing<U, Replacement, Replace, Allow>> :
    Value extends ReadonlyArray<infer U> ? ReadonlyArray<Shallowing<U, Replacement, Replace, Allow>> :
      Value extends { [key: string]: any } ? { [P in keyof Value]: InnerShallowing<Value[P], Replacement, Replace, Allow> } :
        InnerShallowing<Value, Replacement, Replace, Allow>;
