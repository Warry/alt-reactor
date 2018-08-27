
const fs = require('fs')
const path = require('path')
const url = require('url')
const { spawn } = require('child_process')
const temp = require('temp').track()
const chokidar = require('chokidar')

const elmPath = path.join(process.cwd(), 'node_modules/.bin/elm')
const errorPath = path.join(__dirname, 'src/ElmCompilerErrorStandalone.js')
const errorScript = fs.readFileSync(errorPath, 'utf-8')
const tempDir = temp.path()

module.exports = { elmMake, liveReload }

// Compile elm files
function elmMake(options) {
    // Defaults
    options = Object.assign({
        cwd: process.cwd(),
        getSourceFromRequest: (req) =>
            // by default, all url ending by ".elm" are compiled
            // null triggers next()
            (req.url.endsWith('.elm') ? req.url : null)
    }, options || {})

    return (req, res, next) => {
        const source = options.getSourceFromRequest(req)
        if (!source) return next()

        const tempFile = path.join(tempDir, source, '.js')
        const compilation = spawn(elmPath, [
                "make",
                path.join('.', source),
                "--output=" + tempFile,
                "--report=json"
            ], { cwd: options.cwd })

        var errorBuffer = ""
        compilation.stderr.on('data', (data) => {
            errorBuffer += data
        })

        compilation.on('close', () => {
            if (errorBuffer === "") {
                res.writeHead(200, { "Content-Type": "application/javascript; charset=utf-8" })
                fs.createReadStream(tempFile, 'utf-8').pipe(res)
            } else {
                res.writeHead(200, { "Content-Type": "application/javascript; charset=utf-8" })
                res.write(errorScript)
                res.write('\n\nElm.ElmCompilerErrorStandalone.init({ node: document.body, flags: ')
                res.write(errorBuffer)
                res.end(' });')
            }
        })
    }
}

// Live reload
function liveReload(options) {
    // Defaults
    options = Object.assign({
        url: '/@live-reload',
        cwd: process.cwd(),
        event: 'change',
        watched: 'src/',
        ignored: ['node_modules', 'elm-stuff']
    }, options || {})

    return (req, res, next) => {
        if (req.url !== options.url) return next()

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        })

        var id = 0
        var watcher = chokidar.watch(options.watched, options).on(options.event, (event, path) => {
            res.write('id: ' + (id++) + '\\nevent: ' + event + '\ndata: ' + path)
            res.write('\n\n\n')
        })

        var t = setInterval(() => {
            res.write('ping\n\n')
        }, 5000)

        res.socket.on('close', () => {
            clearInterval(t)
            watcher.close()
            res.end()
        })
    }
}

