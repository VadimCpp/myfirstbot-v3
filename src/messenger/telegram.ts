import TelegramBot, { type Update } from 'node-telegram-bot-api'

class TelegramMessenger {
  bot: TelegramBot | null = null

  constructor() {
  }

  init(botToken: string, isDebug: boolean, url: string | undefined): void {
    console.log(' 🤖[telegram]: Initializing bot')

    if (this.bot) {
      console.log(' 🤖[telegram]: Telegram bot already initialized. Skip')
      return
    }

    try {
      const that = this
      if (isDebug) {
        console.log(' 🤖[telegram]: Run in debug (use polling)')
        this.bot = new TelegramBot(botToken, { polling: true })
        this.bot.deleteWebHook()
      } else if (url) {
        console.log(' 🤖[telegram]: Run in production (set webhook)')
        this.bot = new TelegramBot(botToken)
        this.bot.setWebHook(url + botToken)
      } else {
        throw new Error('please set HEROKU_URL in .env file')
      }

      // NOTE: Handle events
      // TODO: refactor
      this.bot?.on('message', (msg) => {
        console.log(' 🤖[telegram]: Handle message', JSON.stringify(msg))
        const chatId = msg.chat.id
        if (msg.sticker) {
          that.bot?.sendSticker(chatId, msg.sticker.file_id)
        } else {
          that.bot?.sendMessage(chatId, 'Received your message: ' + msg.text)
        }
      })
    
    } catch (e: any) {
      console.log(' 🤖[telegram]: Error, ' + e.message)
    }
  }

  processUpdate(reqBody: Update): void {
    this.bot?.processUpdate(reqBody)
  }
}

export default TelegramMessenger
