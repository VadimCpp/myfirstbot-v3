# myfirstbot

> Yet one Telegram bot boilerplate

Technology Stack:

- Programming Language: TypeScript
- Web Application Framework: Node.js, Express
- Cloud Deployment: Heroku
- Testing: Mocha, Sinon, NYC

## Getting started

Follow these steps:
- create .env file.

### Create .env file

- set up DEBUG env variable, default value is true
- set up TELEGRAM_BOT_TOKEN env variable, app will not work otherwise
- set up HEROKU_URL only in production

### Run locally

Install dependencies and run start script:

```bash
npm i
npm run
```

### Deploy to heroku

Use heroku CLI to create web app:

```bash
# Create a new Heroku app with the specified name
heroku create myfirstbot

# Add a Heroku remote to your local Git repository if not set
# This will allow you to deploy your app to Heroku
git remote add heroku https://git.heroku.com/myfirstbot.git

# Set DEBUG env
heroku config:set DEBUG=false --app=myfirstbot

# Set TELEGRAM_BOT_TOKEN env
heroku config:set TELEGRAM_BOT_TOKEN=0000011111:ABBBBBBBBBBBBBBBBBB3333333330 --app=myfirstbot

# Set HEROKU_URL env
heroku config:set HEROKU_URL=https://myfirstbot.herokuapp.com/ --app=myfirstbot

# Deploy your app to Heroku
git push heroku master

# Restart app
heroku restart --app=myfirstbot
```

### Test prod

Perform commands:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"key1": "value1", "key2": "value2"}' https://myfirstbot.herokuapp.com/0000011111:ABBBBBBBBBBBBBBBBBB3333333330
```
