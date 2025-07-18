import { describe, expect, test, it, jest, afterEach } from "@jest/globals";
import { fetched } from "./index.js";
import { computed } from "../computed/index.js";
import { store } from "../store/index.js";

jest.useFakeTimers();
jest.spyOn(global, "setInterval");

afterEach(() => {
  jest.clearAllMocks();
});

describe("Fetched", () => {
  test("We can create a store from a GET response", (done) => {
    const $todo = fetched(`https://jsonplaceholder.typicode.com/todos/1`);

    expect($todo.get()).toEqual({});

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

    expect($todo.get()).toEqual({});

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

    expect($todo.get()).toEqual({});

    $todo.listen((todo) => {
      expect(todo?.id).toEqual(2);

      done();
    });
  });

  test("We can compute a value based on the fetcher", (done) => {
    const $todo = fetched(`https://jsonplaceholder.typicode.com/todos/1`);

    const $id = computed($todo, (todo) => todo?.id);

    expect($todo.get()).toEqual({});

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
    const spy = jest.spyOn(global, "fetch");
    const $post = fetched(`https://jsonplaceholder.typicode.com/posts/1`);

    $post.fetch();

    // Because the result of the API call will be the same, the listen is only called once.
    // So we check if there have been 2 mock calls
    expect(spy.mock.calls.length).toEqual(2);
  });

  test("We can use the patch helper", (done) => {
    const $post = fetched(`https://jsonplaceholder.typicode.com/posts/1`);

    $post.listen((post) => {
      if (post?.title === "Updated") {
        done();
      }
    });

    $post.patch({ ...$post.get(), ...{ title: "Updated" } });
  });

  test("We can use the put helper", (done) => {
    const $post = fetched(`https://jsonplaceholder.typicode.com/posts/1`);

    $post.listen((post) => {
      if (post?.title === "put") {
        done();
      }
    });

    $post.put({
      title: "put",
    });
  });

  test("We can use the post helper", (done) => {
    const $post = fetched(`https://jsonplaceholder.typicode.com/posts`);

    $post.listen((post) => {
      if (post?.title === "foo") {
        done();
      }
    });

    $post.post({
      title: "foo",
    });
  });

  test("We can use the delete helper", (done) => {
    const $post = fetched(`https://jsonplaceholder.typicode.com/posts/1`);

    $post.listen((post) => {
      // Is it an empty object?
      if (Object.keys(post).length === 0) {
        done();
      }
    });

    $post.delete();
  });

  test("We can fetch only when dependencies are not falsy", () => {
    const $todo = fetched(
      `https://jsonplaceholder.typicode.com/todos/1`,
      {},
      { dependencies: [false] },
    );

    expect($todo.get()).toEqual({});

    $todo.listen(() => {
      throw new Error(`Shouldn't have been called`);
    });
  });

  test("We can fetch only when dependencies are truthy", (done) => {
    const $todo = fetched(
      `https://jsonplaceholder.typicode.com/todos/1`,
      {},
      { dependencies: [true] },
    );

    expect($todo.get()).toEqual({});

    $todo.listen(() => {
      done();
    });
  });

  test("We can fetch only when dependencies are truthy, using a store", (done) => {
    const $true = store(true);
    const $todo = fetched(
      `https://jsonplaceholder.typicode.com/todos/1`,
      {},
      { dependencies: [$true] },
    );

    expect($todo.get()).toEqual({});

    $todo.listen(() => {
      done();
    });
  });

  test("When the api call fails, the catch method should be called", (done) => {
    const $todo = fetched(`https://jsonplaceholder.typicode.com/wrong`);

    $todo.listen((data) => {
      throw new Error(`Shouldn't have been called`);
    });

    $todo.catch((error) => {
      expect(error.status).toEqual(404);
      expect(error.body).toEqual({});
      done();
    });
  });

  test("When the dependencies get updated, we should also update the fetched", (done) => {
    const $dependency = store(false);
    const $todo = fetched(
      `https://jsonplaceholder.typicode.com/todos/1`,
      {},
      { dependencies: [$dependency] },
    );

    expect($todo.get()).toEqual({});

    $todo.listen(() => {
      done();
    });

    // This should invoke the fetcher to refetch
    $dependency.set(true);
  });

  test("On the fetcher, we can clear the dependency listeners via clear()", () => {
    const $dependency = store(false);
    const $todo = fetched(
      `https://jsonplaceholder.typicode.com/todos/1`,
      {},
      { dependencies: [$dependency] },
    );

    // This listener should always stay, it should only clear the dependency listeners set in the fetched constructor
    $dependency.listen(() => {});

    expect($dependency.listeners.length).toEqual(2);
    $todo.clear();
    expect($dependency.listeners.length).toEqual(1);
  });

  test("We can have a dependency on another fetched store", (done) => {
    const $dependency = store(false);
    const $otherFetched = fetched(
      `https://jsonplaceholder.typicode.com/todos/11111111111`, // Doesn't return any data
      {},
      { dependencies: [$dependency] },
    );
    const $todo = fetched(
      `https://jsonplaceholder.typicode.com/todos/1`,
      {},
      { dependencies: [$dependency, $otherFetched] },
    );

    expect($todo.get()).toEqual({});

    $otherFetched.catch(() => {
      done();
    });

    $todo.listen(() => {
      throw new Error(`Shouldn't have been updated`);
    });

    // This should invoke the fetcher to refetch
    $dependency.set(true);
  });

  test("We automatically retry 3 times on failure", (done) => {
    const spy = jest.spyOn(global, "fetch");
    const $error = fetched(
      `https://jsonplaceholder.typicode.com/error/1`,
      {},
      { retryInterval: 500 },
    );

    expect($error.get()).toEqual({});

    $error.catch(() => {
      if (spy.mock.calls.length === 3) {
        done();
      }
    });
  });

  test("We can turn off retries", (done) => {
    const spy = jest.spyOn(global, "fetch");
    const $error = fetched(
      `https://jsonplaceholder.typicode.com/error/1`,
      {},
      { retryAmount: 0, retryInterval: 500 },
    );

    expect($error.get()).toEqual({});

    $error.catch(() => {
      if (spy.mock.calls.length === 1) {
        done();
      }
    });
  });
});

// Somehow running it together with other tests makes this test fail
describe("Fetched (2)", () => {
  test("We can get the options from a closure, so we can have store value in there", (done) => {
    const spy = jest.spyOn(global, "fetch");
    const $dependency = store(false);
    const $fetched = fetched(
      `https://jsonplaceholder.typicode.com/todos/1`, // Doesn't return any data
      () => ({
        "x-example": $dependency.get(),
      }),
      {
        dependencies: [$dependency],
      },
    );

    $fetched.listen(() => {
      const [url, headers] = spy.mock.calls.pop();
      if (headers["x-example"] === "example") {
        done();
      }
    });

    // This should invoke the fetcher to refetch
    $dependency.set("example");
  });
});
