## 07-09-2023 performance review
### prepare
/db/perf.sqlite"
for (let i = 0; i < 2100; i++) {
  const tt = `
  INSERT INTO "urlset" ( "parseperiod","name","url","type","selectors","exclideselectors","replacefrom","replaceto","keeptags","enabled","status","conf","lastdata","lastcheck","lastupdate","imgasbase64","activationrule")
  VALUES (60000,'name_${i}','http://localhost:2333/public/test?id=${i}','','body','','','','body',1,NULL,'',NULL,NULL,NULL,0,NULL);`
  console.info(tt)
}
~ 1 minute for 2158 items to request every minute for http://localhost:2333/public/test 
5 seconds can take edit\update of one item if other items are requested at hte same time

### UI performance:
1. press Ctrl + L to clean Network log
2. disable slow browser extentions (could be reviewed in F12 -> Network tab)
Page stat: 
  Load: 0.544s
  Finish: 0.563s
  Transfered: 1.7Mb
  Requests: 36

Load: 0.642s
Finish: 0.673s
Transfered: 0.947Mb
Requests: 37

UI dependencies:
jquery-3.7.0.min
## dist builder: esbuild or Vite [for single pages? => not compatible with jQuery ((] => postpone
  minify js+map, 
  control/load dependencies
summernote???? slickGrid supports -> https://github.com/DimitarChristoff/slickgrid-es6/
---

### regular review 
 - LighHouse
 - npm audit

