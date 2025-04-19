import assert from "assert"
import sinon from "sinon"
import proxyquire from 'proxyquire'
import type { Update, Message } from 'node-telegram-bot-api'

// Create a fake constructor
class FakeTelegramBot {
  public deleteWebHook = sinon.stub().resolves()
  public setWebHook = sinon.stub().resolves()
  public processUpdate = sinon.stub()
  public on = sinon.stub()
  public sendMessage = sinon.stub().resolves()
  public sendSticker = sinon.stub().resolves()
  public stopPolling = sinon.stub()

  constructor(token: string, opts?: any) {
    // Store token and options if needed for assertions
    this.token = token
    this.opts = opts
  }

  private token: string
  private opts?: any
}

// Proxyquire the module under test
const { default: TelegramMessenger } = proxyquire.noCallThru()(
  '../../src/messenger/telegram',
  { 'node-telegram-bot-api': FakeTelegramBot }
)

describe('TelegramMessenger', () => {
  beforeEach(() => {
    // Reset all stubs before each test
    sinon.resetHistory()
  })

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
      sinon.assert.calledWith((tm.bot as any).setWebHook, 'https://test.herokuapp.com1234567890:ABC')
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
      sinon.assert.called((tm.bot as any).deleteWebHook)
      logStub.restore()
    })

    it('should not init if bot has already exist', async () => {
      const logStub = sinon.stub(console, 'log')
      const tm = new TelegramMessenger()
      tm.bot = new FakeTelegramBot('1234567890:ABC')
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
      const tm = new TelegramMessenger()
      tm.bot = new FakeTelegramBot('1234567890:ABC')
      tm.processUpdate({} as Update)
      sinon.assert.calledOnce((tm.bot as any).processUpdate)
    })

    it('should not call processUpdate when bot is null', () => {
      const tm = new TelegramMessenger()
      tm.bot = null
      tm.processUpdate({} as Update)
      // No need to assert on processUpdate since bot is null
      assert.equal(tm.bot, null)
    })
  })

  describe('handleMessage', () => {
    it('should handle text message', () => {
      const logStub = sinon.stub(console, 'log')
      const tm = new TelegramMessenger()
      tm.bot = new FakeTelegramBot('1234567890:ABC')
      
      const mockMessage = {
        chat: { id: 123 },
        text: 'Hello bot'
      }
      
      tm.handleMessage(mockMessage as Message)
      
      sinon.assert.calledWith((tm.bot as any).sendMessage, 123, 'Received your message: Hello bot')
      sinon.assert.calledWith(logStub, ' 🤖[telegram]: Handle message', JSON.stringify(mockMessage))
      logStub.restore()
    })

    it('should handle sticker message', () => {
      const logStub = sinon.stub(console, 'log')
      const tm = new TelegramMessenger()
      tm.bot = new FakeTelegramBot('1234567890:ABC')
      
      const mockMessage = {
        chat: { id: 123 },
        sticker: { file_id: 'sticker123' }
      }
      
      tm.handleMessage(mockMessage as Message)
      
      sinon.assert.calledWith((tm.bot as any).sendSticker, 123, 'sticker123')
      sinon.assert.calledWith(logStub, ' 🤖[telegram]: Handle message', JSON.stringify(mockMessage))
      logStub.restore()
    })

    it('should not process message when bot is not initialized', () => {
      const logStub = sinon.stub(console, 'log')
      const tm = new TelegramMessenger()
      tm.bot = null
      
      const mockMessage = {
        chat: { id: 123 },
        text: 'Hello bot'
      }
      
      tm.handleMessage(mockMessage as Message)
      
      sinon.assert.calledWith(logStub, ' 🤖[telegram]: Bot not initialized. Skip')
      logStub.restore()
    })

    it('should handle message with no text or sticker', () => {
      const logStub = sinon.stub(console, 'log')
      const tm = new TelegramMessenger()
      tm.bot = new FakeTelegramBot('1234567890:ABC')
      
      const mockMessage = {
        chat: { id: 123 },
        // No text or sticker
      }
      
      tm.handleMessage(mockMessage as Message)
      
      // Should default to text message handling with undefined text
      sinon.assert.calledWith((tm.bot as any).sendMessage, 123, 'Received your message: undefined')
      sinon.assert.calledWith(logStub, ' 🤖[telegram]: Handle message', JSON.stringify(mockMessage))
      logStub.restore()
    })

    it('should handle a complete message object', () => {
      const logStub = sinon.stub(console, 'log')
      const tm = new TelegramMessenger()
      tm.bot = new FakeTelegramBot('1234567890:ABC')
      
      const mockMessage = {
        message_id: 12345,
        from: { id: 67890, first_name: 'Test', last_name: 'User', username: 'testuser' },
        date: 1621234567,
        chat: { id: 123, type: 'private', first_name: 'Test', last_name: 'User' },
        text: 'Hello bot with more details'
      }
      
      tm.handleMessage(mockMessage as Message)
      
      sinon.assert.calledWith((tm.bot as any).sendMessage, 123, 'Received your message: Hello bot with more details')
      sinon.assert.calledWith(logStub, ' 🤖[telegram]: Handle message', JSON.stringify(mockMessage))
      logStub.restore()
    })
  })
})
