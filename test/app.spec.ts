import assert from 'assert'
import sinon, { type SinonStub } from 'sinon'
import express from 'express'
import App from '../src/app'
import TelegramMessenger from '../src/messenger/telegram'

describe('App', () => {
  it('should create a new instance', () => {
    const result = new App()
    assert.notEqual(result, null)
    assert.notEqual(result, undefined)
    assert.equal(result.expressWebServer, null)
    assert.equal(result.telegramMessenger, null)
  });

  describe('init', () => {
    it('sinon mock should work correctly', () => {
      const initStub = sinon.stub(App.prototype, 'init');
      const app = new App()
      app.init()
      sinon.assert.calledOnce(initStub)
      initStub.restore()
    })

    it('should not create a bot without bot token', () => {
      process.env.TELEGRAM_BOT_TOKEN = ""
      const initStub = sinon.stub(TelegramMessenger.prototype, 'init');
      const logStub = sinon.stub(console, 'log');
      const app = new App()
      app.init()      
      sinon.assert.notCalled(initStub)
      sinon.assert.callCount(logStub, 1)
      sinon.assert.calledWith(logStub, '⚡️[app]: Error, please set TELEGRAM_BOT_TOKEN in .env file')  
      logStub.restore()
      initStub.restore()    
    })

    it ('should not create a server', async () => {
      process.env.TELEGRAM_BOT_TOKEN = "6611992266:AAGGooffSSKKaaIIkkRRFFEEhhLL11llkk"
      const initStub = sinon.stub(TelegramMessenger.prototype, 'init').throws(new Error('it happens'));
      const logStub = sinon.stub(console, 'log');
      const app = new App()
      app.init()
      sinon.assert.calledOnce(initStub)
      sinon.assert.callCount(logStub, 1)
      sinon.assert.calledWith(logStub, "⚡️[app]: Error, it happens")  
      logStub.restore()
      initStub.restore()
    })

    it ('should not init if bot and server has already exist', async () => {
      process.env.HEROKU_URL = ""
      const logStub = sinon.stub(console, 'log');
      const app = new App()
      app.expressWebServer = express()
      app.telegramMessenger = new TelegramMessenger()
      app.init()
      sinon.assert.callCount(logStub, 1)
      sinon.assert.calledWith(logStub, "⚡️[app]: App already initialized")  
      logStub.restore()
    })

    it ('should succesfully call initExpress method', async () => {
      process.env.TELEGRAM_BOT_TOKEN = "6611992266:AAGGooffSSKKaaIIkkRRFFEEhhLL11llkk"
      process.env.DEBUG = "false"
      process.env.HEROKU_URL = "https://test.herokuapp.com"
      const logStub = sinon.stub(console, 'log');
      const initExpressStub = sinon.stub(App.prototype, 'initExpress');
      const app = new App()
      app.init()
      sinon.assert.calledOnce(app.initExpress as SinonStub)
      sinon.assert.callCount(logStub, 2)
      sinon.assert.calledWith(logStub.getCall(0), " 🤖[telegram]: Initializing bot")
      sinon.assert.calledWith(logStub.getCall(1), ' 🤖[telegram]: Run in production (set webhook)')
      logStub.restore()
      initExpressStub.restore()
    })
  })
})