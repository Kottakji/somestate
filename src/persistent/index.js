import { Store } from "../store/index.js";

export function persistent(key, defaultValue = undefined) {
  return new Persistent(key, defaultValue)
}

class Persistent extends Store {
  constructor(key, defaultValue) {
    super(getFromLocalStorage(key) || defaultValue);

    // Set localstorage key
    this.key = key

    // Set value in localstorage
    saveToLocalStorage(this.key, this.value)
  }

  set(newValue) {
    super.set(newValue);

    // Set value in localstorage
    saveToLocalStorage(this.key, this.value)
  }
}

function saveToLocalStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function getFromLocalStorage(key) {
  const result = window.localStorage.getItem(key)
  if (!result) {
    return null;
  }

  return JSON.parse(result);
}
