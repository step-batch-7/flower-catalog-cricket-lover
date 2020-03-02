const { Server } = require('http');
const { app } = require('./handler');
const port = process.env.PORT || 9000;

const main = function() {
  const server = new Server(app.serve.bind(app));
  server.on('listening', () => process.stdout.write('server is listening'));
  server.listen(port);
};

main();
