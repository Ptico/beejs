define(["base/util"], function(util) {
  describe("Utils", function() {
    describe("namespace", function() {
      it("should create local namespace", function() {
        var app = {};

        util.namespace(app, "hello.world");

        expect(app.hello.world).to.be.an("object");
      });

      it("should assign given object to the last part", function() {
        var app = {};

        util.namespace(app, "hello.world", function() {});

        expect(app.hello.world).to.be.a("function");
      });
    });

    describe("strftime", function() {
      var date = new Date("August 24, 1991 15:17:23");

      it("should format weekdays", function() {
        var str = util.strftime(date, "%a/%A/%u");

        expect(str).to.be.equal("Sat/Saturday/6");
      });

      it("should format month", function() {
        var str = util.strftime(date, "%b/%B/%m");

        expect(str).to.be.equal("Aug/August/08");
      });
    });
  });
});