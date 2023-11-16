# README #
# web-ruda - personal internet scrapper, dashboard for pure internet. 
* Service with admin panel for scrapping personal data from web-sites.

## Program flow
Parsing are defined by Cron schedule in `cronSchedule` properties in `config/default.json5` file.
Parsing process starts in `js/api/UrlProcessor.js` in function `runRequester` and has next algorithm:
 - SELECT all enabled urlSets 
 - calculate if it's time to request new update (if now() < `lastcheck` + `parseperiod`)
 - gather, filter and save new data update according to rules(if any)

### UI notes:
OnRowSelect - load the latest info about the selected row
Single field update/patch returns full information of the selected row

### To start:
* `npm install`
* update on your settings in `config.js` file
* `npm start` to run in development mode

### To Use:
Go to <http://localhost:2333> to see admin panel
To make selector for urlSet: Chrome->copy->copy selector


## Architecture:
DB - sqlite (nedb has no more support!):
    "better-sqlite3": "^7.6.2", https://typeorm.io/find-options

REST "express": "^4.18.2" (try fastify??)

HTTP client - axios?:
    "axios": "^0.27.2", "axios-retry": "^3.3.1",  https://github.com/axios/axios

Web parsing:
 HTML:
    "cheerio": "^0.20.0", "sanitize-html": "^1.11.3",
Shceduler:
    Cron , every minute minimum or 10 minutes

View\UI
    "ejs": "^2.4.2", 
    SlickGrid - https://github.com/6pac/SlickGrid/wiki/Examples
        --https://www.ag-grid.com/example/ -> slower(1.4s 3.5Mb) and costs 1k$
        --Refine UI dev - > no for now
HTML editor - summernote or
  image as Base64 - https://alex-d.github.io/Trumbowyg/ also depends on jquery

Logs:
    pino
    --winston ignore '%s' parameters
## Internal Modules system
To handle new UrlData event you should:
- create new module .js file in `js/modules` folder
- module name should contains only word character(\w regex)
- module should export `handle (content, source, urlSetConf, urlDataId)` function
- add module name in config (*.json5 file) with parameters or empty object under `modules` json section


## TODOs:
- siteParse
- isOnline|hasInternet?
- err logs to discord!
- compress JPG 85% more than enought!
- autoload preset for popular sites
- update to ES6? https://6pac.github.io/SlickGrid/examples/example4-model-esm.html

# Known bugs: // todo: check
* cheerio advanced selectors (:first, :last,: eq(num)) do not work for `select.find(rasppars.exclideselectors).remove();`

### Design
https://jqueryui.com/themeroller/

## SlickGrid review:
https://6pac.github.io/SlickGrid/examples/example-plugin-custom-tooltip.html
    or Details tree instead of tooltip - https://6pac.github.io/SlickGrid/examples/example16-row-detail.html

    Save grid config state - https://6pac.github.io/SlickGrid/examples/example-0070-plugin-state.html
    Full size grid - https://6pac.github.io/SlickGrid/examples/example15-auto-resize.html
 next version features:       
    Grouping - https://6pac.github.io/SlickGrid/examples/example-grouping-checkbox-row-select.html
    
    SelectBox Filter- https://6pac.github.io/SlickGrid/examples/example-select2-editor.html
     Tabs[so-so, slow and fixed width] - https://6pac.github.io/SlickGrid/examples/example-dynamic-with-jquery-tabs.html
    Button header[[so-so - nothing special] - https://6pac.github.io/SlickGrid/examples/example-plugin-headerbuttons.html
    Frozen rows - https://6pac.github.io/SlickGrid/examples/example-frozen-rows.html
                    https://6pac.github.io/SlickGrid/examples/example13-getItem-sorting.html
    Real-time date requesting - https://6pac.github.io/SlickGrid/examples/example14-highlighting.html


## Configuration:
https://github.com/node-config/node-config/wiki/Common-Usage
https://github.com/node-config/node-config/wiki/Configuration-Files

## To test:
Make sure that process.env.NODE_ENV === "test";
If you use 'mochaExplorer' add to '~/.config/Code/User/settings.json':
   "mochaExplorer.env": {
        "NODE_ENV": "test"
    }
Run `npm test`

## for future
* time duration picker https://www.jqueryscript.net/demo/Minimal-Duration-Picker-Plugin-For-jQuery-Bootstrap/
