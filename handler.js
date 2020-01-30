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

const updateComments = function(existingComments, newComment) {
  const { name, comment, date } = newComment;
  const [newDate, time] = date.split('T');
  const row = `
	<tr>
	<td>${newDate}</td>
	<td>${time}</td>
	<td>${name}</td>
	<td>${comment}</td>
</tr>`;
  return row + existingComments;
};

const loadTemplate = (content, propertyBag) => {
  const replaceKeyWithValue = (content, key) => {
    const pattern = new RegExp(`__${key}__`, 'g');
    return content.replace(pattern, propertyBag[key]);
  };
  const keys = Object.keys(propertyBag);
  const html = keys.reduce(replaceKeyWithValue, content);
  return html;
};

const serveStaticPage = function(req, res, next) {
  const updatedComments = getExistingComments().reduce(updateComments, '');
  const filename = req.url === '/' ? '/index.html' : req.url;
  if (!fs.existsSync(`./public${filename}`)) {
    next();
  }
  let fileContent = fs.readFileSync(`${STATIC_FOLDER}${filename}`);
  const [, extension] = filename.split('.');
  if (extension === 'html') {
    fileContent = loadTemplate(fileContent.toString(), {
      comments: updatedComments
    });
  }
  res.setHeader('Content-Type', CONTENT_TYPES[extension]);
  res.end(fileContent);
};

const showUserPage = function(req, res) {
  const existingComments = getExistingComments();

  const pairs = querystring.parse(req.body);
  pairs['date'] = new Date();
  existingComments.push(pairs);
  fs.writeFileSync('data/comments.json', JSON.stringify(existingComments));
  res.statusCode = 301;
  res.setHeader('Location', 'http://localhost:9000/guestBook.html');
  res.end();
};

const readBody = function(req, res, next) {
  let userDetails = '';
  req.on('data', chunk => {
    userDetails += chunk;
    return userDetails;
  });
  req.on('end', () => {
    req.body = userDetails;
    next();
  });
};

const methodNotAllowed = function(req, res) {
  res.statusCode = 400;
  res.end();
};

const app = new App();

app.use(readBody);
app.get('', serveStaticPage);
app.post('/showUserPage', showUserPage);
app.get('', serveBadRequestPage);
app.post(serveBadRequestPage);
app.use(methodNotAllowed);

module.exports = { app };
