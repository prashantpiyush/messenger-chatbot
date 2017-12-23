const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();

const access = require('./access');

const PORT = process.env.PORT || 8080;

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('This is a bot');
})

app.get('/webhook/', (req, res) => {
	if (req.query['hub.verify_token'] === access.verify_token) {
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

function firstEntity(nlp, name) {
  return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
}

function handleMessage(senderId, message) {
  const greeting = firstEntity(message.nlp, 'greetings');
  console.log(message.nlp);
  if (greeting && greeting.confidence > 0.8) {
    sendResponse(senderId, 'Hi there!');
  } else {
    sendResponse(senderId, 'Sorry, I didn\'t get that.');
  }
}

function sendResponse(senderId, messageText) {
	let messageData = {text: messageText}
	request({
		url: "https://graph.facebook.com/v2.6/me/messages",
		qs : {access_token: access.access_token},
		method: "POST",
		json: {
			recipient: {id: senderId},
			message : messageData,
		}
	}, (error, response, body) => {
		if (error) {
			console.log("sending error: " + error.message)
		} else if (response.body.error) {
			console.log("response body error: " + response.body.error.message);
		}
	})
}

app.listen(PORT, () => {
	console.log(`App running on port: ${PORT}`);
})
