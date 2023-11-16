/* global describe, it */
import assert from 'assert'

import * as htmlParser from '../../js/api/html-parser.js'

describe('Check isTextEqual in IMG mode: ', function () {
  it('Text in img in src attr is differ', function () {
    const oldHtml = '<a href="http://sabor.by/wp-content/uploads/2014/03/31_10-06_11_2016_docx.jpg" target="_blank"><img width="100%" src="http://sabor.by/wp-content/uploads/2014/03/31_10-06_11_2016_docx.jpg"></a>'
    const newHtml = '<a href="http://sabor.by/wp-content/uploads/2014/03/07-13_11_2016_docx.jpg" target="_blank"><img width="100%" src="http://sabor.by/wp-content/uploads/2014/03/07-13_11_2016_docx.jpg"></a>'

    const result = htmlParser.isTextEqual(oldHtml, newHtml, 'img', false)

    assert(result === false)
  })

  it('IMG.src is the same with text', function () {
    const oldHtml = `
         Расписание богослужений с 16 по 22 января 2017 года. Седмица 31-я по Пятидесятниц
         <img width="100%" src="http://pokrovhram.by/16_01_17__22_01_17_Неделя-31_я-по-Пятидесятнице.jpg">
         `
    const newHtml = `

         Расписание богослужений с 16 по 22 января 2017 года. Седмица 31-я по Пятидесятниц
         <img width=100% src="http://pokrovhram.by/16_01_17__22_01_17_Неделя-31_я-по-Пятидесятнице.jpg" />
         `

    const result = htmlParser.isTextEqual(oldHtml, newHtml, 'img', false)

    assert(result === true)
  })
})
