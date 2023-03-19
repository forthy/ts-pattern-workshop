import { describe, expect, it } from 'vitest'

import { nameOf, birthYearOf, maleOf, canSmoke, cannotSmokeOf } from '../src/index'
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'
import { fail } from 'assert'

describe('ts-pattern samples', () => {
  it('Only a person who is old enough can smoke', () => {
    const illegalSmokingBirthYear = pipe(new Date(), (d: Date) => d.getUTCFullYear() - 16)

    // canSmoke :: Person => AllowSmoke
    const manCanSmoke = pipe(O.of(maleOf), O.ap(nameOf('Richard Chuo')), O.ap(birthYearOf(1969)))
    const manCannotSmoke = pipe(O.of(maleOf), O.ap(nameOf('John Doe')), O.ap(birthYearOf(illegalSmokingBirthYear)))

    // Positive case
    pipe(
      manCanSmoke,
      O.match(
        () => fail('Failed to construct a man'),
        (m) => expect(canSmoke(m)).toStrictEqual(E.right(m))
      )
    )

    // Negative case
    pipe(
      manCannotSmoke,
      O.match(
        () => fail('Failed to construct a man'),
        (m) => expect(canSmoke(m)).toStrictEqual(E.left(cannotSmokeOf(`${m.name} is not old enough to smoke`)))
      )
    )
  })
})
