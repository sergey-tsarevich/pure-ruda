import assert from 'assert'
import 'mocha-sinon'
import { handleModules } from '../js/api/modules-handler.js'
import logger from '../js/api/util/logger.js'

describe('modules-handler', function () {
  it('handleModules runs second time with cache', function () {
    this.sinon.replace(logger, 'debug', this.sinon.fake())
    this.sinon.replace(logger, 'warn', this.sinon.fake())

    handleModules('content', 'src', {}, 11)
    handleModules('content', 'src', {}, 22)

    assert.equal(logger.warn.callCount, 1)
    assert.deepEqual(logger.warn.args[0], ['Init modules'])
    assert.equal(logger.debug.callCount, 1)
    assert.deepEqual(logger.debug.args[0], ['Load modules cache'])
  })
})
