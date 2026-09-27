# HTML6 Proposal 0.1 - Reference Implementation

This repository is a working experimental implementation of the proposed HTML6 feature set.

## What this is

HTML6 is implemented as a browser compatibility layer on top of an existing HTML5 engine. It does not replace WebKit, Blink, or Gecko. Existing HTML5 documents continue to work unchanged.

The implementation provides:

- HTML6 version detection
- semantic elements: `application`, `navigation`, `notice`, `timeline`, `item`, `field-group`, `output-region`
- declarative state
- declarative actions
- `when` conditional visibility
- partial navigation with `update` and `history`
- pending button states
- basic form validation/error summaries
- accessible live announcements
- safe fallback behavior
- a custom-element/component prototype using standard Web Components
- a small public JavaScript API

## Important compatibility decision

Use this in documents:

```html
<!doctype html>
<html lang="en" data-html-version="6">
```

Do not use `<!doctype html6>` directly inside WebKit unless MiniBrowser preprocesses it first. The HTML parser's doctype algorithm is part of the host engine. The supplied MiniBrowser preprocessor converts `<!doctype html6>` to `<!doctype html>` before WebKit parses the document.

## Files

- `runtime/html6.js` - browser runtime
- `runtime/html6.css` - default accessibility/fallback styles
- `demo/index.html` - working demonstration
- `tests/index.html` - self-test suite
- `spec/HTML6-Proposal-0.1.md` - specification
- `minibrowser/swift/HTML6Integration.swift` - Swift/WebKit integration
- `minibrowser/swift/HTML6DemoLoader.swift` - HTML6 source preprocessing/loading example

## Integration

Copy `runtime/html6.js` and `runtime/html6.css` into MiniBrowser's resources.

For WebKit, inject `html6.js` at `.atDocumentStart` with `forMainFrameOnly: false`. Add the CSS as a user style sheet or include it in pages.

For pages loaded from HTML strings, run `HTML6Preprocessor.prepare(_:)` before `WKWebView.loadHTMLString`.

For remote pages, the recommended production approach is to support the safe declaration:

```html
<!doctype html>
<html data-html-version="6">
```

This avoids changing the host parser's doctype handling.

## Test

Open `demo/index.html` in MiniBrowser after installing the runtime, or open `tests/index.html` to run the compatibility tests.

## Scope

This is a functioning experimental browser feature layer, not an official web standard. A real standards effort would additionally require interoperable implementations in multiple browser engines, Web Platform Tests, accessibility mapping specifications, security review, and standards-body consensus.
