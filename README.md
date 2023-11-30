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

### Fetcher options

```js
import { computed, fetched } from 'somestate'

export const {data: $todos, loading, error} = fetched(`https://jsonplaceholder.typicode.com/todos`,
    // Fetcher options
    {
        headers: {},
    },
    // Additional settings
    {
        // Custom fetcher methods (can be used to set a custom url)
        fetcher: (url, options) => getFetcher(url, 'GET', null, options),
        patcher: (url, body, options) => getFetcher(url, 'PATCH', body, options),
        putter: (url, body, options) => getFetcher(url, 'PUT', body, options),
        poster: (url, body, options) => getFetcher(url, 'POST', body, options),
        deleter: (url, body, options) => getFetcher(url, 'DELETE', null, options),
        catcher: (error) => {},

        // Refetch interval
        refetchInterval: 0,

        // Dependencies - only fetch when the dependencies are not null/undefined/false
        dependencies: [$otherStore]
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