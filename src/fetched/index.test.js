import {describe, expect, test, it} from "@jest/globals";
import {store} from "../store/index.js";
import {fetched} from "./index.js";
import {computed} from "../computed/index.js";

describe("Fetched", () => {
  test("We can create a store from a GET response", (done) => {
    const $todo = fetched(`https://jsonplaceholder.typicode.com/todos/1`);

    expect($todo.get()).toEqual(undefined);

    $todo.listen((todo) => {
      expect(todo?.id).toEqual(1)

      done()
    })
  });

  test("We can set fetch options", (done) => {
    const $todo = fetched(`https://jsonplaceholder.typicode.com/posts`, {
      method: "POST",
      body: JSON.stringify({title: 'foo', body: 'bar', userId: 1}),
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      }
    });

    expect($todo.get()).toEqual(undefined);

    $todo.listen((todo) => {
      expect(todo?.title).toEqual('foo')

      done()
    })
  });

  test("We can use a custom fetcher", (done) => {
    const $todo = fetched(`https://jsonplaceholder.typicode.com/todos/1`, {}, (url) => fetch(url).then(() => ({id: 2})));

    expect($todo.get()).toEqual(undefined);

    $todo.listen((todo) => {
      expect(todo?.id).toEqual(2)

      done()
    })
  });

  // test("We can compute a value based on the fetcher", (done) => {
  //   const $todo = fetched(`https://jsonplaceholder.typicode.com/todos/1`, {}, (url) => fetch(url).then(() => ({id: 2})));
  //
  //   const $first = computed($todo, (todo) =>
  //     ({first: todo?.id})
  //   );
  //
  //   expect($todo.get()).toEqual(undefined);
  //
  //   // TODO fix this
  //   $todo.listen((todo) => {
  //     expect($first.get()?.first).toEqual(1)
  //
  //     done()
  //   })
  // });
});
