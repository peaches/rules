var assert = require('assert');
var _ = require('lodash');
var EE = require('./interpreter').ExpressionEvaluator;
var parser = require('./grammar');

describe('ExpressionEvaluator', function() {
  describe('boolean logic', function() {
    it('supports binary boolean operators', function() {
      var ee = new EE(_, {});
      var result = ee.evaluate(parser.parse('true'));
      assert.equal(result, true);

      result = ee.evaluate(parser.parse('1 == 1'));
      assert.equal(result, true);

      result = ee.evaluate(parser.parse('1 != 2'));
      assert.equal(result, true);

      result = ee.evaluate(parser.parse('1 == 2'));
      assert.equal(result, false);

      result = ee.evaluate(parser.parse('"a" == "a"'));
      assert.equal(result, true);

      result = ee.evaluate(parser.parse('"1" != "a" && "3" != 3'));
      assert.equal(result, true);

      result = ee.evaluate(parser.parse('"1" == "a" && 3 != 3'));
      assert.equal(result, false);

      result = ee.evaluate(parser.parse('true && 1 == 1 && "a" == "a"'));
      assert.equal(result, true);

      ee = new EE(_, {foo: function() { return true; }});
      result = ee.evaluate(parser.parse('true && foo()'));
      assert.equal(result, true);

      ee = new EE(_, {foo: function() { return 0; }});
      result = ee.evaluate(parser.parse('true && foo()'));
      assert.equal(result, false);
    });
  });

  describe('#memberExpr', function() {
    it('looks up member expressions', function() {
      var ee = new EE(_, {foo: {bar: 7}});
      var result = ee.evaluate(parser.parse('foo.bar'));
      assert.equal(result, 7);

      ee = new EE(_, {foo: {bar: {baz: 7}}});
      result = ee.evaluate(parser.parse('foo.bar.baz'));
      assert.equal(result, 7);

      ee = new EE(_, {foo: {bar: 7}});
      result = ee.evaluate(parser.parse('foo.bar.baz'));
      assert.equal(result, undefined);
    });
  });

  describe('#ifExpr', function() {
    it('handles if statements', function() {
      var ee = new EE(_, {foo: {bar: 7}});
      var result = ee.evaluate(parser.parse('if true then \nfoo.bar\nend'));
      assert.equal(result, 7);

      result = ee.evaluate(parser.parse('if false then \nfoo.bar\nend'));
      assert.equal(result, undefined);
    });
  });

  describe('function calls', function() {
    it('call functions in the global context', function() {
      var ee = new EE(_, {foo: function() { return 7; }});
      var result = ee.evaluate(parser.parse('foo()'));
      assert.equal(result, 7);

      var ee = new EE(_, {foo: {bar: function() { return 7; }}});
      result = ee.evaluate(parser.parse('foo.bar()'));
      assert.deepEqual(result, 7);
    });
  });
});
