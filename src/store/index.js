/**
 * Creates a new instance of the Store class.
 *
 * @param {*} value - The initial value for the store. (optional)
 * @returns {Store} - A new instance of the Store class.
 */
export function store(value = undefined) {
  return new Store(value);
}

export class Store {
  constructor(value) {
    this.value = value;
    this.listeners = [];
  }

  get() {
    return this.value;
  }

  set(newValue) {
    // Keep the old value for comparison
    const oldValue = this.value;

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

  listen(closure, keys = null) {
    const id = generateId()
    const listener = new Listener(id, closure, keys, () => this.unsubscribe(id))
    this.listeners.push(listener);

    return listener
  }

  unsubscribe(id) {
   this.listeners = this.listeners.filter(listener => listener.id !== id)
  }
}

class Listener {
  constructor(id, closure, keys, unsubscribe) {
    this.id = id;
    this.closure = closure;
    this.keys = keys;
    this.unsubscribe = unsubscribe;
  }
}

function generateId () {
  let d = new Date().getTime(), d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
  });
}

function equals(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
