var sqlite3 = require('sqlite3')
const path = require('path')

const init_db = () => {
  let db = new sqlite3.Database(path.join(process.cwd(), 'public-groups-bot.sqlite'))
  db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS published_groups (chatId INTEGER PRIMARY KEY)")
  })
  return db
}

const publicChatsDB = init_db()

process.on('exit', () => publicChatsDB.close())

publicChatsDB.delete = (chatId) => {
  return new Promise((resolve, reject) => {
    publicChatsDB.run("DELETE FROM published_groups WHERE chatId = $chatId",
      { $chatId: chatId },
      (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
  })
}

publicChatsDB.save = (chatId) => {
  return new Promise((resolve, reject) => {
    publicChatsDB.run("INSERT INTO published_groups (chatId) VALUES ($chatId)",
      { $chatId: chatId },
      (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      }
    )
  })
}

publicChatsDB.getChats = () => {
  return new Promise((resolve, reject) => {
    publicChatsDB.all(`SELECT chatId FROM published_groups`,
      {},
      (err, result) => {
        if (err) {
          reject(err)
        } else {
          const chatIds = result.map(obj => obj.chatId)
          resolve(chatIds)
        }
      }
    )
  })
}

module.exports = publicChatsDB
