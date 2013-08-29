define(['browser/net'], function(net) {
  describe('Net', function() {

    describe('Request', function() {

      xdescribe('HTTP methods', function() {
        var xhr, requests;

        beforeEach(function() {
          xhr = sinon.useFakeXMLHttpRequest();
          requests = [];
          xhr.onCreate = function (req) { requests.push(req); };
        });

        afterEach(function() {
          xhr.restore();
        });

        it('should send GET requests', function() {
          var req = new net.Request('get', '/'),
              result;

          req.send();

          expect(requests[0].method).to.be.equal('GET');
          expect(requests[0].url).to.be.equal('/');
        });

        it('should send POST requests', function() {
          var req = new net.Request('post', '/'),
              result;

          req.send();

          expect(requests[0].method).to.be.equal('POST');
          expect(requests[0].url).to.be.equal('/');
        });

        it('should send PUT requests', function() {
          var req = new net.Request('put', '/'),
              result;

          req.send();

          expect(requests[0].method).to.be.equal('PUT');
          expect(requests[0].url).to.be.equal('/');
        });

        it('should send PATCH requests', function() {
          var req = new net.Request('patch', '/'),
              result;

          req.send();

          expect(requests[0].method).to.be.equal('PATCH');
          expect(requests[0].url).to.be.equal('/');
        });

        it('should send DELETE requests', function() {
          var req = new net.Request('delete', '/'),
              result;

          req.send();

          expect(requests[0].method).to.be.equal('DELETE');
          expect(requests[0].url).to.be.equal('/');
        });
      });

      xdescribe('data', function() {});

      xdescribe('options', function() {});
    });

    describe('Response', function() {
      var xhr, request, response;

      beforeEach(function() {
        xhr = new sinon.FakeXMLHttpRequest();
      });

      describe('metadata', function() {
        beforeEach(function() {
          request  = { xhr: xhr }; // Stub
          response = new net.Response(xhr, request);
        });

        it('should inject original request', function() {
          expect(response.request).to.be.eql(request);
        });

        it('should inject original xhr object', function() {
          expect(response.xhr).to.be.eql(xhr);
        });
      });

      describe('statuses', function() {
        it('should contains response status', function() {
          xhr.respond(201);
          response = new net.Response(xhr);

          expect(response.status).to.be.eql(201);
          expect(response.statusType).to.be.eql('success');
          expect(response.statusText).to.be.eql('Created');
        });

        it('should set success property', function() {
          xhr.respond(201);
          response = new net.Response(xhr);

          expect(response.success).to.be.ok();
          expect(response.error).to.not.be.ok();
        });

        it('should set info property', function() {
          xhr.respond(100);
          response = new net.Response(xhr);

          expect(response.info).to.be.ok();
          expect(response.success).to.not.be.ok();
        });

        it('should set clientError property', function() {
          xhr.respond(404);
          response = new net.Response(xhr);

          expect(response.clientError).to.be.ok();
          expect(response.error).to.be.ok();
          expect(response.serverError).to.not.be.ok();
        });

        it('should set serverError property', function() {
          xhr.respond(503);
          response = new net.Response(xhr);

          expect(response.serverError).to.be.ok();
          expect(response.error).to.be.ok();
          expect(response.clientError).to.not.be.ok();
        });
      });

      describe('headers', function() {
        beforeEach(function() {
          xhr.respond(200, { 'Content-Type': 'application/json', 'X-Custom-Header': 'somedata' });
          response = new net.Response(xhr);
        });

        it('should contains response headers', function() {
          expect(response.headers['Content-Type']).to.be.eql('application/json');
          expect(response.headers['X-Custom-Header']).to.be.eql('somedata');
        });

        it('should get headers case-insensitive', function() {
          expect(response.get('x-custom-header')).to.be.eql('somedata');
          expect(response.get('x-Custom-hEader')).to.be.eql('somedata');
        });

        it('should set Content-Type', function() {
          expect(response.contentType).to.be.eql('application/json');
        });

        it('should set type', function() {
          expect(response.type).to.be.eql('json');
        });
      });

      describe('data', function() {
        it('should contains response text', function() {
          xhr.respond(200, { 'Content-Type': 'text/plain' }, 'Hello!');
          response = new net.Response(xhr);

          expect(response.text).to.be.eql('Hello!');
        });

        it('should parse JSON', function() {
          xhr.respond(200, { 'Content-Type': 'application/json' }, '{"name": "Andrey"}');
          response = new net.Response(xhr);

          expect(response.json).to.be.eql({ name: 'Andrey' });
          expect(response.body).to.be.eql({ name: 'Andrey' });
          expect(response.text).to.be.eql('{"name": "Andrey"}');
        });
      });

    });
  });
});