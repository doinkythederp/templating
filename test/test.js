function chooseTest() {
  const readline = require('readline');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('Choose a test:');
    console.log('1. webServer');
    console.log('2. stringRender');

    rl.question('> ', (answer) => {
      rl.close();
      const answers = ['1', '2'];
      const requires = ['webServer/index.js', 'stringRender/index.js'];
      if (answers.includes(answer)) {
        require('./' + requires[answers.indexOf(answer)]);
        resolve();
      } else {
        chooseTest().then(() => resolve());
      }
    });
  });
}

chooseTest();