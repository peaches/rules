

function ExpressionEvaluator(lodash, context) {
  this._ = lodash;
  this.context = context;
}

ExpressionEvaluator.prototype = {
  evaluate: function(tree) {
    if (tree.type !== 'Program' && tree.body && tree.body.length > 0) {
      return;
    }

    try {
      return this.evalExpr(tree);
    } catch (ex) {
      console.log(ex);
      return;
    }
  },

  evalExpr: function(expr) {
    var _ = this._;

    switch (expr.type) {
      case 'Program':
      case 'BlockStatement':
        return _.last(_.map(expr.body, this.evalExpr, this));

      case 'BinaryExpression': return this.binaryExpr(expr);
      case 'IfStatement': return this.ifExpr(expr);
      case 'CallExpression': return this.callExpr(expr);
      case 'ExpressionStatement': return this.evalExpr(expr.expression);
      case 'MemberExpression': return this.memberExpr(expr);

      case 'Identifier': return expr.name;
      case 'Literal': return expr.value;

      default: throw 'Expression not yet supported: ' + expr.type;
    }
  },

  binaryExpr: function(expr) {
    var lhs = this.evalExpr(expr.left),
        rhs = this.evalExpr(expr.right);
    switch (expr.operator) {
      case '==': return lhs === rhs;
      case '!=': return lhs !== rhs;
      case '<': return lhs < rhs;
      case '<=': return lhs <= rhs;
      case '>': return lhs > rhs;
      case '>=': return lhs >= rhs;
      case '&&': return lhs && rhs;
      case '||': return lhs || rhs;
      default: throw 'Binary expression not supported: ' + expr.operator;
    }
  },

  /**
   * {
   *   "type": "IfStatement",
   *   "test": {
   *     "type": "CallExpression",
   *     "callee": {
   *       "type": "Identifier",
   *       "name": "foo"
   *     },
   *     "arguments": []
   *   },
   *   "consequent": {
   *     "type": "BlockStatement",
   *     "body": [{
   *       "type": "ExpressionStatement",
   *       "expression": {
   *         "type": "CallExpression",
   *         "callee": {
   *           "type": "Identifier",
   *           "name": "bar"
   *         },
   *         "arguments": []
   *       }
   *     }]
   *   },
   *   "alternate": null
   * }
   */
  ifExpr: function(expr) {
    var cond = this.evalExpr(expr.test),
        result;
    if (!!cond) {
      result = this.evalExpr(expr.consequent);
    } else if (expr.alternate) {
      result = this.evalExpr(expr.alternate);
    }

    return result;
  },

  /**
   * {
   *   "type": "CallExpression",
   *   "callee": {
   *     "type": "Identifier",
   *     "name": "bar"
   *   },
   *   "arguments": []
   * }
   */
  callExpr: function(expr) {
    var func = this.evalExpr(expr.callee);
    func = this.getGlobalIfString(func);

    if (this._.isFunction(func)) {
      return func();
    }

    throw 'Function not found: ' + expr.callee.name;
  },

  /**
   * This does not support computed properties
   */
  memberExpr: function(expr) {
    var obj = this.evalExpr(expr.object),
        property = this.evalExpr(expr.property);

    // When we traverse down depth first, we will get back an Identifier name.
    // What this means is we need to look up this identity in the "global"
    // context for the data. All subsequent MemberExpression in this chain will
    // be properly namespaced.
    obj = this.getGlobalIfString(obj);

    if (this._.has(obj, property)) {
      return obj[property];
    }

    throw 'Property "' + property + '" is not valid for "' + JSON.stringify(obj);
  },

  getGlobalIfString: function(identifier) {
    return this._.isString(identifier) ? this.context[identifier] : identifier;
  }
};

module.exports = {
  ExpressionEvaluator: ExpressionEvaluator
};
