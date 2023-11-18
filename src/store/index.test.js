import {describe, expect, test, it} from '@jest/globals';
import { store } from "./index.js";

describe('Store', () => {
  test('We can initialize store object', () => {
    [null, undefined, "example", 1337].map(value => {
      const $value = store(value)
      expect($value.get()).toEqual(value);
    })
  })

  test('We can set the store', () => {
    const $value = store("First")
    $value.set("Second")
    expect($value.get()).toEqual("Second");
  })

  test('We can listen to store changes', (done) => {
    const $value = store("First")

    $value.listen((value) => {
      expect(value).toEqual("Second");
      done()
    })

    $value.set("Second")
  })
})