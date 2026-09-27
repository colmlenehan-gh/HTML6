/*
 * HTML6 Proposal 0.1
 * Reference runtime
 *
 * No eval(), Function(), inline script compilation, or security-policy bypasses.
 */
(function () {
  "use strict";

  const VERSION = "0.1.0";

  const HTML6 = {
    version: VERSION,
    states: new Map(),
    ready: false
  };

  window.HTML6 = HTML6;

  const stateEvent = name => new CustomEvent("html6:statechange", {
    bubbles: true,
    detail: { name, value: HTML6.states.get(name) }
  });

  function isHTML6Document() {
    const root = document.documentElement;
    return !!root && (
      root.dataset.htmlVersion === "6" ||
      document.doctype?.name?.toLowerCase() === "html6"
    );
  }

  function parseScalar(value) {
    if (value === null || value === undefined) return "";
    const s = String(value).trim();
    if (s === "true") return true;
    if (s === "false") return false;
    if (s !== "" && !Number.isNaN(Number(s))) return Number(s);
    return s;
  }

  function setState(name, value) {
    const old = HTML6.states.get(name);
    HTML6.states.set(name, parseScalar(value));
    if (old !== HTML6.states.get(name)) {
      document.dispatchEvent(stateEvent(name));
      renderConditions();
    }
  }

  function conditionPasses(expression) {
    if (!expression) return true;

    // Grammar: term ( "||" term )*
    // term: comparison ( "&&" comparison )*
    // comparison: identifier (==|!=) quoted-or-number
    const orParts = expression.split("||").map(x => x.trim());

    return orParts.some(orPart => {
      const andParts = orPart.split("&&").map(x => x.trim());
      return andParts.every(test => {
        const match = test.match(/^([A-Za-z_][\w-]*)\s*(==|!=)\s*(?:"([^"]*)"|'([^']*)'|(-?\d+(?:\.\d+)?|true|false))$/);
        if (!match) return false;
        const name = match[1];
        const operator = match[2];
        const rhs = parseScalar(match[3] ?? match[4] ?? match[5]);
        const lhs = HTML6.states.get(name);
        return operator === "==" ? lhs === rhs : lhs !== rhs;
      });
    });
  }

  function renderConditions() {
    document.querySelectorAll("[when]").forEach(el => {
      const visible = conditionPasses(el.getAttribute("when"));
      if (visible) {
        el.hidden = false;
        el.removeAttribute("aria-hidden");
      } else {
        el.hidden = true;
        el.setAttribute("aria-hidden", "true");
      }
    });
  }

  function initStates() {
    document.querySelectorAll("state[name]").forEach(el => {
      setState(el.getAttribute("name"), el.getAttribute("value") ?? "");
      el.hidden = true;
      el.setAttribute("aria-hidden", "true");
    });
  }

  function setPending(button, pending) {
    if (!button.dataset.html6OriginalText) {
      button.dataset.html6OriginalText = button.textContent;
    }

    if (pending) {
      button.dataset.html6WasDisabled = button.disabled ? "1" : "0";
      button.disabled = true;
      const text = button.getAttribute("pending-text");
      if (text) button.textContent = text;
      button.setAttribute("aria-busy", "true");
    } else {
      button.disabled = button.dataset.html6WasDisabled === "1";
      if (button.dataset.html6OriginalText !== undefined) {
        button.textContent = button.dataset.html6OriginalText;
      }
      button.removeAttribute("aria-busy");
    }
  }

  function applySemantics() {
    document.querySelectorAll("navigation").forEach(el => {
      if (!el.hasAttribute("role")) el.setAttribute("role", "navigation");
    });

    document.querySelectorAll("notice").forEach(el => {
      if (!el.hasAttribute("role")) el.setAttribute("role", "status");
      if (!el.hasAttribute("aria-live")) el.setAttribute("aria-live", "polite");
    });

    document.querySelectorAll("output-region").forEach(el => {
      if (!el.hasAttribute("aria-live")) el.setAttribute("aria-live", "polite");
    });

    document.querySelectorAll("timeline").forEach(el => {
      if (!el.hasAttribute("role")) el.setAttribute("role", "list");
    });

    document.querySelectorAll("timeline > item").forEach(el => {
      if (!el.hasAttribute("role")) el.setAttribute("role", "listitem");
    });
  }

  function performAction(button) {
    const action = button.getAttribute("action");
    const targetName = button.getAttribute("target");
    if (!action || !targetName) return false;

    const target = document.querySelector(`state[name="${CSS.escape(targetName)}"]`);
    if (!target) return false;

    const current = HTML6.states.get(targetName);

    switch (action) {
      case "toggle":
        setState(targetName, current === "open" ? "closed" : "open");
        break;
      case "set":
        setState(targetName, button.getAttribute("value") ?? "");
        break;
      case "increment":
        setState(targetName, Number(current || 0) + 1);
        break;
      case "decrement":
        setState(targetName, Number(current || 0) - 1);
        break;
      case "show":
        setState(targetName, "open");
        break;
      case "hide":
        setState(targetName, "closed");
        break;
      default:
        return false;
    }

    if (action === "toggle" && button.hasAttribute("aria-expanded")) {
      const open = HTML6.states.get(targetName) === "open";
      button.setAttribute("aria-expanded", String(open));
    }

    return true;
  }

  async function enhancedNavigate(link) {
    const selector = link.getAttribute("update");
    if (!selector) return false;

    let target;
    try {
      target = document.querySelector(selector);
    } catch {
      return false;
    }
    if (!target) return false;

    const url = new URL(link.href, location.href);

    try {
      const response = await fetch(url.href, {
        credentials: "same-origin",
        headers: { "X-HTML6-Navigation": "partial" }
      });
      if (!response.ok) throw new Error("HTTP " + response.status);

      const text = await response.text();
      const parser = new DOMParser();
      const nextDocument = parser.parseFromString(text, "text/html");
      const nextTarget = nextDocument.querySelector(selector);
      if (!nextTarget) throw new Error("Target not found");

      target.replaceWith(document.importNode(nextTarget, true));

      if (link.getAttribute("history") === "replace") {
        history.replaceState({}, "", url.href);
      } else {
        history.pushState({}, "", url.href);
      }

      applySemantics();
      renderConditions();
      document.dispatchEvent(new CustomEvent("html6:navigation", {
        bubbles: true,
        detail: { url: url.href, selector }
      }));

      const newTarget = document.querySelector(selector);
      if (newTarget && typeof newTarget.focus === "function") {
        newTarget.setAttribute("tabindex", "-1");
        newTarget.focus({ preventScroll: true });
      }

      return true;
    } catch {
      location.href = url.href;
      return true;
    }
  }

  function formErrorSummary(form) {
    const invalid = [...form.elements].filter(el => typeof el.checkValidity === "function" && !el.checkValidity());
    if (!invalid.length) return;

    let notice = form.querySelector("notice[data-html6-error-summary]");
    if (!notice) {
      notice = document.createElement("notice");
      notice.dataset.html6ErrorSummary = "1";
      notice.setAttribute("role", "alert");
      notice.setAttribute("aria-live", "assertive");
      form.prepend(notice);
    }

    notice.textContent = `${invalid.length} field${invalid.length === 1 ? "" : "s"} require attention.`;
    invalid[0].focus({ preventScroll: false });
  }

  function wireEvents() {
    document.addEventListener("click", async event => {
      const actionButton = event.target.closest?.("[action][target]");
      if (actionButton && performAction(actionButton)) {
        event.preventDefault();
        return;
      }

      const link = event.target.closest?.("a[update]");
      if (link && !event.defaultPrevented) {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        await enhancedNavigate(link);
      }
    }, true);

    document.addEventListener("submit", event => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;

      if (!form.checkValidity()) {
        event.preventDefault();
        formErrorSummary(form);
        return;
      }

      if (form.dataset.html6Submitting === "1") {
        event.preventDefault();
        return;
      }

      form.dataset.html6Submitting = "1";
      form.querySelectorAll('button[type="submit"], input[type="submit"]').forEach(button => {
        if (button instanceof HTMLButtonElement) setPending(button, true);
        else button.disabled = true;
      });
    }, true);

    window.addEventListener("pageshow", () => {
      document.querySelectorAll("button[pending-text]").forEach(button => setPending(button, false));
      document.querySelectorAll("form[data-html6-submitting]").forEach(form => delete form.dataset.html6Submitting);
    });

    window.addEventListener("popstate", () => {
      // Normal browser history navigation remains authoritative.
      document.dispatchEvent(new CustomEvent("html6:navigation", {
        bubbles: true,
        detail: { url: location.href, history: true }
      }));
    });
  }

  function initComponents() {
    document.querySelectorAll("component[name]").forEach(definition => {
      const name = definition.getAttribute("name");
      if (!/^[a-z][a-z0-9]*-[a-z0-9-]+$/.test(name)) return;
      if (customElements.get(name)) return;

      const template = definition.querySelector("template");
      if (!template) return;

      customElements.define(name, class HTML6Component extends HTMLElement {
        constructor() {
          super();
          if (template.content && !this.shadowRoot) {
            const shadow = this.attachShadow({ mode: "open" });
            shadow.appendChild(template.content.cloneNode(true));
          }
        }
      });

      definition.hidden = true;
    });
  }

  function init() {
    if (!isHTML6Document()) return;

    initStates();
    applySemantics();
    initComponents();
    renderConditions();
    wireEvents();

    HTML6.ready = true;
    document.dispatchEvent(new CustomEvent("html6:ready", {
      bubbles: true,
      detail: { version: VERSION }
    }));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
