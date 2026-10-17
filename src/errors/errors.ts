type Definition = (...args: any[]) => string
type Definitions = Record<string, Definition>
type ValidDefinitions<DefinitionsMap extends Definitions> = {
  [Name in keyof DefinitionsMap]: Parameters<DefinitionsMap[Name]> extends [] | [unknown] ? DefinitionsMap[Name] : never
} & ('Error' extends keyof DefinitionsMap ? never : unknown)
type Args<DefinitionFunction extends Definition> = Parameters<DefinitionFunction>
type Details<DefinitionFunction extends Definition> = Args<DefinitionFunction> extends [infer Value] ? Value : undefined
type ConstructorArgs<DefinitionFunction extends Definition> =
  Args<DefinitionFunction> extends [infer Value] ? [details: Value, cause?: unknown] : [details?: undefined, cause?: unknown]
type ErrorInstance<DefinitionsMap extends Definitions> = {
  [Name in keyof DefinitionsMap]: ErrorBase & { readonly name: Name; readonly details: Details<DefinitionsMap[Name]> }
}[keyof DefinitionsMap]
type ErrorConstructor<DefinitionFunction extends Definition, Name extends string> = new (
  ...args: ConstructorArgs<DefinitionFunction>
) => ErrorBase & {
  readonly name: Name
  readonly details: Details<DefinitionFunction>
}

type Registry<DefinitionsMap extends Definitions> = {
  <Name extends keyof DefinitionsMap & string>(
    name: Name,
    ...args: ConstructorArgs<DefinitionsMap[Name]>
  ): Extract<ErrorInstance<DefinitionsMap>, { name: Name }>
  readonly Error: abstract new (...args: any[]) => ErrorInstance<DefinitionsMap>
} & { readonly [Name in keyof DefinitionsMap]: ErrorConstructor<DefinitionsMap[Name], Name & string> }

abstract class ErrorBase extends Error {
  override readonly name: string = 'Error'
  readonly details: unknown = undefined
}

/** Create a callable registry of named Error constructors. */
export function errors<const DefinitionsMap extends Definitions>(
  definitions: DefinitionsMap & ValidDefinitions<DefinitionsMap>,
): Registry<DefinitionsMap> {
  if (Object.hasOwn(definitions, 'Error')) throw new TypeError('Error is reserved for the registry base')
  const Base = class extends ErrorBase {}
  const constructors = Object.create(null) as Record<string, new (...args: any[]) => Error>
  for (const name of Object.keys(definitions)) {
    const message = definitions[name]!
    constructors[name] = class extends Base {
      readonly name = name
      readonly details: unknown
      constructor(...args: [unknown?, unknown?]) {
        const [details, cause] = args
        super(message(details))
        this.details = details
        if (args.length > 1) this.cause = cause
      }
    }
    Object.defineProperty(constructors[name], 'name', { value: name })
  }
  const registry = ((name: string, ...args: unknown[]) => {
    const Constructor = constructors[name]
    if (!Constructor) throw new TypeError(`Unknown error: ${name}`)
    return new Constructor(...args)
  }) as unknown as Registry<DefinitionsMap>
  Object.defineProperty(registry, 'Error', { value: Base, writable: true, configurable: true })
  for (const name of Object.keys(constructors)) {
    Object.defineProperty(registry, name, { value: constructors[name], writable: true, configurable: true })
  }
  return registry
}
