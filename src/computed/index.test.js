import {describe, expect, test, it} from '@jest/globals';
import {store} from "../store/index.js";
import {computed} from "./index.js";

describe('Computed', () => {
  test('We can compute a value from a different stores', () => {
    const $items = store([1,2,3])

    const $even = computed($items, items => items.filter(item => item % 2 === 0))

    expect($even.get()).toEqual([2])
  })

  test('We can compute a value from a different stores', () => {
    const $items = store([1,2,3])

    const $even = computed($items, items => items.filter(item => item % 2 === 0))

    expect($even.get()).toEqual([2])
  })
})