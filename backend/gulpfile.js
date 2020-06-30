'use strict'

var gulp = require('gulp');
var sftp = require('gulp-sftp');

gulp.task('upload', function() {
    gulp.src('routes/**').pipe(sftp({host: '178.128.223.189', remotePath: '/vehicles_backend/routes/', user: 'root', pass: 'password2015'}));
    gulp.src('*.json').pipe(sftp({host: '178.128.223.189', remotePath: '/vehicles_backend/', user: 'root', pass: 'password2015'}));
    //gulp.src(['*.json', '*.js']).pipe(sftp({host: '178.128.223.189', remotePath: '/591chat_backend/', user: 'root', pass: 'password2015'}));
});
