/* global describe, it */
import assert from 'assert'

import * as htmlParser from '../../js/api/html-parser.js'

describe('Check isTextEqual in HTML and deletions mode (many deletions): ', function () {
  it('Text in html is the same and differs only in deletions. Deletions mode is on.', function () {
    const result = htmlParser.isTextEqual(oldHtml, newHtml, 'html', true)

    assert(result === true)
  })

  it('Text in html is the same and differs only in deletions. Deletions mode is off.', function () {
    const result = htmlParser.isTextEqual(oldHtml, newHtml, 'html', false)

    assert(result === false)
  })

  it('Text in html is the same and differs only in deletions. Deletions mode is off2.', function () {
    const result = htmlParser.isTextEqual(oldHtml, newHtml, 'html', false)

    assert(result === false)
  })

  it('Text in html differs', function () {
    newHtml += '_DIFF' // WARN: add-hoc!
    const result = htmlParser.isTextEqual(oldHtml, newHtml, 'html', true)

    assert(result === false)
  })

  // WARN: contains add-hoc! DO NOT CONTINUE THIS TEST WITH OLD GLOBAL DATA!!!

  const oldHtml = `
     Расписание богослужений






     <br>
     <br>







     <br>
     <br>








     <br>
     <br>
     Суббота 5-й седмицы.
     <strong>Суббота Ака́фиста. Похвала́ Пресвятой Богородицы.</strong>

     <br>
     1.04.2017
     суббота
     Часы.
     8.25

     <br>
     Божественная литургия.
     По окончании Акафист Божией Матери.
     9.00



     <br>
     <br>
     <strong>Неделя 5-я Великого поста.</strong>
     Прп. Марии Египетской.

     <br>
     1.04.2017
     суббота
     Всенощное бдение.
     По окончании – исповедь.
     18.00

     <br>
     2.04.2017
     воскресенье
     Часы.
     8.25

     <br>
     Божественная литургия.
     9.00



     <br>
     <br>
     Пятница 6-й седмицы, ва́ий.
     <strong>Благове́щение Пресвятой Богородицы.</strong>

     <br>
     6.04.2017
     четверг
     Всенощное бдение.
     По окончании – исповедь.
     18.00

     <br>
     7.04.2017
     пятница
     Часы.
     8.25

     <br>
     Божественная литургия.
     9.00



     <br>
     <br>
     Суббота 6-й седмицы, ва́ий.
     <strong>Лазарева суббота.</strong>

     <br>
     8.04.2017
     суббота
     Часы.
     8.25

     <br>
     Божественная литургия.
     9.00



     <br>
     <br>
     <strong>Неделя ва́ий </strong>(цветоно́сная, Вербное воскресенье).
     <strong>Вход Господень в Иерусалим.</strong>

     <br>
     8.04.2017
     суббота
     Всенощное бдение.
     <strong>Освящение ваий (вербы).</strong>
     По окончании – исповедь.
     18.00

     <br>
     9.04.2017
     воскресенье
     Часы.
     8.25

     <br>
     Божественная литургия.
     9.00



     <br>
     <br>
     Страстна́я седмица.
     <strong>Великая Среда.</strong>

     <br>
     12.04.2017
     среда
     Утреня. Первый час.
     По окончании – исповедь.
     18.00



     <br>
     <br>
     Страстна́я седмица.
     <strong>Великий Четверто́к.</strong>
     Воспоминание Тайной Ве́чери.

     <br>
     13.04.2017
     четверг
     Часы.
     8.25

     <br>
     Божественная литургия.
     9.00



     <br>
     <br>
     Страстна́я седмица.
     <strong>Великий Пяток.</strong>
     Воспоминание Святых спасительных Страстей Господа нашего Иисуса Христа.

     <br>
     13.04.2017
     четверг
     Утреня Великой Пятницы с чтением 12 Евангелий.
     18.00

     <br>
     14.04.2017
     пятница
     Вечерня Великого Пятка с вы-носом ПЛАЩАНИЦЫ.
     По окончании – исповедь.
     15.00



     <br>
     <br>
     Страстна́я седмица.
     <strong>Великая Суббота.</strong>

     <br>
     15.04.2017
     суббота
     <strong>Освящение пасхальной снеди с 1400 до 1600.</strong>

     <br>
     Исповедь.
     21.30

     <br>
     Полунощница.
     23.15



     <br>
     <br>
     <strong>Светлое Христово Воскресение.
     ПАСХА.</strong>

     <br>
     16.04.2017
     воскресенье
     Утреня. Пасхальные часы.
     Божественная литургия.
     <strong>По окончании освящение пасхальной снеди.</strong>
     00.00



     <br>
     <br>
     Вторник Светлой седмицы.
     <strong>Иконы Божией Матери. Иверской.</strong>

     <br>
     18.04.2017
     вторник
     Часы.
     8.25

     <br>
     Божественная литургия.
     9.00



     <br>
     <br>
     Пятница Светлой седмицы.
     <strong>Иконы Божией Матери «Живоносный Источник».</strong>

     <br>
     21.04.2017
     пятница
     Часы.
     8.25

     <br>
     Божественная литургия.
     9.00



     <br>
     <br>
     <strong>Антипасха.
     Неделя 2-я по Пасхе, апостола Фомы.</strong>

     <br>
     22.04.2017
     суббота
     Всенощное бдение.
     По окончании – исповедь.
     18.00

     <br>
     23.04.2017
     воскресенье
     Часы.
     8.25

     <br>
     Божественная литургия.
     9.00



     <br>
     <br>
     <strong>Радоница. Поминовение усопших.</strong>

     <br>
     25.04.2017
     вторник
     Панихида.
     9.00



     <br>
     <br>
     <strong>Неделя 3-я по Пасхе, святых жен-мироносиц.</strong>

     <br>
     29.04.2017
     суббота
     Всенощное бдение.
     По окончании – исповедь.
     18.00

     <br>
     30.04.2017
     воскресенье
     Часы.
     8.25

     <br>
     Божественная литургия.
     9.00


     `

  let newHtml = `

     Расписание богослужений

     <br/> <br/> <td> </td> <td>  </td>   <br/> <br/> <td> </td>        <br/> <br/> <td><strong>Радоница. Поминовение усопших.</strong></td>  <br/> <td>25.04.2017 				вторник</td> <td>Панихида.</td> <td>9.00</td>    <br/> <br/> <td><strong>Неделя 3-я по Пасхе, святых жен-мироносиц.</strong></td>  <br/> <td>29.04.2017 				суббота</td> <td>Всенощное бдение. 				По окончании – исповедь.</td> <td>18.00</td>  <br/> <td>30.04.2017 				воскресенье</td> <td>Часы.</td> <td>8.25</td>  <br/> <td>Божественная литургия.</td> <td>9.00</td>
     `
})
