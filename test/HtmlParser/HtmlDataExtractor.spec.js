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
  it('clear html is ok', function () {
    const html = `
         Расписание  Богослужений
         <br/><br/><p>Ноябрь 2016</p>


         <br/><br/><b>
         07.11</b>
         Понедельник</b>
         </b>
         Служб нет</b>

         <br/><br/><b>
         08.11</b>
         Вторник</b>
         </b>
         </b>
         <br/>
         17.00-18.00</b>
         Дежурный священник по храму (свящ.Евгений Фисенкин)</b>
         <br/>
         18.00</b>
         Акафист «Отрада или Утешение». Молебен (свящ.Евгений Фисенкин)</b>
         <br/>
         19.00</b>
         Собеседование по принятию таинства «Крещение» (диакон Максим Лопухов)</b>

         <br/><br/><b>
         09.11</b>
         Среда</b>
         </b>
         </b>
         <br/>
         17.00-18.00</b>
         Дежурный священник по храму (свящ.Евгений Фисенкин)</b>
         <br/>
         18.00</b>
         Акафист празднику «Введение во храм Пресвятой Богородицы», молебен о болящих (свящ.Евгений Фисенкин)</b>

         <br/><br/><b>
         10.11</b>
         Четверг</b>
         </b>
         </b>
         <br/>
         17.00-18.00</b>
         Дежурный священник по храму (свящ.Георгий Лопухов)</b>
         <br/>
         18.00</b>
         Акафист муч.млад. Гавриилу Белостокскому (на распев), молебен о непраздных (беременных) женщинах и семьях чающих иметь детей (свящ.Георгий Лопухов)</b>



         <br/><br/><p>Святыни Храма: 1). Ковчег с частицей мощей святого Мученика младенца Гавриила Белостокского — покровителя и целителя детей и подростков. 2). Икона «Покров Пресвятой Богородицы», спис с чудотворной иконы на святой горе Афон (Греция). 3). Икона Николая Чудотворца, спис с чудотворной иконы на святой горе Афон (Греция). 4). Икона «Введения во храм Пресвятой Богородицы» с частичкой земли с места нахождения Иерусалимского храма (г.Иерусалим, Израиль). 5). Икона Вифлеемских младенцев — мучеников с частицей мощей мучеников (г.Вифлием, Израиль).   Выполнение приходских треб, совершение церковных таинств проводится после индивидуальных собеседований. Запись на собеседования по телефону: 8-029-62-86-093 (velcom) священник о.Георгий.</p>
         <br/><br/><p>Приходские (престольные) праздники:</p>
         <br/><br/><p>4 декабря – Введение во храм Пресвятой Богородицы</p>
         <br/><br/><p>3 мая – день памяти мученика младенца Гавриила Белостокского</p>
         <br/><br/><p>3 февраля – день памяти иконы Пресвятой Богородицы «Отрада» или «Утешение»</p>
         `
    const result = htmlParser.clearHtml(html)
    assert(result.length === 1743)
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
