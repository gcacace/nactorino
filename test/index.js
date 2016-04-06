var expect = require('chai').expect;

var Actor = require('../lib/actor');

describe('Actor', function () {

  var pingActor;

  beforeEach(function () {
    pingActor = new Actor({
      ping: function (ping, timeout) {
        return new Promise(function (resolve) {
          setTimeout(function () {
            resolve(ping);
          }, timeout);
        });
      },
      fail: function (ping, timeout) {
        return new Promise(function (resolve, reject) {
          setTimeout(function () {
            reject(ping);
          }, timeout);
        });
      }
    });
  });

  it('propagates a successful result', function (done) {

    var result;

    pingActor.ask('ping', 'req1', 0)
      .then(function (pong) {
        result = pong;
      })
      .finally(function () {
        expect(result).to.be.equal('req1');
        done();
      }).done();
  });

  it('propagates a failure', function (done) {

    var error;

    pingActor.ask('fail', 'err1', 0)
      .catch(function (err) {
        error = err;
      })
      .finally(function () {
        expect(error).to.be.equal('err1');
        done();
      }).done();
  });

  it('serializes multiple asynchronous calls', function (done) {

    var results = [];

    function consumePong(pong) {
      results.push(pong);
      if (results.length >= 2) {
        expect(results).to.be.deep.equal(['req1', 'req2']);
        done();
      }
    }

    pingActor.ask('ping', 'req1', 10)
      .then(function (pong) {
        consumePong(pong);
      }).done();
    pingActor.ask('ping', 'req2', 0)
      .then(function (pong) {
        consumePong(pong);
      }).done();
  });

  it('serializes multiple asynchronous calls with failures', function (done) {

    var results = [];

    function consumePong(pong) {
      results.push(pong);
      if (results.length >= 3) {
        expect(results).to.be.deep.equal(['req1', 'err1', 'req2']);
        done();
      }
    }

    pingActor.ask('ping', 'req1', 10)
      .then(function (pong) {
        consumePong(pong);
      }).done();
    pingActor.ask('fail', 'err1', 0)
      .catch(function (pong) {
        consumePong(pong);
      }).done();
    pingActor.ask('ping', 'req2', 20)
      .then(function (pong) {
        consumePong(pong);
      }).done();
  });
});