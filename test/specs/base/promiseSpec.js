define(["base/promise"], function(Promise) {
  describe("Promises", function() {
    var spyOne, spyTwo, deferred;

    beforeEach(function() {
      spyOne   = sinon.spy();
      spyTwo   = sinon.spy();
      deferred = new Promise();
    });

    it("should resolve promise", function() {
      deferred.done(spyOne);
      deferred.resolve(1);

      expect(spyOne).to.be.calledWith(1);
    });

    it("should call done callback after completion", function() {
      deferred.resolve(2);
      deferred.done(spyOne);

      expect(spyOne).to.be.calledWith(2);
    });

    it("should reject promise", function() {
      deferred.fail(spyOne);
      deferred.reject(3);

      expect(spyOne).to.be.calledWith(3);
    });

    it("should call fail callback after completion", function() {
      deferred.reject(4);
      deferred.fail(spyOne);

      expect(spyOne).to.be.calledWith(4);
    });

    it("should call anyway callback when resolved", function() {
      deferred.anyway(spyOne);
      deferred.resolve();

      expect(spyOne).to.be.called();
    });

    it("should call anyway callback when rejected", function() {
      deferred.anyway(spyOne);
      deferred.reject();

      expect(spyOne).to.be.called();
    });

    it("should call progress callback", function() {
      deferred.progress(spyOne);

      deferred.notify("On the way");

      expect(spyOne).to.be.calledWith("On the way");
    });

    it("should not change progress and call progress callbacks when done", function() {
      deferred.progress(spyOne);

      deferred.resolve();
      deferred.notify("On the way");

      expect(spyOne).to.not.be.called();
      expect(deferred.progress()).to.be(undefined);
    });

    it("should not call fail callback when done", function() {
      deferred.fail(spyOne);
      deferred.done(spyTwo);

      deferred.resolve();

      expect(spyOne).to.not.be.called();
      expect(spyTwo).to.be.called();
    });

    it("should not call done callback when fail", function() {
      deferred.done(spyOne);
      deferred.fail(spyTwo);

      deferred.reject();

      expect(spyOne).to.not.be.called();
      expect(spyTwo).to.be.called();
    });
  });
});