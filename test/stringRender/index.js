const parser = new (require('../../module/index.js'))({ custom: /(?<!\\){([\s\S]+?)}/gm });

// String render
console.log(parser.renderString('This render seems to be { \'ok\'  }, variable passed in is { JSON.stringify(variable, null, 2) }', {variable: {message: 'example error', code: 000}}));