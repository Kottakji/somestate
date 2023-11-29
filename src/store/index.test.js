import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { store } from "./index.js";

afterEach(() => {
  jest.clearAllMocks();
});

describe("Store", () => {
  test("We can initialize store object", () => {
    [null, undefined, "example", 1337].map((value) => {
      const $value = store(value);

      expect($value.get()).toEqual(value);
    });
  });

  test("We can set the store", () => {
    const $value = store("First");

    $value.set("Second");

    expect($value.get()).toEqual("Second");
  });

  test("We can listen to store changes", (done) => {
    const $value = store("First");

    $value.listen((value) => {
      expect(value).toEqual("Second");
      done();
    });

    $value.set("Second");
  });

  test("We don't update when nothing has changes", () => {
    const $value = store({ x: 10, y: 10 });

    $value.listen((value) => {
      throw new Error(`Shouldn't have been updated`);
    });

    $value.set({ x: 10, y: 10 });
  });

  test("We can listen to key changes only", () => {
    const $value = store({ x: 10, y: 10 });

    $value.listen(
      (value) => {
        throw new Error(`Shouldn't have been updated`);
      },
      ["x"],
    );

    $value.set({ x: 10, y: 12 });
  });

  test("We can unsubscribe from a listener using the return value from the listen method", () => {
    const $value = store("First");

    const listener = $value.listen((value) => {
      if (value !== "First") {
        throw new Error(`Shouldn't have been called`);
      }
    });

    listener.unsubscribe();

    $value.set("Second");
  });

  test("We can unsubscribe multiple listeners", () => {
    const $value = store("First");

    let listeners = [];
    Array(10).map(() => {
      listeners.push(
        $value.listen((value) => {
          if (value !== "First") {
            throw new Error(`Shouldn't have been called`);
          }
        }),
      );
    });

    listeners.map((listeners) => void listeners.unsubscribe());

    $value.set("Second");
  });
});
