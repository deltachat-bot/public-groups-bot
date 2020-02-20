const { deltachat, log } = require('deltachat-node-webbot-base')
const publicChatsDB = require('./database')
const webApp = require('./web_app')
const config = require('config')

const dc_started = deltachat.start((chat, message) => {
  switch (message.getText()) {
    case '/publish':
      log(`Saving chat ${chat.getId()} as public group`)
      publicChatsDB.save(chat.getId()).then(_ => {
        log("Saved chat, sending acknowledging message");
        deltachat.sendMessage(chat.getId(), "OK, chat was opened to public subscription through the web login app. ✓")
      })
      break
    case '/unpublish':
      log(`Deleting chat ${chat.getId()} from public groups`)
      publicChatsDB.delete(chat.getId()).then(_ => {
        log("Deleted chat, sending acknowledging message");
        deltachat.sendMessage(chat.getId(), "OK, chat was removed from public subscription. ✓")
      })
      break
  }
})

// Setup the web app.
const server = require('http').createServer(webApp)
const port = config.get('http_port')

// When the deltachat setup is done, run the web-app.
// If we would start the web-app earlier, deltachat e.g. might not be ready yet to generate QR-codes.
dc_started.then(() => {
  server.listen(port, '127.0.0.1', () => {
    log(`Listening on http://127.0.0.1:${port}`)
  })
}).catch(console.error)
