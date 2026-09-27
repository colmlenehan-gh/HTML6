# MiniBrowser integration

## 1. Identify the web view

The supplied integration assumes MiniBrowser uses Apple's `WKWebView`.

If MiniBrowser is currently using `WKWebView`, add:

- `runtime/html6.js`
- `runtime/html6.css`

to the Xcode target's Copy Bundle Resources.

## 2. Install the runtime

Where MiniBrowser creates its `WKWebViewConfiguration`:

```swift
let configuration = WKWebViewConfiguration()
let controller = WKUserContentController()

HTML6Integration.install(into: controller)

configuration.userContentController = controller

let webView = WKWebView(frame: .zero, configuration: configuration)
```

The runtime is injected at document end in the reference implementation. This is intentional: it allows WebKit to finish parsing the HTML5-compatible document first.

## 3. Load an HTML6 source document

For local or generated HTML strings:

```swift
let normalized = HTML6Preprocessor.prepare(htmlSource)
webView.loadHTMLString(normalized, baseURL: baseURL)
```

This turns:

```html
<!doctype html6>
```

into:

```html
<!doctype html>
```

before WebKit parses it.

The HTML document should also contain:

```html
<html data-html-version="6">
```

That attribute is what activates the runtime.

## 4. Remote pages

For normal HTTP/HTTPS navigation, use the compatibility declaration:

```html
<!doctype html>
<html lang="en" data-html-version="6">
```

Do not attempt to replace WebKit's parser from injected JavaScript.

If MiniBrowser later introduces an HTML6-aware document-loading pipeline, it can normalize the doctype before handing bytes to WKWebView.

## 5. CSS

The runtime does not automatically inject `html6.css`. Add it to the HTML6 document:

```html
<link rel="stylesheet" href="/html6.css">
```

or inject it as a `WKUserStyleSheet` if you want the browser to provide it automatically.

## 6. Testing

Open `tests/index.html`.

Then open `demo/index.html`.

Verify:

- `HTML6.ready` becomes true.
- Menu state toggles.
- `when` content responds to state.
- form validation blocks invalid submission.
- pending text appears on a valid submission.
- ordinary HTML5 pages still render normally.

## 7. Architecture

MiniBrowser remains responsible for:

- networking
- navigation
- TLS
- cookies
- WebKit rendering
- JavaScript execution
- permissions
- storage

HTML6 is responsible only for the additive declarative layer.

This separation keeps the implementation small and preserves WebKit's mature security and compatibility behavior.
