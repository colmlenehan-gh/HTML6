# HTML6 Proposal 0.1

Status: Experimental reference implementation

## 1. Version declaration

Preferred production declaration:

```html
<!doctype html>
<html data-html-version="6">
```

Experimental source declaration:

```html
<!doctype html6>
```

MiniBrowser must normalize the experimental declaration to HTML's standards doctype before handing the document to WebKit.

## 2. Semantic elements

| Element | Semantics |
|---|---|
| application | application root/container |
| navigation | navigation landmark |
| notice | status or alert message |
| timeline | ordered event collection |
| item | item within a collection |
| field-group | related form fields |
| output-region | programmatically updated output |

Unknown elements remain ordinary flow containers when the host engine does not implement native semantics.

## 3. Declarative state

```html
<state name="menu" value="closed"></state>
<button action="toggle" target="menu" aria-controls="main-menu">Menu</button>
<nav id="main-menu" when="menu == 'open'">...</nav>
```

Supported actions:

- set
- toggle
- increment
- decrement
- show
- hide
- submit

State values are strings or numbers. Expressions are deliberately limited to equality/inequality and logical conjunction/disjunction. No JavaScript is evaluated from markup.

## 4. Partial navigation

```html
<a href="/inbox" update="#content" history="push">Inbox</a>
```

The runtime fetches the destination using normal browser credentials and CORS rules, parses it as HTML, extracts the target selector, replaces the current region, updates history, and dispatches `html6:navigation`.

A failed enhanced request falls back to ordinary link navigation.

## 5. Pending actions

```html
<button type="submit" pending-text="Saving…">Save</button>
```

The runtime disables the submit control while the request is pending and exposes an accessible busy state.

## 6. Form validation

Existing HTML validation remains authoritative. The runtime adds:

- an error summary
- `aria-invalid`
- `aria-describedby`
- standardized `notice` placement
- duplicate-submission prevention

## 7. Accessibility

The implementation adds conservative ARIA mappings:

- navigation -> `role=navigation`
- notice -> `role=status` unless an explicit role exists
- output-region -> `aria-live=polite` unless explicitly supplied
- application -> `role=application` only when `data-html6-role="application"` is explicitly requested

Keyboard and focus behavior is delegated to native controls wherever possible.

## 8. Components

The proposal permits a component declaration:

```html
<component name="user-card">
  <template shadowrootmode="open">
    ...
  </template>
</component>
```

The reference runtime registers the custom element represented by the component name and preserves fallback content. It intentionally relies on the browser's existing Web Components implementation rather than inventing a second component model.

## 9. Security

The runtime never evaluates arbitrary JavaScript expressions supplied through HTML attributes. It uses a small parser for declarative state conditions.

Fetches use the browser's normal security model. The runtime does not bypass CORS, CSP, cookies, origin checks, or permissions.

## 10. Failure behavior

Unsupported HTML6 attributes are ignored. Unsupported HTML6 elements retain their child content. Enhanced navigation failures revert to ordinary navigation.

## 11. Backward compatibility

Any ordinary HTML5 page remains an HTML5 page. HTML6 features are opt-in and additive.
