define(["base/util", "base/enumerator"], function(util, enumerator) {

  describe("Enumerable", function() {
    describe("Array", function() {
      var nums, names, result;

      beforeEach(function() {
        nums   = [1, 2, 3, 4, 5];
        names  = ["Ann", "Peter", "John", "Andrew", "Bob", "Garry", "Suzanne", "Jim"];
        result = [];

        util.mix(enumerator.List, nums);
        util.mix(enumerator.List, names);
      });

      it("should iterate Array with #each method", function() {
        nums.each(function(v, i) {
          result.push(v + i);
        });

        expect(result).to.eql([1, 3, 5, 7, 9]);
      });

      it("should iterate Array with #eachSlice method", function() {
        nums.eachSlice(2, function(v, i) {
          result.push(v);
        });

        expect(result).to.eql([[1, 2], [3, 4], [5]]);
      });

      it("should map Array with #map method", function() {
        result = nums.map(function(v, i) {
          return v + i;
        });

        expect(result).to.eql([1, 3, 5, 7, 9]);
      });

      it("should map Array with #map method with string as iterator", function() {
        result = nums.map("toString");

        expect(result).to.eql(["1", "2", "3", "4", "5"]);
      });

      it("should get keys with #pluck method", function() {
        result = names.pluck("length");

        expect(result).to.eql([3, 5, 4, 6, 3, 5, 7, 3]);
      });

      it("should reduce Array with #reduce method", function() {
        result = nums.reduce(function(sum, val) {
          return sum + val;
        });

        expect(result).to.be.equal(15);
      });

      it("should find element with #find method", function() {
        result = nums.find(function(val) {
          return val > 3;
        });

        expect(result).to.be.equal(4);
      });

      it("should find elements with #findAll method", function() {
        result = nums.findAll(function(val) {
          return val > 3;
        });

        expect(result).to.eql([4, 5]);
      });

      it("should sort elements with #sortBy method", function() {
        result = names.sortBy(function(v) { return v.length; });

        expect(result).to.eql(["Ann", "Bob", "Jim", "John", "Peter", "Garry", "Andrew", "Suzanne"]);
      });

      it("should group elements with #groupBy", function() {
        result = names.groupBy(function(v) { return v.length; });

        expect(result["3"]).to.eql(["Ann", "Bob", "Jim"]);
        expect(result["4"]).to.eql(["John"]);
        expect(result["5"]).to.eql(["Peter", "Garry"]);
        expect(result["6"]).to.eql(["Andrew"]);
        expect(result["7"]).to.eql(["Suzanne"]);
      });

      it("should bind context to iterator", function() {
        var bound = { val: 2 };

        result = nums.map(function(v) {
          return v + this.val;
        }, bound);

        expect(result).to.eql([3, 4, 5, 6, 7]);
      });
    });
  });
});