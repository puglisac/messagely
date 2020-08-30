## Messagely
Message.ly is a user-to-user private messaging app.

This exercise is meant to teach and reinforce useful common patterns around authentication and authorization.

This is a back-end api built with NodeJS and ExpressJS.

- anyone can login or register
- any logged-in user can see the list of users
- only that user can view their get-user-detail route, or their from-messages or to-messages routes.
- only the sender or recipient of a message can view the message-detail route
- only the recipient of a message can mark it as read
- any logged in user can send a message to any other user

## Endpoints
routes/auth.js  

- POST /login - login: {username, password} => {token}

- POST /register - register user: registers, logs in, and returns token.
 
 {username, password, first\_name, last\_name, phone} => {token}.

routes/users.js

- GET / - get list of users.

 => {users: [{username, first\_name, last\_name, phone}, ...]}



- GET /:username - get detail of users.
 
 => {user: {username, first\_name, last\_name, phone, join\_at, last\_login\_at}}

- GET /:username/to - get messages to user
 
  => {messages: [{id, body, sent\_at, read\_at, from\_user: {username, first\_name, last\_name, phone}}, ...]}



- GET /:username/from - get messages from user
 
  => {messages: [{id, body, sent\_at, read\_at, to\_user: {username, first\_name, last\_name, phone}}, ...]}
 

routes/messages.js

- GET /:id - get detail of message.
 
  => {message: {id, body, sent\_at, read\_at, from\_user: {username, first\_name, last\_name, phone}, to_user: {username, first\_name, last\_name, phone}}

- POST / - post message.

  {to_username, body} => {message: {id, from\_username, to\_username, body, sent\_at}}



- POST/:id/read - mark message as read:

 => {message: {id, read_at}}
 
## Built With
 
- NodeJS - backend
- ExpressJS - framework
- Bcrypt - password hashing
- PostgreSQL - database
- Node-pg - connecting to database
- Jest - testing

To run tests:  

```
jest --runInBand
```