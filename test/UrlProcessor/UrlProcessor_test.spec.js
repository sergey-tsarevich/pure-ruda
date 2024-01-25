/* global describe, it, beforeEach, afterEach */
// https://github.com/nock/nock#readme
import assert from 'assert' // https://nodejs.org/api/assert.html#assertokvalue-message
import Database from 'better-sqlite3'
import config from 'config'
import nock from 'nock'

import { Urlset } from '../../js/entity/Urlset-model.js'
import { AppDataSource } from '../../js/data-source.js'
import * as urlProcessor from '../../js/api/UrlProcessor.js'
import { TOO_SMALL_RESPONSE_TEXT_STATUS } from '../../js/api/util/consts.js'

const db = new Database(config.sqliteDbPath)
const repo = AppDataSource.getRepository(Urlset)

describe('UrlProcessor - parse site and save', function () {
  beforeEach(async () => {
    console.log('Going to use "%s" test db.', config.sqliteDbPath)
    const uset = getSitePref()
    await repo.save(uset)
  })
  afterEach(async () => {
    console.log('Clean up after tests...')
    await AppDataSource.getRepository(Urlset).clear()
  })

  it('When response is valid text, then new parse should be inserted', async () => {
    // Arrange
    const rows = await repo.find()
    const siteParsePref = rows[0]

    nock('http://UrlProcessor-test1.org')
      .get('/')
      .reply(
        200,
        `<html><body><div class=entry-content> <table border=1>
            <tr> <td> 8:30  </td> <td>  <strong>Служащие:</strong> иерей Г. Бутько, диакон Р. Шурпаков
            <strong>Требные:</strong> прот. А. Якутик, прот. Г. Фельдшеров
            <strong>Дежурные: </strong>иерей А. Веремейчик (11:00-15:30), иерей И. Ковалёв (14:00-20:00) </td> </tr>
            <tr> <td>  17:00 </td> <td> <strong>Беседа: </strong>прот. Н. Богданович </tr>
            <tr> <td>  17:00  </td> <td>  <strong>Акафист: </strong>прот. Ю. Залоско  </td> </tr>
            <tr><td> 17:30 </td> <td><strong>Исповедь:</strong> иерей В. Шпаков </td> </tr>
            <tr> <td>  18:00 </td> <td> <strong>Служащие: </strong>прот. Ю. Залоско, диакон Р. Шурпаков </td> </tr>
            </table></div></body></html>`,
        { 'Content-Type': 'text/html' }
      )
    // Act
    const rawHtml = await urlProcessor.parseSiteAndSave(siteParsePref)
    // Assert
    assert.equal(rawHtml.length, 750)
    assert.match(rawHtml, /Служащие/)
    const siteSet = db
      .prepare('SELECT * FROM urlset WHERE id = ?')
      .get(siteParsePref.id)
    assert.equal(siteSet.status, 200)
    assert.equal(siteSet.lastupdate, siteSet.lastcheck)
    assert.notEqual(siteSet.lastdata.length, 0)
  })

  it('When response is not valid text - to small text, then status and lastupdate should be updated accordingly', async () => {
    // Arrange
    const rows = await repo.find()
    const siteParsePref = rows[0]
    nock('http://UrlProcessor-test1.org')
      .get('/')
      .reply(200, '<html></html>', { 'Content-Type': 'text/html' })

    // Act
    try {
      await urlProcessor.parseSiteAndSave(siteParsePref)
      assert.fail()
    } catch (e) {
      // Assert
      assert.strictEqual(e, 'Too small response text')
      const siteData = db
        .prepare('SELECT * FROM urldata WHERE urlsetid = ?')
        .get(siteParsePref.id)
      assert.ok(siteData === undefined)
      const sitePref = db
        .prepare('SELECT * FROM urlset WHERE id = ?')
        .get(siteParsePref.id)
      assert.equal(sitePref.status, TOO_SMALL_RESPONSE_TEXT_STATUS)
      assert.ok(sitePref.lastcheck > 0)
      assert.equal(sitePref.lastupdate, undefined)
      assert.equal(sitePref.lastdata, undefined)
    }
  })

  it('When response is valid text and not changed from last parse, then no new lastupdate id inserted - should be the same', async () => {
    // Arrange
    const rows = await repo.find()
    const sitePref = rows[0]
    const siteSameContent =
      '<html><body><div class=entry-content>This is some very helpful and useful content</div></body></html>'
    sitePref.lastdata = siteSameContent
    nock('http://UrlProcessor-test1.org')
      .get('/')
      .reply(200, siteSameContent, { 'Content-Type': 'text/html' })

    // Act
    const msg = await urlProcessor.parseSiteAndSave(sitePref)
    // Assert
    assert.strictEqual(msg, 'Url content is the same as previous.')
    const sitePrefAfter = db
      .prepare('SELECT * FROM urlset WHERE id = ?')
      .get(sitePref.id)
    assert.equal(sitePrefAfter.status, 200)
    assert.ok(sitePrefAfter.lastcheck > sitePrefAfter.lastupdate)
  })

  it('When host is unavailable, then status = 0 and lastcheck updated', async () => {
    // Arrange
    const rows = await repo.find()
    const sitePref = rows[0]

    try {
      await urlProcessor.parseSiteAndSave(sitePref)
      assert.fail()
    } catch (e) {
      // Assert
      assert.match(e, /Error handled:/)
      const siteData = db
        .prepare('SELECT * FROM urldata WHERE urlsetid = ?')
        .get(sitePref.id)
      assert.ok(siteData === undefined)
      const sitePrefAfter = db
        .prepare('SELECT * FROM urlset WHERE id = ?')
        .get(sitePref.id)
      assert.strictEqual(sitePrefAfter.status, 0)
      assert.ok(sitePrefAfter.lastcheck > 0)
      assert.equal(sitePrefAfter.lastupdate, undefined)
      assert.equal(sitePrefAfter.lastdata, undefined)
    }
  })

  function getSitePref () {
    return {
      parseperiod: 86400000,
      name: 'Test 1',
      lastupdate: null,
      url: 'http://UrlProcessor-test1.org',
      type: 'html',
      selectors: 'div.entry-content',
      exclideselectors: '',
      replacefrom: '',
      replaceto: '',
      keeptags: 'br,strong,tr,td,p,strong,table,tbody',
      enabled: '1',
      conf: ''
    }
  }
})
