(function () {
  var COPY_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  var CHECK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

  var blocks = document.querySelectorAll(".highlight, .article__content > pre");
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    if (block.querySelector(".code-copy-btn")) continue;
    block.style.position = "relative";
    var btn = document.createElement("button");
    btn.className = "code-copy-btn";
    btn.type = "button";
    btn.setAttribute("aria-label", "Copy code");
    btn.innerHTML = COPY_ICON;
    btn.addEventListener("click", (function (b, copyBtn) {
      return function () {
        var code = b.querySelector("code");
        var text = code ? code.textContent : b.textContent;
        navigator.clipboard.writeText(text).then(function () {
          copyBtn.innerHTML = CHECK_ICON;
          copyBtn.classList.add("code-copy-btn--copied");
          setTimeout(function () {
            copyBtn.innerHTML = COPY_ICON;
            copyBtn.classList.remove("code-copy-btn--copied");
          }, 2000);
        });
      };
    })(block, btn));
    block.appendChild(btn);
  }

  function closeLightbox() {
    var box = document.querySelector(".image-lightbox");
    if (!box) return;
    document.removeEventListener("keydown", onLightboxKey);
    box.remove();
    document.body.classList.remove("image-lightbox-open");
  }

  function onLightboxKey(e) {
    if (e.key === "Escape") closeLightbox();
  }

  document.addEventListener("click", function (e) {
    var img = e.target.closest && e.target.closest("img.blog-post__image[data-fullsrc]");
    if (!img) return;
    var src = img.getAttribute("data-fullsrc");
    if (!src || src.charAt(0) !== "/" || src.charAt(1) === "/") return;
    e.preventDefault();
    closeLightbox();
    var box = document.createElement("div");
    box.className = "image-lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Image preview");
    var full = document.createElement("img");
    full.src = src;
    full.alt = img.alt || "";
    box.appendChild(full);
    box.addEventListener("click", closeLightbox);
    document.body.appendChild(box);
    document.body.classList.add("image-lightbox-open");
    document.addEventListener("keydown", onLightboxKey);
  });
})();
