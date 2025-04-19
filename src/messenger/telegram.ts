import TelegramBot, { type Update, type Message } from 'node-telegram-bot-api'

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

      this.bot.on('message', this.handleMessage.bind(this))
    
    } catch (e: any) {
      console.log(' 🤖[telegram]: Error, ' + e.message)
    }
  }

  processUpdate(reqBody: Update): void {
    this.bot?.processUpdate(reqBody)
  }

  //
  // To handle message, we need to implement handleMessage method
  // See https://core.telegram.org/bots/api#message 
  // 
  handleMessage(msg: Message): void {
    if (!this.bot) {
      console.log(' 🤖[telegram]: Bot not initialized. Skip')
      return
    }

    console.log(' 🤖[telegram]: Handle message', JSON.stringify(msg))
    const chatId = msg.chat.id
    if (msg.sticker) {
      this.bot.sendSticker(chatId, msg.sticker.file_id)
    } else {
      this.bot.sendMessage(chatId, 'Received your message: ' + msg.text)
    }
  }
}

export default TelegramMessenger
