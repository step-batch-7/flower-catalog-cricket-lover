const request = require('supertest');

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
  it('should post comments on guestBookPage', function(done) {
    request(app.serve.bind(app))
      .post('/saveComments')
      .send('name=phani&comment=good')
      .expect(301, done);
  })
});
