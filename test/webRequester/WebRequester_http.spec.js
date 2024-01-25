/* global describe, it */
import assert from 'assert'
import nock from 'nock'

import * as webRequester from '../../js/api/web-requester.js'

describe('Test Web Requester: with local mock', function () {
  it('No such URL', function (done) {
    webRequester.getRawHtmlFrom('fail_zzz.org').then(function (html) {
        done(new Error('Error: no such site!'))
      }).catch(function (err) {
        assert.strictEqual(err.code, 'ENOTFOUND')
        assert.equal(err.message, 'getaddrinfo ENOTFOUND fail_zzz.org')
        done()
      })
  })

  it('Request http is ok', function (done) {
    // Given
    nock('http://test.org')
      .get('/')
      .reply(200, 'Hello World!', { 'Content-Type': 'text/html' })

    try {
      // When
      webRequester.getRawHtmlFrom('test.org').then(function (html) {
          // Then
          assert(html.indexOf('Hello World!') === 0)

          done()
        }).catch(function (err) {
          console.error('Ups!', err)
          done(new Error('Err: ' + err))
        })
    } catch (assertioErr) {
            done(assertioErr)
    }
  })
  it('http response is 400', function (done) {
    // Given
    nock('http://test.org')
      .get('/')
      .reply(400, 'Bad request!', { 'Content-Type': 'text/html' })
    // When
    webRequester
      .getRawHtmlFrom('test.org')
      .then(function (html) {
        // Then
        done(new Error('Bad request!'))
      })
      .catch(function (err) {
        assert.strictEqual(err?.code, 'ERR_BAD_REQUEST')
        assert.equal(err?.message, 'Request failed with status code 400')
        done()
      })
  })
})
