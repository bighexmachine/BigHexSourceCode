var chai = require('chai');
var expect = chai.expect;
var compiler = require('../gpioConfig/compiler.js');
var fs = require("fs");
var path = require('path');

describe('Compile', function()
{
  let programs = ["stdlibtest.x", "ca.x", "fact.x", "inputFaces.x", "nyan.x", "pong.x", "reaction.x", "rotating_text.x", "starter.x", "tree.x", "wink.x"];

  describe('all example programs should compile successfully', function() {
    programs.forEach(function(program) {
      it('prog : ' + program, function(done)
      {
	this.timeout(15000);

        let filename = path.normalize(__dirname + '/../xPrograms/' + program);
        compiler.compile(fs.readFileSync(filename).toString('utf8'), function(result) {
          if(result.success)
          {
            done();
          }
          else
          {
            done(new Error("Compile Failed:\n" + result.output));
          }
        }, true);
      });
    });
  });
});
