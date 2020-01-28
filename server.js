const fs = require('fs');
const { Server } = require('net');

const CONTENT_TYPES = {
  txt: 'text/plain',
  html: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  json: 'application/json',
  gif: 'image/gif',
  jpg: 'application/jpg',
  pdf: 'application/pdf'
};

const serveBadRequestPage = function() {
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

const getExistingComments = function() {
  if (fs.existsSync('./data/comments.json'))
    return JSON.parse(fs.readFileSync('./data/comments.json', 'utf8'));
  return [];
};

const createPage = function(filename) {
  const existingComments = getExistingComments();
  let fileContent = fs.readFileSync(filename);
  const [, , extension] = filename.split('.');

  const updateGuestBook = function(existingComments, newComment) {
    const { name, comment, date } = newComment;
    const latestComment = `${date.toString()} ${name} ${comment} </br> ${existingComments}`;
    return latestComment;
  };
  const name = existingComments.reduce(updateGuestBook, '');

  let updatedFileContent = fileContent;
  if (extension === 'html') {
    fileContent = fileContent.toString();
    updatedFileContent = fileContent.replace('__comments__', name);
  }

  const response = [
    'HTTP/1.1 200 OK',
    `Content-type: ${CONTENT_TYPES[extension]}`,
    `Content-length: ${updatedFileContent.length}`,
    'Connection:closed',
    '',
    ''
  ];

  return [response.join('\n'), updatedFileContent];
};

const showUserPage = function() {
  const defaultResponse = [
    'HTTP/1.1 301',
    `Content-length: 0`,
    'Location: http://localhost:9000/guestBook.html',
    '',
    ''
  ];

  return [defaultResponse.join('\n')];
};

const generateResponse = function(text) {
  const comments = getExistingComments();
  const [request, ...headerAndContent] = text.split('\n');
  let [method, filename] = request.split(' ');
  if (filename === '/') filename = '/index.html';

  if (method === 'POST' && filename === '/showUserPage') {
    const userDetails = headerAndContent[headerAndContent.length - 1];
    const keyValuePairs = userDetails.split('&');
    const pairs = keyValuePairs.reduce((context, pair) => {
      const [key, value] = pair.split('=');
      context[key] = value;
      return context;
    }, {});
    pairs['date'] = new Date();
    comments.push(pairs);
    fs.writeFileSync('data/comments.json', JSON.stringify(comments), 'utf8');
    return showUserPage();
  }

  if (!fs.existsSync(`./public${filename}`)) {
    return [serveBadRequestPage()];
  }
  return createPage(`./public${filename}`);
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
