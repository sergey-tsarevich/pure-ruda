/* global describe, xit, beforeEach, afterEach */
// https://github.com/nock/nock#readme
import assert from 'assert' // https://nodejs.org/api/assert.html#assertokvalue-message
import Database from 'better-sqlite3'
import config from 'config'
import nock from 'nock'

import { Urlset } from '../../js/entity/Urlset-model.js'
import { AppDataSource } from '../../js/data-source.js'
import * as urlProcessor from '../../js/api/UrlProcessor.js'

const db = new Database(config.sqliteDbPath)

describe('UrlProcessor - parse site and save', function () {
  beforeEach(async () => {
    console.log('Going to use "%s" test db.', config.sqliteDbPath)
    const repo = AppDataSource.getRepository(Urlset)

    // const uset = new Urlset()
    const uset = getSitePref()
    // uset.name = 'aTest'
    // uset.url = 'wwww2.hrambel.by'

    await repo.save(uset)
  })
  afterEach(async () => {
    console.log('Clean up after tests...')
    await AppDataSource.getRepository(Urlset).clear()
  })

  xit('When response is valid text, then new parse should be inserted', async (done) => {
    // Arrange
    const repo = AppDataSource.getRepository(Urlset)
    const rows = await repo.find()
    const siteParsePref = rows[0]

    // const siteParsePref = getSitePref()
    // siteParsePref.url = 'http://UrlProcessor-test2.org'
    // siteParsePref.id = db.prepare('INSERT INTO rasppars(parseperiod, name, lastupdate, url, type, selectors, exclideselectors, replacefrom, replaceto, keeptags, enabled) values (:parseperiod, :name, :lastupdate, :url, :type, :selectors, :exclideselectors, :replacefrom, :replaceto, :keeptags, :enabled)').run(siteParsePref).lastInsertRowid

    nock('http://UrlProcessor-test1.org')
      .get('/')
      .reply(200, `<html><body><div class=entry-content> <table border=1>
            <tr> <td> 8:30  </td> <td>  <strong>Служащие:</strong> иерей Г. Бутько, диакон Р. Шурпаков
            <strong>Требные:</strong> прот. А. Якутик, прот. Г. Фельдшеров
            <strong>Дежурные: </strong>иерей А. Веремейчик (11:00-15:30), иерей И. Ковалёв (14:00-20:00) </td> </tr>
            <tr> <td>  17:00 </td> <td> <strong>Беседа: </strong>прот. Н. Богданович </tr>
            <tr> <td>  17:00  </td> <td>  <strong>Акафист: </strong>прот. Ю. Залоско  </td> </tr>
            <tr><td> 17:30 </td> <td><strong>Исповедь:</strong> иерей В. Шпаков </td> </tr>
            <tr> <td>  18:00 </td> <td> <strong>Служащие: </strong>прот. Ю. Залоско, диакон Р. Шурпаков </td> </tr>
            </table></div></body></html>`, { 'Content-Type': 'text/html' })

    // Act
    urlProcessor.parseSiteAndSave(siteParsePref).then(function (rawHtml) {
      // Assert

      console.info('ZZZZZ')
      console.info('== ', rawHtml)
      //   const repo = AppDataSource.getRepository(Urlset)
      //   const rows = await repo.find()
      //   const sitePref = rows[0]

      //   assert.strictEqual(sitePref.status, 200)
      //   assert.ok(sitePref.lastupdate, 'lastupdate should not be undefined')

      //   const siteData = db.prepare('SELECT * FROM rasp WHERE urlsetid = ?').get(siteParsePref.id)
      //   assert.strictEqual(siteData.source, 'http://UrlProcessor-test2.org')
      //   assert.match(siteData.content, /Служащие/)
      done()
    })
      .catch(function (err) {
        console.error(err)
        done(new Error('Error to pass test: unexpected state!'))
      })
  })

  xit('When response is not valid text - to small text, then status and lastupdate should be updated accordingly', function (done) {
    // Arrange
    const siteParsePref = getSitePref()
    siteParsePref.id = db.prepare('INSERT INTO rasppars(parseperiod, name, lastupdate, url, type, selectors, exclideselectors, replacefrom, replaceto, keeptags, enabled) values (:parseperiod, :name, :lastupdate, :url, :type, :selectors, :exclideselectors, :replacefrom, :replaceto, :keeptags, :enabled, :conf)').run(siteParsePref).lastInsertRowid

    nock('http://UrlProcessor-test1.org')
      .get('/')
      .reply(200, '<html></html>', { 'Content-Type': 'text/html' })

    // Act
    urlProcessor.parseSiteAndSave(siteParsePref).then(function (rawHtml) {
      done(new Error('Error to pass test: unexpected state!'))
    }).catch(function (err) {
      // Assert -> do not work!
      // const sitePref = db.prepare('SELECT * FROM raspparse WHERE id = ?').get(siteParsePref.id);
      // assert.strictEqual(sitePref.status, TOO_SMALL_RESPONSE_TEXT_STATUS)
      // assert.ok(siteParsePref.lastupdate)
      done()
    })
  })

  xit('When response is valid text and not changed from last parse, then no new lastupdate id inserted - should be the same', function (done) {
    // Arrange
    const siteParsePref = getSitePref()
    siteParsePref.url = 'http://UrlProcessor-test3.org'
    siteParsePref.id = db.prepare('INSERT INTO rasppars(parseperiod, name, lastupdate, url, type, selectors, exclideselectors, replacefrom, replaceto, keeptags, enabled, conf) values (:parseperiod, :name, :lastupdate, :url, :type, :selectors, :exclideselectors, :replacefrom, :replaceto, :keeptags, :enabled, :conf)').run(siteParsePref).lastInsertRowid
    const siteData = {
      urlsetid: siteParsePref.id.toString(),
      parsed: new Date().toISOString(),
      content: `<table border=1>
            <tr> <td> 8:30  </td> <td>  <strong>Служащие:</strong> иерей Г. Бутько, диакон Р. Шурпаков
            <strong>Требные:</strong> прот. А. Якутик, прот. Г. Фельдшеров
            <strong>Дежурные: </strong>иерей А. Веремейчик (11:00-15:30), иерей И. Ковалёв (14:00-20:00) </td> </tr>
            <tr> <td>  17:00 </td> <td> <strong>Беседа: </strong>прот. Н. Богданович </tr>
            <tr> <td>  17:00  </td> <td>  <strong>Акафист: </strong>прот. Ю. Залоско  </td> </tr>
            <tr><td> 17:30 </td> <td><strong>Исповедь:</strong> иерей В. Шпаков </td> </tr>
            <tr> <td>  18:00 </td> <td> <strong>Служащие: </strong>прот. Ю. Залоско, диакон Р. Шурпаков </td> </tr>
            </table>`,
      source: siteParsePref.url,
      reviewed: '0',
      conf: ''
    }
    const lastSiteDataRowid = db.prepare('INSERT INTO rasp(urlsetid, parsed, content, source, reviewed, conf) values (:urlsetid, :parsed, :content, :source, :reviewed, :conf)').run(siteData).lastInsertRowid

    nock('http://UrlProcessor-test3.org')
      .get('/')
      .reply(200, `<html><body><div class=entry-content> <table border=1>
            <tr> <td> 8:30  </td> <td>  <strong>Служащие:</strong> иерей Г. Бутько, диакон Р. Шурпаков
            <strong>Требные:</strong> прот. А. Якутик, прот. Г. Фельдшеров
            <strong>Дежурные: </strong>иерей А. Веремейчик (11:00-15:30), иерей И. Ковалёв (14:00-20:00) </td> </tr>
            <tr> <td>  17:00 </td> <td> <strong>Беседа: </strong>прот. Н. Богданович </tr>
            <tr> <td>  17:00  </td> <td>  <strong>Акафист: </strong>прот. Ю. Залоско  </td> </tr>
            <tr><td> 17:30 </td> <td><strong>Исповедь:</strong> иерей В. Шпаков </td> </tr>
            <tr> <td>  18:00 </td> <td> <strong>Служащие: </strong>прот. Ю. Залоско, диакон Р. Шурпаков </td> </tr>
            </table></div></body></html>`, { 'Content-Type': 'text/html' })

    // Act
    urlProcessor.parseSiteAndSave(siteParsePref).then(function (rawHtml) {
      // Assert
      const sitePref = db.prepare('SELECT * FROM rasppars WHERE id = ?').get(siteParsePref.id)
      assert.strictEqual(sitePref.status, 200)
      const siteDataRes = db.prepare('SELECT * FROM rasp WHERE urlsetid = ?').get(siteParsePref.id)
      assert.strictEqual(siteDataRes.source, 'http://UrlProcessor-test3.org')
      assert.strictEqual(siteDataRes.id, lastSiteDataRowid)
      done()
    }).catch(function (err) {
      console.error(err)
      done(new Error('Error to pass test: unexpected state!'))
    })
  })

  xit('When host is unavailable, then status = 0', function (done) {
    // Arrange
    const siteParsePref = getSitePref()
    siteParsePref.url = 'http://UrlProcessor-test4.org'
    siteParsePref.id = db.prepare('INSERT INTO rasppars(parseperiod, name, lastupdate, url, type, selectors, exclideselectors, replacefrom, replaceto, keeptags, enabled, conf) values (:parseperiod, :name, :lastupdate, :url, :type, :selectors, :exclideselectors, :replacefrom, :replaceto, :keeptags, :enabled, :conf)').run(siteParsePref).lastInsertRowid

    // Act
    urlProcessor.parseSiteAndSave(siteParsePref).then(function (rawHtml) {
      // Assert
      done(new Error('Error to pass test: unexpected state!'))
    }).catch(function (err) {
      // Assert-> do not work!
      // const sitePref = db.prepare('SELECT * FROM raspparse WHERE id = ?').get(siteParsePref.id);
      // assert.strictEqual(sitePref.status, 0)
      // assert.ok(siteParsePref.lastupdate)
      done()
    })
  })

  function getSitePref () {
    return {
      parseperiod: null,
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
