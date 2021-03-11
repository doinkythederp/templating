##### | [Github Repo](https://github.com/doinkythederp/templating) | [NPM](https://www.npmjs.com/package/@doinkythederp/templating) |

# doinkythederp's JS Templating Tool
A templating tool allows you to create "templates" that generate an output. This one in particular is based off of Javascript's template literal system, and runs Node.js code. Snippets of code, called expressions, are run by the server and used to edit the template. Expressions are marked by a start and stop marker.

The templating tool will run the code put *between* the start and stop markers, then replace the entire expression and markers with the output of the code. It is important to note that the code is run by the server - the template is already fully formed by the time it exits the templating engine.

## Table of contents

- [Installation](#install)
- [Examples](#examples)
- [Documentation](#documentation)
  - [templateParser](#templateparser-class)
  - [templateOptions](#templateoptions-object)
  - [Using with Express](#using-with-express)
  - [Customizing the RegExp](#customizing-the-regexp)

## Install
Installing is as simple as running the following npm command:
`npm i @doinkythederp/templating`

## Examples
Using the module to generate an error message from a template:
```javascript
const templateParser = require('@doinkythederp/templating');
const messageParser = new templateParser({ path: __dirname + '/json/', extension: 'json' });

myEventListener.on('error', (error, code) => {
  const message = messageParser.render('error', { code, error, timestamp: Date.now()});
  console.log(message);
});
```
An example of a template file, using the default expression markers `#≤` and `≥`:
```html
<html>
  <body>
  	<div>
      <h1>HTML Templating</h1>
      <p>#≤ if ( visits > 1 ) { `This page has now been visited ${visits} times.` }
          else { "Hey look, our first visitor!"} ≥
          </p>
    </div>
  </body>
</html>
```
## Documentation
When requiring the module, the `templateParser` class will be returned. It can be used to render templates, and has changeable options attached to it.
### `templateParser` **Class**
| Property | Type |
|----------|------|
path | Static Method
__express | Static Method
setOptions | Method
render | Method
renderString | Method
options | Property
constructor | Constructor
___
#### `.path(require.resolve( requirePath ))` **Static Method**
Generate a path to a templates folder that you can use in the templateParser's `options.path`
* `requirePath`: The path to a file that is in your templates folder, styled like a `require()` method.
```javascript
const path = templateParser.path(require.resolve(`../html/index.html`));

const htmlParser = new templateParser({ path, extension: 'html' });
```
___
#### `.__express` **Static Method**
A function given to Express to use as a template engine. It doesn't ever need to be called by you.
##### Using the `__express` property:
```js
// Register the engine with Express with the `app.engine` method
const extension = 'html';
app.engine(extension, require('@doinkythederp/templating').__express)
```
See more at [Using with express](#using-with-express)
___
#### `.setOptions( options )` **Method**
Allows you to change the options that were set on initialization
* `options`: The updated `templateOptions` you would like to use
```javascript
myTemplateParser.setOptions({ extension: 'json'});
console.log(`Settings changed.`)
```
___
#### `.render( target, variables, options )` **Method**
Looks for expressions in the specified file, evaluates the code, and returns the file with the expressions and markers replaced with the codes output.
###### **Note:** All possible expressions prefixed with a `\` backslash will be ignored, such as "\\#≤ expression ≥".
###### **Note:** Keywords such as `function`, `if`, and `for` are perfectly acceptable inside of expressions. Multi-lined expressions also work.
###### **Warning:** If you don't transfer your variables to the template through the `variables` argument, they won't be accessible. Note that you can set variables in one expression and access them again in another expression in the same template.
 * `target`: The name of the file to render
 * `variables`: An object containing the variables to transfer to the template. Inisde the template, they can be accesed as if they'd been set as global variables.
 * `options`: The temporary `templateOptions` options to use - defaults to the ones set on initialization or with the `.setOptions` method
```javascript
const htmlParser = new templateParser({ path });
// This example uses an express app
const app = express();

// A profile page
app.get('/profile/:id', (request, response) => {
  // If our example database doesn't have the user, render our 404 page
  if (!myDatabase.has('USER-' + request.params.id))
    return res.status(404).send(htmlParser.render('404', { request, message: `User not Found` }));

  // Otherwise, get the user from the database...
  const user = myDatabase.get('USER-' + request.params.id);

  // And render their profile page
  res.send(htmlParser.render('users/profilePage'));
})
```
___
#### `.renderString( input, variables, options )` **Method**
Instead of rendering a template *file*, this allows you to render a string. Very similar to using template literals, but with differences: When rendering the string, you can only access variables you imported. The fact you can also use multi-line expressions and 
* `input`: The string to render
* `variables`: An object containing the variables to transfer to the template. Inisde the template, they can be accesed as if they'd been set as global variables.
* `options`: The temporary `templateOptions` options to use - defaults to the ones set on initialization or with the `.setOptions` method

___
#### `.options` **Property**
Gives a `templateOptions` object holding a copy of the current options.
You can't change the options through the object it returns.
___
#### `new templateParser( options )` **Constructor**
Create a new templateParser object with the specified options
* `options`: The `templateOptions` you would like to use
```javascript
const templateParser = require(`@doinkythederp/templating`);
const myTemplateParser = new templateParser({ path, extension: '.markdown' });
```
___
### `templateOptions` **Object**
Used to configure the properties of a `templateParser`

| Parameter | Type | Optional | Default | Description |
|-----------|------|----------|---------|-------------|
path | String | Yes | `/` | The base path when accessing a template file
extension | String | Yes | `html` | The file extension to use, can be an empty string to skip
handleUndefined | Boolean | Yes
custom | RegExp | Yes | `/(?<!\\)\#\≤([\s\S]+?)\≥/gm` | Allows you to set your own RegExp for locating varibles
###### **Warning**: Only change the RegExp if you fully know what you're doing!
```js
const options = {
  path: templateParser.path(require.resolve('../htmlFiles/index.html'),
  extention: 'html',
  custom: /(?<!\\)\$\{([\s\S]+?)\}/gm
}
const myTemplateParser = new templateParser(options);
```
___
### Using with Express
Express provides a `app.render` and `res.render` function, allowing you to render files without too much of a hassle.
To use this feature, you have to register the template engine with express, and do a bit of setup.
##### Using the `app.engine` method
```js
// Express setup
const express = require('express');
const app = express();

// First, choose the extension of your template files
const extension = 'html';

// Now, use the app.engine method to register the template engine
app.engine(extension, require('@doinkythederp/templating).__express);
// The neccesary code is stored inside of the exported __express property.

// Continued setup
app.set('views', __dirname + '/templates/'); // The path to the folder that the templates are in.
app.set('view engine', extension); // Automatically use this engine when no extension is provided.

// Optional setup
app.locals.regexp = /custom-regexp/gm
```
##### An example using `res.render`
```js
app.get('/', (req, res) => {
  app.status(200).render('index', { authUser: /* Somehow get the current user */ })
})
```
___
### Customizing the RegExp
The base RegExp is formatted in the following way:
```js
/ (?<!\\) \#\≤ ([\s\S]+?) (?<!\\) \≥ /gm
/*   1      2      3         4     5   6  */
```

1. No leading backslash filter - Means that if you put a backslash here at the beginning, it won't see the start of the expression.
2. The start of the expression - This marks the start of the expression
3. First capture group - This is where the code looks to find what code to run. It is set to allow anything in it.
4. No leading backslash filter - Means that if you put a backslash here at the end, it won't see the end of the expression.
5. The end of the expression - This marks the end of the expression
6. Flags - `g` allows multiple expressions, `m` allows muli-line expressions

###### You can edit this RegExp as you please, although expect errors if it's not correctly formatted.

## Version History

* 1.0.0 - Initial Release
* 1.0.1 - Bug fixes and a README.md file
* 1.0.2 - Bug fixes
* 1.1.0 - Lots more features
* 1.1.1 - Some renderString bugs fixed
* 1.1.2 - More bug fixes
* 1.1.3 - Version History added, Github Repo added, License added and some errors fixed
* 1.2.0 - Added support for express's `res.render`.

##### | [Back to Top](#top) | [Github Repo](https://github.com/doinkythederp/templating) | [NPM](https://www.npmjs.com/package/@doinkythederp/templating) |

