#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const http = require('http')
const connect = require('connect')
const program = require('commander')
const reactor = require('../index.js')
const serveStatic = require('serve-static')

const app = connect()
var elmJson

// Get elm.json
try {
    elmJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'elm.json')))
} catch (e) {
    if (e.code === 'ENOENT') {
        console.error(' No elm.json file at', e.path)
        console.log('Do you want to initialize the directory? [Y/n]')
        if (process.stdin.read() === "n"){
            process.exit(1)
        } else {
            
        }
    } else {
        console.error(' Something is wrong with the elm.json file:', '\n\n', e)
        process.exit(1)
    }
}

// Generate the cli
program
    .version('1.0.0')
    .option('--no-reload', 'Disable live reload')
    .option('--no-static', 'Disable static files')
    .option('-t, --template <f>', 'Template file', "index.html")
    .option('-p, --port <n>', 'Port number', 8000)
    .parse(process.argv)

// Compile **/*.elm
app.use(reactor.elmMake())

// Live reload
if (program.reload) {
    app.use(reactor.liveReload({
        watched: elmJson['source-directories']
    }))
}

// Static files
if (program.static) {
    app.use(serveStatic(process.cwd(), { index: program.template }))

    // 404 is template
    app.use((req,res, next) =>
        fs.createReadStream(path.join(process.cwd(), program.template), 'utf-8')
            .on('error', next)
            .pipe(res)
    )
}

// Start
http.createServer(app).listen(program.port)
console.log(' Server started on http://[::]:' + (program.port))
