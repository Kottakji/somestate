# Reactivestore

Intuitive and simple platform agnostic state management


## Methods


### store

```js
import { store } from 'reactivestore'

export const $items = store([])

export function addItem(item) {
    $items.set([...$items.get(), item])
}
```

### computed

```js
import { store, computed } from 'reactivestore'

export const $items = store([1,2,3])

export const $even = computed($items, items => items.filter(item => item % 2 == 0))
```


### fetched

```js
import { computed, fetched } from 'reactivestore'

export const {data: $todos, loading, error} = fetched(`https://jsonplaceholder.typicode.com/todos`)

export const $completed = computed($todos, todos => todos.filter(todo => todo?.completed))
```


### listen

```js
import { computed, fetched } from 'reactivestore'

export const {data: $todos, loading, error} = fetched(`https://jsonplaceholder.typicode.com/todos`)

$todos.listen(({data: todos}) => {
    console.log(todos)
})
```

### Only listen to key changes

```js
import { computed, fetched } from 'reactivestore'

export const {data: $todo, loading, error} = fetched(`https://jsonplaceholder.typicode.com/todos/1`)

// Only update when $item.completed has changed
export const $isCompleted = computed($todo, todo => !!todo?.completed, ['completed'])

// Only listen when $item.completed has changed
$item.listen(({data: item}) => {
    console.log(item)
}, ['completed'])
```

## Methods

### State methods

```js
import { store } from 'reactivestore'

export const $id = store();

$id.get()
$id.set()
```


### Fetched methods

```js
import { store } from 'reactivestore'

export const $id = store();

$id.get()
$id.set()
```

## Options

### State options

```js
import { fetched } from 'reactivestore'

export const {data: $todos, loading, error} = fetched(`https://jsonplaceholder.typicode.com/todos`)

// Corresponding to the HTTP request methods
$todos.get()
$todos.patch(todos)
$todos.put(todos)
$todos.post(todos)
$todos.delete()

```

### Fetcher options

```js
import { computed, fetched } from 'reactivestore'

export const {data: $todos, loading, error} = fetched(`https://jsonplaceholder.typicode.com/todos`,
    // Fetcher options
    {
        headers: {},
    },
    // Additional settings
    {
        // Fetcher
        fetcher: (url, options = {}) => fetch(url, options).then((r) => r.json()),

        // Custom urls per method
        getUrl: null,
        patchUrl: null,
        putUrl: null,
        postUrl: null,
        deleteUrl: null,

        // Refetch interval
        refetchInterval: 0,

        // Dependencies - only fetch when the dependencies are not null/undefined/false
        dependencies: [$otherStore]
    }
)

export const $completed = computed($todos, todos => todos.filter(todo => todo?.completed))
```

## React

`npm install reactivestore/react`

```js
import { useStore } from 'reactivestore/react'
import { $profile } from '../stores/profile.js'

export const Header = ({ postId }) => {
  const profile = useStore($profile)
  return <header>Hi, {profile.name}</header>
}
```