# Public Groups Bot — Allow joining Delta Chat groups via the web

This Delta Chat bot allows people to join published Delta Chat groups with a click.

To "authenticate", users must scan a QR-code with their Delta Chat app. That makes their Delta Chat email address known to the bot. (No further checks on the user's email addresses are done.)

The web interface shows all groups that have been published.

To publish a group, this bot must be added as a member of the group, then someone must send `/publish` as message into the group chat.

To unpublish, send `/unpublish`.

## Requirements

* NPM and NodeJS >= 7.6.
* An email account for the bot.

## Setup

1. Install the dependencies by running `npm install`.
2. Configure the bot by saving its email-address and password into `config/local.json`. E.g.:
```bash
echo '{
"email_address": "bot@example.net",
"email_password": "secretandsecure"
}' > config/local.json
```
3. Optionally configure the `http_port` (that the bot should serve the web interface on) in `config/local.js` (default: 3000).
4. Setup a HTTP daemon to reverse-proxy the bot, e.g. nginx.

## Run

Run the bot with `npm start`.

