const request = require('supertest');

const { app } = require('../handler');

describe('GET index.html', function() {
  it('should get index.html when the path is /', function(done) {
    request(app.serve.bind(app))
      .get('/')
      .expect('Content-Type', 'text/html', done)
      .expect('Content-Length', '692')
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
