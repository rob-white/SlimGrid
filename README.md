# SlimGrid

A wrapper for [SlickGrid](https://github.com/mleibman/SlickGrid) to slim down the amount of time and code required to create a grid

## A Simple Example

#### Code
```javascript
var container = $('body');
var data = [
	{'id': 1, 'column': 'value'}, 
	{'id': 2, 'column': 'value'}, 
	{'id': 3, 'column': 'value'}
];

var grid = SlimGrid()
	.container(container)
	.render(data);
```

## More Examples & Documentation

[Wiki](https://github.com/rob-white/SlimGrid/wiki)

## To-Do

[Issues](https://github.com/rob-white/SlimGrid/issues)
