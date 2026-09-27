# MiniBrowser integration checklist

- [ ] Confirm MiniBrowser uses WKWebView.
- [ ] Add `runtime/html6.js` to Copy Bundle Resources.
- [ ] Add `runtime/html6.css` to Copy Bundle Resources if you want browser-provided defaults.
- [ ] Call `HTML6Integration.install(into:)` when constructing the WKWebView configuration.
- [ ] For HTML strings, call `HTML6Preprocessor.prepare(_:)` before `loadHTMLString`.
- [ ] Add `<html data-html-version="6">` to HTML6 pages.
- [ ] Test a normal HTML5 page.
- [ ] Test `demo/index.html`.
- [ ] Test `tests/index.html`.

If MiniBrowser is not based on WKWebView, do not use the Swift files unchanged. The runtime itself remains usable in any browser engine capable of normal HTML5 + JavaScript.
