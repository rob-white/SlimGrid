# SlimGrid

A wrapper for [SlickGrid](https://github.com/mleibman/SlickGrid) to slim down the amount of time and code required to create a grid

## A Simple Example

```javascript
var container = $('body');
var data = [{'id': 1, 'column': 'value'}, 
			{'id': 2, 'column': 'value'}, 
			{'id': 3, 'column': 'value'}];

var grid = SlimGrid()
	.container(container)
	.primaryKey('id')
	.render(data);
```

## Documentation & Examples

[Wiki](https://github.com/rob-white/SlimGrid/wiki)

## To-Do

- Wiki (Documentation, examples)
- Remove dependency to underscore.js
