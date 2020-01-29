const fs = require('fs');
const { Server } = require('http');

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

const serveBadRequestPage = function(req, res) {
  const badRequestPage = `
<html>
  <body>
    <h2>404:File not found</h2>
  </body>
</html>`;
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/html');
  res.end(badRequestPage);
};

const getExistingComments = function() {
  if (fs.existsSync('./data/comments.json'))
    return JSON.parse(fs.readFileSync('./data/comments.json', 'utf8'));
  return [];
};

const STATIC_FOLDER = `${__dirname}/public`;

const createPage = function(req, res) {
  const existingComments = getExistingComments();
  let filename = `${req.url}`;
  if (filename === '/') filename = `/index.html`;
  let fileContent = fs.readFileSync(`${STATIC_FOLDER}${filename}`);
  const [, extension] = filename.split('.');

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
  const contentType = CONTENT_TYPES[extension];
  res.setHeader('Content-Type', contentType);
  res.end(updatedFileContent);
};

const showUserPage = function(req, res) {
  const existingComments = getExistingComments();
  let userDetails = '';
  req.on('data', chunk => (userDetails += chunk));
  req.on('end', () => {
    const keyValuePairs = userDetails.split('&');
    const pairs = keyValuePairs.reduce((context, pair) => {
      const [key, value] = pair.split('=');
      context[key] = value;
      return context;
    }, {});
    pairs['date'] = new Date();
    existingComments.push(pairs);
    fs.writeFileSync(
      'data/comments.json',
      JSON.stringify(existingComments),
      'utf8'
    );
  });
  res.statusCode = 301;
  res.setHeader('Location', 'http://localhost:9000/guestBook.html');
  res.end();
};

const handleRequest = function(req, res) {
  const filename = req.url;
  const method = req.method;
  if (method === 'POST' && filename === '/showUserPage') {
    return showUserPage(req, res);
  }
  if (fs.existsSync(`./public${filename}`)) {
    return createPage(req, res);
  }
  return serveBadRequestPage(req, res);
};

const main = function() {
  const server = new Server(handleRequest);
  server.on('listening', () => console.warn('server is listening'));
  server.listen(9000);
};
main();
