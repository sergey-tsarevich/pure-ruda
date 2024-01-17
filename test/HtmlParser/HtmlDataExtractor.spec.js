/* global describe, it */
import assert from 'assert' // https://nodejs.org/api/assert.html#assertokvalue-message

import fs from 'fs'
import * as htmlParser from '../../js/api/html-parser.js'

describe('Check parsing shcedule from html: ', function () {
  it('parsing without errors and result is ok', async function () {
    const content = fs.readFileSync('test/HtmlParser/sppsobor.html', 'utf-8')
    let expected = fs.readFileSync('test/HtmlParser/sppsobor-result.html', 'utf-8')

    let result = await htmlParser.extractData(content, {
      name: 'test',
      url: 'http://sppsobor.by/raspisanie-bogosluzhenij',
      type: 'html',
      selectors: 'div.entry-content',
      replacefrom: 'Распечатать,   ',
      replaceto: ',',
      keeptags: 'table,tr,td,br,strong,b',
      parseperiod: '22',
      enabled: '1',
      lastupdate: '111'
    })

    result = result.replace(/\s/g, '') // make test OS-independent
    expected = expected.replace(/\s/g, '') // make test OS-independent
    assert(result === expected)
  })

  it('parsing without errors and result length is ok', async function () {
    const content = fs.readFileSync('test/HtmlParser/obitel-minsk.html', 'utf-8')

    let result = await htmlParser.extractData(content, {
      name: 'test',
      url: 'obitel-minsk.html',
      type: 'html',
      selectors: 'div.scheduleTable',
      replacefrom: '',
      replaceto: '',
      keeptags: 'table,tr,td,br,strong,b',
      parseperiod: '22',
      enabled: '1',
      lastupdate: '111'
    })

    result = result.replace(/\r/g, '') // make test OS-independent
    assert(result.length === 29149)
  })

  it('parsing with advanced selectors is ok', async function () {
    const content = fs.readFileSync('test/HtmlParser/sppsobor.html', 'utf-8')

    const result = await htmlParser.extractData(content, {
      name: 'test',
      url: 'http://sppsobor.by/raspisanie-bogosluzhenij',
      type: 'html',
      selectors: 'div.entry-content strong:first',
      // "exclideselectors": "strong:first", // todo: bug do not work!
      replacefrom: 'Распечатать,   ',
      replaceto: ',',
      keeptags: 'table,tr,td,br,strong,b',
      parseperiod: '22',
      enabled: '1',
      lastupdate: '111'
    })

    assert.strictEqual(result, 'Седмица 17-я по Пятидесятнице. 2018 год')
  })

  it('leave only text in html is ok', function () {
    const html = `
         Расписание  Богослужений
         <br/><br/><p>Ноябрь 2016</p>


         <br/><br/><b>
         07.11</b>
         Понедельник</b>

         10.11</b>
         Четверг</b>
         </b>
         </b>
         `

    const result = htmlParser.getOnlyText(html)
    assert.strictEqual(result, 'Расписание Богослужений Ноябрь 2016 07.11 Понедельник 10.11 Четверг')
  })
})
