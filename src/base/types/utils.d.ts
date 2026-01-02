export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type ValidationResult<T, E extends Error = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

type PartialWithUndefined<T> = {
  [P in keyof T]?: T[P] | undefined;
};

export interface Branding<BrandT> {
  __brand: BrandT;
}

export interface Flavoring<FlavorT> {
  __flavor?: FlavorT;
}

export type Flavor<T, FlavorT> = T & Flavoring<FlavorT>;

type NonEmptyExtract<T, U> =
  Extract<T, U> extends never
    ? { error: 'Extract produced never - no matching types found' }
    : Extract<T, U>;
