import { describe, expect, test, it, afterEach, jest } from "@jest/globals";
import { store } from "../store/index.js";
import { computed } from "./index.js";
import { fetched } from "../fetched/index.js";

afterEach(() => {
  jest.clearAllMocks();
});

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

    const $even = computed([$items, $max], ([items, max]) => {
      return items.filter((item) => item < max);
    });

    $max.set(10);

    expect($even.get()).toEqual([1, 2, 3]);

    $items.set([1, 2, 3, 4]);

    expect($even.get()).toEqual([1, 2, 3, 4]);
  });

  test("We can listen to key changes", () => {
    const $item = store({ x: 10, y: 10 });

    const $double = computed(
      $item,
      (item) =>
        Object.fromEntries(Object.entries(item).map(([k, v]) => [k, v * 2])),
      ["x"],
    );

    expect($double.get()).toEqual({ x: 20, y: 20 });

    $item.set({ x: 10, y: 12 });

    expect($double.get()).toEqual({ x: 20, y: 20 });

    $item.set({ x: 12, y: 12 });

    expect($double.get()).toEqual({ x: 24, y: 24 });
  });

  test("We can compute based on a fetched store", (done) => {
    const $todo = fetched(`https://jsonplaceholder.typicode.com/todos/1`);

    const $id = computed(
      $todo,
      (todo) => todo.id, // This should only be called when the initial value is not undefined
      ["id"],
    );

    $id.listen((value) => {
      if (value === undefined) {
        throw new Error(`Shouldn't have been updated`);
      }
      if (value === 1) {
        done();
      }
    });
  });

  test("We can compute based on a fetched store, with multiple dependent stores key", (done) => {
    const $value = store(true);
    const $todo = fetched(`https://jsonplaceholder.typicode.com/todos/1`);

    const $id = computed(
      [$value, $todo],
      ([_, todo]) => todo.id, // This should only be called when the initial value is not undefined
      ["id"],
    );

    $id.listen((value) => {
      if (value === undefined) {
        throw new Error(`Shouldn't have been updated`);
      }
      if (value === 1) {
        done();
      }
    });
  });
});
