const request = require('supertest');

const { app } = require('../handler');

describe('GET index.html', function() {
  it('should get index.html when the route is /', function(done) {
    request(app.serve.bind(app))
      .get('/')
      .expect('Content-Type', 'text/html', done)
      .expect('Content-Length', '692')
      .expect(200);
  });
});
