/* global URLSET, URLDATA, $, Slick, initCatalogGrid, sanitizeHtml */
/**
 * Application Domains initialisations
 */
const parsePeriod = {
  60000: 'Minute',
  3600000: 'Hourly',
  86400000: 'Daily',
  604800000: 'Weekly'
}
const URLSET_CONF = {
  name: 'urlset',
  catalogColumns: [
    { name: 'Name', field: URLSET.name, editor: UrlNameTextEditor, formatter: (row, cell, value) => { return value }, validator: requiredFieldValidator, sortable: true, width: 300 },
    { name: 'Url', field: URLSET.url, editor: Slick.Editors.LongText, formatter: urlFormatter, validator: requiredFieldValidator, sortable: true, width: 250 },
    { name: 'Period', field: URLSET.parseperiod, editor: SelectBoxEditor, formatter: SelectBoxFormatter, dataSource: parsePeriod, defaultValue: 86400000, sortable: true, width: 60 },
    { name: 'LastCheck', field: URLSET.lastcheck, formatter: timeStampFormatter, sortable: true, width: 90 },
    { name: 'LastUpdate', field: URLSET.lastupdate, formatter: timeStampFormatter, sortable: true, width: 90 },
    { name: 'Active', field: URLSET.enabled, editor: Slick.Editors.Checkbox, formatter: booleanFormatter, defaultValue: true, sortable: true, width: 60 },
    { name: 'Status', field: URLSET.status, editor: Slick.Editors.Integer, formatter: urlStatusFormatter, sortable: true, width: 60 },
    { name: 'Img64', field: URLSET.imgasbase64, editor: Slick.Editors.Checkbox, formatter: booleanFormatter, sortable: true, width: 60 },
    { name: 'ActivationRule', field: URLSET.activationrule, editor: Slick.Editors.Text, formInput: true, sortable: true, width: 0 },
    { name: 'Conf', field: URLSET.conf, editor: Slick.Editors.Text, formInput: true, sortable: true, width: 0 },
    { name: 'Type', field: URLSET.type, editor: Slick.Editors.Text, formInput: true, sortable: true, width: 0 },
    { name: 'Selectors', field: URLSET.selectors, editor: Slick.Editors.Text, formInput: true, sortable: true, width: 0 },
    { name: 'ExclideSelectors', field: URLSET.exclideselectors, editor: Slick.Editors.Text, formInput: true, sortable: true, width: 0 },
    { name: 'ReplaceFrom', field: URLSET.replacefrom, editor: Slick.Editors.Text, formInput: true, sortable: true, width: 0 },
    { name: 'ReplaceTo', field: URLSET.replaceto, editor: Slick.Editors.Text, formInput: true, sortable: true, width: 0 },
    {
      name: 'KeepTags',
      field: URLSET.keeptags,
      editor: Slick.Editors.Text,
      formInput: true,
      defaultValue: 'a,b,br,div,dl,dt,em,h1,h2,h3,h4,h5,h6,hr,i,img,li,ol,p,span,strong,sub,table,tbody,td,tfoot,th,thead,tr,u,ul',
      sortable: true,
      width: 0
    }
  ],
  ITEM_URL: '/ruda/api/urlset/',
  grid: null,
  data: null
}
const URLDATA_CONF = {
  name: 'urldata',
  catalogColumns: [
    { name: 'Name', field: URLDATA.urlset_name, formatter: (row, cell, value) => { return value }, sortable: true, width: 300 },
    // { name: 'Parsed', field: URLDATA.parsed, formatter: timeStampFormatter, sortable: true, width: 90 },
    // { name: 'Source', field: URLDATA.source, formatter: urlFormatter, formInput: true, sortable: true, width: 110 },
    { name: 'Reviewed', field: URLDATA.reviewed, editor: Slick.Editors.Checkbox, formatter: reviewedFormatter, sortable: true, width: 60 },
    { name: 'Content', field: URLDATA.content, editor: Slick.Editors.LongText, formatter: htmlFormatter, width: 300 },
    { name: 'Note', field: URLDATA.note, editor: Slick.Editors.Text, sortable: true, width: 100 }
  ],
  ITEM_URL: '/ruda/api/urldata/',
  grid: null
}
URLSET_CONF.catalogColumns.forEach(function (col) { // necessary for sorting/filtering
  col.id = col.field
})
URLDATA_CONF.catalogColumns.forEach(function (col) { // necessary for sorting/filtering
  col.id = col.field
})
let currentColumns = URLSET_CONF.catalogColumns
let currentGrid
//= =Init catalog grid

function requiredFieldValidator (value) {
  if (value === null || value === undefined || value === '') {
    return { valid: false, msg: 'Required value!' }
  } else {
    return { valid: true, msg: null }
  }
}

function urlFormatter (row, cell, value, columnDef, dataContext) {
  return "<a href='" + value + "' target=_blank>" + value + '</a>'
}
function htmlFormatter (row, cell, value, columnDef, dataContext) {
  function cleanupContent (html) {
    return sanitizeHtml(html, {
      allowedTags: ['img'],
      allowedAttributes: { img: ['src'] }
    }).trim().replace(/[\t]/g, '')
      .replace(/[\s]{3,}/g, '\r\n\r\n')
  }
  if (value) {
    return cleanupContent(value) // remove unclosed tags
  }
  return ''
}

function urlStatusFormatter (row, cell, value, columnDef, dataContext) {
  if (!value) return '<span style="color:gray"> - </span>'
  switch (value) {
    case 200:
      return `<span style="color:green">${value}</span>`
    default:
      return `<span style="color:orange;font-weight: bold;">${value}</span>`
  }
}

function reviewedFormatter (row, cell, value, columnDef, dataContext) {
  if (value) {
    return '<span style="color:green">Yes</span>'
  } else {
    return '<span style="color:red;font-weight:bold;">No</span>'
  }
}
function booleanFormatter (row, cell, value, columnDef, dataContext) {
  if (typeof value === 'boolean') {
    return value ? '+' : '-'
  } else if ((value === 'true')) {
    return '+'
  } else {
    return '-'
  }
}

function timeStampFormatter (row, cell, value, columnDef, dataContext) {
  if (value == null || value === '') {
    return '-'
  } else {
    const d = new Date(value)
    return ('0' + d.getDate()).slice(-2) + '-' + ('0' + (d.getMonth() + 1)).slice(-2) +
           ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2)
  }
}

/*
 * Main start function.
 */
(function () {
  // init data table
  $.getJSON(URLDATA_CONF.ITEM_URL + 'actual', {}, function (data) {
    URLDATA_CONF.grid = initCatalogGrid(URLDATA_CONF.catalogColumns, data, URLDATA_CONF.name, URLDATA_CONF.ITEM_URL, URLDATA.content, false)
    currentGrid = URLDATA_CONF.grid
    URLDATA_CONF.data = data
    $('#' + URLDATA_CONF.name + 'Pager').html('Total: ' + data.length)
  })

  // init UI
  $('#tabs').tabs({
    activate: function (event, ui) {
      if (ui.newTab.index() === 0) {
        currentColumns = URLDATA_CONF.catalogColumns
        currentGrid = URLDATA_CONF.grid
      } else { // second tab chosen
        if (URLSET_CONF.grid == null) {
          // init second data table
          $.getJSON(URLSET_CONF.ITEM_URL, {}, function (data) {
            URLSET_CONF.grid = initCatalogGrid(URLSET_CONF.catalogColumns, data, URLSET_CONF.name, URLSET_CONF.ITEM_URL, URLSET.lastdata)
            currentGrid = URLSET_CONF.grid
            URLSET_CONF.data = data
            $('#' + URLSET_CONF.name + 'Pager').html('Total: ' + data.length)
            // default sorting first column
            $('.slick-header-columns').children().eq(1).trigger('click')
          })
        }
        currentColumns = URLSET_CONF.catalogColumns
        currentGrid = URLSET_CONF.grid
      }
    }
  })
})()
