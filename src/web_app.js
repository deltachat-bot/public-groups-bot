/**
 * This app lists public groups and allows to join them with a click.
 * To publish a group just send '/publish' into the group while the login-bot
 * is a member.
 * To unpublish, send '/unpublish'.
 */
const { webApp, deltachat, ensureAuthenticated } = require('deltachat-node-webbot-base')
const { log } = require('deltachat-node-bot-base')
const publicChatsDB = require('./database')
const ejs = require('ejs')
const path = require('path')
const express = require('express')

const router = express.Router()                                                                                                                                                                

/**
 * List all public groups
 */
router.get('/', ensureAuthenticated, async (req, res) => {
  let contactId = req.session.contactId
  log(`Rendering public-groups page for contactId ${contactId}`)
  const chatIds = await publicChatsDB.getChats() || []
  let joinedChats = []
  let unjoinedChats = []
  chatIds.forEach(chatId => {
    let data = {
      "chatId": chatId,
      "chatName": deltachat.getChat(chatId).getName(),
    }
    if (deltachat.isContactInChat(chatId, contactId)) {
      joinedChats.push(data)
    } else {
      unjoinedChats.push(data)
    }
  })

  const content = await ejs.renderFile(
    path.join(__dirname, '../web/groups.ejs').toString(),
    {
      address: deltachat.getContact(contactId).toJson().address,
      joinedChats: joinedChats,
      unjoinedChats: unjoinedChats,
      numChats: chatIds.length,
      successMessage: req.session.successMessage,
      baseUrl: req.baseUrl
    }
  )
  req.session.successMessage = ''
  res.send(content)
})

/**
 * Add the user (aka contact) to the given group.
 */
router.get('/join/:chatId', ensureAuthenticated, (req, res) => {
  log("Request to /join")
  const chatId = req.params.chatId
  const chat = chatId && deltachat.getChat(chatId)

  if (!chat) {
    log("The requested chat_id does not exist")
    req.session.successMessage = "You'd have to create that group first, please. It does not exist yet :)"
    res.redirect(req.baseUrl)
    return
  }

  // Shouldn't happen, but better check twice.
  if (!req.session.contactId) {
    log("Error: not contactId in session!")
    return res.redirect(req.baseUrl)
  }

  log(`Adding contact ${req.session.contactId} to group ${chatId}`)
  deltachat.addContactToChat(chatId, req.session.contactId)
  req.session.successMessage = `✓ You joined group ${chat.getName()}`
  res.redirect(req.baseUrl)
})

/**
 * Logout, aka destroy the session.
 */
router.get('/logout', ensureAuthenticated, async (req, res) => {
  log("Request to /logout")
  await new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) {
        console.error(err)
        reject()
      } else {
        log("Session destroyed.")
        resolve()
      }
    })
  })
  res.redirect(req.baseUrl)
})


/**
 * Serve the CSS for the group listing.
 */
router.get('/groups.css', (_req, res) => { res.sendFile(path.join(__dirname, '../web/groups.css')) })

// Hook into the webApp. We could specify a sub-path here.
webApp.use('/', router)

module.exports = webApp
