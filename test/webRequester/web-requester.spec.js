/* global describe, it */
import { isValidUrl } from '../../js/api/web-requester.js'
import * as assert from 'assert'

describe('isValidUrl', () => {
  it('should return true when given a valid http url', () => {
    const url = 'http://www.example.com'
    const result = isValidUrl(url)
    assert.ok(result)
  })
  it('should return true when given a valid url starting with //', () => {
    const url = '//www.example.com'
    const result = isValidUrl(url)
    assert.ok(result)
  })
  it('should return false when given an invalid url', () => {
    const url = 'example.com'
    const result = isValidUrl(url)
    assert.ok(!result)
  })
  it('should return false when given an empty string', () => {
    const url = ''
    const result = isValidUrl(url)
    assert.ok(!result)
  })
})
