(function () {
  var cache = new Map();

  function sameOrigin(href) {
    try {
      return new URL(href, location.href).origin === location.origin;
    } catch (e) {
      return false;
    }
  }

  function prefetch(url) {
    if (cache.has(url)) return Promise.resolve(cache.get(url));
    var p = fetch(url, { credentials: "same-origin" }).then(function (r) {
      if (!r.ok) throw new Error(String(r.status));
      return r.text();
    }).then(function (html) {
      cache.set(url, html);
      return html;
    }).catch(function (err) {
      cache.delete(url);
      throw err;
    });
    cache.set(url, p);
    return p;
  }

  function runScripts(root) {
    var scripts = root.querySelectorAll("script");
    for (var i = 0; i < scripts.length; i++) {
      var old = scripts[i];
      var s = document.createElement("script");
      if (old.src) s.src = old.src;
      else s.textContent = old.textContent;
      old.parentNode.replaceChild(s, old);
    }
  }

  function adoptAssets(doc) {
    var links = doc.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute("href");
      if (href && !document.querySelector('link[rel="stylesheet"][href="' + href + '"]')) {
        document.head.appendChild(links[i].cloneNode(true));
      }
    }
    var scripts = doc.querySelectorAll("script[src]");
    for (var j = 0; j < scripts.length; j++) {
      var src = scripts[j].getAttribute("src");
      if (!src || src.indexOf("nav-transition") !== -1) continue;
      if (document.querySelector('script[src="' + src + '"]')) continue;
      var s = document.createElement("script");
      s.src = src;
      s.defer = true;
      document.body.appendChild(s);
    }
  }

  function renderMath() {
    if (typeof renderMathInElement !== "function") return;
    renderMathInElement(document.body, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\begin{equation}", right: "\\end{equation}", display: true },
        { left: "\\begin{align}", right: "\\end{align}", display: true },
        { left: "\\begin{alignat}", right: "\\end{alignat}", display: true },
        { left: "\\begin{gather}", right: "\\end{gather}", display: true },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true }
      ]
    });
  }

  function apply(html) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    var newMain = doc.querySelector("main");
    var curMain = document.querySelector("main");
    var newShell = doc.querySelector(".page-shell");
    var curShell = document.querySelector(".page-shell");
    var newNav = doc.querySelector(".site-nav__list");
    var curNav = document.querySelector(".site-nav__list");
    if (!newMain || !curMain) throw new Error("missing main");

    document.title = doc.title;
    adoptAssets(doc);
    if (curShell && newShell) curShell.className = newShell.className;
    if (curNav && newNav) curNav.innerHTML = newNav.innerHTML;
    curMain.replaceWith(newMain);
    runScripts(newMain);
    window.scrollTo(0, 0);
    renderMath();
  }

  function go(url, push) {
    prefetch(url)
      .then(function (html) {
        var run = function () { apply(html); };
        if (document.startViewTransition) document.startViewTransition(run);
        else run();
        if (push) history.pushState({ suNav: 1 }, "", url);
      })
      .catch(function () {
        location.href = url;
      });
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
    var url = a.href;
    if (!sameOrigin(url)) return;
    var next = new URL(url);
    if (next.pathname === location.pathname && next.search === location.search) {
      if (next.hash) return;
      e.preventDefault();
      return;
    }
    e.preventDefault();
    go(url, true);
  });

  document.addEventListener("mouseover", function (e) {
    var a = e.target.closest("a[href]");
    if (!a || a.target === "_blank") return;
    if (!sameOrigin(a.href)) return;
    prefetch(a.href);
  }, { passive: true });

  window.addEventListener("popstate", function () {
    go(location.href, false);
  });
})();
