/* global handleBackendErrors, $, Slick */
const Catalog = {
  ID_NAME: 'id',
  NO_ID: '-',
  notificationTimeOut: null
}

function initCatalogGrid (catalogColumns, catData, gridSelector, itemUrl, dataField, enableAddRow = true) {
  const formSelector = '#' + gridSelector + '-form'
  const sortSearchConf = { // grid search config
    sortcols: [{ sortAsc: 1, sortCol: catalogColumns[2] }],
    search: ''
  }

  const options = {
    enableCellNavigation: true,
    enableColumnReorder: true,
    editable: true,
    enableAddRow: enableAddRow,
    asyncEditorLoading: true,
    autoEdit: true,
    multiColumnSort: true//,
    // forceFitColumns: true,
    // autosizeColsMode: true
  }

  const catDataView = new Slick.Data.DataView({ inlineFilters: true })
  const catGrid = new Slick.Grid('#' + gridSelector + 'Grid', catDataView, catalogColumns, options)
  function updateOrCreateCatalog (item) {
    const activeCell = catGrid.getActiveCell()
    let curRow
    if (activeCell) {
      curRow = activeCell.row
    } else {
      curRow = getSelectedItems()[0]
    }

    function validateGridRow (theId, aGrid) {
      for (let c = 0; c < aGrid.getColumns().length; c++) {
        const col = aGrid.getColumns()[c]
        if (col.validator) {
          const val = catDataView.getItemById(theId)[col.field]
          const vRes = col.validator(val)
          if (!vRes.valid) {
            vRes.column = c
            return vRes
          }
        }
      }

      return { valid: true, msg: null, column: -1 }
    }

    const validationRes = validateGridRow(item.id, catGrid)
    if (!validationRes.valid) {
      showInfo(validationRes.msg, true)
      catGrid.flashCell(curRow, validationRes.column, 1000)
      catGrid.setActiveCell(curRow, validationRes.column)
      catGrid.editActiveCell()
      return
    }

    const isCreate = item.id === Catalog.NO_ID
    let command = itemUrl
    if (isCreate) {
      delete item.id
      $.post(command, item,
        function (respData) {
          console.info('New item: ', respData)
          catDataView.deleteItem(Catalog.NO_ID)
          catDataView.addItem(respData)
          showInfo('Saved.', false)
        }, 'json'
      ).fail(function (err) {
        handleBackendErrors(err)
        item.id = Catalog.NO_ID // restore id
      })
    } else {
      command += item.id
      $.ajax({
        url: command,
        type: 'patch',
        data: item,
        success: function (respData) {
          const merged = { ...catDataView.getItem(curRow), ...respData }
          catDataView.updateItem(item.id, merged)
          showInfo('Updated.', false)
        },
        error: handleBackendErrors
      })
    }
  }

  catGrid.setSelectionModel(new Slick.RowSelectionModel())

  const checkboxSelector = new Slick.CheckboxSelectColumn({
    cssClass: 'slick-cell-checkboxsel'
  })
  catalogColumns.unshift(checkboxSelector.getColumnDefinition())
  catGrid.registerPlugin(checkboxSelector)
  catGrid.onSelectedRowsChanged.subscribe(function (e, args) {
    if (!$(formSelector).length) {
      return // no form to fill
    }
    const activeRow = args.rows[0]
    const dataContext = args.grid.getDataItem(activeRow)
    if (!dataContext) {
      return // no data yet for new row
    }
    $.getJSON(itemUrl + dataContext.id, {},
      function (respData) {
        const merged = { ...dataContext, ...respData }
        catDataView.updateItem(dataContext.id, merged)
        $('#summernote').summernote('code', respData[dataField])
        const formColumns = catalogColumns.filter(function (col) { return col && col.editor && (col.formInput || col.summernote) })
        formColumns.forEach(function (column) {
          $(formSelector + ' .form-input-' + column.field).val(respData[column.field])
        })
      }
    ).fail(function (err) {
      showInfo('Server error: ' + err, true)
    })
  })
  catGrid.onCellChange.subscribe(function (e, args) {
    const isCreate = args.item.id === Catalog.NO_ID
    if (isCreate) {
      updateOrCreateCatalog(args.item)
    } else {
      const updatedFields = {}
      updatedFields[args.column.field] = args.item[args.column.field]
      updatedFields[Catalog.ID_NAME] = args.item[Catalog.ID_NAME]
      updateOrCreateCatalog(updatedFields)
    }
  })

  catGrid.onAddNewRow.subscribe(function (e, args) {
    const aCell = args.grid.getActiveCell()
    // I) Check if previous not saved(has no id)
    const prevItem = catDataView.getItem(aCell.row - 1)
    if (aCell.row !== 0 && (!prevItem || prevItem.id === Catalog.NO_ID)) {
      args.grid.setActiveCell(aCell.row - 1, aCell.cell)
      console.info('Previous is not saved!')
      return
    }
    // II) Validate this value
    let value = ''
    for (const p in args.item) value = args.item[p]// it is always has one property
    if (args.column.validator) {
      const result = args.column.validator(value)
      if (!result.valid) {
        catGrid.flashCell(aCell.row, aCell.cell, 500)
        console.info('Not Valid!')
        return
      }
    }

    const defObject = {}
    defObject[Catalog.ID_NAME] = Catalog.NO_ID
    catalogColumns.forEach(aCol => {
      defObject[aCol.field] = aCol.defaultValue
    })
    $.extend(defObject, args.item)
    console.info('Adding item:', defObject)
    catDataView.addItem(defObject)
    updateOrCreateCatalog(defObject)
    $('#' + gridSelector + 'Pager').html('Total: ' + catData.length)
  })

  catGrid.onKeyDown.subscribe(function (e) {
    if (e.which !== 65 || !e.ctrlKey) { // select all rows on ctrl-a
      return false
    }
    const rows = []
    for (let i = 0; i < catDataView.getLength(); i++) {
      rows.push(i)
    }

    catGrid.setSelectedRows(rows)
    e.preventDefault()
  })

  function comparer (a, b) {
    const cols = sortSearchConf.sortcols
    for (let i = 0, l = cols.length; i < l; i++) {
      const field = cols[i].sortCol.field
      const sorter = cols[i].sortCol.sorter
      const sign = cols[i].sortAsc ? 1 : -1
      const value1 = a[field]; const value2 = b[field]
      let result
      if (sorter) {
        result = sorter(value1, value2, sign)
      } else {
        result = (value1 === value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign
      }
      if (result !== 0) {
        return result
      }
    }
    return 0
  }

  catGrid.onSort.subscribe(function (e, args) {
    sortSearchConf.sortcols = args.sortCols
    catDataView.sort(comparer, args.sortAsc)
  })

  // wire up model events to drive the grid
  catDataView.onRowCountChanged.subscribe(function (e, args) {
    catGrid.updateRowCount()
    catGrid.render()
  })

  catDataView.onRowsChanged.subscribe(function (e, args) {
    catGrid.invalidateRows(args.rows)
    catGrid.render()
  })

  // wire up the search textbox to apply the filter to the model
  $('#txtSearch5').keyup(function (e) {
    Slick.GlobalEditorLock.cancelCurrentEdit()
    if (e.which === 27) { // clear on Esc
      this.value = ''
    }

    sortSearchConf.search = this.value
    updateFilter()
  })
  $('#txtSearch5').focus()

  function updateFilter () {
    catDataView.setFilterArgs({
      search: sortSearchConf.search
    })
    catDataView.refresh()
  }

  // initialize the model after all the events have been hooked up
  catDataView.beginUpdate()
  catDataView.setItems(catData, Catalog.ID_NAME)
  catGrid.setColumns(catalogColumns)

  catDataView.setFilterArgs({
    search: sortSearchConf.search
  })

  function catalogFilter (item, args) {
    const s = args.search.toLowerCase()
    let isContains = false
    for (let i = 0; i < currentColumns.length; i++) {
      let val = item[currentColumns[i].id]
      val = val ? $.trim(val.toString().toLowerCase()) : ''
      isContains = (val.indexOf(s) > -1)
      if (isContains) break
    }

    if (s !== '' && !isContains) {
      // do not show
      return false
    }
    return true
  }

  catDataView.setFilter(catalogFilter)
  catDataView.endUpdate()

  function addItem () {
    catGrid.scrollRowToTop(catGrid.getDataLength())
    catGrid.setActiveCell(catGrid.getDataLength(), 1)
    catGrid.editActiveCell()
    return false
  }
  function delSelectedItem () {
    if (!confirm('Are you sure that you want to delete the selected item?')) return false
    let isBreak = false
    const ids = []
    let currId
    let c
    for (c = 0; c < catGrid.getSelectedRows().length; c++) {
      const curRow = catGrid.getSelectedRows()[c]
      const item = catGrid.getDataItem(curRow)
      if (item.id === Catalog.NO_ID) {
        catDataView.deleteItem(Catalog.NO_ID)
        // catGrid.setSelectedRows([]);
        return
      } else {
        ids[ids.length] = item.id
      }
    }
    catGrid.setSelectedRows([])
    for (c = 0; c < ids.length; c++) { // todo: make bath deletion!
      currId = ids[c]
      $.ajax({
        async: false,
        type: 'DELETE',
        url: itemUrl + currId,
        data: { id: currId },
        success: function (r) {
          showInfo('Deleted!', false)
          catDataView.deleteItem(currId)
          isBreak = false
          $('#' + gridSelector + 'Pager').html('Total: ' + catData.length)
        }
      }).fail(function (err) {
        showInfo(err, true)
        isBreak = true
      })
      if (isBreak) break
    }

    return false
  }
  function getSelectedItems () {
    if (!catGrid.getSelectedRows().length) {
      alert('Please choose the item(s)')// todo: i18n?
      return
    }
    const selectedItems = []
    catGrid.getSelectedRows().forEach(function (row) {
      selectedItems.push(catGrid.getDataItem(row))
    })
    return selectedItems
  }
  function updateItemFormInputs () {
    const selItem = getSelectedItems()[0]
    if (!selItem) {
      return
    }
    const updatedFields = {}
    const formColumns = catalogColumns.filter(function (col) { return col && col.editor && col.formInput })
    formColumns.forEach(function (column) {
      updatedFields[column.field] = $(formSelector + ' .form-input-' + column.field).val()
    })
    updatedFields[Catalog.ID_NAME] = selItem[Catalog.ID_NAME]
    updateOrCreateCatalog(updatedFields)

    return false
  }
  return {
    addItem,
    delSelectedItem,
    updateItemFormInputs,
    getSelectedItems
  }
}

function showInfo (mess, isError) {
  cleanInfo()
  $('#infoDiv').html(
    '<b style=\'color:' + (isError ? 'red' : 'green') + ';\'>' + (mess?.statusText ? mess.statusText : mess) + '</b>')
  setTimeout(function () {
    $('#infoDiv').html('')
  }, 10000)
}

function cleanInfo () {
  if (Catalog.notificationTimeOut) {
    clearTimeout(Catalog.notificationTimeOut)
    Catalog.notificationTimeOut = null
    $('#infoDiv').html('')
  }
}

$.ajaxSetup({
  error: function (result) {
    showInfo(result, true)
  },
  beforeSend: function () {
    if (!Catalog.notificationTimeOut) {
      Catalog.notificationTimeOut = setTimeout(
        function () {
          $('#infoDiv').html('<b style=\'color:#c77405;\'>Waiting server response</b>')
        }, 1000)
    }
  },
  complete: cleanInfo
})
