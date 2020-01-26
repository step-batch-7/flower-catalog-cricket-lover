const fs = require('fs');
const { Server } = require('net');

const CONTENT_TYPES = {
  txt: 'text/plain',
  html: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  json: 'application/json',
  gif: 'image/gif',
  jpg: 'application/jpg'
};

const createNotFoundPage = function() {
  const notFoundPage = `
<html>
  <body>
    <h2>404:File not found</h2>
  </body>
</html>`;
  const defaultResponse = [
    'HTTP/1.1 404 Not Found',
    'Content-type: text/html',
    `Content-length:${notFoundPage.length}`,
    '',
    notFoundPage
  ];
  return defaultResponse.join('\n');
};

const createPage = function(filename) {
  const fileContent = fs.readFileSync(filename);
  const [, extension] = filename.split('.');

  const response = [
    'HTTP/1.1 200 OK',
    `Content-type: ${CONTENT_TYPES[extension]}`,
    `Content-length: ${fileContent.length}`,
    'Connection:closed',
    '',
    ''
  ];

  return [response.join('\n'), fileContent];
};

const generateResponse = function(text) {
  const [request, ...headerAndContent] = text.split('\n');
  let filename = request.match('.*/(.*.*) ')[1];
  if (filename === '') filename = 'index.html';
  const [, extension] = filename.split('.');
  if (extension === 'jpg' || extension === 'gif')
    filename = `images/${filename}`;
  if (!fs.existsSync(filename)) {
    return [createNotFoundPage()];
  }
  return createPage(filename);
};

const handleRequest = function(socket) {
  const remote = `${socket.remoteAddress}:${socket.remotePort}`;
  console.warn('new connection', remote);
  socket.setEncoding('utf8');
  socket.on('data', text => {
    console.warn(text);
    const contents = generateResponse(text);
    contents.forEach(res => socket.write(res));
  });
  socket.on('close', hadError => console.warn('closed', hadError));
  socket.on('end', () => console.warn(remote, 'ended'));
};

const main = function() {
  const server = new Server();
  server.on('error', err => console.warn('error', err));
  server.on('connection', handleRequest);
  server.on('listening', () => console.warn('server is listening'));
  server.on('close', () => console.warn('server closed'));
  server.listen(9000);
};
main();
