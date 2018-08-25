#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const url = require('url')
const http = require('http')
const connect = require('connect')
const program = require('commander')
const request = require('request')
const reactor = require('../index.js')
const serveStatic = require('serve-static')

program
    .version('1.0.0')
    .option('--no-reload', 'Disable live reload')
    .option('--no-static', 'Disable static files')
    .option('-p, --port <n>', 'Port number', 8000)
    .option('-P, --proxy <url>', 'Proxy url')
    .parse(process.argv)

const app = connect()
const proxyUrl = program.proxy

// Compile **/*.elm
app.use(reactor.elmMake())

// Static files
if (program.static) {
	app.use(serveStatic(process.cwd()))
}

// Proxy
if (program.proxy) {
    app.use((req,res) =>
        req.pipe(request(url.resolve(proxyUrl, req.url))).pipe(res)
    )
}

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

// Start
http.createServer(app).listen(program.port || 8000)
console.log('Server started on http://[::]:' + (program.port || 8000))
