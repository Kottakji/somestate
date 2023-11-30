# Somestate

Intuitive and simple platform agnostic state management

## Install

```bash
npm install somestate
```

## Packages

React -  https://github.com/Kottakji/somestate-react

## Methods

### store

```js
import { store } from 'somestate'

export const $items = store([])

export function addItem(item) {
    $items.set([...$items.get(), item])
}
```

### computed

```js
import { store, computed } from 'somestate'

export const $items = store([1,2,3])

export const $even = computed($items, items => items.filter(item => item % 2 === 0))

// Or multiple dependencies
export const $other = computed([$items, $even], [items, even] => {
    // Do something
})
```

### fetched

```js
import { computed, fetched } from 'somestate'

export const {data: $todos, loading, error} = fetched(`https://jsonplaceholder.typicode.com/todos`)

export const $completed = computed($todos, todos => todos.filter(todo => todo?.completed))
```

### persistent

Same as the store, but gets the value from localstorage

```js
import { persistent } from 'somestate'

// Without a default value (will be undefined by default)
export const $store = persistent('mylocalstoragekey')

// With a default value, if there is something in localstorage, it will use that value
export const $withDefaultValue = persistent('mylocalstoragekey', 1)
```

### listen

```js
import { computed, fetched } from 'somestate'

export const {data: $todos, loading, error} = fetched(`https://jsonplaceholder.typicode.com/todos`)

$todos.listen(({data: todos}) => {
    console.log(todos)
})
```

### Only listen to key changes

```js
import { computed, fetched } from 'somestate'

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
import { store } from 'somestate'

export const $id = store();

$id.get()
$id.set()
```


### Fetched methods

```js
import { fetched } from 'somestate'

export const {data: $todos, loading, error} = fetched(`https://jsonplaceholder.typicode.com/todos`)

// Corresponding to the HTTP request methods
$todos.get()
$todos.patch(todos)
$todos.put(todos)
$todos.post(todos)
$todos.delete()

// Error handling
$todos.catch(error => console.log(error.status, error.body))
```

## Options

### Fetched options

```js
import { computed, fetched } from 'somestate'

export const {data: $todos, loading, error} = fetched(`https://jsonplaceholder.typicode.com/todos`,
    // Fetched options
    {
        headers: {},
    },
    // Additional settings
    {
        // Custom api methods (can be used to set a custom url)
        fetcher: (url, options) => getFetcher(url, 'GET', null, options),
        patcher: (url, body, options) => getFetcher(url, 'PATCH', body, options),
        putter: (url, body, options) => getFetcher(url, 'PUT', body, options),
        poster: (url, body, options) => getFetcher(url, 'POST', body, options),
        deleter: (url, options) => getFetcher(url, 'DELETE', null, options),

        // Custom fetcher methods can also use a single url to only change the url, but keep the fetcher the same
        // patcher: `https://example.com/items`
        // putter: `https://example.com/items`
        // poster: `https://example.com/items`
        // deleter: `https://example.com/items`

        // Catch any api request errors
        catcher: (error) => {},

        // Refetch interval
        refetchInterval: 0,

        // Dependencies - only fetch when the dependencies are not null/undefined/false
        dependencies: [someVariable, $someStore]
    }
)

export const $completed = computed($todos, todos => todos.filter(todo => todo?.completed))
```

## Webpack

You can auto load all the store files, so that the stores will be initiated by default.

https://webpack.js.org/concepts/entry-points/

webpack.config.js
```js
const glob = require('glob');

module.exports = {
    //...
    entry: {
        index: [...glob.sync('./src/stores/*.js'), ...['./src/index.js']]
    },
}
```

You can then create dependency chains using computed, which will automatically be triggered when a depend store changes.

```js
import { computed } from 'somestate'
import {$flag} from "./flagStore.js"

computed($flag, flag => {
    if (flag) {
        // Do some logic
        // Note that computed/listen is never called when the value stays the same
    }
})

```