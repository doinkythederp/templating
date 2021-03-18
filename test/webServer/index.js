// Module setup
const templateParser = require('../../module/index.js');
const path = templateParser.path(require.resolve('./html/index.html'));
const htmlParser = new templateParser({ path, extension: '.html' });

// Express server setup
const express = require('express');
const app = express();

// Keep track of visits
var visits = 0;

// Register engine
app.engine('html', templateParser.__express);
app.set('views', __dirname + '/html/') // set the templates directory
app.set('view engine', 'html') // Use the template engine

// Vanilla
app.get('/', (request, response) => {
  ++visits;
  response.status(200).send(htmlParser.render('index', { visits }));
})

// res.render
app.get('/render', (request, response) => {
  ++visits;
  response.status(200).render('index', {visits} );
})

// Error handling
app.use((request, response) => {
  response.status(404).send(htmlParser.render('404', { path: request.path }));
})

app.use((error, request, response, next) => {
  console.error(error);
  response.status(500).send(htmlParser.render('500', { error }));
})

// Start the server
app.listen(3000, () => console.info(`Example app running on https://localhost:3000`));
