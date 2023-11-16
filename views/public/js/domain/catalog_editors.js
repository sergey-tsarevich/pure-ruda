/* global Catalog, $, Slick, Option */

// (function () {
function Select2Editor (args) {
  let $input
  let defaultValue

  function PopulateSelect (select, dataSource) {
    let newOption
    $.each(dataSource, function (idx, item) {
      newOption = new Option(item.name, item.id)
      select.appendChild(newOption)
    })
  }

  this.keyCaptureList = [Slick.keyCode.UP, Slick.keyCode.DOWN, Slick.keyCode.ENTER]
  this.init = function () {
    $input = $('<select></select>')
    $input.width(args.container.clientWidth + 3)
    PopulateSelect($input[0], args.column.dataSource)
    $input.appendTo(args.container)
    $input.focus().select()

    $input.select2({
      allowClear: false
    })
  }
  this.destroy = function () {
    $input.select2('close')
    $input.select2('destroy')
    $input.remove()
  }
  this.show = function () {
  }
  this.hide = function () {
  }
  this.position = function (position) {
  }
  this.focus = function () {
    $input.select2('input_focus')
  }
  this.loadValue = function (item) {
    defaultValue = item[args.column.field]
    $input.val(defaultValue)
    $input[0].defaultValue = defaultValue
    $input.trigger('change.select2')
  }
  this.serializeValue = function () {
    return $input.val()
  }
  this.applyValue = function (item, state) {
    item[args.column.field] = state
  }
  this.isValueChanged = function () {
    return (!($input.val() === '' && defaultValue == null)) && ($input.val() !== defaultValue)
  }
  this.validate = function () {
    return {
      valid: true,
      msg: null
    }
  }
  this.init()
}

function SelectBoxEditor (args) {
  let $input
  let defaultValue
  this.keyCaptureList = [Slick.keyCode.UP, Slick.keyCode.DOWN, Slick.keyCode.ENTER]
  this.init = function () {
    $input = $('<select></select>')
    $input.width(args.container.clientWidth + 3)
    let newOption
    $.each(args.column.dataSource, function (value, text) {
      newOption = new Option(text, value)
      $input[0].appendChild(newOption)
    })
    $input.appendTo(args.container)
    $input.focus().select()
  }
  this.destroy = function () {
    $input.remove()
  }
  this.show = function () {
  }
  this.hide = function () {
  }
  this.position = function (position) {
  }
  this.focus = function () {
    $input.focus()
  }
  this.loadValue = function (item) {
    defaultValue = item[args.column.field]
    $input.val(defaultValue)
    $input[0].defaultValue = defaultValue
  }
  this.serializeValue = function () {
    return $input.val()
  }
  this.applyValue = function (item, state) {
    item[args.column.field] = state
  }
  this.isValueChanged = function () {
    return (!($input.val() === '' && defaultValue == null)) && ($input.val() !== defaultValue)
  }
  this.validate = function () {
    return {
      valid: true,
      msg: null
    }
  }
  this.init()
}

function SelectBoxFormatter (row, cell, value, columnDef, dataContext) {
  return columnDef.dataSource[value] || '-'
}

// todo: review duplicate!
function UrlNameTextEditor(args) {
  var input;
  var defaultValue;
  var scope = this;
  this.args = args;

  this.init = function () {
    // navOnLR = args.grid.getOptions().editorCellNavOnLRKeys;
    input = Slick.Utils.createDomElement('input', { type: 'text', className: 'editor-text' }, args.container);
    const url = args.item.url
    if (url && !args.item.name) {
      const urlName = url.split('/')[2].replace('www.', '')
      scope.applyValue(scope.args.item, urlName);
    }
    input.focus();
    input.select();

    // don't show Save/Cancel when it's a Composite Editor and also trigger a onCompositeEditorChange event when input changes
    if (args.compositeEditorOptions) {
      input.addEventListener("change", this.onChange);
    }
  };

  this.onChange = function() {
    var activeCell = args.grid.getActiveCell();

    // when valid, we'll also apply the new value to the dataContext item object
    if (scope.validate().valid) {
      scope.applyValue(scope.args.item, scope.serializeValue());
    }
    scope.applyValue(scope.args.compositeEditorOptions.formValues, scope.serializeValue());
    args.grid.onCompositeEditorChange.notify({ row: activeCell.row, cell: activeCell.cell, item: scope.args.item, column: scope.args.column, formValues: scope.args.compositeEditorOptions.formValues });
  };

  this.destroy = function () {
    input.removeEventListener("change", this.onChange)
    input.remove();
  };

  this.focus = function () {
    input.focus();
  };

  this.getValue = function () {
    return input.value;
  };

  this.setValue = function (val) {
    input.value = val;
  };

  this.loadValue = function (item) {
    defaultValue = item[args.column.field].trim() || '';
    input.value = defaultValue;
    input.defaultValue = defaultValue;
    input.select();
  };

  this.serializeValue = function () {
    return input.value;
  };

  this.applyValue = function (item, state) {
    item[args.column.field] = state;
  };

  this.isValueChanged = function () {
    return (!(input.value === "" && defaultValue == null)) && (input.value != defaultValue);
  };

  this.validate = function () {
    if (args.column.validator) {
      var validationResults = args.column.validator(input.value, args);
      if (!validationResults.valid) {
        return validationResults;
      }
    }

    return {
      valid: true,
      msg: null
    };
  };

  this.init();
}
// todo:
//   // exports
//   Slick.Utils.extend(Catalog, {
//     Formatters: {
//     },
//     Editors: {
//       Select2Editor
//     }
//   })
// })()
