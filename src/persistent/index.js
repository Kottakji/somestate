import { Store } from "../store/index.js";

/**
 * Creates a new instance of the Persistent class.
 *
 * @param {string} key - The localStorage key for the persistent data.
 * @param {*} [defaultValue] - The default value to be used if the persistent data does not exist.
 * @returns {Persistent} - A new instance of the Persistent class.
 */
export function persistent(key, defaultValue = undefined) {
  return new Persistent(key, defaultValue);
}

/**
 * A class that extends Store and provides persistent storage using local storage.
 *
 * @classdesc A class that extends Store and provides persistent storage using local storage.
 * @extends Store
 */
export class Persistent extends Store {
  /**
   * Creates a new instance of the Constructor class.
   *
   * @param {string} key - The key used to store the value in local storage.
   * @param {any} defaultValue - The default value to use if no value is found in local storage.
   *
   * @return {undefined} - This method does not return a value.
   */
  constructor(key, defaultValue) {
    super(getFromLocalStorage(key) || defaultValue);

    // Set localstorage key
    this.key = key;

    // Set value in localstorage
    saveToLocalStorage(this.key, this.value);
  }

  /**
   * Set the value of the property and save it to local storage.
   *
   * @param {any} newValue - The new value to set.
   */
  set(newValue) {
    super.set(newValue);

    // Set value in localstorage
    saveToLocalStorage(this.key, this.value);
  }
}

/**
 * Saves a key-value pair to the local storage.
 *
 * @param {string} key - The key for the value to be saved.
 * @param {any} value - The value to be saved.
 * @return {void}
 */
function saveToLocalStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Retrieves the value associated with the specified key from the local storage.
 *
 * @param {string} key - The key for the value to retrieve.
 * @returns {any|null} - The retrieved value if it exists, otherwise null.
 */
function getFromLocalStorage(key) {
  const result = window.localStorage.getItem(key);
  if (!result) {
    return null;
  }

  return JSON.parse(result);
}
