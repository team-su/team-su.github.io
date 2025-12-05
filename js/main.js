(function($, moment, ClipboardJS, config) {
    $('.article img').attr('loading', 'lazy');
    $('.article img:not(".not-gallery-item")').each(function() {
        if ($(this).parent('a').length === 0) {
            $(this).wrap('<a class="gallery-item" href="' + $(this).attr('src') + '"></a>');
            if (this.alt) {
                $(this).after('<p class="has-text-centered is-size-6 caption">' + this.alt + '</p>');
            }
        }
    });

    if (typeof $.fn.lightGallery === 'function') {
        $('.article').lightGallery({ selector: '.gallery-item' });
    }
    if (typeof $.fn.justifiedGallery === 'function') {
        if ($('.justified-gallery > p > .gallery-item').length) {
            $('.justified-gallery > p > .gallery-item').unwrap();
        }
        $('.justified-gallery').justifiedGallery();
    }

    if (typeof moment === 'function') {
        $('.article-meta time').each(function() {
            $(this).text(moment($(this).attr('datetime')).fromNow());
        });
    }

    $('.article > .content > table').each(function() {
        if ($(this).width() > $(this).parent().width()) {
            $(this).wrap('<div class="table-overflow"></div>');
        }
    });

    function adjustNavbar() {
        const navbarWidth = $('.navbar-main .navbar-start').outerWidth() + $('.navbar-main .navbar-end').outerWidth();
        if ($(document).outerWidth() < navbarWidth) {
            $('.navbar-main .navbar-menu').addClass('justify-content-start');
        } else {
            $('.navbar-main .navbar-menu').removeClass('justify-content-start');
        }
    }
    adjustNavbar();
    $(window).resize(adjustNavbar);

    function toggleFold(codeBlock, isFolded) {
        const $toggle = $(codeBlock).find('.fold i');
        !isFolded ? $(codeBlock).removeClass('folded') : $(codeBlock).addClass('folded');
        !isFolded ? $toggle.removeClass('fa-angle-right') : $toggle.removeClass('fa-angle-down');
        !isFolded ? $toggle.addClass('fa-angle-down') : $toggle.addClass('fa-angle-right');
    }

    function createFoldButton(fold) {
        return '<span class="fold">' + (fold === 'unfolded' ? '<i class="fas fa-angle-down"></i>' : '<i class="fas fa-angle-right"></i>') + '</span>';
    }

    $('figure.highlight table').wrap('<div class="highlight-body">');
    if (typeof config !== 'undefined' && typeof config.article !== 'undefined' && typeof config.article.highlight !== 'undefined') {
        $('figure.highlight').addClass('hljs');
        $('figure.highlight .code .line span').each(function() {
            const classes = $(this).attr('class').split(/\s+/);
            for (const cls of classes) {
                $(this).addClass('hljs-' + cls);
                $(this).removeClass(cls);
            }
        });

        const clipboard = config.article.highlight.clipboard;
        const fold = config.article.highlight.fold.trim();

        $('figure.highlight').each(function() {
            if ($(this).find('figcaption').length) {
                $(this).find('figcaption').addClass('level is-mobile');
                $(this).find('figcaption').append('<div class="level-left">');
                $(this).find('figcaption').append('<div class="level-right">');
                $(this).find('figcaption div.level-left').append($(this).find('figcaption').find('span'));
                $(this).find('figcaption div.level-right').append($(this).find('figcaption').find('a'));
            } else {
                if (clipboard || fold) {
                    $(this).prepend('<figcaption class="level is-mobile"><div class="level-left"></div><div class="level-right"></div></figcaption>');
                }
            }
        });

        if (typeof ClipboardJS !== 'undefined' && clipboard) {
            $('figure.highlight').each(function() {
                const id = 'code-' + Date.now() + (Math.random() * 1000 | 0);
                const button = '<a href="javascript:;" class="copy" title="Copy" data-clipboard-target="#' + id + ' .code"><i class="fas fa-copy"></i></a>';
                $(this).attr('id', id);
                $(this).find('figcaption div.level-right').append(button);
            });
            new ClipboardJS('.highlight .copy');
        }

        if (fold) {
            $('figure.highlight').each(function() {
                $(this).addClass('foldable');
                if ($(this).find('figcaption').find('span').length > 0) {
                    const span = $(this).find('figcaption').find('span');
                    if (span[0].innerText.indexOf('>folded') > -1) {
                        span[0].innerText = span[0].innerText.replace('>folded', '');
                        $(this).find('figcaption div.level-left').prepend(createFoldButton('folded'));
                        toggleFold(this, true);
                        return;
                    }
                }
                $(this).find('figcaption div.level-left').prepend(createFoldButton(fold));
                toggleFold(this, fold === 'folded');
            });
            $('figure.highlight figcaption .level-left').click(function() {
                const $code = $(this).closest('figure.highlight');
                toggleFold($code.eq(0), !$code.hasClass('folded'));
            });
        }
    }

    const $toc = $('#toc');
    if ($toc.length > 0) {
        const $mask = $('<div>');
        $mask.attr('id', 'toc-mask');
        $('body').append($mask);
        function toggleToc() {
            $toc.toggleClass('is-active');
            $mask.toggleClass('is-active');
        }
        $toc.on('click', toggleToc);
        $mask.on('click', toggleToc);
        $('.navbar-main .catalogue').on('click', toggleToc);
    }

    if (window.location.pathname.length > 1 && !$('.article').length) {
        $('#back-to-top').remove();
    } else {
        $(window).scroll(function() {
            if ($(window).scrollTop() > 300 && $('.article').length) {
                $('#back-to-top').addClass('show-btn');
            } else {
                $('#back-to-top').removeClass('show-btn');
            }
        });
    }

    $(document).ready(function() {
        const $tocLinks = $('.widget-toc a, .menu-list a').filter(function() {
            return $(this).attr('href') && $(this).attr('href').startsWith('#');
        });
        const $headers = $('.article h1, .article h2, .article h3, .article h4, .article h5');

        function normalizeTextToId(text) {
            return text.trim()
                .replace(/\s+/g, '-')
                .replace(/[^a-zA-Z0-9\u4e00-\u9fa5\-]/g, '')
                .toLowerCase();
        }

        $headers.each(function() {
            const $h = $(this);
            if (!$h.attr('id') || $h.attr('id') === 'undefined') {
                $h.attr('id', normalizeTextToId($h.text()));
            }
        });

        const linkMap = new Map();
        $tocLinks.each(function() {
            const href = $(this).attr('href');
            const id = href.substring(1).toLowerCase();
            linkMap.set(id, this);
        });

        function setActive(el) {
            if (!el) return;
            $tocLinks.removeClass('active');
            $(el).addClass('active');
            
            const $scrollContainer = $(el).closest('.menu-list, .widget-toc');
            if ($scrollContainer.length) {
                const top = el.offsetTop;
                const height = $scrollContainer.height();
                const scrollTop = $scrollContainer.scrollTop();
                if (top > scrollTop + height - 50 || top < scrollTop) {
                     $scrollContainer.animate({ scrollTop: top - 50 }, 200);
                }
            }
        }

        $tocLinks.on('click', function(e) {
            e.preventDefault();
            const href = $(this).attr('href');
            const targetId = href.substring(1);
            const normalizedTargetId = normalizeTextToId(targetId);
            const target = document.getElementById(targetId) || document.getElementById(normalizedTargetId);
            
            if (target) {
                const offset = 80;
                const top = $(target).offset().top - offset;
                window.scrollTo({ top, behavior: 'smooth' });
                setActive(linkMap.get(target.id.toLowerCase()) || this);
            }
        });

        if ($headers.length > 0) {
            const io = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('id');
                        if (id) {
                            const linkEl = linkMap.get(id.toLowerCase());
                            if (linkEl) setActive(linkEl);
                        }
                    }
                });
            }, { root: null, rootMargin: '-80px 0px -70% 0px', threshold: 0 });
            
            $headers.each(function() {
                io.observe(this);
            });
        }
    });

})(jQuery, window.moment, window.ClipboardJS, window.IcarusThemeSettings);