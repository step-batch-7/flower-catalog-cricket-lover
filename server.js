const {Server} = require('http');
const {app} = require('./handler')

const main = function() {
  const server = new Server(app.serve.bind(app));
  server.on('listening', () => console.warn('server is listening'));
  server.listen(9000);
};
main();