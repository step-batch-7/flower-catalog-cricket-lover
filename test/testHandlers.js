const sinon = require('sinon');
const request = require('supertest');
const fs = require('fs');
const { app } = require('../handler');

describe('GET request', function() {
  it('should get index.html when the path is /', function(done) {
    request(app.serve.bind(app))
      .get('/')
      .expect('Content-Type', 'text/html', done)
      .expect('Content-Length', '692')
      .expect(/Abeliophyllum/)
      .expect(/Ageratum/)
      .expect(200);
  });
  it('should get the requested file when correct path is given', function(done) {
    request(app.serve.bind(app))
      .get('/js/hideJar.js')
      .expect('Content-Type', 'application/javascript')
      .expect(200, done);
  });
  it('should give not found when incorrect path is given', function(done) {
    request(app.serve.bind(app))
      .get('/badFile')
      .expect(404, done);
  });
});

describe('POST comments', function() {
  beforeEach(() => sinon.replace(fs, 'writeFileSync', () => {}));
  afterEach(() => sinon.restore());
  it('should post comments on guestBookPage', function(done) {
    request(app.serve.bind(app))
      .post('/saveComments')
      .send('name=honey&comment=ohMyGod!!')
      .expect(301, done);
  });
});

describe('PUT request', function() {
  it('should give method not allowed when wrong method is asked', function(done) {
    request(app.serve.bind(app))
      .put('/')
      .expect(405, done);
  });
});
