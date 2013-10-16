define(['base/util'], function(util) {
  describe('Utils', function() {

    describe("strftime", function() {
      var date;

      beforeEach(function() {
        date = new Date("August 9, 1991 15:17:23");
      });

      it('%a', function() {
        var str = util.strftime(date, 'Today is %a.');

        expect(str).to.be.equal('Today is Fri.');
      });

      it('%A', function() {
        var str = util.strftime(date, 'Today is %A');

        expect(str).to.be.equal('Today is Friday');
      });

      it('%b', function() {
        var str = util.strftime(date, 'This month is an %b.');

        expect(str).to.be.equal('This month is an Aug.');
      });

      it('%B', function() {
        var str = util.strftime(date, 'This month is an %B');

        expect(str).to.be.equal('This month is an August');
      });

      it('%c', function() {
        var str = util.strftime(date, 'Now is %c');

        expect(str).to.be.equal('Now is ' + date.toLocaleString());
      });

      it('%d', function() {
        var str = util.strftime(date, 'Today is %dth');

        expect(str).to.be.equal('Today is 09th');
      });

      it('%D', function() {
        var str = util.strftime(date, 'Today is %D');

        expect(str).to.be.equal('Today is 08/09/91');
      });

      it('%e', function() {
        var str = util.strftime(date, 'Today is %eth');

        expect(str).to.be.equal('Today is 9th');
      });

      it('%H', function() {
        var str = util.strftime(date, 'Now is %H hours');

        expect(str).to.be.equal('Now is 15 hours');
      });

      it('%I', function() {
        var str = util.strftime(date, 'Now is %I hours');

        expect(str).to.be.equal('Now is 03 hours');
      });

      it('%j', function() {
        var str = util.strftime(date, 'Today is %jth day of the year');

        expect(str).to.be.equal('Today is 221th day of the year');
      });

      it('%k begin of day', function() {
        date.setHours('05')
        var str = util.strftime(date, 'Now is %k hours');

        expect(str).to.be.equal('Now is 5 hours');
      });

      it('%k end of day', function() {
        var str = util.strftime(date, 'Now is %k hours');

        expect(str).to.be.equal('Now is 15 hours');
      });

      it('%l', function() {
        var str = util.strftime(date, 'Now is %l hours');

        expect(str).to.be.equal('Now is 3 hours');
      });

      it('%m', function() {
        var str = util.strftime(date, 'The number of this month is %m');

        expect(str).to.be.equal('The number of this month is 08');
      });

      it('%M', function() {
        var str = util.strftime(date, '%M minutes from beginning of hour');

        expect(str).to.be.equal('17 minutes from beginning of hour');
      });

      it('%p', function() {
        var str = util.strftime(date, 'Now is %p');

        expect(str).to.be.equal('Now is PM');
      });

      it('%P', function() {
        var str = util.strftime(date, 'Now is %P');

        expect(str).to.be.equal('Now is pm');
      });

      it('%S', function() {
        var str = util.strftime(date, '%S seconds');

        expect(str).to.be.equal('23 seconds');
      });

      it('%u', function() {
        var str = util.strftime(date, 'Today is %uth day of the week');

        expect(str).to.be.equal('Today is 5th day of the week');
      });

      it('%U', function() {
        var str = util.strftime(date, 'Today is %Uth week of the year');

        expect(str).to.be.equal('Today is 31th week of the year');
      });

      it('%w', function() {
        var str = util.strftime(date, 'Today is %wth day of the week');

        expect(str).to.be.equal('Today is 5th day of the week');
      });

      it('%W');

      it('%x');

      it('%X');

      it('%y');

      it('%Y');

      it('%z');

      it('%Z');

      it('%%');
    });

  });
});
