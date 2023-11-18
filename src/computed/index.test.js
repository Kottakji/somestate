import { describe, expect, test, it } from "@jest/globals";
import { store } from "../store/index.js";
import { computed } from "./index.js";

describe("Computed", () => {
  test("We can compute a value from a different stores", () => {
    const $items = store([1, 2, 3]);

    const $even = computed($items, (items) =>
      items.filter((item) => item % 2 === 0),
    );

    expect($even.get()).toEqual([2]);
  });

  test("We can compute a value from a different store", () => {
    const $items = store([1, 2, 3]);

    const $even = computed($items, (items) =>
      items.filter((item) => item % 2 === 0),
    );

    expect($even.get()).toEqual([2]);
  });

  test("We can compute a value from different stores", () => {
    const $items = store([1, 2, 3]);
    const $max = store(2);

    const $even = computed([$items, $max], ([items, max]) =>
      items.filter((item) => item < max),
    );

    expect($even.get()).toEqual([1]);
  });

  test("When the original value updates, the computed value changes as well", () => {
    const $items = store([1, 2, 3]);

    const $even = computed($items, (items) =>
      items.filter((item) => item % 2 === 0),
    );

    $items.set([1, 2, 3, 4]);

    expect($even.get()).toEqual([2, 4]);
  });

  test("When the original values update, the computed value changes as well", () => {
    const $items = store([1, 2, 3]);
    const $max = store(2);

    const $even = computed([$items, $max], ([items, max]) =>
      items.filter((item) => item < max),
    );

    $max.set(10);

    expect($even.get()).toEqual([1, 2, 3]);

    $items.set([1, 2, 3, 4]);

    expect($even.get()).toEqual([1, 2, 3, 4]);
  });
});
