/* global describe, it */
import assert from 'assert'
import nock from 'nock'
import axios from 'axios'
import iconvlite from 'iconv-lite'
import * as webRequester from '../../js/api/web-requester.js'

import { responseIn1251 } from './responces/in_1251_encoding.js'
import { responseInKoi8r } from './responces/in_koi8r_encoding.js'

describe('Web Requester - detect Encoding', function () {
  it("When parse 'windows 1251' encoding then return correct russian words", function (done) {
    nock('http://test.org')
      .get('/')
      .reply(200, iconvlite.encode(responseIn1251.data, 'win1251'), { 'Content-Type': 'text/html' })

    axios.get('http://test.org', {
      responseType: 'stream'
    }).then(function (response) {
      if (response.status === 200) {
        const buffers = []

        response.data.on('data', function (chunk) {
          buffers.push(chunk)
        })
        response.data.on('end', function () {
          const utf8StringResponse = Buffer.concat(buffers).toString()
          const enc = webRequester.detectEncoding(response, utf8StringResponse)
          const result = iconvlite.decode(Buffer.concat(buffers), enc)
          assert.match(result, /Радонежского/)
        })
      } else {
        console.error('Bad response', response)
      }
      done()
    }).catch(function (error) {
      console.log(error.message)
      done()
    })
  })

  it('When parse Koi8-r encoding then return correct russian words', function (done) {
    nock('http://test.org')
      .get('/')
      .reply(200, iconvlite.encode(responseInKoi8r.data, 'koi8-r'), { 'Content-Type': 'text/html' })

    axios.get('http://test.org', {
      responseType: 'stream'
    }).then(function (response) {
      if (response.status === 200) {
        const buffers = []

        response.data.on('data', function (chunk) {
          buffers.push(chunk)
        })
        response.data.on('end', function () {
          const utf8StringResponse = Buffer.concat(buffers).toString()
          const enc = webRequester.detectEncoding(response, utf8StringResponse)
          const result = iconvlite.decode(Buffer.concat(buffers), enc)
          assert.match(result, /Хмелево/)
        })
      } else {
        console.error('Bad response', response)
      }
      done()
    }).catch(function (error) {
      console.log(error.message)
      done()
    })
  })
})
