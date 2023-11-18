export function store(value = undefined) {
  return new Store(value);
}

export class Store {
  constructor(value) {
    this.value = value
    this.listeners = []
  }

  get() {
    return this.value
  }

  set(newValue) {
    this.value = newValue

    this.listeners.map((closure) => closure(newValue))
  }

  listen(closure) {
    this.listeners.push(closure)
  }
}

