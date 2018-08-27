# Alternative Elm Reactor

#### FEATURES
- Compile elm files from url
- Compiler errors in the browser
- Static assets
- Live reload
- Works with `Browser.Navigation`

## Try it

```bash
$ npx alt-reactor --help

    --no-reload        Disable live reload
    --no-static        Disable static files
    -t, --template <f> Template file (default: index.html)
    -p, --port <n>     Port number (default: 8000)

```

> `npx` is a utlity that comes with node and npm. It allows you to run a npm module (with bin), without installing it or even adding node_modules to your directory. It just dowloads it, runs it (caches it in your home for next time).

run `npx alt-reactor` within the same directory as your `elm.json`, then update your `index.html` template along this lines:

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

### Static assets

The whole directory is served, but live reload only works within your `elm.json`'s `source-directories`. 

**All 404 display `index.html`**, so that you can use a custom router from `Browser.application`.

## Configure

Use **`elm.json`** to durably configure alt-reactor, here are the defaults:

```json
{
	... rest of the elm.json ...
	"alt-reactor": {
		"static": true,
		"reload": true,
		"template": "index.html",
		"port": 8000
	}
}
```

## Install

### As a cli:

```bash
$ npm i alt-reactor -g
```

### As a HTTP middleware:

To be plugged-in with `connect` or `express`...

```bash
$ npm i alt-reactor --save
```

```js
var reactor = require('alt-reactor')
var app = require('connect')()

// these are the defaults:

app.use(reactor.elmMake({
    cwd: process.cwd(),
    getSourceFromRequest: (req) =>
        // by default, all url ending by ".elm" are compiled
        // null triggers next()
        (req.url.endsWith('.elm') ? req.url : null)
}))

app.use(reactor.liveReload({
    url: '/@live-reload',
    cwd: process.cwd(),
    event: 'change',
    watched: 'src/',
    ignored: ['node_modules', 'elm-stuff']
})) // all chokidar options are also valid.
```
