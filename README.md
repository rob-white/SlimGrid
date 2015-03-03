# SlimGrid

A wrapper for [SlickGrid](https://github.com/mleibman/SlickGrid) to slim down the amount of time and code required to create a grid

## A Simple Example

#### Code
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

#### CSS
```html
    <link href="../css/slickgrid/slick.grid.css?v=1.0" rel="stylesheet" type="text/css"/>
    <link href="../css/jquery/smoothness/jquery-ui-1.10.3.custom.min.css?v=1.0" rel="stylesheet" type="text/css"/>
    <link href="../css/slickgrid/slick.pager.css?v=1.0" rel="stylesheet" type="text/css"/>
    <link href="../css/slickgrid/slick.columnpicker.css?v=1.0" rel="stylesheet" type="text/css"/>
    <link href="../css/slickgrid/slick.headerbuttons.css?v=1.0" rel="stylesheet" type="text/css"/>
    <link href="../css/slickgrid/slick.headermenu.css?v=1.0" rel="stylesheet" type="text/css"/>
    <link href="../css/slickgrid/slick-default-theme.css?v=1.0" rel="stylesheet" type="text/css"/>
```

#### Javascript
```html
    <script src="../js/jquery/jquery-1.9.1.js?v=1.0" type="text/javascript"></script>
    <script src="../js/jquery/jquery-ui-1.10.3.custom.min.js?v=1.0" type="text/javascript"></script>
    <script src="../js/jquery/jquery.event.drop-2.2.js?v=1.0" type="text/javascript"></script>
    <script src="../js/jquery/jquery.event.drag-2.2.js?v=1.0" type="text/javascript"></script>
    
    <script src="../js/slickgrid/slick.core.js?v=1.0" type="text/javascript"></script>
    <script src="../js/slickgrid/slick.grid.js?v=1.0" type="text/javascript"></script>
    <script src="../js/slickgrid/slick.formatters.js?v=1.0" type="text/javascript"></script>
    <script src="../js/slickgrid/slick.dataview.js?v=1.0" type="text/javascript"></script>
    <script src="../js/slickgrid/slick.pager.js?v=1.0" type="text/javascript"></script>
    <script src="../js/slickgrid/slick.groupitemmetadataprovider.js?v=1.0" type="text/javascript"></script>
    <script src="../js/slickgrid/slick.cellrangedecorator.js?v=1.0" type="text/javascript"></script>
    <script src="../js/slickgrid/slick.cellrangeselector.js?v=1.0" type="text/javascript"></script>
    <script src="../js/slickgrid/slick.cellselectionmodel.js?v=1.0" type="text/javascript"></script>
    <script src="../js/slickgrid/slick.rowselectionmodel.js?v=1.0" type="text/javascript"></script>
    <script src="../js/slickgrid/slick.columnpicker.js?v=1.0" type="text/javascript"></script>
    <script src="../js/slickgrid/slickgrid.headerfilter.js?v=1.0" type="text/javascript"></script>
    <script src="../js/slickgrid/slick.cellexternalcopymanager.js?v=1.0" type="text/javascript"></script>
    <script src="../js/slickgrid/slick.editors.js?v=1.0" type="text/javascript"></script>

    <script src="../js/underscore/underscore.js?v=1.0" type="text/javascript"></script>

    <script src="../slim.grid.js?v=1.0" type="text/javascript"></script>
```

## More Examples & Documentation

[Wiki](https://github.com/rob-white/SlimGrid/wiki)

## To-Do

- Wiki (More examples and documentation)
- Abstract up missing SlickGrid events/functions
- Remove dependency to Underscore.js
