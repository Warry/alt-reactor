# Alternative Elm Reactor

#### FEATURES
- Compiler errors in the browser
- Static assets
- Live-Reload

## Usage

```$ npx alt-reactor --help

    --no-reload        Disable live reload
    --no-static        Disable static files
    -p, --port <n>     Port number, default 8000

```

run `npx alt-reactor --help` within the same directory as your `elm.json`, then update your html template:

### Compile elm files from url

```html
<script type="text/javascript" src="/src/Main.elm"></script>
<script type="text/javascript">
	Elm.Main.init({
        node: document.getElementById("elm")
	})
</script>
```

> Note the special route `src="/src/Main.elm"`, that will compile the sources (from your `elm.json`'s `source-directories`) on each request, and display compile errors right within the browser.

### Live reload

Add this one-liner to reload each time any file is saved within your `elm.json`'s `source-directories`.

```html
<script type="text/javascript">new EventSource('/@live-reload').onmessage = function(event, path){ location.reload() }</script>
```

## Install

### As a cli:

```bash
$ npx alt-reactor --help
```

### As a HTTP middleware:

To be plugged-in with `connect` or `express`...

```bash
$ npm i alt-reactor --save
```

```js
var reactor = require('alt-reactor')
var app = require('connect')()

// usage

app.use(reactor.elmMake({
    cwd: process.cwd(),
    getSourceFromRequest: (req) =>
        (req.url.endsWith('.elm') ? req.url : null) // calls next() if null
}))

app.use(reactor.liveReload({
    cwd: process.cwd(),
    event: 'change',
    watched: 'src/**.elm',
    ignored: ['node_modules', 'elm-stuff']
})) // all chokidar options are also valid.
```
