#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const url = require('url')
const http = require('http')
const connect = require('connect')
const program = require('commander')
const reactor = require('../index.js')
const serveStatic = require('serve-static')

program
    .version('1.0.0')
    .option('--no-reload', 'Disable live reload')
    .option('--no-static', 'Disable static files')
    .option('-t, --template <f>', 'Template file', 'index.html')
    .option('-p, --port <n>', 'Port number', 8000)
    .parse(process.argv)

const app = connect()

// Compile **/*.elm
app.use(reactor.elmMake())

// Live reload
if (program.reload) {
    var watched
    try {
        const elmJson = fs.readFileSync(path.join(process.cwd(), 'elm.json'))
        watched = JSON.parse(elmJson)['source-directories']
    } catch (e) {
        console.warn("[live-reload] Couldn't read the 'source-directories' from your elm.json, default is src/")
    }
    app.use(reactor.liveReload({ watched }))
}

// Static files
if (program.static) {
    app.use(serveStatic(process.cwd(), { index: program.template }))

    // 404
    app.use((req,res, next) =>
        fs.createReadStream(path.join(process.cwd(), program.template), 'utf-8')
            .on('error', next)
            .pipe(res)
    )
}

// Start
http.createServer(app).listen(program.port || 8000)
console.log('Server started on http://[::]:' + (program.port || 8000))
