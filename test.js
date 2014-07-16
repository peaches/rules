var g = require('./grammar');

console.log(JSON.stringify(g.parse("if foo.bar.boo[whoa.man.child].baz() then\n bar()\n end")))
