#!/usr/bin/env node

var util = require('../util');
var fs = require('../fs');
var AvocadoBuild = require('../build').AvocadoBuild;
var export_ = require('../export');
var debug = require('../debug/debug');
var arguments = require('../arguments');
var args = process.argv.slice(2);
var cmd = args.shift();

if ( cmd == 'help' || cmd == 'h' ) { 
	// print help message
	//
} 
else if ( cmd == 'export' ) {
  util.assert(args.length, 'export Bad argument. system name required, for example "avocado export ios"');
  new export_.AvocadoExport(process.cwd(), args[0]).export();
} 
else if ( cmd == 'build' || cmd == 'init' ) {
	var build = new AvocadoBuild(process.cwd(), process.cwd() + '/out');
	if ( cmd == 'init' ) {
		build.initialize();
	} else {
  	build.build();
	}
} 
else {
	// run wrb server
	arguments.def_opts(['port', 'p'], 1026, '--port=PORT,-p PORT Run avocado debugger server port');
	arguments.def_opts(['remote', 'r'], '', '--remote=ADDRESS,-r ADDRESS Remote console address');

 	debug.start_server(arguments.options);
}
