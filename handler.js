const fs = require('fs');
const querystring = require('querystring');
const { App } = require('./app');

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

const serveBadRequestPage = function(req, res, next) {
  const badRequestPage = `
<html>
  <body>
    <h2>404:File not found</h2>
  </body>
</html>`;
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/html');
  res.end(badRequestPage);
  next();
};

const getExistingComments = function() {
  if (fs.existsSync('./data/comments.json')) {
    return JSON.parse(fs.readFileSync('./data/comments.json', 'utf8'));
  }
  return [];
};

const STATIC_FOLDER = `${__dirname}/public`;

const updateGuestBook = function(existingComments, newComment) {
  const { name, comment, date } = newComment;
  const [newDate, time] = date.split('T');
  const latestComment = `<tr><td>${newDate}</td><td>${time.slice(
    0,
    8
  )}</td><td>${name}</td> <td>${comment}</td> </br> ${existingComments}</tr>`;
  return latestComment;
};

const serveStaticPage = function(req, res, next) {
  const existingComments = getExistingComments();
  let filename = `${req.url}`;
  if (filename === '/') {
    filename = '/index.html';
  }
  if (!fs.existsSync(`./public${filename}`)) {
    next();
  }
  let fileContent = fs.readFileSync(`${STATIC_FOLDER}${filename}`);
  const [, extension] = filename.split('.');

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

const showUserPage = function(req, res, next) {
  const existingComments = getExistingComments();

  pairs = querystring.parse(req.body);
  pairs['date'] = new Date();
  existingComments.push(pairs);
  fs.writeFileSync('data/comments.json', JSON.stringify(existingComments));
  res.statusCode = 301;
  res.setHeader('Location', 'http://localhost:9000/guestBook.html');
  res.end();
};

const readBody = function(req, res, next) {
  let userDetails = '';
  req.on('data', chunk => (userDetails += chunk));
  req.on('end', () => {
    req.body = userDetails;
    next();
  });
};

const app = new App();

app.use(readBody);
app.get('/', serveStaticPage);
app.post('/showUserPage', showUserPage);
app.use(serveBadRequestPage);

module.exports = { app };
