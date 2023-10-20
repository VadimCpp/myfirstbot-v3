import assert from "assert"
import sinon from "sinon"
import TelegramBot, { type Update } from 'node-telegram-bot-api'
import TelegramMessenger from "../../src/messenger/telegram"

describe('TelegramMessenger', () => {
  it('should create a new instance', () => {
    const tm = new TelegramMessenger()
    assert.notEqual(tm, null)
    assert.notEqual(tm, undefined)
    assert.equal(tm.bot, null)
  })

  describe('init', () => {
    it('should create a new bot in production', () => {
      const logStub = sinon.stub(console, 'log')
      const tm = new TelegramMessenger()
      tm.init('1234567890:ABC', false, 'https://test.herokuapp.com')
      assert.notEqual(tm.bot, null)

      sinon.assert.callCount(logStub, 2)
      sinon.assert.calledWith(logStub.getCall(0), " 🤖[telegram]: Initializing bot")
      sinon.assert.calledWith(logStub.getCall(1), ' 🤖[telegram]: Run in production (set webhook)')
      logStub.restore()
    })

    it('should create a new bot in debug', () => {
      const logStub = sinon.stub(console, 'log')
      const tm = new TelegramMessenger()
      tm.init('1234567890:ABC', true, 'https://test.herokuapp.com')
      assert.notEqual(tm.bot, null)

      sinon.assert.callCount(logStub, 2)
      sinon.assert.calledWith(logStub.getCall(0), " 🤖[telegram]: Initializing bot")
      sinon.assert.calledWith(logStub.getCall(1), ' 🤖[telegram]: Run in debug (use polling)')
      logStub.restore()
      tm.bot?.stopPolling()
    })

    it ('should not init if bot has already exist', async () => {
      const logStub = sinon.stub(console, 'log')
      const tm = new TelegramMessenger()
      tm.bot = new TelegramBot('1234567890:ABC')
      tm.init('1234567890:DEF', true, 'https://test.herokuapp.com')
      sinon.assert.callCount(logStub, 2)
      sinon.assert.calledWith(logStub.getCall(0), " 🤖[telegram]: Initializing bot")
      sinon.assert.calledWith(logStub.getCall(1), " 🤖[telegram]: Telegram bot already initialized. Skip")
      logStub.restore()
    })

    it('should not create a new bot in production', () => {
      const logStub = sinon.stub(console, 'log')
      const tm = new TelegramMessenger()
      tm.init('1234567890:ABC', false, '')
      assert.equal(tm.bot, null)

      sinon.assert.callCount(logStub, 2)
      sinon.assert.calledWith(logStub.getCall(0), " 🤖[telegram]: Initializing bot")
      sinon.assert.calledWith(logStub.getCall(1), ' 🤖[telegram]: Error, please set HEROKU_URL in .env file')
      logStub.restore()
    })
  })

  describe('processUpdate', () => {
    it('should call processUpdate', () => {
      const processUpdateStub = sinon.stub(TelegramBot.prototype, 'processUpdate')
      const tm = new TelegramMessenger()
      tm.bot = new TelegramBot('1234567890:ABC')
      tm.processUpdate({} as Update)
      sinon.assert.calledOnce(processUpdateStub)
      processUpdateStub.restore()
    })

    it('should not call processUpdate', () => {
      const processUpdateStub = sinon.stub(TelegramBot.prototype, 'processUpdate')
      const tm = new TelegramMessenger()
      tm.bot = null
      tm.processUpdate({} as Update)
      sinon.assert.notCalled(processUpdateStub)
      processUpdateStub.restore()
    })
  })
})
