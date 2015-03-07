// SlimGrid
// Author: 	Rob White
// A wrapper for SlickGrid to slim down the amount of time
// and code required to create a simple SlickGrid
//
// SlickGrid
// Author: Michael Leibman
// https://github.com/mleibman/SlickGrid

function SlimGrid() {

    // Some default SlickGrid options
    // Option descriptions can be found in the SlickGrid docs here:
    // https://github.com/mleibman/SlickGrid/wiki/Grid-Options
    var slickgridOptions = {
            asyncEditorLoading: false,
            asyncEditorLoadDelay: 100,
            asyncPostRenderDelay: 50,
            autoEdit: true,
            autoHeight: false,
            cellFlashingCssClass: 'flashing',
            cellHighlightCssClass: 'selected',
            dataItemColumnValueExtractor: null,
            defaultColumnWidth: 150,
            editable: false,
            editorFactory: null,
            editorLock: Slick.GlobalEditorLock,
            enableAddRow: false,
            enableAsyncPostRender: false,
            enableCellNavigation: true,
            enableColumnReorder: true,
            enableTextSelectionOnCells: false,
            explicitInitialization: true,
            forceFitColumns: false,
            forceSyncScrolling: false,
            formatterFactory: null,
            fullWidthRows: false,
            headerRowHeight: 30,
            leaveSpaceForNewRows: false,
            multiColumnSort: true,
            multiSelect: false,
            rowHeight: 25,
            selectedCellCssClass: 'selected',
            showHeaderRow: true,
            syncColumnCellResize: false,
            topPanelHeight: 25
        },
        pk = 'id',
        container = $('body'),
        height = 600,
        exists = false,
        autoIncrement = false,
        downloadable = true,
        showColumnpicker = false,
        pasteExactOnly = false,
        showHeaderFilter = true,
        showPagerStats = true,
        copyOut = false,
        // loadingIndicator can also be an image - example: $('<img style="vertical-align: text-bottom;" src="IMG_SRC"/>')
        loadingIndicator = $('<span style="vertical-align: text-bottom; font-size: 10px">Loading...</span>'),
        contextMenu = $('<ul class="context-menu"></ul>'),
        myGrid = $('<div class="slim-grid" style="height: ' + height + 'px; border-right: 1px solid #d3d3d3; border-left: 1px solid #d3d3d3; font-size: 11px !important;"></div>'),
        myPager = $('<div class="slim-pager"></div>'),
        selectionModel = new Slick.RowSelectionModel(),
        columnFilters = {},
        ajaxOptions = {
            async: false,
            type: 'GET',
            url: '',
            cache: false,
            dataType: 'json'
        },
        rowFormatter = function (row) {
            return row;
        },
        columnOptions = function (key, column) {
            return column;
        },
        events = {
            onScroll: function (e, args) {
            },
            onSort: function (e, args) {
            },
            onHeaderContextMenu: function (e, args) {
            },
            onHeaderClick: function (e, args) {
            },
            onMouseEnter: function (e, args) {
            },
            onMouseLeave: function (e, args) {
            },
            onClick: function (e, args) {
            },
            onDblClick: function (e, args) {
            },
            onContextMenu: function (e, args, cell) {
            },
            onContextMenuClick: function (e, args, selectedData) {
            },
            onKeyDown: function (e, args) {
            },
            onAddNewRow: function (e, args, row) {
            },
            onValidationError: function (e, args) {
            },
            onViewportChanged: function (e, args) {
            },
            onColumnsReordered: function (e, args) {
            },
            onColumnsResized: function (e, args) {
            },
            onCellChange: function (e, args, cell) {
            },
            onBeforeEditCell: function (e, args) {
            },
            onBeforeCellEditorDestroy: function (e, args) {
            },
            onHeaderRowCellRendered: function (e, args) {
                if (args.column.id != '_checkbox_selector') {
                    $(args.node).empty();
                    $("<input title='" + args.column.id + "' class='text-center' type='text'>")
                        .data("columnId", args.column.id)
                        .val(columnFilters[args.column.id])
                        .appendTo(args.node);
                }
                else {
                    $("<input class='hidden' type='text'>").data("columnId", args.column.id)
                        .val(columnFilters[args.column.id])
                        .appendTo(args.node);
                }
            },
            onBeforeHeaderRowCellDestroy: function (e, args) {
            },
            onBeforeDestroy: function (e, args) {
            },
            onActiveCellChanged: function (e, args) {
            },
            onActiveCellPositionChanged: function (e, args) {
            },
            onDragInit: function (e, args) {
            },
            onDragStart: function (e, args) {
            },
            onDrag: function (e, args) {
            },
            onDragEnd: function (e, args) {
            },
            onRowSelected: function (e, args, selectedData) {
            },
            onCellCssStylesChanged: function (e, args) {
            },
            onHeaderFilterClick: function (e, args) {
            },
            onHeaderMenuOptionClick: function (e, args) {
            },
            onSelectedRangesChanged: function (e, args) {
            },
            onDataviewUpdate: function (e, args) {
            },
            onPasteCells: function (e, args) {
            },
            onPasteCellsUndo: function (e, args) {
            },
            beforeRender: function (data) {
                return data;
            },
            afterRender: function (data) {
            },
            onRenderError: function (error) {
                if(window.console) console.log(error);
            }
        },
        downloadId = generateUUID(),
        gridview, dataview;

    // Constructor
    function grid() { }

    // Render the SlickGrid
    // If data isn't provided directly, we assume ajax request
    // Otherwise, we can't render the grid without data
    grid.render = function (data) {
		// If there's a url and data parameter was not passed
        if (ajaxOptions.url && !arguments.length) {
        	// Pull data remotely
            refreshData(function (data) {
                data = events.beforeRender.call(grid, data);

                if (data) {
                    initGrid(data);
                }
                else {
                    notifyError({
                        title: 'Undefined Data Error',
                        desc: 'Data returned from beforeRender event is undefined.'
                    });
                }
            }, function (error) {
                notifyError({
                    title: 'Remote Data Error',
                    desc: 'There was a server error when retrieving data from the remote source.',
                    error: error
                });
            });
        }
        else {
            if (data) {
                showLoadingIndicator(true);
                data = events.beforeRender.call(grid, data);

				if (data) {
                    initGrid(data);
                }
				else {
                    notifyError({
                        title: 'Undefined Data Error',
                        desc: 'Data returned from beforeRender event is undefined.'
                    });
                }
            }
            else {
                notifyError({
                    title: 'No Data Error',
                    desc: 'SlimGrid is missing data or remote url missing from ajax options.'
                });
            }
        }

        return grid;
    };

    // If the SlickGrid already exists
    // Resize the canvas to fit the page
    grid.resize = function () {
        if (exists) {
            gridview.resizeCanvas();
            gridview.invalidate();
        }

        return grid;
    };

    // Getter/Setter for beforeRender event
    grid.beforeRender = function (_) {
        if (!arguments.length) return events.beforeRender;
        events.beforeRender = _;

        return grid;
    };

    // Getter/Setter for afterRender event
    grid.afterRender = function (_) {
        if (!arguments.length) return events.afterRender;
        events.afterRender = _;

        return grid;
    };

    // Getter/Setter for onRenderError event
    grid.onRenderError = function (_) {
        if (!arguments.length) return events.onRenderError;
        events.onRenderError = _;

        return grid;
    };

	// Getter/Setter for gridview (SlickGrid grid object)
    grid.gridview = function (_) {
        if (!arguments.length) return gridview;
        gridview = _;

        return grid;
    };

	// Getter/Setter for dataview (SlickGrid DataView object)
    grid.dataview = function (_) {
        if (!arguments.length) return dataview;
        dataview = _;

        return grid;
    };

    grid.showColumnpicker = function (_) {
        if (!arguments.length) return showColumnpicker;
        showColumnpicker = _;

        return grid;
    };

    grid.showHeaderFilter = function (_) {
        if (!arguments.length) return showHeaderFilter;
        showHeaderFilter = _;

        return grid;
    };

	// Getter/Setter for primary key
    grid.primaryKey = function (_) {
        if (!arguments.length) return pk;
        pk = _;

        return grid;
    };

	// Getter/Setter whether or not to auto create
	// a unique primary key
    grid.autoIncrement = function (_) {
        if (!arguments.length) return autoIncrement;
        autoIncrement = _;

        return grid;
    };

	// Getter/Setter for jQuery ajax options
    grid.ajaxOptions = function (_) {
        if (!arguments.length) return $.extend(true, {}, ajaxOptions);
        ajaxOptions = $.extend(ajaxOptions, _);

        return grid;
    };

	// Getter/Setter for whether or not the
	// grid has CSV download link
    grid.downloadable = function (_) {
        if (!arguments.length) return downloadable;
        downloadable = _;

        return grid;
    };

	// Getter/Setter to check if data being pasted in
	// the grid is required to match column schema exact
	// -- This greatly speeds up pasting of large data sets
    grid.pasteExactOnly = function (_) {
        if (!arguments.length) return pasteExactOnly;
        pasteExactOnly = _;

        return grid;
    };

	// Getter/Setter for SlickGrid options
	// Applies options directly to grid object if it
	// already exists
    grid.slickgridOptions = function (_) {
        if (!arguments.length) return slickgridOptions;
        slickgridOptions = $.extend(slickgridOptions, _);
        
        if (gridview) {
            gridview.setOptions(_);
            gridview.invalidate();
        }

        return grid;
    };

	// Getter/Setter for loading indicator
    grid.loadingIndicator = function (_) {
        if (!arguments.length) return loadingIndicator;
        loadingIndicator = _;

        return grid;
    };

	// Getter/Setter for rowFormatter callback function
    grid.rowFormatter = function (_) {
        if (!arguments.length) return rowFormatter;
        rowFormatter = _;

        return grid;
    };

    grid.columnOptions = function (_) {
        if (!arguments.length) return columnOptions;
        columnOptions = _;

        return grid;
    };

    grid.columns = function (_) {
        if (!arguments.length && gridview) return gridview.getColumns();
        if (gridview) gridview.setColumns(_);

        return grid;
    };

    grid.container = function (_) {
        if (!arguments.length) return container;
        container = _;

        return grid;
    };

    grid.height = function (_) {
        if (!arguments.length) return height;
        height = _;

        return grid;
    };

    grid.contextMenu = function (_) {
        if (!arguments.length) return contextMenu;
        contextMenu = _;

        return grid;
    };

    grid.copyOut = function (_) {
        if (!arguments.length) return copyOut;
        copyOut = _;

        return grid;
    };

    grid.selectionModel = function (_) {
        if (!arguments.length) return selectionModel;
        selectionModel = _;

        return grid;
    };

    grid.showPagerStats = function (_) {
        if (!arguments.length) return showPagerStats;
        showPagerStats = _;

        return grid;
    };

    grid.onAddNewRow = function (_) {
        if (!arguments.length) return events.onAddNewRow;
        events.onAddNewRow = _;

        return grid;
    };

    grid.onContextMenu = function (_) {
        if (!arguments.length) return events.onContextMenu;
        events.onContextMenu = _;

        return grid;
    };

    grid.onContextMenuClick = function (_) {
        if (!arguments.length) return events.onContextMenuClick;
        events.onContextMenuClick = _;

        return grid;
    };

    grid.onRowSelected = function (_) {
        if (!arguments.length) return events.onRowSelected;
        events.onRowSelected = _;

        return grid;
    };

    grid.onDataviewUpdate = function (_) {
        if (!arguments.length) return events.onDataviewUpdate;
        events.onDataviewUpdate = _;

        return grid;
    };

    grid.onCellChange = function (_) {
        if (!arguments.length) return events.onCellChange;
        events.onCellChange = _;

        return grid;
    };

    grid.onPasteCells = function (_) {
        if (!arguments.length) return events.onPasteCells;
        events.onPasteCells = _;

        return grid;
    };

    grid.onPasteCellsUndo = function (_) {
        if (!arguments.length) return events.onPasteCellsUndo;
        events.onPasteCellsUndo = _;

        return grid;
    };

    // Returns true/false whether or not the
    // SlickGrid has been created (rendered) or not
    grid.exists = function () {
        return exists;
    };

    // SlimGrid always uses a DataView
    // So we grab and return the data from the SlickGrid dataview
    grid.getData = function () {
        return dataview.getItems();
    };

    // Add multiple rows to the grid at
    // an index (if specified)
    grid.addRows = function (arr, idx) {
    	idx = idx ? idx : 0;
    	
    	if (exists) {
	        dataview.beginUpdate();
	        arr.forEach(function (item) {
	            dataview.insertItem(idx, item);
	        });
	        dataview.endUpdate();
	        dataview.refresh();
       	}
       	
       	return grid;
    };

    // Update multiple rows at once using the key
    // of the primary key value and the updated item
    grid.updateRows = function (arr) {
        
        if (arr.length > 0 && exists) {
            dataview.beginUpdate();
            arr.forEach(function (item) {
                dataview.updateItem(item[pk], item);
            });
            dataview.endUpdate();
            dataview.refresh();
        }
        
        return grid;
    };

    // Returns true/false whether or not a row
    // exists given the primary key value
    grid.rowIdExists = function (rowId) {
        return rowExists(rowId);
    };

    // If the grid is filtered, returns the data from that filtered
    // set. Creates a deep copy of each object,
    // so we don't hold reference to data still in grid)
    grid.getFilteredData = function () {
        var numRows = dataview.getLength(), data = [], i = 0;
        
        while (i < numRows) {
            data.push($.extend(true, {}, dataview.getItem(i)));
            i++;
        }

        return data;
    };

    // Returns a dataset of the currently
    // selected rows in the grid
    grid.getSelectedRows = function () {
        return getSelectedRows();
    };

    // ----- Private functions -----
    // Returns true/false whether or not a row exists
    // given a rowId (primary key) value
    // Underscore.js is currently used for finding the row
    // and will be removed as a dependency in the future
    function rowExists(rowId) {
        var data = dataview.getItems();
        var found = _.find(data, function (item) {
            return item[pk] == rowId;
        });

        return !found ? false : true;
    }

    // Returns an array of the currently
    // selected rows in the grid
    function getSelectedRows() {
        var selectedData = [];
        if (exists) {
            var selectedIndexes = gridview.getSelectedRows();
            $.each(selectedIndexes, function (index, value) {
                selectedData.push(gridview.getData().getItem(value));
            });
        }

        return selectedData;
    }

    // Performs a jQuery ajax request with the provided
    // ajax options. Callbacks are called based on ajax result
    function refreshData(success, err) {

        showLoadingIndicator(true);

        // Retrieve data from remote source
        var defaultOptions = {
            async: true,
            type: "GET",
            url: null,
            cache: true,
            dataType: "json",
            success: function (data) {
                success(data);
            },
            error: function (error) {
                showLoadingIndicator(false);
                err(error);
            }
        };
		
		// Call jQuery ajax function
        $.ajax($.extend({}, defaultOptions, ajaxOptions));
    }

    function initGrid(data) {

        if (data.length > 0) {

            // If SlimGrid needs to generate a unique key
            if (autoIncrement) {
                var rowId = 0;
                for (var row in data) {
                    data[row][pk] = rowId;
                    ++rowId;
                }
            }

            // If the grid doesn't already exist
            if (!exists) {
                var standardColumns = [];

                // Iterate through the first row so we can grab the
                // columns and set their options
                for (var key in data[0]) {
                    if (key != pk) {

                        // Default column options
                        var column = {
                            'id': key,
                            'name': key,
                            'field': key,
                            'sortable': true,
                            'formatter': function (row, cell, value, columnDef, dataContext) {
                                return value;
                            },
                            'cssClass': 'text-center'
                        };
                        
                        // Override column options with user preferences
                        column = columnOptions.call(grid, key, column);

                        // Allow columns to be hidden, if specified
                        var addColumn = true;
                        if (column.hasOwnProperty('hidden')) {
                            if (column['hidden']) addColumn = false;
                        }
                        
                        if (addColumn) standardColumns.push(column);
                    }
                }


                var copyPastePluginOptions = {
                    clipboardCommandHandler: function (editCommand) {
                        // Only execute pastes/undo/redo if the grid is editable
                        if (slickgridOptions.editable) {
                            undoRedoBuffer.queueAndExecuteCommand.call(undoRedoBuffer, editCommand);
                        }
                    },
                    exactDataOnly: pasteExactOnly,  // Pasted format must match grid exactly
                    autoIncrement: autoIncrement
                };

                // Buffer for pasting/undo/redo
                var undoRedoBuffer = {
                    commandQueue: [],
                    commandCtr: 0,

                    queueAndExecuteCommand: function (editCommand) {
                        this.commandQueue[this.commandCtr] = editCommand;
                        this.commandCtr++;
                        editCommand.execute(pk, events.onPasteCells);
                    },

                    undo: function () {
                        if (this.commandCtr == 0)
                            return;

                        this.commandCtr--;
                        var command = this.commandQueue[this.commandCtr];

                        if (command && Slick.GlobalEditorLock.cancelCurrentEdit()) {
                            command.undo(pk, events.onPasteCellsUndo);
                        }
                    },
                    redo: function () {
                        if (this.commandCtr >= this.commandQueue.length)
                            return;
                        var command = this.commandQueue[this.commandCtr];
                        this.commandCtr++;
                        if (command && Slick.GlobalEditorLock.cancelCurrentEdit()) {
                            command.execute(pk, events.onPasteCells);
                        }
                    }
                };

				// Underscore.js is used for parts of this filter
				// This dependency will eventually be removed
                function filter(item) {
                    // Regex pattern to validate numbers
                    // a number negative/positive with decimals with/without $, %
                    var patRegex_no = /^[$]?[-+]?[0-9.,]*[$%]?$/,
                        columns = gridview.getColumns(),
                        value = true;

                    for (var i = 0; i < columns.length; i++) {
                        var col = columns[i];
                        var filterValues = col.filterValues;

                        if (filterValues && filterValues.length > 0) {
                            value = value & _.contains(filterValues, item[col.field]);
                        }
                    }

                    for (var columnId in columnFilters) {
                        if (columnId !== undefined && columnFilters[columnId] !== "") {
                            var c = gridview.getColumns()[gridview.getColumnIndex(columnId)];
                            var filterVal = columnFilters[columnId].toLowerCase();
                            var filterChar1 = filterVal.substring(0, 1); // grab the 1st Char of the filter field, so we could detect if it's a condition or not

                            if (item[c.field] == null)
                                return false;

                            // First let see if the user supplied a condition (<, <=, >, >=, !=, <>, =, ==)
                            // Substring on the 1st Char is enough to find out if it's a condition or not
                            // if a condition is supplied, we might have to transform the values (row values & filter value) before comparing
                            // for a String (we'll do a regular indexOf), for a number (parse to float then compare), for a date (create a Date Object then compare)
                            if (filterChar1 == '<' || filterChar1 == '>' || filterChar1 == '!' || filterChar1 == '=') {
                                // We found a Condition filter, find the white space index position of the condition substring (should be index 1 or 2)
                                var idxFilterSpace = filterVal.indexOf(" ");

                                if (idxFilterSpace > 0) {
                                    // Split the condition & value of the full filter String
                                    var condition = filterVal.substring(0, idxFilterSpace);
                                    var filterNoCondVal = columnFilters[columnId].substring(idxFilterSpace + 1);

                                    // Which type are the row values? We'll convert to proper format before applying the condition
                                    // Then apply the condition comparison: String (we'll do a regular indexOf), number (parse to float then compare)
                                    if (patRegex_no.test(item[c.field])) {
                                        if (testCondition(condition, parseFloat(item[c.field]), parseFloat(filterNoCondVal)) == false)
                                            return false;
                                        // whatever is remain will be tested as a regular String format     
                                    } else {
                                        if (testCondition(condition, item[c.field].toLowerCase(), filterNoCondVal.toLowerCase()) == false)
                                            return false;
                                    }
                                }
                            } else {
                                if (typeof item[c.field] != 'number') {
                                    if (item[c.field].toString().toLowerCase().indexOf(columnFilters[columnId].toLowerCase()) == -1)
                                        return false;
                                }
                                else {
                                    if (item[c.field].toString().indexOf(columnFilters[columnId]) == -1)
                                        return false;
                                }
                            }
                        }
                    }

                    return value;
                }

                // Available header input filter operators
                function testCondition(condition, value1, value2) {
                    switch (condition) {
                        case '<':
                            var resultCond = (value1 < value2) ? true : false;
                            break;
                        case '<=':
                            var resultCond = (value1 <= value2) ? true : false;
                            break;
                        case '>':
                            var resultCond = (value1 > value2) ? true : false;
                            break;
                        case '>=':
                            var resultCond = (value1 >= value2) ? true : false;
                            break;
                        case '!=':
                        case '<>':
                            var resultCond = (value1 != value2) ? true : false;
                            break;
                        case '=':
                        case '==':
                            var resultCond = (value1 == value2) ? true : false;
                            break;
                    }

                    return resultCond;
                }

                $(function () {

                    // Set the height of the grid container
                    myGrid.css('height', height + 'px');

                    // Create the grid's dataview
                    var groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider();
                    dataview = new Slick.Data.DataView({
                        groupItemMetadataProvider: groupItemMetadataProvider
                    });

                    // Create the grid and set its selection model (the grid is still not initialized)
                    gridview = new Slick.Grid(myGrid, dataview, standardColumns, slickgridOptions);
                    gridview.registerPlugin(groupItemMetadataProvider);
                    gridview.setSelectionModel(selectionModel);
                    gridview.getCanvasNode().focus();

                    // If we want the user to be able to copy data
                    // out of the grid with ctrl+c/command+c
                    if (copyOut) {
                        var copyManager = new Slick.CellExternalCopyManager(copyPastePluginOptions);
                        gridview.registerPlugin(copyManager);
                    }

                    // If we want a header column picker
                    if (showColumnpicker) {
                        var columnpicker = new Slick.Controls.ColumnPicker(standardColumns, gridview, slickgridOptions);
                    }

                    // Event is fired when the header context menu is shown
                    gridview.onHeaderContextMenu.subscribe(function (e, args) {
                        events.onHeaderContextMenu.call(grid, e, args);
                    });

                    // Event is fired when the column header is clicked
                    gridview.onHeaderClick.subscribe(function (e, args) {
                        events.onHeaderClick.call(grid, e, args);
                    });

                    // Event is fired when the grid is scrolled
                    gridview.onScroll.subscribe(function (e, args) {
                        events.onScroll.call(grid, e, args);
                    });

                    // Event is fired when the grid is sorted
                    gridview.onSort.subscribe(function (e, args) {
                        if (e.target.className != 'slick-header-menubutton') {
                            sorterDefault(args.sortCols, dataview);
                        }
                    });

                    // Event is fired when the mouse enters the grid
                    gridview.onMouseEnter.subscribe(function (e, args) {
                        events.onMouseEnter.call(grid, e, args);
                    });

                    // Event is fired when the mouse leaves the grid
                    gridview.onMouseLeave.subscribe(function (e, args) {
                        events.onMouseLeave.call(grid, e, args);
                    });

                    // Event is fired when mouse is clicked on the grid
                    gridview.onClick.subscribe(function (e, args) {
                        events.onClick.call(grid, e, args);
                    });

                    // Event is fired when mouse is double clicked on the grid
                    gridview.onDblClick.subscribe(function (e, args) {
                        events.onDblClick.call(grid, e, args);
                    });

                    // Event is fired when key is down when grid is focused
                    // NOTE: This won't work if the copyOut == true,
                    // since the plugin for copying uses this subscription
                    if(!copyOut) {
                        gridview.onKeyDown.subscribe(function (e, args) {
                            events.onKeyDown.call(grid, e, args);
                        });
                    }

                    // Event is fired when a cell edit attempt is made
                    // but the edit violates the cell's validation function
                    gridview.onValidationError.subscribe(function (e, args) {
                        events.onValidationError.call(grid, e, args);
                    });

                    // Event is fired when the grid's viewport changes size (width/height)
                    gridview.onViewportChanged.subscribe(function (e, args) {
                        events.onViewportChanged.call(grid, e, args);
                    });

                    // Event is fired when column(s) are dragged
                    // to a different position
                    gridview.onColumnsReordered.subscribe(function (e, args) {
                        events.onColumnsReordered.call(grid, e, args);
                    });

                    // Event is fired when column(s) are resized
                    gridview.onColumnsResized.subscribe(function (e, args) {
                        events.onColumnsResized.call(grid, e, args);
                    });

                    // Event is fired before a cell changes into edit mode
                    gridview.onBeforeEditCell.subscribe(function (e, args) {
                        events.onBeforeEditCell.call(grid, e, args);
                    });

                    // Event is fired right before a cell in
                    // edit mode changes back to normal
                    gridview.onBeforeCellEditorDestroy.subscribe(function (e, args) {
                        events.onBeforeCellEditorDestroy.call(grid, e, args);
                    });

                    // Event is fired right before the SlickGrid is destroyed
                    gridview.onBeforeDestroy.subscribe(function (e, args) {
                        events.onBeforeDestroy.call(grid, e, args);
                    });

                    // Event is fired when the active cell is changed
                    gridview.onActiveCellChanged.subscribe(function (e, args) {
                        events.onActiveCellChanged.call(grid, e, args);
                    });

                    //
                    gridview.onActiveCellPositionChanged.subscribe(function (e, args) {
                        events.onActiveCellPositionChanged.call(grid, e, args);
                    });

                    // Event is fired when a drag is initialized
                    gridview.onDragInit.subscribe(function (e, args) {
                        events.onDragInit.call(grid, e, args);
                    });

                    // Event is fired on the start of a drag event
                    gridview.onDragStart.subscribe(function (e, args) {
                        events.onDragStart.call(grid, e, args);
                    });

                    // Event is fired when drag is occurring
                    gridview.onDrag.subscribe(function (e, args) {
                        events.onDrag.call(grid, e, args);
                    });

                    // Event is fired when drag event ends
                    gridview.onDragEnd.subscribe(function (e, args) {
                        events.onDragEnd.call(grid, e, args);
                    });

                    // Event is fired when a cell's css style changes
                    gridview.onCellCssStylesChanged.subscribe(function (e, args) {
                        events.onCellCssStylesChanged.call(grid, e, args);
                    });

                    if (selectionModel) {
                        selectionModel.onSelectedRangesChanged.subscribe(function (e, args) {
                            gridview.focus();
                            events.onSelectedRangesChanged.call(grid, e, args);

                            if (args.length != 0) {
                                var columns = gridview.getColumns(),
                                    selectedArr = [];

                                for (var rg = 0; rg < args.length; rg++) {
                                    var range = args[rg],
                                        selectedRows = [];

                                    for (var i = range.fromRow; i < range.toRow + 1; i++) {
                                        var selectedCells = [],
                                            dt = gridview.getDataItem(i);

                                        for (var j = range.fromCell; j < range.toCell + 1; j++) {
                                            selectedCells.push(getDataItemValueForColumn(dt, columns[j]));
                                        }

                                        selectedRows.push(selectedCells);
                                    }

                                    for (var k = 0; k < selectedRows.length; k++){
                                        selectedArr.push(selectedRows[k]);
                                    }
                                }

                                calculateStatistics(selectedArr);
                            }
                        });

                        function getDataItemValueForColumn(item, columnDef) {
                            var val = '';

                            // If a custom getter is not defined, we call serializeValue of the editor to serialize
                            if (columnDef.editor) {
                                var editorArgs = {
                                    'container': $("body"),  // a dummy container
                                    'column': columnDef,
                                    'position': { 'top': 0, 'left': 0 }  // a dummy position required by some editors
                                };
                                var editor = new columnDef.editor(editorArgs);

                                editor.loadValue(item);
                                val = editor.serializeValue();
                                editor.destroy();
                            }
                            else {
                                val = item[columnDef.field];
                            }

                            return val;
                        }

                        function calculateStatistics(selectionArray) {
                            // Flatten the selected range (2d array)
                            var flattened = [].concat.apply([], selectionArray);

                            // Check if our values are numeric, if not
                            // not just ignore the iteration
                            var ignored = 0;
                            var sum = flattened.reduce(function (a, b) {
                                if (!$.isNumeric(a) || !$.isNumeric(b))
                                    ignored++;

                                a = $.isNumeric(a) ? a : 0;
                                b = $.isNumeric(b) ? b : 0;

                                return parseFloat(a) + parseFloat(b);
                            });

                            // Calculate sum/avg/count stats for selection
                            sum = $.isNumeric(sum) ? Math.round(sum * 100)/100 : 0;
                            var avg = flattened.length > ignored  ? Math.round((sum / (flattened.length - ignored))*100)/100 : 0;
                            var count = flattened.length;

                            var statString = 'Average: ' + avg + ' Count: ' + count + ' Sum: ' + sum;
                            $(myPager).find('.slick-pager-statistics').text(statString);
                        }
                    }

                    // Allows for sorting when clicking on column header
                    // This and headerSorter will eventually be merged,
                    // too much duplicate code...
                    function sorterDefault(sortCols, dataview) {
                        events.onSort.call(grid, sortCols, dataview);
                        dataview.sort(function (row1, row2) {
                            for (var i = 0, l = sortCols.length; i < l; i++) {
                                var field = sortCols[i].sortCol.field;
                                var sign = sortCols[i].sortAsc ? 1 : -1;
                                var x = row1[field], y = row2[field];
                                var result = (x < y ? -1 : (x > y ? 1 : 0)) * sign;
                                if (result != 0) {
                                    return result;
                                }
                            }
                            return 0;
                        }, true);
                    }

                    // Allows for sorting asc/desc when clicking on header menu items
                    function headerSorter(sortCols, dataview, sortAsc) {
                        events.onSort.call(grid, sortCols, dataview);
                        dataview.sort(function (row1, row2) {
                            for (var i = 0, l = sortCols.length; i < l; i++) {
                                var field = sortCols[i].field;
                                var sign = sortAsc ? 1 : -1;
                                var x = row1[field], y = row2[field];
                                var result = (x < y ? -1 : (x > y ? 1 : 0)) * sign;
                                if (result != 0) {
                                    return result;
                                }
                            }
                            return 0;
                        }, true);
                    }

                    if (typeof selectionModel == 'RowSelectionModel') {
                        // Event is fired when a new row is selected other than
                        // the current selected row
                        gridview.onSelectedRowsChanged.subscribe(function (e, args) {
                            var selectedIndexes = gridview.getSelectedRows(),
                                selectedData = getSelectedRows();

                            events.onRowSelected.call(grid, e, args, selectedData);
                            if (selectedIndexes.length > 0) gridview.setActiveCell(selectedIndexes[0], 0);
                        });
                    }

                    // Event is fired when a new row is created
                    gridview.onAddNewRow.subscribe(function (e, args) {
                        var row = {}, cols = gridview.getColumns(), item = args['item'];
                        // For each column we have, check to see if we had a value added for it
                        cols.forEach(function (col) {
                            row[col['id']] = item.hasOwnProperty(col['id']) ? item[col['id']] : null;
                        });

                        events.onAddNewRow.call(this, e, args, [row]);
                    });

                    // Event is fired when the grid's row count changes
                    dataview.onRowCountChanged.subscribe(function (e, args) {
                        if (exists) events.onDataviewUpdate.call(grid, e, args);
                        gridview.updateRowCount();
                        gridview.render();
                    });

                    // Event is fired when a row changes
                    dataview.onRowsChanged.subscribe(function (e, args) {
                        gridview.invalidateRows(args.rows);
                        gridview.render();
                    });

                    dataview.getItemMetadata = function (row) {
                        return rowFormatter(row, dataview);
                    };

                    // Create small delay timer for use when a
                    // user types in the input filters
                    var delay = (function () {
                        var timer = 0;
                        return function (callback, ms) {
                            clearTimeout(timer);
                            timer = setTimeout(callback, ms);
                        };
                    })();

                    // Update the dataview after a delay when filter is typed in header input
                    $(gridview.getHeaderRow()).delegate(":input", "change keyup", function (e) {
                        var columnId = $(this).data("columnId");
                        if (columnId != null) {
                            columnFilters[columnId] = $.trim($(this).val());
                            delay(function () {
                                dataview.refresh();
                            }, 300);
                        }
                    });

                    // Event fired when the header row is rendered
                    gridview.onHeaderRowCellRendered.subscribe(function (e, args) {
                        events.onHeaderRowCellRendered.call(grid, e, args);
                    });

                    // Event fired right before the header row is destroyed
                    gridview.onBeforeHeaderRowCellDestroy.subscribe(function (e, args) {
                        events.onBeforeHeaderRowCellDestroy.call(grid, e, args);
                    });

                    // Event fire when a cell's value changes by an edit
                    // Pass the stuff we might need to update a cell
                    // in the backend as an object, for convenience
                    gridview.onCellChange.subscribe(function (e, args) {
                        var cell = {};

                        cell.pkColumn = pk;
                        cell.pk = args.item[pk];
                        cell.value = args.item[gridview.getColumns()[args.cell].field];
                        cell.column = gridview.getColumns()[args.cell].field;

                        events.onCellChange.call(grid, e, args, cell);
                    });

                    if (contextMenu) {
                        // Event fired when right-click initiated over grid cells
                        gridview.onContextMenu.subscribe(function (e, args) {
                            e.preventDefault();

                            var cell = gridview.getCellFromEvent(e);
                            events.onContextMenu.call(grid, e, args, cell, gridview);

                            // If row(s) are selected, show the context menu
                            var selectedIndexes = gridview.getSelectedRows();
                            if (selectedIndexes.length > 0) {
                                contextMenu
                                    .data("row", cell.row)
                                    .css("top", e.pageY)
                                    .css("left", e.pageX)
                                    .show();
                            }

                            // Hide the context menu on click
                            // anywhere away from it
                            $('body').one('click', function () {
                                contextMenu.hide();
                            });
                        });

                        // Event fired when a context menu option is selected
                        contextMenu.click(function (e) {
                            var selectedData = getSelectedRows();
                            events.onContextMenuClick.call(grid, e, selectedData);
                        });
                    }

                    // Add grid and pager to the parent container
                    myGrid.appendTo(container);
                    myPager.appendTo(container);

                    var pager = new Slick.Controls.Pager(dataview, gridview, myPager);

                    // Set the data with our primary key
                    // and the filter function
                    dataview.beginUpdate();
                    dataview.setItems(data, pk);
                    dataview.setFilter(filter);
                    dataview.endUpdate();

                    if (showHeaderFilter) {
                        //	https://github.com/danny-sg/slickgrid-spreadsheet-plugins
                        var filterPlugin = new Ext.Plugins.HeaderFilter({});

                        // This event is fired when a filter is selected
                        filterPlugin.onFilterApplied.subscribe(function (e, args) {

                            events.onHeaderFilterClick.call(grid, e, args);

                            dataview.refresh();
                            gridview.invalidate();
                            gridview.resetActiveCell();
                        });

                        // Event fired when a menu option is selected
                        filterPlugin.onCommand.subscribe(function (e, args) {
                            events.onHeaderMenuOptionClick.call(grid, e, args);
                            headerSorter([args.column], dataview, args.command === "sort-asc");
                        });

                        gridview.registerPlugin(filterPlugin);
                    }

                    // Initialize the SlickGrid
                    gridview.init();

                    // If we want the grid to be excel downloadable
                    var pager = $(myPager).find('.slick-pager');
                    // Create a holder for grid selection statistics
                    pager.append('<span class="slick-pager-statistics" style="font-size: 11px; padding: 3px; float: right"></span>');

                    // Creates an Excel download link if the browser isn't old IE
                    if (downloadable) {
                        pager.append('<span id="' + downloadId + '" style="padding: 3px !important; font-size: 11px;"></span>');
                        createDownloadCSVButton('#' + downloadId + '', 'RawData', false, '', 'Download Data', data);
                    }

                    showLoadingIndicator(false);
                    if (loadingIndicator) pager.append(loadingIndicator);

                    // At this point, the grid should be rendered
                    exists = true;
                    events.afterRender.call(grid, data);
                });
            }
            else {
                // If we want the grid to be excel downloadable
                // Creates an Excel download button if the browser isn't IE
                if (downloadable) {
                    createDownloadCSVButton('#' + downloadId + '', 'RawData', false, '', 'Download Data', data);
                }

                // Update the existing grid with new data
                updateGrid(data);
            }
        }
        else {
            notifyError({
                title: 'No Data Error',
                desc: 'Unable to initialize grid due to empty dataset.'
            });
        }
    }

    function updateGrid(data) {

        // Make sure we have a SlickGrid already
        if (exists) {

            var standardColumns = [];

            for (var key in data[0]) {

                // By default, don't show the primary key column
                if (key != pk) {

                    // Default column options
                    var column = {
                        'id': key,
                        'name': key,
                        'field': key,
                        'sortable': true,
                        'formatter': function (row, cell, value, columnDef, dataContext) {
                            return value;
                        },
                        'cssClass': 'text-center'
                    };

                    // Override/merge default column options with custom preferences
                    column = columnOptions.call(grid, key, column);

                    // Hide the column so it doesn't display in the grid
                    // NOTE: The column is still available when accessing grid data
                    var addColumn = true;
                    if (column.hasOwnProperty('hidden')) {
                        if (column['hidden']) addColumn = false;
                    }

                    if (addColumn) standardColumns.push(column);
                }
            }

            // Set columns into SlickGrid
            gridview.setColumns(standardColumns);

            gridview.onHeaderRowCellRendered.unsubscribe(events.onHeaderRowCellRendered);

            // Set the new data into our dataview
            dataview.beginUpdate();
            dataview.setItems(data, pk);
            dataview.endUpdate();

            // Allow formatting of rows (color, etc.)
            // using SlickGrid's metadata access
            dataview.getItemMetadata = function (row) {
                return rowFormatter.call(grid, row);
            };

			// Perform a resize
            gridview.invalidate();
            gridview.resizeCanvas();

            showLoadingIndicator(false);
        }
        else {
            showLoadingIndicator(false);

            notifyError({
                title: 'Undefined Grid Error',
                desc: 'Tried to call methods on SlickGrid object is undefined.'
            });
        }
    }

    // Helper function for display SlimGrid errors
    function notifyError(error){
        events.onRenderError.call(grid, error);
        throw new Error(error.desc);
    }

    // Helper function to show/hide loading indicator spinner (if it exists)
    function showLoadingIndicator(show) {
        if (loadingIndicator) {
            if (show) loadingIndicator.show();
            else loadingIndicator.hide();
        }
    }

    // Helper function for generating a unique identifier for download id/SlimGrid id
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Create a download CSV button (remove current data if there's already one)
    // - containerID (string): CSS id attribute (ie. #container) of the DOM element that you want the button to be appended to
    // - filename (string): What you want the file to be called
    // - showIcon (boolean): Whether or not to show a download icon in the button
    // - btnClass (string): Class to add to the button to change it's appearance (ie. btn btn-primary, btn btn-info)
    // - btnText (string): What text you want to be displayed on the button
    // - data (array): Flat json object array of the data you want to be downloaded
    function createDownloadCSVButton(containerID, filename, showIcon, btnClass, btnText, data) {

        // This method only works if the browser isn't IE
        if (!$('html').hasClass('ie') && !$('html').hasClass('ie9')) {
            // Clean up old download button (if there is one)
            // Prevents overloading of objectURLs on the browser
            removeDownloadCSVButton(containerID);
            // Convert the JSON to CSV format
            var csvData = JSONToCSV(data);
            // Create a blob using the csvdata
            var bb = new Blob([csvData], {type: 'text/csv'});
            // Create an object url from the blob
            var url = window.URL.createObjectURL(bb);
            var iconHTML = '';
            if (showIcon)
                iconHTML = '<i class="icon icon-download-alt icon-white"></i> ';
            // Append the button to the user's container
            $(containerID).append('<a download="' + filename + '.csv" downloadurl="text/csv:' + filename + '.csv:' + url + '" href="' + url + '" class="' + btnClass + ' csv-download-btn">' + iconHTML + btnText + '</a>');
        }

        function removeDownloadCSVButton(containerID) {

            if (!$('html').hasClass('ie') && !$('html').hasClass('ie9')) {
                // Remove any stored internal blobs from the browser
                var oldURL = $(containerID + ' .csv-download-btn').attr('href');
                window.URL.revokeObjectURL(oldURL);
                // Remove the button if we already have one on the page
                $(containerID + ' .csv-download-btn').remove();
            }
        }

        // Converts from JSON format to CSV format (header included)
        // Recieves:
        // - objArray (array): Flat json object array, each object is considered a row.
        // Returns: 
        // - str (string): Comma seperated
        function JSONToCSV(objArray) {
            var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray,
                str = '';

            for (var i = 0; i < array.length; i++) {
                var line = '';

                // Header values
                if (i == 0) {
                    for (var columnName in array[i]) {
                        line += '"' + columnName + '",';
                    }
                    line.slice(0, line.Length - 1);
                    str += line + '\r\n';
                    line = '';
                }

                // All other values
                for (var index in array[i]) {
                    line += '"' + array[i][index] + '",';
                }
                line.slice(0, line.Length - 1);
                str += line + '\r\n';
            }

            return str;
        }
    }

    return grid;
}

// External Copy Manager Plugin
// Developed by: Nereo Labs
// https://github.com/Celebio/SlickGrid
(function ($) {
    // register namespace
    $.extend(true, window, {
        "Slick": {
            "CellExternalCopyManager": CellExternalCopyManager
        }
    });


    function CellExternalCopyManager(options) {
        /*
         This manager enables users to copy/paste data from/to an external Spreadsheet application
         such as MS-Excel® or OpenOffice-Spreadsheet.

         Since it is not possible to access directly the clipboard in javascript, the plugin uses
         a trick to do it's job. After detecting the keystroke, we dynamically create a textarea
         where the browser copies/pastes the serialized data.

         options:
         copiedCellStyle : sets the css className used for copied cells. default : "copied"
         copiedCellStyleLayerKey : sets the layer key for setting css values of copied cells. default : "copy-manager"
         dataItemColumnValueExtractor : option to specify a custom column value extractor function
         dataItemColumnValueSetter : option to specify a custom column value setter function
         clipboardCommandHandler : option to specify a custom handler for paste actions
         bodyElement: option to specify a custom DOM element which to will be added the hidden textbox. It's useful if the grid is inside a modal dialog.
         */
        var _grid;
        var _self = this;
        var _copiedRanges;
        var _options = options || {};
        var _copiedCellStyleLayerKey = _options.copiedCellStyleLayerKey || "copy-manager";
        var _copiedCellStyle = _options.copiedCellStyle || "copied";
        var _clearCopyTI = 0;
        var _bodyElement = _options.bodyElement || document.body;

        var keyCodes = {
            'C': 67,
            'V': 86,
            'ESC': 27
        }

        function init(grid) {
            _grid = grid;
            _grid.onKeyDown.subscribe(handleKeyDown);

            // we need a cell selection model
            var cellSelectionModel = grid.getSelectionModel();
            if (!cellSelectionModel) {
                throw new Error("Selection model is mandatory for this plugin. Please set a selection model on the grid before adding this plugin: grid.setSelectionModel(new Slick.CellSelectionModel())");
            }
            // we give focus on the grid when a selection is done on it.
            // without this, if the user selects a range of cell without giving focus on a particular cell, the grid doesn't get the focus and key stroke handles (ctrl+c) don't work
            cellSelectionModel.onSelectedRangesChanged.subscribe(function (e, args) {
                _grid.focus();
            });
        }

        function destroy() {
            _grid.onKeyDown.unsubscribe(handleKeyDown);
        }

        function getDataItemValueForColumn(item, columnDef) {
            if (_options.dataItemColumnValueExtractor) {
                return _options.dataItemColumnValueExtractor(item, columnDef);
            }

            var retVal = '';

            // if a custom getter is not defined, we call serializeValue of the editor to serialize
            if (columnDef.editor) {
                var editorArgs = {
                    'container': $("body"),  // a dummy container
                    'column': columnDef,
                    'position': {'top': 0, 'left': 0}  // a dummy position required by some editors
                };
                var editor = new columnDef.editor(editorArgs);
                editor.loadValue(item);
                retVal = editor.serializeValue();
                editor.destroy();
            }
            else {
                retVal = item[columnDef.field];
            }

            return retVal;
        }

        function setDataItemValueForColumn(item, columnDef, value) {
            if (_options.dataItemColumnValueSetter) {
                return _options.dataItemColumnValueSetter(item, columnDef, value);
            }

            // if a custom setter is not defined, we call applyValue of the editor to unserialize
            if (columnDef.editor) {
                var editorArgs = {
                    'container': $("body"),  // a dummy container
                    'column': columnDef,
                    'position': {'top': 0, 'left': 0}  // a dummy position required by some editors
                };
                var editor = new columnDef.editor(editorArgs);
                editor.loadValue(item);
                editor.applyValue(item, value);
                editor.destroy();
            }
        }

        function _createTextBox(innerText) {
            var ta = document.createElement('textarea');
            ta.style.position = 'absolute';
            ta.style.left = '-1000px';
            ta.style.top = document.body.scrollTop + 'px';
            ta.value = innerText;
            _bodyElement.appendChild(ta);
            ta.select();

            return ta;
        }

        function _decodeTabularData(_grid, ta) {
            var columns = _grid.getColumns();
            var clipText = ta.value;
            var clipRows = clipText.split(/[\n\f\r]/);
            var clippedRange = [];

            _bodyElement.removeChild(ta);

            for (var i = 0; i < clipRows.length; i++) {
                if (clipRows[i] != "")
                    clippedRange[i] = clipRows[i].split("\t");
            }

            var slickData = [], matching = true;
            for (var j = 0; j < clippedRange.length; j++) {
                var slickRow = {}, row = clippedRange[j];
                if (row.length == columns.length) {
                    for (var i = 0; i < row.length; i++) {
                        var val = row[i];
                        slickRow[columns[i]['id']] = val;
                    }
                    slickData.push(slickRow);
                }
                else {
                    matching = false;
                    break;
                }
            }

            var selectedCell = _grid.getActiveCell();
            var ranges = _grid.getSelectionModel().getSelectedRanges();
            var selectedRange = ranges && ranges.length ? ranges[0] : null;   // pick only one selection
            var activeRow = null;
            var activeCell = null;

            if (selectedRange) {
                activeRow = selectedRange.fromRow;
                activeCell = selectedRange.fromCell;
            } else if (selectedCell) {
                activeRow = selectedCell.row;
                activeCell = selectedCell.cell;
            } else {
                // we don't know where to paste
                return;
            }

            var oneCellToMultiple = false;
            var destH = clippedRange.length;
            var destW = clippedRange.length ? clippedRange[0].length : 0;
            if (clippedRange.length == 1 && clippedRange[0].length == 1 && selectedRange) {
                oneCellToMultiple = true;
                destH = selectedRange.toRow - selectedRange.fromRow + 1;
                destW = selectedRange.toCell - selectedRange.fromCell + 1;
            }
            var availableRows = _grid.getData().length - activeRow;
            var addRows = 0;
            if (availableRows < destH) {
                var d = _grid.getData();
                for (addRows = 1; addRows <= destH - availableRows; addRows++)
                    d.push({});
                _grid.setData(d);
                _grid.render();
            }
            var clipCommand = {
                isClipboardCommand: true,
                clippedRange: clippedRange,
                oldValues: [],
                cellExternalCopyManager: _self,
                _options: _options,
                setDataItemValueForColumn: setDataItemValueForColumn,
                markCopySelection: markCopySelection,
                oneCellToMultiple: oneCellToMultiple,
                activeRow: activeRow,
                activeCell: activeCell,
                destH: destH,
                destW: destW,
                desty: activeRow,
                destx: activeCell,
                maxDestY: _grid.getDataLength(),
                maxDestX: _grid.getColumns().length,
                h: 0,
                w: 0,
                execute: function (pk, event) {
                    this.h = 0;
                    var changedCells = [], err = {};

                    // Fast even with large data sets
                    if (_options.exactDataOnly) {
                        if (matching) {
                            var dv = _grid.getData();

                            // If we want a temporary primary key
                            if (_options.autoIncrement) {
                                var rowId = 0;
                                for (row in slickData) {
                                    slickData[row][pk] = rowId;
                                    ++rowId;
                                }
                            }

                            dv.beginUpdate();
                            dv.setItems(slickData, pk);
                            dv.endUpdate();
                            _grid.invalidate();

                            if (event) event(slickData);
                        }
                        else {
                            err['status'] = 'fail';
                            err['desc'] = 'Pasted data does not match column schema';
                            if (event) event(changedCells, err);
                        }
                    }

                    // Slow (with big datasets)
                    if (!_options.exactDataOnly) {
                        for (var y = 0; y < destH; y++) {
                            this.oldValues[y] = [];
                            this.w = 0;
                            this.h++;

                            for (var x = 0; x < destW; x++) {
                                this.w++;
                                var desty = activeRow + y;
                                var destx = activeCell + x;

                                if (desty < this.maxDestY && destx < this.maxDestX) {
                                    var nd = _grid.getCellNode(desty, destx);
                                    var dt = _grid.getDataItem(desty);

                                    var destPK = dt[pk];
                                    var destColName = columns[destx]['id'];
                                    var newValue = clippedRange[y][x];

                                    changedCells.push({
                                        'pkColumn': pk,
                                        'pk': destPK,
                                        'column': destColName,
                                        'value': newValue
                                    });

                                    this.oldValues[y][x] = dt[columns[destx]['id']];
                                    if (oneCellToMultiple)
                                        this.setDataItemValueForColumn(dt, columns[destx], clippedRange[0][0]);
                                    else
                                        this.setDataItemValueForColumn(dt, columns[destx], clippedRange[y][x]);
                                    _grid.updateCell(desty, destx);
                                }
                            }
                        }

                        if (event) event(changedCells);

                        var bRange = {
                            'fromCell': activeCell,
                            'fromRow': activeRow,
                            'toCell': activeCell + this.w - 1,
                            'toRow': activeRow + this.h - 1
                        }

                        this.markCopySelection([bRange]);
                        _grid.getSelectionModel().setSelectedRanges([bRange]);
                        this.cellExternalCopyManager.onPasteCells.notify({ranges: [bRange]});
                    }
                },

                undo: function (pk, event) {
                    var changedCells = [];
                    for (var y = 0; y < destH; y++) {
                        for (var x = 0; x < destW; x++) {
                            var desty = activeRow + y;
                            var destx = activeCell + x;

                            if (desty < this.maxDestY && destx < this.maxDestX) {
                                var nd = _grid.getCellNode(desty, destx);
                                var dt = _grid.getDataItem(desty);

                                var destPK = dt[pk];
                                var destColName = columns[destx]['id'];
                                var oldValue = this.oldValues[y][x];

                                changedCells.push({
                                    'pkColumn': pk,
                                    'pk': destPK,
                                    'column': destColName,
                                    'value': oldValue
                                });

                                if (oneCellToMultiple)
                                    this.setDataItemValueForColumn(dt, columns[destx], this.oldValues[0][0]);
                                else
                                    this.setDataItemValueForColumn(dt, columns[destx], this.oldValues[y][x]);
                                _grid.updateCell(desty, destx);
                            }
                        }
                    }

                    if (event) event(changedCells);

                    var bRange = {
                        'fromCell': activeCell,
                        'fromRow': activeRow,
                        'toCell': activeCell + this.w - 1,
                        'toRow': activeRow + this.h - 1
                    }

                    this.markCopySelection([bRange]);
                    _grid.getSelectionModel().setSelectedRanges([bRange]);
                    this.cellExternalCopyManager.onPasteCells.notify({ranges: [bRange]});

                    if (addRows > 1) {
                        var d = _grid.getData();
                        for (; addRows > 1; addRows--)
                            d.splice(d.length - 1, 1);
                        _grid.setData(d);
                        _grid.render();
                    }
                }
            };

            if (_options.clipboardCommandHandler) {
                _options.clipboardCommandHandler(clipCommand);
            }
            else {
                clipCommand.execute();
            }
        }


        function handleKeyDown(e, args) {
            var ranges;
            if (!_grid.getEditorLock().isActive()) {
                if (e.which == keyCodes.ESC) {
                    if (_copiedRanges) {
                        e.preventDefault();
                        clearCopySelection();
                        _self.onCopyCancelled.notify({ranges: _copiedRanges});
                        _copiedRanges = null;
                    }
                }

                if (e.which == keyCodes.C && (e.ctrlKey || e.metaKey)) {    // CTRL + C
                    ranges = _grid.getSelectionModel().getSelectedRanges();
                    if (ranges.length != 0) {
                        _copiedRanges = ranges;
                        markCopySelection(ranges);
                        _self.onCopyCells.notify({ranges: ranges});

                        var columns = _grid.getColumns();
                        var clipTextArr = [];

                        for (var rg = 0; rg < ranges.length; rg++) {
                            var range = ranges[rg];
                            var clipTextRows = [];
                            for (var i = range.fromRow; i < range.toRow + 1; i++) {
                                var clipTextCells = [];
                                var dt = _grid.getDataItem(i);

                                for (var j = range.fromCell; j < range.toCell + 1; j++) {
                                    clipTextCells.push(getDataItemValueForColumn(dt, columns[j]));
                                }
                                clipTextRows.push(clipTextCells.join("\t"));
                            }
                            clipTextArr.push(clipTextRows.join("\r\n"));
                        }
                        var clipText = clipTextArr.join('');
                        var $focus = $(_grid.getActiveCellNode());
                        var ta = _createTextBox(clipText);

                        ta.focus();

                        setTimeout(function () {
                            _bodyElement.removeChild(ta);
                            // restore focus
                            if ($focus && $focus.length > 0) {
                                $focus.attr('tabIndex', '-1');
                                $focus.focus();
                                $focus.removeAttr('tabIndex');
                            }
                        }, 100);

                        return false;
                    }
                }

                if (e.which == keyCodes.V && (e.ctrlKey || e.metaKey)) {    // CTRL + V
                    var ta = _createTextBox('');

                    setTimeout(function () {
                        _decodeTabularData(_grid, ta);
                    }, 100);

                    return false;
                }
            }
        }

        function markCopySelection(ranges) {
            clearCopySelection();

            var columns = _grid.getColumns();
            var hash = {};
            for (var i = 0; i < ranges.length; i++) {
                for (var j = ranges[i].fromRow; j <= ranges[i].toRow; j++) {
                    hash[j] = {};
                    for (var k = ranges[i].fromCell; k <= ranges[i].toCell && k < columns.length; k++) {
                        hash[j][columns[k].id] = _copiedCellStyle;
                    }
                }
            }
            _grid.setCellCssStyles(_copiedCellStyleLayerKey, hash);
            clearTimeout(_clearCopyTI);
            _clearCopyTI = setTimeout(function () {
                _self.clearCopySelection();
            }, 2000);
        }

        function clearCopySelection() {
            _grid.removeCellCssStyles(_copiedCellStyleLayerKey);
        }

        $.extend(this, {
            "init": init,
            "destroy": destroy,
            "clearCopySelection": clearCopySelection,
            "handleKeyDown": handleKeyDown,

            "onCopyCells": new Slick.Event(),
            "onCopyCancelled": new Slick.Event(),
            "onPasteCells": new Slick.Event()
        });
    }
})(jQuery);