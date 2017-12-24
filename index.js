const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();

const {access_token, verify_token} = require('./access');
const {responses} = require('./messages.json');

const PORT = process.env.PORT || 8080;

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('This is a bot');
})

app.get('/webhook/', (req, res) => {
	if (req.query['hub.verify_token'] === verify_token) {
		res.send(req.query['hub.challenge']);
	}
	res.send("Wrong token");
})

app.post('/webhook/', (req, res) => {
  const body = req.body;
  if(body.object == 'page') {
    body.entry[0].messaging.forEach((msgEvent) => {
      let senderId = msgEvent.sender.id;
      let message = msgEvent.message;
      if(message && message.text) {
        handleMessage(senderId, message);
      }
    })
    res.sendStatus(200);
  }
})

function getIntentResponse(intent) {
  const body = responses[intent];
  const messages = body.messages;
  const randInt = Math.floor(Math.random() * messages.length);
  return messages[randInt];
}

function firstEntity(nlp, name) {
  return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
}

function handleMessage(senderId, message) {
  const greeting = firstEntity(message.nlp, 'greetings');
  if (greeting && greeting.confidence > 0.8) {
    sendGreetingsResponse(senderId);
  } else {
    sendResponse(senderId, getIntentResponse('default'));
  }
}

function sendGreetingsResponse(senderId) {
  const url = `https://graph.facebook.com/v2.6/${senderId}?fields=first_name,last_name&access_token=${access_token}>`;
  request(url, (err, res, body) => {
    const profile = JSON.parse(body);
    const keys = Object.keys(profile);
    const name = profile[keys[0]].toString() + ' ' + profile[keys[1]].toString();
    const reply = getIntentResponse('greetings');
    sendResponse(senderId, `${reply} ${name}`);
  })
}

function sendResponse(senderId, messageText) {
	let messageData = {text: messageText}
  const req = {
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs : {access_token: access_token},
		method: 'POST',
		json: {
			recipient: {id: senderId},
			message : messageData,
		}
	};
	request(req, (err, res, body) => {
		if (err) {
			console.log('sending error: ' + err.message)
		} else if (res.body.error) {
			console.log('response body error: ' + res.body.error.message);
		}
	})
}

app.listen(PORT, () => {
	console.log(`App running on port: ${PORT}`);
})
