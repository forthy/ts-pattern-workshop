import { Newtype, prism, iso } from 'newtype-ts'
import * as E from 'fp-ts/Either'
import { match as patternMatch, P } from 'ts-pattern'

export interface Name extends Newtype<{ readonly Name: unique symbol }, string> {}
export interface BirthYear extends Newtype<{ readonly BirthYear: unique symbol }, number> {}

const isValidString: (s: string) => boolean = (s) => s !== null && s !== undefined && s !== ''
const isValidBirthYear: (by: number) => boolean = (by) => by !== null && by !== undefined && by > 1922 && by <= new Date().getFullYear()

export const nameOf = (n: string) => prism<Name>(isValidString).getOption(n)
//           ^?
export const birthYearOf = (by: number) => prism<BirthYear>(isValidBirthYear).getOption(by)
export const birthYearFrom: (by: BirthYear) => number = (by) => iso<BirthYear>().unwrap(by)

const isOlderThan18: (thisYear: number) => (by: BirthYear) => boolean = (thisYear) => (by) => thisYear - birthYearFrom(by) > 18

export type Male = { _tag: 'Male'; name: Name; birthYear: BirthYear }
export type Female = { _tag: 'Female'; name: Name; birthYear: BirthYear }

export const maleOf: (name: Name) => (birthYear: BirthYear) => Readonly<Male> = (name) => (birthYear) => ({ _tag: 'Male', name, birthYear })
export const femaleOf: (name: Name) => (birthYear: BirthYear) => Readonly<Female> = (name) => (birthYear) => ({
  _tag: 'Female',
  name,
  birthYear,
})
export type Person = Female | Male

// Errors
export type CannotSmoke = { _tag: 'CannotSmoke'; msg: string }
export type NullishError = { _tag: 'NullishError'; msg: string }

export const cannotSmokeOf: (msg: string) => Readonly<CannotSmoke> = (msg) => ({ _tag: 'CannotSmoke', msg })
export const nullishErrorOf: (msg: string) => Readonly<NullishError> = (msg) => ({ _tag: 'NullishError', msg })
export type Error = CannotSmoke | NullishError

// export declare const canSmoke: (p: Person) => E.Either<CannotSmoke, Person>
export const canSmoke: (p: Person) => E.Either<Error, Person> = (p) =>
  patternMatch(p)
    .with(P.nullish, () => E.left(nullishErrorOf('The given person is nullish')))
    .with({ _tag: 'Male', birthYear: P.when((by) => isOlderThan18(new Date().getFullYear())(by)) }, (p) => E.right(p))
    .otherwise((p) => E.left(cannotSmokeOf(`${p.name} is not old enough to smoke`)))
    // .run()
