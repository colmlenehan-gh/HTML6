# HTML6

**HTML6 is a proposed extension layer for HTML focused on modern application development, declarative state, accessibility, navigation, and progressive enhancement.**

> **Status:** Proposal / Experimental
> **Version:** 0.1.0
> **License:** MIT

HTML6 is an experimental proposal exploring how HTML could provide more expressive application-development primitives while remaining familiar to existing web developers and compatible with current browsers.

HTML6 is **not an official successor to HTML5** and is not currently a web standard. This repository contains the proposal and a reference implementation intended for experimentation and browser integration.

## Goals

HTML6 aims to explore:

* More expressive semantic elements
* Declarative application state
* Declarative UI actions
* Improved form behaviour
* Declarative partial navigation
* Built-in pending states
* Stronger accessibility defaults
* Declarative components
* Progressive enhancement
* Compatibility with existing HTML
* A minimal browser runtime rather than a large JavaScript framework

The goal is not to replace JavaScript, CSS, or existing web standards. Instead, HTML6 explores which common application behaviours could potentially be expressed declaratively.

## Example

A basic HTML6 document can declare its version using:

```html
<!doctype html>
<html data-html-version="6">
  <body>
    <application>
      <navigation>
        <a href="/">Home</a>
        <a href="/about">About</a>
      </navigation>

      <main>
        <h1>Hello, HTML6</h1>

        <state name="menu" value="closed"></state>

        <button action="toggle" target="menu">
          Toggle menu
        </button>

        <div when="menu == open">
          The menu is open.
        </div>
      </main>
    </application>
  </body>
</html>
```

The preferred declaration is:

```html
<!doctype html>
<html data-html-version="6">
```

This allows current browsers to continue parsing the document as ordinary HTML while an HTML6 runtime provides the additional behaviour.

## Proposed Features

### Semantic Elements

HTML6 proposes additional semantic elements for common application structures:

```html
<application>
<navigation>
<notice>
<timeline>
<item>
<field-group>
<output-region>
```

These elements are intended to provide clearer document semantics while allowing browsers and assistive technologies to apply appropriate behaviour.

### Declarative State

Application state can be declared directly in HTML:

```html
<state name="menu" value="closed"></state>
```

Actions can then modify that state:

```html
<button action="toggle" target="menu">
  Menu
</button>
```

Elements can respond to state using `when`:

```html
<div when="menu == open">
  Menu content
</div>
```

### Declarative Actions

The reference implementation currently explores actions such as:

* `set`
* `toggle`
* `increment`
* `decrement`
* `show`
* `hide`

Example:

```html
<button
  action="set"
  target="counter"
  value="10">
  Set to 10
</button>
```

### Forms

HTML6 explores enhanced declarative form behaviour, including:

* Validation feedback
* Error summaries
* Submission pending states
* Disabled submission controls
* Accessible status communication

Example:

```html
<form>
  <input name="email" type="email" required>

  <button type="submit" pending-text="Submitting...">
    Submit
  </button>
</form>
```

### Partial Navigation

Links can request that only part of a page is replaced:

```html
<a
  href="/inbox"
  update="#content"
  history="push">
  Inbox
</a>
```

The reference runtime fetches the destination, extracts the requested region, and replaces the matching element.

If the enhanced navigation fails, the browser falls back to normal navigation.

### Accessibility

Accessibility is a core design consideration.

The reference implementation provides appropriate ARIA behaviour for several proposed elements and states, including:

* Navigation semantics
* Live regions
* Status announcements
* List/list-item semantics
* Hidden state management
* Form error reporting
* Focus management following partial navigation

HTML6 does not intend to make accessibility automatic in every situation. Authors remain responsible for creating accessible interfaces.

## Declarative Components

HTML6 also explores declarative component definitions:

```html
<component name="user-card">
  <template shadowrootmode="open">
    <article>
      <slot></slot>
    </article>
  </template>
</component>
```

The reference implementation uses the browser's existing Web Components and Shadow DOM capabilities rather than introducing a separate component system.

## Browser Compatibility

HTML6 is designed as a **compatibility layer** rather than a replacement HTML parser.

Current browsers already understand HTML5 and can safely parse unknown elements. The HTML6 runtime adds the proposed behaviour using existing browser APIs.

This approach allows experimentation without requiring a complete browser-engine rewrite.

## MiniBrowser

The repository includes integration material for browsers based on Apple's `WKWebView`, including the MiniBrowser project.

The integration works by:

1. Loading the HTML6 runtime into the web view.
2. Installing it as a document-end `WKUserScript`.
3. Optionally preprocessing the experimental `<!doctype html6>` declaration.
4. Allowing WebKit to perform the actual HTML parsing and rendering.

The recommended production form remains:

```html
<!doctype html>
<html data-html-version="6">
```

rather than relying on an unrecognised doctype.

See:

```text
minibrowser/MiniBrowser-Integration.md
```

for integration instructions.

## Reference Implementation

The current reference implementation is intentionally small.

```text
runtime/
├── html6.js
└── html6.css
```

The runtime does not attempt to replace the browser's JavaScript engine, HTML parser, DOM, CSS engine, networking stack, or accessibility subsystem.

It provides a compatibility layer for the features currently defined by the proposal.

## Repository Structure

```text
HTML6/
├── README.md
├── CHANGELOG.md
├── LICENSE
├── package.json
│
├── runtime/
│   ├── html6.js
│   └── html6.css
│
├── demo/
│   └── index.html
│
├── tests/
│   └── index.html
│
├── spec/
│   └── HTML6-Proposal-0.1.md
│
└── minibrowser/
    ├── MiniBrowser-Integration.md
    ├── INTEGRATION-CHECKLIST.md
    └── swift/
        ├── HTML6Integration.swift
        └── HTML6DemoLoader.swift
```

## Design Principles

HTML6 is being developed around some several principles:

### Declarative First

Common interface behaviour should be expressible in HTML where practical.

### Progressive Enhancement

HTML6 features should enhance an existing HTML document rather than make it completely dependent on the runtime.

### Accessibility by Default

New primitives should have sensible accessibility semantics wherever possible.

### Security by Default

The runtime should avoid dangerous mechanisms such as dynamically evaluating arbitrary JavaScript.

### Browser Compatibility

HTML6 should build upon existing browser technologies wherever possible.

### Minimalism

HTML6 should not become a replacement for the entire web platform.

### Backwards Compatibility

Existing HTML should remain valid and usable alongside HTML6 features.

## Current Status

HTML6 is an experimental proposal.

The current implementation should be considered a **reference implementation**, not a production web standard.

The syntax, semantics, APIs, and behaviour may change substantially between versions.

Nothing in this repository currently represents an official W3C, WHATWG, browser-vendor, or ISO standard.

## Roadmap

Potential future work includes:

* Expand the HTML6 specification
* Improve the reference runtime
* Expand automated tests
* Improve declarative form capabilities
* Expand state expressions
* Define a more complete component model
* Improve navigation behaviour
* Expand accessibility testing
* Investigate server-side integration
* Prototype additional browser integrations
* Gather developer feedback
* Evaluate which features could realistically be proposed to existing web standards bodies

## Contributing

Contributions, technical discussion, experiments, and implementation feedback are welcome.

When proposing a new feature, consider:

1. What problem does it solve?
2. Why should it belong in HTML rather than JavaScript or CSS?
3. How does it progressively enhance existing HTML?
4. How does it affect accessibility?
5. How does it affect security?
6. How does it behave in browsers without HTML6 support?
7. Can the feature be implemented without requiring a fundamentally different browser engine?

## License

HTML6 is released under the **MIT License**.

See [`LICENSE`](LICENSE) for the complete license text.

Copyright © 2026 Colm Lenehan.

## Disclaimer

HTML6 is an independent experimental project.

It is not affiliated with, endorsed by, or maintained by the World Wide Web Consortium (W3C), WHATWG, Apple, Google, Microsoft, Mozilla, or any other browser vendor or standards organisation.

The term "HTML6" is used here to describe this project's proposed extension to HTML and does not imply that an official HTML6 standard currently exists.

