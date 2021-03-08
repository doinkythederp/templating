// Module setup
const templateParser = require('../../module/index.js');
const path = templateParser.path(require.resolve('./html/index.html'));
const htmlParser = new templateParser({ path, extension: '.html' });

// Express server setup
const express = require('express');
const app = express();

// Keep track of visits
var visits = 0;

// Our webpage
app.get('/', (request, response) => {
  ++visits;
  response.status(200).send(htmlParser.render('index', { visits }));
})

app.get((error, request, response, next) => {
  response.status(500).send(htmlParser.render('500', { error }));
})

// Error handling
app.use((request, response) => {
  response.status(404).send(htmlParser.render('404', { path: request.path }));
})

app.use((error, request, response, next) => {
  response.status(500).send(htmlParser.render('500', { error }));
})

// Start the server
app.listen(3000, () => console.info(`Example app running on https://localhost:3000`));

// String render
console.log(htmlParser.renderString('test #≤ \'ok\' ≥'));