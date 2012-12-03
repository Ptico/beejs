define(["browser/net"], function(net) {
  describe("Net", function() {
    describe("HTTP methods", function() {
      var xhr, requests;

      beforeEach(function() {
        xhr = sinon.useFakeXMLHttpRequest();
        requests = [];
        xhr.onCreate = function (req) { requests.push(req); };
      });

      afterEach(function() {
        xhr.restore();
      });

      it("should send GET requests", function() {
        var req = new net.Request("get", "/"),
            result;

        req.send();

        expect(requests[0].method).to.be.equal("GET");
        expect(requests[0].url).to.be.equal("/");
      });

      it("should send POST requests", function() {
        var req = new net.Request("post", "/"),
            result;

        req.send();

        expect(requests[0].method).to.be.equal("POST");
        expect(requests[0].url).to.be.equal("/");
      });

      it("should send PUT requests", function() {
        var req = new net.Request("put", "/"),
            result;

        req.send();

        expect(requests[0].method).to.be.equal("PUT");
        expect(requests[0].url).to.be.equal("/");
      });

      it("should send PATCH requests", function() {
        var req = new net.Request("patch", "/"),
            result;

        req.send();

        expect(requests[0].method).to.be.equal("PATCH");
        expect(requests[0].url).to.be.equal("/");
      });

      it("should send DELETE requests", function() {
        var req = new net.Request("delete", "/"),
            result;

        req.send();

        expect(requests[0].method).to.be.equal("DELETE");
        expect(requests[0].url).to.be.equal("/");
      });
    });

    describe("Emulated HTTP methods", function() {
      var xhr, requests;

      beforeEach(function() {
        xhr = sinon.useFakeXMLHttpRequest();
        requests = [];
        xhr.onCreate = function (req) { requests.push(req); };
      });

      afterEach(function() {
        xhr.restore();
      });

      it("should send GET requests", function() {
        var req = new net.Request("get", "/"),
            result;

        req.send();

        expect(requests[0].method).to.be.equal("GET");
        expect(requests[0].url).to.be.equal("/");
        expect(requests[0].requestBody).to.be.equal(null);
      });

      it("should send POST requests", function() {
        var req = new net.Request("post", "/"),
            result;

        req.send();

        expect(requests[0].method).to.be.equal("POST");
        expect(requests[0].url).to.be.equal("/");
        expect(requests[0].requestBody).to.be.eql({});
      });

      it("should send PUT requests", function() {
        var req = new net.Request("put", "/"),
            result;

        req.set("emulate", true);
        req.send();

        expect(requests[0].method).to.be.equal("POST");
        expect(requests[0].url).to.be.equal("/");
        expect(requests[0].requestBody).to.be.eql({ _method: "PUT" });
      });

      it("should send PATCH requests", function() {
        var req = new net.Request("patch", "/"),
            result;

        req.set("emulate", true);
        req.send();

        expect(requests[0].method).to.be.equal("POST");
        expect(requests[0].url).to.be.equal("/");
        expect(requests[0].requestBody).to.be.eql({ _method: "PATCH" });
      });

      it("should send DELETE requests", function() {
        var req = new net.Request("delete", "/"),
            result;

        req.set("emulate", true);
        req.send();

        expect(requests[0].method).to.be.equal("POST");
        expect(requests[0].url).to.be.equal("/");
        expect(requests[0].requestBody).to.be.eql({ _method: "DELETE" });
      });
    });

    describe("Data", function() {
      var xhr, requests;

      beforeEach(function() {
        xhr = sinon.useFakeXMLHttpRequest();
        requests = [];
        xhr.onCreate = function (req) { requests.push(req); };
      });

      afterEach(function() {
        xhr.restore();
      });

      it("should send GET data", function() {
        var req = new net.Request("get", "/");

        req.setData("one", 1).setData("two", 2).send();

        expect(requests[0].url).to.be.equal("/?one=1&two=2");
        expect(requests[0].requestBody).to.be.eql(null);
      });

      it("should send POST data", function() {
        var req = new net.Request("post", "/");

        req.setData("one", 1);

        req.setData({
          two: 2,
          three: 3
        }).send();

        expect(requests[0].url).to.be.equal("/");
        expect(requests[0].requestBody).to.be.eql({ one: 1, two: 2, three: 3 });
      });

      it("should escape GET data", function() {
        var req = new net.Request("get", "/");

        req.setData("greeting", "Hello world").setData("тест", "раз").send();

        expect(requests[0].url).to.be.equal("/?greeting=Hello%20world&%D1%82%D0%B5%D1%81%D1%82=%D1%80%D0%B0%D0%B7");
      });

      it("should interpolate data in URL's", function() {
        var req = new net.Request("post", "/users/:id/:action");

        req.setData({
          id: 42,
          action: "edit",
          email: "user@example.com"
        }).send();

        expect(requests[0].url).to.be.equal("/users/42/edit");
        expect(requests[0].requestBody).to.be.eql({ email: "user@example.com" });
      });
    });

    describe("Promise", function() {
      var xhr, spyOne, spyTwo, requests, req;

      beforeEach(function() {
        xhr    = sinon.useFakeXMLHttpRequest();
        spyOne = sinon.spy();
        spyTwo = sinon.spy();
        req    = new net.Request("get", "/");
        requests = [];
        xhr.onCreate = function (req) { requests.push(req); };
      });

      afterEach(function() {
        xhr.restore();
      });

      it("should call success promise", function() {
        req.done(spyOne).fail(spyTwo).send();
        requests[0].respond(200);

        expect(spyOne).to.be.calledOnce();
        expect(spyTwo).to.not.be.called();
      });

      it("should call fail promise", function() {
        req.done(spyOne).fail(spyTwo).send();
        requests[0].respond(404);

        expect(spyOne).to.not.be.called();
        expect(spyTwo).to.be.calledOnce();
      });

      it("should call anyway promise when done", function() {
        req.anyway(spyOne).fail(spyTwo).send();
        requests[0].respond(200);

        expect(spyOne).to.be.calledOnce();
        expect(spyTwo).to.not.be.called();
      });

      it("should call anyway promise when fail", function() {
        req.anyway(spyOne).done(spyTwo).send();
        requests[0].respond(500);

        expect(spyOne).to.be.calledOnce();
        expect(spyTwo).to.not.be.called();
      });

      it("should call promise after complete", function() {
        req.send();
        requests[0].respond(200);

        req.done(spyOne);
        expect(spyOne).to.be.calledOnce();
      });
    });
  });
});