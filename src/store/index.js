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
    if (equals(this.value, newValue)) return;

    this.listeners.map(({ closure, keys }) => {
      // Always call listener
      if (keys === null) {
        return void closure(newValue);
      }

      // Check if any of the keys has a change
      if (
        Array.isArray(keys) &&
        keys.some((key) => !equals(this.value?.[key], newValue?.[key]))
      ) {
        return void closure(newValue);
      }

      // Keys contains a single key
      if (!equals(this.value?.[keys], newValue?.[keys])) {
        return void closure(newValue);
      }
    });

    this.value = newValue;
  }

  listen(closure, keys = null) {
    this.listeners.push({ closure, keys });
  }
}

function equals(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
