/**
 * Wrapper type used to circumvent ESM/SWC circular dependency issue
 * caused by reflection metadata saving the type of the property.
 *
 * @see https://github.com/nestjs/nest/issues/12028
 */
export type WrapperType<T> = T;
