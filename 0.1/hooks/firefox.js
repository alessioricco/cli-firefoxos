var _ = require("underscore");
var appc = require("node-appc");
var tiappxml = require("tiapp.xml");
var fs = require("fs");
var xml = require("../lib/xml");

exports.cliVersion = '>=3.2';

var logger, form, platform, config, manifestsrc;

/******************************************
 *
 *****************************************/
var mobileweb = function(data, callback) {
	logger.info("*************************** mobileweb");
	//logger.info(JSON.stringify(data));
	callback && callback();
}
/******************************************
 *
 *****************************************/
var postexecute = function(data, callback) {
	logger.info("*************************** postexecute");
	callback && callback();
}
/******************************************
 *
 *****************************************/
var preexecute = function(data, callback) {

	logger.info("*************************** preexecute");

	// read the manifest from tiapp.xml
	var tiapp = tiappxml.load('./tiapp.xml');
	if (!tiapp) {

		logger.info("tiapp is null");

		return;
	}
	tiapp.getFirefoxManifest = function getFirefoxManifest() {
		var mobilewebContainer = xml.getLastElement(this.doc.documentElement, 'mobileweb');
		if (!mobilewebContainer) {
			logger.info("mobilewebContainer: not found");
			return null;
		}
		// create results object from <target> elements
		var results = "", manifests = mobilewebContainer.getElementsByTagName('manifest');
		// take the last (it should be just one)
		for (var i = 0, len = manifests.length; i < len; i++) {
			var manifest = manifests.item(i);
			results = xml.getNodeText(manifest);
		}
		return results;
	};

	// get the manifest
	var manifest = tiapp.getFirefoxManifest();
	logger.info("manifest:\n" + manifest);
	if (!manifest || manifest.length == 0) {

		logger.info("manifest is null");

		//todo: building a manifest from tiapp.xml
		return;
	}
	// it will be wrote later
	manifestsrc = manifest;

	// write the manifest
	/*
	 var output = fs.createWriteStream("./Resources/manifest.webapp");
	 output.on('close', function() {
	 logger.info("manifest,webapp wrote");
	 });
	 output.write(manifest, "utf8", function() {
	 output.close();
	 });
	 */
	 /*
	fs.writeFile("./Resources/manifest.webapp", manifest, function(err) {
		if (err)
		
			{
				logger.info(err);
				return console.log(err);
				
				}
		//console.log('Hello World > helloworld.txt');
		logger.info("manifest wrote");

		//data.cli.addHook('cli:post-execute', postexecute);
		callback && callback();
	});*/
	callback && callback();
};

/******************************************
 *
 *****************************************/
var precompile = function(data, callback) {

	logger.info("*************************** precompile");

	if (['android', 'ios'].indexOf(platform) !== -1) {
		logger.error("Only mobileweb support with --firefoxos flag");
		return;
	}

	callback && callback();
}
/*
after the compilation i could modifiy the index.html file on destination and make it
firefoxos compliant
*/

/******************************************
 *
 *****************************************/
var postcompile = function(data, callback) {
	logger.info("*************************** postcompile");

	var buildDir = data.buildDir;
	var path = buildDir + "/manifest.webapp";

	fs.writeFile(path, manifestsrc, function(err) {
		if (err) {
				logger.info(err);
				return console.log(err);		
		}
		//console.log('Hello World > helloworld.txt');
		logger.info("manifest wrote");

		//data.cli.addHook('cli:post-execute', postexecute);
		callback && callback();
	});


	//callback && callback();
}
/******************************************
 *
 *****************************************/
var commandloaded = function(data, callback) {
	logger.info("*************************** commandloaded");
	callback && callback();
}
/******************************************
 *
 *****************************************/
String.prototype.replaceAll = function(find, replace) {
	var str = this;
	return str.replace(new RegExp(find, 'g'), replace);
};

/******************************************
 *
 *****************************************/
var finalize = function(data, callback) {

	logger.info("*************************** finalize ");
	var buildDir = data.buildDir;
	var path = buildDir + "/index.html";

	function save(data) {
		fs.writeFile(path, data, function(err) {
			if (err) {
				logger.error("unable to read index.html");
				return;
			}

			callback && callback();

		});
		
	}

	// change the index.html file
	function modify(data, cb) {

		var err = false;
		var newdata = data;

		try {

			newdata = newdata.replaceAll("'click'", "'touchend'");
			newdata = newdata.replaceAll("'singletap'", "'touchend'");
			newdata = newdata.replaceAll('"click"', '"touchend"');
			newdata = newdata.replaceAll('"singletap"', '"touchend"');

		} catch(e) {
			logger.error("unable to modify index.html");
		} finally {

		}

		if (!err) {
			cb && cb(newdata);
		}
	}

	function read(cb) {
		var input = fs.readFile(path, "utf8", function(err, data) {

			if (err) {
				logger.error("unable to read index.html");
				return;
			}

			cb && cb(data, save);
		});
	}

	/* ari: postcompile e finalize are not called if the selected sdk is not the current sdk*/

	read(modify);

}
/******************************************
 *
 *****************************************/
 /*
var go = {
	pre : function(data, callback) {

		logger.info("*************************** go pre");
		callback && callback();
	},

	post : function(data, callback) {

		logger.info("*************************** go post");
		callback && callback();
	},
	priority : 1000
}
*/
/******************************************
 *
 *****************************************/
exports.init = function(_logger, config, cli, appc) {

	logger = _logger;
	logger.info("*************************** init");
	//logger.info(JSON.stringify(config));

	if (process.argv.indexOf('--ffos') !== -1 || process.argv.indexOf('--firefoxos') !== -1) {

		logger.info("*************************** firefox");

		//cli.addHook('build.pre.construct',preconstruct);

		//cli.addHook('build.mobileweb.config', mobileweb);

		//cli.addHook('build.pre.compile', precompile);
		cli.addHook('build.post.compile', postcompile);
		cli.on('build.finalize', finalize);
		cli.on('cli:pre-execute', preexecute);
		//cli.addHook('cli:post-execute', postexecute);
		//cli.addHook('cli:command-loaded', commandloaded);
		//cli.addHook('cli:go', go);
	}

}