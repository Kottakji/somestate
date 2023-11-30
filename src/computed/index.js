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

  // Make sure to only compute the value when we don't have any undefined values
  // Otherwise the computed is initiated its dependencies (for example with fetched)
  const getValue = (value) => {
    if (
      (single && value !== undefined) ||
      value?.every((v) => v !== undefined)
    ) {
      return closure(value);
    }
    return undefined;
  };

  // Initialize the store with the default value
  const result = store(
    getValue(
      single
        ? dependencies.get()
        : dependencies.map((dependency) => dependency.get()),
    ),
  );

  // Listen to the dependencies
  single
    ? dependencies.listen((value) => result.set(getValue(value)), keys)
    : dependencies.map((dependency) =>
        dependency.listen(
          () =>
            result.set(
              getValue(dependencies.map((dependency) => dependency.get())),
            ),
          keys,
        ),
      );

  return result;
}

export class Computed extends Store {
  constructor(dependencies, closure, keys = null) {
    // Do we have single or multiple dependencies?
    const single = !(
      typeof dependencies.every === "function" &&
      dependencies.every((dependency) => dependency instanceof Store)
    );

    // Initiate with a default value
    super(Computed.getValue(single, dependencies, closure));

    // Listen to the dependencies
    single
      ? dependencies.listen(
          () => this.set(Computed.getValue(single, dependencies, closure)),
          keys,
        )
      : dependencies.map((dependency) =>
          dependency.listen(
            () => this.set(Computed.getValue(single, dependencies, closure)),
            keys,
          ),
        );
  }

  static getValue(single, dependencies, closure) {
    // Make sure to only compute the value when we don't have any undefined values
    // Otherwise the computed is initiated its dependencies (for example with fetched)
    const getValue = (value) => {
      if (
        (single && value !== undefined) ||
        value?.every((v) => v !== undefined)
      ) {
        return closure(value);
      }
      return undefined;
    };

    return getValue(
      single
        ? dependencies.get()
        : dependencies.map((dependency) => dependency.get()),
    );
  }
}
