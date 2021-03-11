const fs = require('fs');




class renderer {
  constructor(options) {
    // Make sure we have valid options
    if (typeof options == 'undefined') options = new Object();
    if (typeof options !== 'object') throw new TypeError(`The options provided to the renderer must be an object.`);
    if (typeof options.expressions !== 'object') options.expressions = new Object();

    // Set fallbacks
    options = {
      path: options.path || '',
      extension: options.extension || '.html',
      custom: options.custom
    }

    // Make sure the path and extension are valid
    if ((!options.extension.startsWith('.')) && options.extension !== '') options.extension = '.' + options.extension;

    if (!options.path.endsWith('/')) options.path = options.path + '/';

    this._options = options;
  }

  render(request, variables, options) {
    // Create a new VM
    const vm = require('vm');
    // Allow custom options that don't save
    // Make sure we have valid options
    if (typeof options == 'undefined') options = new Object();
    if (typeof options !== 'object') throw new TypeError(`The options provided to the renderer must be an object.`);
    if (typeof options.path !== 'string' && options.path) throw new TypeError(`The default path provided to the renderer must be a string.`);
    if (typeof options.extension !== 'string' && options.extension) throw new TypeError(`The default extension provided to the renderer must be a string.`);
    if (options.custom instanceof RegExp && options.extension) throw new TypeError(`The custom RegExp provided to the renderer must be a RegExp.`);
    if (!variables || typeof variables !== 'object') variables = {};
    vm.createContext(variables);

    // Fallbacks
    options = {
      path: options.path || this._options.path,
      extension: options.extension || this._options.extension,
      custom: options.custom
    }

    // Here's our file to grab
    const path = `${options.path}${request}${options.extension}`;

    // Make sure the file exists
    if (!fs.existsSync(path)) throw new Error(`The requested file ${path} doesn't exist.`);

    // Get the contents of the file
    var file = fs.readFileSync(`${options.path}${request}${options.extension}`, 'utf8');

    var matches;

    var match = options.custom || /(?<!\\)\#\≤([\s\S]+?)(?<!\\)\≥/gm;

    eval(`matches = [...file.matchAll(match)]`);

    // Run the code
    matches.forEach(([match, code]) => {
      file = file.replace(match, vm.runInContext(code, variables, { filename: "templateEngine" }));
    });

    // Return the final document
    return file;
  }

  renderString(input, variables, options) {
    // Create a new VM
    const vm = require('vm');
    // Allow custom options that don't save
    // Make sure we have valid options
    if (typeof options == 'undefined') options = new Object();
    if (typeof options !== 'object') throw new TypeError(`The options provided to the renderer must be an object.`);
    if (typeof options.path !== 'string' && options.path) throw new TypeError(`The default path provided to the renderer must be a string.`);
    if (typeof options.extension !== 'string' && options.extension) throw new TypeError(`The default extension provided to the renderer must be a string.`);
    if (options.custom instanceof RegExp && options.extension) throw new TypeError(`The custom RegExp provided to the renderer must be a RegExp.`);
    if (!variables || typeof variables !== 'object') variables = {};
    vm.createContext(variables);
    // Fallbacks
    options = {
      path: options.path || this._options.path,
      extension: options.extension || this._options.extension,
      custom: options.custom
    }

    var matches;

    input = new String(input);

    var match = options.custom || /(?<!\\)\#\≤([\s\S]+?)(?<!\\)\≥/gm;

    eval(`matches = [...new String(input).matchAll(match)]`);

    // Run the code
    matches.forEach(([match, code]) => {
      input = input.replace(match, vm.runInContext(code, variables, { filename: "templateEngine" }));
    });

    // Return the final document
    return input;
  }

  setOptions(options) {
    // Make sure we have valid options
    if (typeof options !== 'object') throw new TypeError(`The options provided to the renderer must be an object.`);

    // Set fallbacks
    options = {
      path: options.path || this._options.path,
      extension: options.extension || this._options.extension,
      custom: options.custom
    }

    // Make sure the path and extension are valid
    if (!options.extension.startsWith('.')) options.extension = '.' + options.extension;

    if (!options.path.endsWith('/')) options.extension = '.' + options.extension;

    this._options = options;
  }

  static __express(path, options, finish) { // Using with res.render
    // Create a new VM
    const vm = require('vm');

    options = options || {};

    vm.createContext(options); // Make the provided variables into a context

    // Make sure the file exists
    if (!fs.existsSync(path)) return finish(new Error(`The requested template file ${path} doesn't exist.`));

    // Get the contents of the file
    var file = fs.readFileSync(path, 'utf8');


    var match = options._locals.regexp || /(?<!\\)\#\≤([\s\S]+?)(?<!\\)\≥/gm; // The regex

    var matches = [...file.matchAll(match)]; // Look for expressions

    // Run the code
    matches.forEach(([match, code]) => {
      file = file.replace(match, vm.runInContext(code, options, { filename: "templateEngine" }));
    });

    // Return the final document
    return finish(null, file);
  }

  static path(input) {
    if (typeof input !== 'string') throw new TypeError(`Argument input must be a string.`);

    input = input.split('/');
    input.pop();

    return input.join('/');
  }

  get options() {
    return Object.assign(new Object(), this._options);
  }

}

module.exports = renderer;