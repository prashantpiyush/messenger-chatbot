# Messenger chatbot

### Overview
This is a my personal project to lean node.js. This bot currently replies to only three kind of messages: Greetings, Thanks and Bye. Also, for the greetings reply it fetches senders name from facebook and appends it to one of the replies.

Example of Greetings reply:
```
User: Hi!
Bot : Hey, Prashant!
```

### Steps
If you want to test this bot on your own environment then follow the setps below:

1. Creat a new app on [developers](https://developers.facebook.com/) site of facebook and get an `ACCESS_TOKEN` after adding your facebook page to the app.
2. Decide on a `VERIFY_TOKEN` which you will use for authentication between you app and facebook. It can be any string and as simple as `Testbot`.
3. Create a file named `access.json` in the project directory with the following content:
```
{
    "access_token": "<YOUR_ACCESS_TOKEN>",
    "verify_token": "<YOUR_VERIFY_TOKEN>"
}
```
4. Push all this code on your server and the bot will be up and running.
5. Setup webhook on your facebook app using your server's webhook address and the `VERIFY_TOKEN` you just created to receive messages from facebook.
