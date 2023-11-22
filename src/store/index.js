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

    this.listeners.map(({ closure, keys }) => {
      // Always call listener
      if (keys === null) {
        return void closure(newValue);
      }

      // Check if any of the keys has a change
      if (
        Array.isArray(keys) &&
        keys.some((key) => !equals(oldValue?.[key], newValue?.[key]))
      ) {
        return void closure(newValue);
      }

      // Keys contains a single key
      if (!equals(oldValue?.[keys], newValue?.[keys])) {
        return void closure(newValue);
      }
    });

  }

  listen(closure, keys = null) {
    this.listeners.push({ closure, keys });
  }
}

function equals(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
