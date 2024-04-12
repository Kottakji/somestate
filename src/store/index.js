import structuredClone from "@ungap/structured-clone";

/**
 * Creates a new instance of the Store class.
 *
 * @param {*} value - The initial value for the store. (optional)
 * @returns {Store} - A new instance of the Store class.
 */
export function store(value = undefined) {
  return new Store(value);
}

/**
 * A class representing a store that holds a value and allows listeners to be notified of value changes.
 */
export class Store {
  /**
   * @param {any} value - The initial value for the constructor.
   *
   * @return {void}
   */
  constructor(value) {
    this.value = value;
    this.listeners = [];
  }

  /**
   * Retrieves the value stored in the object.
   *
   * @returns {*} The value stored in the object.
   */
  get() {
    return this.value;
  }

  /**
   * Sets the new value and invokes listeners if the value has changed.
   *
   * @param {any} newValue - The new value to set.
   *
   * @return {void}
   */
  set(newValue) {
    // Keep the old value for comparison
    const oldValue = cloneValue(this.value);

    // Only update when not the same
    if (equals(oldValue, newValue)) return;

    // Set the new value
    this.value = newValue;

    this.listeners.map((listener) => {
      // Always call listener
      if (listener.keys === null) {
        return void listener.closure(newValue);
      }

      // Check if any of the keys has a change
      if (
        Array.isArray(listener.keys) &&
        listener.keys.some((key) => !equals(oldValue?.[key], newValue?.[key]))
      ) {
        return void listener.closure(newValue);
      }

      // Keys contains a single key
      if (!equals(oldValue?.[listener.keys], newValue?.[listener.keys])) {
        return void listener.closure(newValue);
      }
    });
  }

  /**
   * Callback for adding two numbers.
   *
   * @callback Closure
   * @param {any} value
   */

  /**
   * Adds a listener to the list of listeners.
   *
   * @param {Closure} closure - The closure to be invoked when the event occurs.
   * @param {Array<string>|null} [keys=null] - Optional array of keys to filter the events.
   * @returns {Listener} - A new instance of the Listener class.
   */
  listen(closure, keys = null) {
    const id = generateId();
    const listener = new Listener(id, closure, keys, () =>
      this.unsubscribe(id),
    );
    this.listeners.push(listener);

    return listener;
  }

  /**
   * Removes a listener with the specified ID from the listeners array.
   *
   * @param {string} id - The ID of the listener to unsubscribe.
   */
  unsubscribe(id) {
    this.listeners = this.listeners.filter((listener) => listener.id !== id);
  }

  /**
   * Clears the listeners array.
   *
   * @return {void} - No value is returned.
   */
  clear() {}
}

/**
 * Represents a listener object.
 * @class
 */
export class Listener {
  constructor(id, closure, keys, unsubscribe) {
    this.id = id;
    this.closure = closure;

    this.keys = keys;
    this.unsubscribe = unsubscribe;
  }
}

function generateId() {
  let d = new Date().getTime(),
    d2 =
      (typeof performance !== "undefined" &&
        performance.now &&
        performance.now() * 1000) ||
      0;
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : (r & 0x7) | 0x8).toString(16);
  });
}

function cloneValue(value) {
  if (isClass(value)) {
    return Object.assign(Object.create(Object.getPrototypeOf(value)), value);
  }

  if (typeof value === "object") {
    return Object.assign({}, value);
  }

  if (typeof value === "function") {
    return value;
  }

  return structuredClone(value);
}

function equals(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function isClass(value) {
  return typeof value === "function" && value.prototype !== undefined;
}
