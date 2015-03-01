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
    var slickgridOptions = {
            showHeaderRow: true,
            enableCellNavigation: true,
            enableColumnReorder: true,
            multiColumnSort: true,
            headerRowHeight: 30,
            explicitInitialization: true,
            defaultColumnWidth: 150,
            rowHeight: 25,
            editable: false,
            enableTextSelectionOnCells: false,
            forceFitColumns: false,
            multiSelect: false
        },
        exists = false,
        autoIncrement = false,
        downloadable = true,
        showColumnpicker = false,
        pasteExactOnly = false,
        showHeaderFilter = true,
        copyOut = false,
        loadingIndicator = null, //$('<img style="vertical-align: text-bottom;" src=""/>')
        container = $('body'),
        contextMenu = null,
        height = 600,
        pk = 'ID',
        myGrid = $('<div class="slim-grid" style="height: ' + height + 'px; border-right: 1px solid #d3d3d3; border-left: 1px solid #d3d3d3; font-size: 11px !important;"></div>'),
        myPager = $('<div class="slim-pager"></div>'),
        selectionModel = 'row',
        columnFilters = {},
        ajaxOptions = {
            async: false,
            type: 'GET',
            url: '',
            cache: false,
            dataType: 'json'
        },
        rowFormatter = function (row, dataview) {

        },
        columnFormatter = function (row, cell, value, columnDef, dataContext) {
            return value;
        },
        columnOptions = function (key, column) {
            return column;
        },
        events = {
            onContextMenu: function (e, cell, gridview) {
            },
            onContextMenuClick: function (e, selectedData) {
            },
            onAddNewRow: function (e, args, row) {
            },
            onRowSelected: function (e, selectedData) {
            },
            onDataviewUpdate: function (e, args, gridview) {
            },
            onCellChange: function (cell) {
            },
            onPasteCells: function () {
            },
            onPasteCellsUndo: function () {
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
            beforeRender: function (data) {
                return data;
            },
            afterRender: function (data, gridview) {
            },
            onRenderError: function (error) {
            }
        },
        downloadId = generateUUID(),
        gridview = null,
        dataview = null,
        columnpicker = null;

    // Constructor
    function grid() {
    }

    // Render the SlickGrid
    // If data isn't provided directly, we assume ajax request
    // Otherwise, we can't render the grid without data
    grid.render = function (data) {

        if (ajaxOptions.url && !arguments.length) {
            refreshData(function (data) {
                var d = events.beforeRender(data);
                if (d) data = d;

                initGrid(data);
            }, function (error) {
                events.onRenderError(error);
                throw new Error('There was an ajax error when retrieving remote data.');
            });
        }
        else {
            if (data) {
                showLoadingIndicator(true);

                var d = events.beforeRender(data);
                if (d) data = d;

                initGrid(data);
            }
            else {
                events.onRenderError();
                throw new Error('No data passed to render function or url incorrect in ajax options.');
            }
        }

        return grid;
    };

    // If the SlickGrid object already exists
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

    grid.gridview = function (_) {
        if (!arguments.length) return gridview;
        gridview = _;

        return grid;
    };

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

    grid.primaryKey = function (_) {
        if (!arguments.length) return pk;
        pk = _;

        return grid;
    };

    grid.autoIncrement = function (_) {
        if (!arguments.length) return autoIncrement;
        autoIncrement = _;

        return grid;
    };

    grid.ajaxOptions = function (_) {
        if (!arguments.length) return $.extend(true, {}, ajaxOptions);
        ajaxOptions = $.extend(ajaxOptions, _);

        return grid;
    };

    grid.downloadable = function (_) {
        if (!arguments.length) return downloadable;
        downloadable = _;

        return grid;
    };

    grid.pasteExactOnly = function (_) {
        if (!arguments.length) return pasteExactOnly;
        pasteExactOnly = _;

        return grid;
    };

    grid.slickgridOptions = function (_) {
        if (!arguments.length) return slickgridOptions;
        slickgridOptions = $.extend(slickgridOptions, _);
        if (gridview) {
            gridview.setOptions(_);
            gridview.invalidate();
        }

        return grid;
    };

    grid.loadingIndicator = function (_) {
        if (!arguments.length) return loadingIndicator;
        loadingIndicator = _;

        return grid;
    };

    grid.rowFormatter = function (_) {
        if (!arguments.length) return rowFormatter;
        rowFormatter = _;

        return grid;
    };

    grid.columnFormatter = function (_) {
        if (!arguments.length) return columnFormatter;
        columnFormatter = _;

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

    // SlimGrid always uses a SlickGrid w/ dataview
    // So grab and return the data from the dataview
    grid.getData = function (_) {
        return dataview.getItems();
    };

    // Add a row to the top of the grid
    // Refresh the dataview/grid to show the change
    grid.addRow = function (_) {
        dataview.insertItem(0, _);
        dataview.refresh();
    };

    // Add multiple rows to the top of the grid
    grid.addRows = function (arr) {
        dataview.beginUpdate();
        arr.forEach(function (item) {
            dataview.insertItem(0, item);
        });
        dataview.endUpdate();
        dataview.refresh();
    };

    // Update a row given the primary key value
    // and the updated row object
    grid.updateRow = function (p, _) {
        dataview.updateItem(p, _);
        dataview.refresh();
    };

    // Update multiple rows at once using the key
    // of the primary key value and the updated item
    grid.updateRows = function (key, d) {
        if (d.length > 0) {
            dataview.beginUpdate();
            d.forEach(function (item) {
                dataview.updateItem(item[key], item);
            });
            dataview.endUpdate();
            dataview.refresh();
        }
    };

    // Returns true/false whether or not a row exists given
    // the primary key value
    grid.rowIdExists = function (p) {
        return rowExists(p);
    };

    // If the grid is filtered, returns the data from that filtered set
    // Creates a deep copy of each object (so we don't hold reference to data still in grid)
    grid.getFilteredData = function () {
        var numRows = dataview.getLength(), data = [], i = 0;
        while (i < numRows) {
            data.push($.extend(true, {}, dataview.getItem(i)));
            i++;
        }

        return data;
    };

    // Returns a dataset of the currently selected rows in
    // the grid
    grid.getSelectedRows = function () {
        return getSelectedRows();
    };


    // ----- Private functions -----
    // Returns true/false whether or not a row exists
    // given a primary key value
    //
    // Underscore.js function currently used for finding row...
    function rowExists(p) {
        var d = dataview.getItems();
        var found = _.find(d, function (item) {
            return item[pk] == p;
        });

        return !found ? false : true;
    }

    // Returns an array of the currently selected rows
    // in the grid
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
        $.ajax({
            async: ajaxOptions.async,
            type: ajaxOptions.type,
            url: ajaxOptions.url,
            cache: ajaxOptions.cache,
            dataType: ajaxOptions.dataType,
            success: function (data) {
                success(data);
            },
            error: function (error) {
                showLoadingIndicator(false);
                err(error);
            }
        });
    }

    function initGrid(data) {
        if (data.length > 0) {

            // If we want a temporary key
            if (autoIncrement) {
                var rowid = 0;
                for (row in data) {
                    data[row][pk] = rowid;
                    ++rowid;
                }
            }

            // If the SlickGrid doesn't arleady exist
            if (!exists) {
                var standardColumns = [];

                for (key in data[0]) {
                    if (key != pk) {
                        // Default column options
                        var column = {
                            'id': key,
                            'name': key,
                            'field': key,
                            'sortable': true,
                            'formatter': columnFormatter,
                            'cssClass': 'text-center'
                        };
                        // Override column options with user preferences
                        column = columnOptions(key, column);
                        column['formatter'] = columnFormatter;

                        var addColumn = true;
                        if (column.hasOwnProperty('hidden')) {
                            if (column['hidden']) addColumn = false;
                        }
                        if (addColumn) standardColumns.push(column);
                    }
                }

                var pluginOptions = {
                    clipboardCommandHandler: function (editCommand) {
                        if (slickgridOptions.editable) {
                            // Paste/Under/Redo occured, call corresponding command
                            undoRedoBuffer.queueAndExecuteCommand.call(undoRedoBuffer, editCommand);
                        }
                    },
                    exactDataOnly: pasteExactOnly,
                    autoIncrement: autoIncrement
                };

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
                                    filterNoCondVal = columnFilters[columnId].substring(idxFilterSpace + 1);

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

                    myGrid.css('height', height + 'px'); // Set the height of the grid container

                    var groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider();
                    dataview = new Slick.Data.DataView({
                        groupItemMetadataProvider: groupItemMetadataProvider
                    });
                    gridview = new Slick.Grid(myGrid, dataview, standardColumns, slickgridOptions);
                    gridview.registerPlugin(groupItemMetadataProvider);

                    if (selectionModel == 'cell') {
                        var cellSelector = new Slick.CellSelectionModel();
                        gridview.setSelectionModel(cellSelector);
                    }
                    else {
                        var rowSelector = new Slick.RowSelectionModel();
                        gridview.setSelectionModel(rowSelector);
                    }

                    if (copyOut) {
                        var copyManager = new Slick.CellExternalCopyManager(pluginOptions);
                        gridview.registerPlugin(copyManager);
                    }

                    gridview.getCanvasNode().focus();

                    if (showColumnpicker) {
                        columnpicker = new Slick.Controls.ColumnPicker(standardColumns, gridview, slickgridOptions);
                    }

                    gridview.onSort.subscribe(function (e, args) {
                        if (e.target.className != 'slick-header-menubutton') {
                            sorterDefault(args.sortCols, dataview);
                        }
                    });

                    // Allows for sorting when clicking on header menu
                    function sorterDefault(sortCols, dataview) {
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

                    if (selectionModel == 'row') {
                        gridview.onSelectedRowsChanged.subscribe(function (e) {
                            var selectedIndexes = gridview.getSelectedRows(),
                                selectedData = getSelectedRows();

                            events.onRowSelected(e, selectedData);
                            if (selectedIndexes.length > 0) gridview.setActiveCell(selectedIndexes[0], 0);
                        });
                    }

                    gridview.onAddNewRow.subscribe(function (e, args) {
                        var row = {}, cols = gridview.getColumns(), item = args['item'];
                        // For each column we have, check to see if we had a value added for it
                        cols.forEach(function (col) {
                            row[col['id']] = item.hasOwnProperty(col['id']) ? item[col['id']] : null;
                        });

                        events.onAddNewRow(e, args, [row]);
                    });

                    dataview.onRowCountChanged.subscribe(function (e, args) {
                        if (exists) events.onDataviewUpdate(e, args, gridview);
                        gridview.updateRowCount();
                        gridview.render();
                    });

                    dataview.onRowsChanged.subscribe(function (e, args) {
                        gridview.invalidateRows(args.rows);
                        gridview.render();
                    });

                    dataview.getItemMetadata = function (row) {
                        return rowFormatter(row, dataview);
                    };

                    var delay = (function () {
                        var timer = 0;
                        return function (callback, ms) {
                            clearTimeout(timer);
                            timer = setTimeout(callback, ms);
                        };
                    })();

                    // Update the dataview after a delay when filter is typed in header
                    $(gridview.getHeaderRow()).delegate(":input", "change keyup", function (e) {
                        var columnId = $(this).data("columnId");
                        if (columnId != null) {
                            columnFilters[columnId] = $.trim($(this).val());
                            delay(function () {
                                dataview.refresh();
                            }, 300);
                        }
                    });

                    gridview.onHeaderRowCellRendered.subscribe(events.onHeaderRowCellRendered);

                    gridview.onCellChange.subscribe(function (e, args) {
                        var cell = {};

                        cell.pkColumn = pk;
                        cell.pk = args.item[pk];
                        cell.value = args.item[gridview.getColumns()[args.cell].field];
                        cell.column = gridview.getColumns()[args.cell].field;

                        events.onCellChange(cell);
                    });

                    if (contextMenu) {
                        // On context menu (right-click) show our custom context menu
                        gridview.onContextMenu.subscribe(function (e) {
                            e.preventDefault();
                            var cell = gridview.getCellFromEvent(e);

                            events.onContextMenu(e, cell, gridview);

                            var selectedIndexes = gridview.getSelectedRows();
                            if (selectedIndexes.length > 0) {
                                contextMenu
                                    .data("row", cell.row)
                                    .css("top", e.pageY)
                                    .css("left", e.pageX)
                                    .show();
                            }

                            $('body').one('click', function () {
                                contextMenu.hide();
                            });
                        });

                        contextMenu.click(function (e) {
                            var selectedData = getSelectedRows();
                            events.onContextMenuClick(e, selectedData);
                        });
                    }

                    myGrid.appendTo(container);
                    myPager.appendTo(container);

                    var pager = new Slick.Controls.Pager(dataview, gridview, myPager);

                    dataview.beginUpdate();
                    dataview.setItems(data, pk);
                    dataview.setFilter(filter);
                    dataview.endUpdate();

                    //	https://github.com/danny-sg/slickgrid-spreadsheet-plugins
                    if (showHeaderFilter) {
                        var filterPlugin = new Ext.Plugins.HeaderFilter({});

                        // This event is fired when a filter is selected
                        filterPlugin.onFilterApplied.subscribe(function () {
                            dataview.refresh();
                            gridview.invalidate();
                            gridview.resetActiveCell();
                        });

                        // Event fired when a menu option is selected
                        filterPlugin.onCommand.subscribe(function (e, args) {
                            headerSorter([args.column], dataview, args.command === "sort-asc");
                        });

                        gridview.registerPlugin(filterPlugin);
                    }

                    gridview.init();

                    // If we want the grid to be excel downloadable
                    var pager = $(myPager).find('.slick-pager');
                    if (downloadable) {
                        // Creates an Excel download link if the browser isn't old IE
                        pager.append('<span id="' + downloadId + '" style="padding: 3px !important; font-size: 11px;"></span>');
                        createDownloadCSVButton('#' + downloadId + '', 'RawData', false, '', 'Download Data', data);
                    }

                    showLoadingIndicator(false);
                    if (loadingIndicator) pager.append(loadingIndicator);

                    exists = true; // At this point, if everything worked, the grid should be rendered
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
            if (events.onRenderError) events.onRenderError();
            throw new Error('Dataset empty when trying to initialize grid.');
        }

        events.afterRender(data, gridview);
    }

    function updateGrid(data) {

        // Make sure we have a SlickGrid already
        if (exists) {

            var standardColumns = [];

            for (key in data[0]) {
                // By default, don't show the primary key column
                if (key != pk) {

                    // Default column options
                    var column = {
                        'id': key,
                        'name': key,
                        'field': key,
                        'sortable': true,
                        'formatter': columnFormatter,
                        'cssClass': 'text-center'
                    };

                    // Override/merge column options with custom preferences
                    // Column formatter can probably be merged with columnOptions in a future update
                    column = columnOptions(key, column);
                    column['formatter'] = columnFormatter;

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
            dataview.setItems(data);
            dataview.endUpdate();

            // Allow formatting of rows (color, etc.) using SlickGrid metadata access
            dataview.getItemMetadata = function (row) {
                return rowFormatter(row, dataview);
            };

            // Resize grid just in case
            gridview.invalidate();
            gridview.resizeCanvas();

            showLoadingIndicator(false);
        }
        else {
            showLoadingIndicator(false);
            if (events.onRenderError) events.onRenderError();
            throw new Error('Tried to call methods on Slickgrid object that does not exist.');
        }
    }

    // Helper function to show/hide loading indicator spinner (if it exists)
    function showLoadingIndicator(show) {
        if (loadingIndicator) {
            if (show) loadingIndicator.show();
            else loadingIndicator.hide();
        }
    }

    // Helper function for generating a unique identifier or download id/SlimGrid id
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
//
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

                    // Fast even with big datasets
                    if (_options.exactDataOnly) {
                        if (matching) {
                            var dv = _grid.getData();

                            // If we want a temporary key, because Dave didn't give one to us
                            if (_options.autoIncrement) {
                                var rowid = 0;
                                for (row in slickData) {
                                    slickData[row][pk] = rowid;
                                    ++rowid;
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