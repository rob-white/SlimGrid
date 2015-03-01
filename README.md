# SlimGrid

A wrapper for SlickGrid to slim down the amount of timecode to create a simple grid

## Very Simple Example

```javascript
var container = $('body');
var data = [{'id': 1, 'column', 'value'}, 
			{'id': 2, 'column', 'value'}, 
			{'id': 3, 'column', 'value'}];

var grid = SlimGrid()
	.container(container)
	.primaryKey('id')
	.render(data);
```

## To-Do

- Documentation
- Code up more examples
- Remove dependency to underscore.js
