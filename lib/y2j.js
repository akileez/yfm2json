var moment = require('moment'),
    path = require('path'),
    fs = require('fs'),
    yfm = require('assemble-yaml');


function processFile(filename, bdir)
{
    var _basename =  path.dirname(filename).split( path.sep ).slice( -1 )[0] + '-' +  path.basename(filename, path.extname(filename));
    var _metadata = yfm.extractJSON(filename);

    if (_metadata)
    {
        // map user-entered date to a better one using moment's great parser
        if (_metadata.date)
            _metadata.iso8601Date = moment(_metadata.date).format();

        _metadata.parentPath = path.dirname(filename) + '/' + filename.split( path.sep ).slice( -1 )[0].replace(/\.hbs/,'.html');
        _metadata.parentDir = path.dirname(filename).split( path.sep ).slice( 3 )[0];
        _metadata.buildDir = path.dirname(filename).replace(/app\/assemble\/templates\//,'').replace(/views\//,'').replace(/views/,'');

        if (_metadata.buildDir) {
            _metadata.buildDirFileExt = _metadata.buildDir + '/' + path.basename(filename).replace(/\.hbs/,'.html');
        } else {
            _metadata.buildDirFileExt =  path.basename(filename).replace(/\.hbs/,'.html');
        }

        _metadata.buildFileExt = path.basename(filename).replace(/\.hbs/,'.html');
        _metadata.buildFile = path.basename(filename, path.extname(filename));
        _metadata.buildExt  = path.extname(filename).replace(/\.hbs/,'.html');
        _metadata.buildDest = bdir + _metadata.buildDirFileExt;
        _metadata.autolink  = '../' +  _metadata.buildDirFileExt;
    }

    return {
        metadata: _metadata,
        basename: _basename
    }
}

exports.parse = function(filenames, options)
{
    // http://i.qkme.me/3tmyv8.jpg
    var parse_all_the_files = {};

    filenames.forEach(function(f) {
        var m = processFile(f, options.bdir);
        parse_all_the_files[m.basename] = m.metadata;
    });

    var json;

    if (options.minify)
        json = JSON.stringify(parse_all_the_files);
    else
        json = JSON.stringify(parse_all_the_files, null, 2) + '\n';

    if (options.outfile) {
        var file = fs.openSync(options.outfile, 'w+');
        fs.writeSync(file, json);
        fs.closeSync(file);
        return;
    } else {
        return json;
    }
}