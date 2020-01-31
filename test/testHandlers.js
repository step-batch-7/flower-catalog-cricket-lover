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
      .get('/ageratum.html')
      .expect('Content-Type', 'text/html')
      .expect(200, done)
      .expect(/ageratum/);
  });
});
