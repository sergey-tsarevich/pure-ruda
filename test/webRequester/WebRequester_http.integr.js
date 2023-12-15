/* global describe, it */
import assert from 'assert'

import * as webRequester from '../../js/api/web-requester.js'

describe('Test Web Requester: internet required', function () {

  it('Url without HTTP prefix is ok', function (done) {
    try {
      webRequester.getRawHtmlFrom('1.1.1.1').then(function (html) {
        assert(html.length > 1000)
        assert(html.indexOf('<title>1.1.1.1 — The free app that makes your Internet faster.</title>') > 0)

        done()
      }).catch(function (err) {
        done(new Error('Err: ' + err))
      })
    } catch (assertioErr) {
      done(assertioErr)
    }
  })

  it('HTTPS response html is OK', function (done) {
    webRequester.getRawHtmlFrom('https://kv.by').then(function (html) {
      assert(html.length > 3000)
      assert(html.indexOf('zzz') < 0)

      done()
    }).catch(function (err) {
      console.info(err)
      done(new Error('Err: ' + err))
    })
  })

  it('Encoding win1251 is OK', function (done) {
    webRequester.getRawHtmlFrom('http://sergiyhram.com/3.htm').then(function (html) {
      assert(html.indexOf('<title>Расписание богослужений</title>') > 0)

      done()
    }).catch(function (err) {
      console.info(err)
      done(new Error('Err: ' + err))
    })
  })
})
