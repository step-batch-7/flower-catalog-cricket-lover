const {Server} = require('http');
const {handleRequest} = require('./handler')

const main = function() {
  const server = new Server(handleRequest);
  server.on('listening', () => console.warn('server is listening'));
  server.listen(9000);
};
main();