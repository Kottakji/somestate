import { Store, store } from "../store/index.js";

/**
 * Creates a computed store based on a closure and dependencies.
 * @param {Store|Array<Store>} dependencies - The dependencies for the computed store.
 * @param {function} closure - The closure function that computes the value of the store.
 * @param {Array<string>|null} keys - The keys to listen for changes on the dependencies. Default is null.
 * @returns {Store} - The computed store.
 */
export function computed(dependencies, closure, keys = null) {
  // Do we have a single dependency?
  const single = !(
    typeof dependencies.every === "function" &&
    dependencies.every((dependency) => dependency instanceof Store)
  );

  // Initialize the store with the default value
  const result = store(
    closure(
      single
        ? dependencies.get()
        : dependencies.map((dependency) => dependency.get()),
    ),
  );

  // Listen to the dependencies
  single
    ? dependencies.listen((value) => result.set(closure(value)), keys)
    : dependencies.map((dependency) =>
        dependency.listen(
          () =>
            result.set(
              closure(dependencies.map((dependency) => dependency.get())),
            ),
          keys,
        ),
      );

  return result;
}
