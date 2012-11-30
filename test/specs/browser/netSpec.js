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

  });
});