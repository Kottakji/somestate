import {describe, expect, test, it, jest, afterEach} from "@jest/globals";
import {fetched} from "./index.js";
import {computed} from "../computed/index.js";

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
      body: JSON.stringify({title: "foo", body: "bar", userId: 1}),
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
      {fetcher: (url) => fetch(url).then(() => ({id: 2}))},
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

  test("We can use the fetch helper", () => {
    const spy = jest.spyOn(global, 'fetch')
    const $post = fetched(`https://jsonplaceholder.typicode.com/posts/1`);

    $post.fetch()

    // Because the result of the API call will be the same, the listen is only called once.
    // So we check if there have been 2 mock calls
    expect(spy.mock.calls.length).toEqual(2)
  });

  test("We can use the patch helper", (done) => {
    const $post = fetched(`https://jsonplaceholder.typicode.com/posts/1`);

    $post.listen((post) => {
      if (post?.title === 'Updated') {
        done();
      }
    });

    $post.patch({...$post.get(), ...{title: 'Updated'}})
  });

  test("We can use the put helper", (done) => {
    const $post = fetched(`https://jsonplaceholder.typicode.com/posts/1`);

    $post.listen((post) => {
      if (post?.title === 'put') {
        done();
      }
    });

    $post.put({
      title: 'put',
    })
  });

  test("We can use the post helper", (done) => {
    const $post = fetched(`https://jsonplaceholder.typicode.com/posts`);

    $post.listen((post) => {
      if (post?.title === 'foo') {
        done();
      }
    });

    $post.post({
      title: 'foo',
    })
  });

  test("We can use the delete helper", (done) => {
    const $post = fetched(`https://jsonplaceholder.typicode.com/posts/1`);

    $post.listen((post) => {
      // Is it an empty object?
      if (Object.keys(post).length === 0) {
        done();
      }
    });

    $post.delete()
  });

  // TODO what happens if it's not a 200?

  // TODO fetch dependencies?
  // TODO fetch headers?

  // TODO we can unsubscribe from the listener
});
