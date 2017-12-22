const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const app = express();

const access = require('./access');

const port = process.env.PORT || 8080;

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/', function(req, res) {
  res.send('This is a bot');
})

app.get('/webhook/', function(req, res) {
	if (req.query['hub.verify_token'] === access.verify_token) {
		res.send(req.query['hub.challenge'])
	}
	res.send("Wrong token")
})

app.post('/webhook/', function(req, res) {
  console.log('\npost called new\n');
	let messaging_events = req.body.entry[0].messaging;
	for (let i = 0; i < messaging_events.length; i++) {
		let event = messaging_events[i]
		let sender = event.sender.id
		if (event.message && event.message.text) {
			let text = event.message.text
			sendText(sender, "Text echo: " + text.substring(0, 100))
		}
	}
	res.sendStatus(200)
})

function sendText(sender, text) {
  console.log('\nsenText called\n');
	let messageData = {text: text}
	request({
		url: "https://graph.facebook.com/v2.6/me/messages",
		qs : {access_token: access.access_token},
		method: "POST",
		json: {
			recipient: {id: sender},
			message : messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log("sending error")
		} else if (response.body.error) {
			console.log("response body error")
		}
	})
}

app.listen(port, function() {
	console.log('app running on port: '  + port)
})
