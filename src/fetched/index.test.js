import { describe, expect, test, it, jest, afterEach } from "@jest/globals";
import { store } from "../store/index.js";
import { fetched } from "./index.js";
import { computed } from "../computed/index.js";

jest.useFakeTimers();
jest.spyOn(global, "setInterval");

afterEach(() => {
  jest.clearAllMocks();
});

describe("Fetched", () => {
  test("We can create a store from a GET response", (done) => {
    const $todo = fetched(`https://jsonplaceholder.typicode.com/todos/1`);

    expect($todo.get()).toEqual(undefined);

    $todo.listen((todo) => {
      expect(todo?.id).toEqual(1);

      done();
    });
  });

  test("We can set fetch options", (done) => {
    const $todo = fetched(`https://jsonplaceholder.typicode.com/posts`, {
      method: "POST",
      body: JSON.stringify({ title: "foo", body: "bar", userId: 1 }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });

    expect($todo.get()).toEqual(undefined);

    $todo.listen((todo) => {
      expect(todo?.title).toEqual("foo");

      done();
    });
  });

  test("We can use a custom fetcher", (done) => {
    const $todo = fetched(
      `https://jsonplaceholder.typicode.com/todos/1`,
      {},
      { fetcher: (url) => fetch(url).then(() => ({ id: 2 })) },
    );

    expect($todo.get()).toEqual(undefined);

    $todo.listen((todo) => {
      expect(todo?.id).toEqual(2);

      done();
    });
  });

  test("We can compute a value based on the fetcher", (done) => {
    const $todo = fetched(`https://jsonplaceholder.typicode.com/todos/1`);

    const $id = computed($todo, (todo) => todo?.id);

    expect($todo.get()).toEqual(undefined);

    $id.listen((id) => {
      expect(id).toEqual(1);

      done();
    });
  });

  test("The fetcher can automatically refetch", () => {
    const _ = fetched(
      `https://jsonplaceholder.typicode.com/todos/1`,
      {},
      {
        refetchInterval: 3000,
      },
    );

    expect(setInterval).toHaveBeenCalledTimes(1);
  });

  test("When we have no refetch interval, setInterval is never called", () => {
    const _ = fetched(`https://jsonplaceholder.typicode.com/todos/1`);

    expect(setInterval).toHaveBeenCalledTimes(0);
  });
});
