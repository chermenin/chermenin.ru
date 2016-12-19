var gulp        = require('gulp');
var frontMatter = require('gulp-front-matter');
var marked      = require('gulp-marked');
var minifyHtml  = require('gulp-htmlmin');
var rename      = require('gulp-rename');
var clean       = require('gulp-clean');
var gutil       = require('gulp-util');
var path        = require('path');
var swig        = require('swig');
var through     = require('through2');
var connect     = require('connect');
var http        = require('http');

String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

var src = __dirname + '/src';
var site        = require(src + '/settings/site.json');
site.time = new Date();
site.timezoneOffset = -site.time.getTimezoneOffset() / 60;
site.time.setHours(site.time.getHours() + site.timezoneOffset);

swig.setDefaults({
    loader: swig.loaders.fs(src + '/templates'),
    cache: false
});

var rePostName   = /(\d{4})-(\d{1,2})-(\d{1,2})-(.*)/;

function collectPosts() {
    var posts = [];       
    var tags = [];
	var tagsCount = [];
    return through.obj(function (file, enc, cb) {
        posts.push(file.page);
        posts[posts.length - 1].content = file.contents.toString();
        
        if (file.page.tags) {
            file.page.tags.forEach(function (tag) {
                if (tags.indexOf(tag) == -1) {
                    tags.push(tag);
					tagsCount[tag] = 1;
                } else {
					tagsCount[tag] += 1;
				}
            });
        }
        
        this.push(file);
        cb();
    },
    function (cb) {
        posts.sort(function (a, b) {
            return b.date - a.date;
        });
        site.posts = posts;
        site.tags = tags;
		site.tagsCount = tagsCount;
        cb();
    });
}

function filename2date() {
    return through.obj(function (file, enc, cb) {                
        var basename = path.basename(file.path, '.md');
        var match = rePostName.exec(basename);
        if (match)
        {
            var year     = match[1];            
            var month    = match[2];
            var day      = match[3];
            var basename = match[4];
            file.page.date = new Date(year, month - 1, day);
			file.page.date.setHours(file.page.date.getHours() + site.timezoneOffset);
            file.page.url  = '/' + year + '/' + month + '/' + day + '/' + basename;
        }
        
        this.push(file);
        cb();
    });
}

function summarize(marker) {
    return through.obj(function (file, enc, cb) {                
        var summary = file.contents.toString().split(marker)[0]
        file.page.summary = summary;
        this.push(file);
        cb();
    });
}

function applyTemplate(templateFile) {
    var tpl = swig.compileFile(path.join(src + '/templates/', templateFile));
    
    return through.obj(function (file, enc, cb) {            
        var data = {
            site: site,
            page: file.page,
            content: file.contents.toString()
        };            
        file.contents = new Buffer(tpl(data), 'utf8');
        this.push(file);
        cb();
    });
}

gulp.task('posts', function () {
    return gulp.src(src + '/posts/*.md')
        .pipe(frontMatter({property: 'page', remove: true}))        
        .pipe(marked())
//        .pipe(summarize('<!--more-->'))
        .pipe(filename2date())
        .pipe(collectPosts())
        .pipe(applyTemplate('post.html'))
        .pipe(rename(function (path) {
            path.extname = ".html";
            var match = rePostName.exec(path.basename);
            if (match)
            {
                var year = match[1];            
                var month = match[2];
                var day = match[3];
            
                path.dirname = year + '/' + month + '/' + day;
                path.basename = match[4];
            }            
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('pages:html', ['posts'], function () {
    return gulp.src([src + '/pages/**/*.html'])
        .pipe(through.obj(function (file, enc, cb) {            
            var data = {
                site: site,
                page: {}
            };
            var tpl = swig.compileFile(file.path);
            file.contents = new Buffer(tpl(data), 'utf8');
            this.push(file);
            cb();
        }))        
        .pipe(gulp.dest('build'));
});

gulp.task('pages:md', function () {
    return gulp.src(src + '/pages/**/*.md')
        .pipe(frontMatter({property: 'page', remove: true}))
        .pipe(marked())
        .pipe(applyTemplate('page.html'))
        .pipe(rename({extname: '.html'}))
        .pipe(gulp.dest('build'));
});

gulp.task('pages', ['pages:md', 'pages:html']);

gulp.task('images', function () {
    return gulp.src(src + '/images/**/*')        
        .pipe(gulp.dest('build/images'));
});

gulp.task('files', function () {
    return gulp.src(src + '/files/**/*')        
        .pipe(gulp.dest('build/files'));
});

gulp.task('fonts', function () {
    return gulp.src(src + '/templates/font/**/*')        
        .pipe(gulp.dest('build/font'));
});

function tags() {
    
    var stream = through.obj(function(file, enc, cb) {
		this.push(file);
		cb();
	});
    
    if (site.tags)
    {
        site.tags.forEach(function (tag) {
            var file = new gutil.File({
                path: tag + '.html',
                contents: new Buffer('')
            });
            file.page = {title: tag, tag: tag}
            
            stream.write(file);        
        });
    }
    
    stream.end();
    stream.emit("end");
    
    return stream;
}

gulp.task('tags', ['posts'], function () {
    return tags()
        .pipe(applyTemplate('tag.html'))
        .pipe(gulp.dest('build/tag'));
});

gulp.task('design:css', function () {
    return gulp.src(src + '/templates/css/*.css')        
        .pipe(gulp.dest('build/css'));
});

gulp.task('design:js', function () {
    return gulp.src(src + '/templates/js/*.js')        
        .pipe(gulp.dest('build/js'));
});

gulp.task('design:favico', function () {
    return gulp.src(src + '/templates/favicon.ico')        
        .pipe(gulp.dest('build'));
});

gulp.task('design', ['design:css', 'design:js', 'design:favico']);

gulp.task('rss', ['posts'], function () {
    return gulp.src([src + '/rss/atom.xml'])
        .pipe(through.obj(function (file, enc, cb) {            
            var data = {
                site: site,
                page: {}
            };
            var tpl = swig.compileFile(file.path);
            file.contents = new Buffer(tpl(data), 'utf8');
            this.push(file);
            cb();
        }))        
        .pipe(gulp.dest('build'));
});

gulp.task('default', ['posts', 'pages', 'images', 'files', 'fonts', 'tags', 'design', 'rss']);

gulp.task('clean', function() {
    return gulp.src('build', {read: false})
        .pipe(clean());
});

gulp.task('watch', ['default'], function () {
    gulp.watch(['posts/*.md', 'design/*.html'], ['posts', 'pages', 'rss', 'tags']);
    gulp.watch(['pages/**/*', 'design/*.html'], ['pages']);
    gulp.watch(['images/**/*'], ['images']);
    gulp.watch(['files/**/*'], ['files']);
    gulp.watch(['design/**/*'], ['design']);

    var app = connect()
        .use(connect.static('build'))
        .use(connect.directory('build'));

    http.createServer(app).listen(8080);
});