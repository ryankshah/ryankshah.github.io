/* =========================================================================
   ryankshah.com — interaction layer
   Everything here is progressive: without it the page is complete and readable.
   ========================================================================= */
(function () {
    'use strict';
    window.__siteReady = true;

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function esc(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    /* ---------- Menu sheet (phone) ---------------------------------------- */
    function buildMenu() {
        var btn = document.getElementById('menu');
        var sheet = document.getElementById('sheet');
        if (!btn || !sheet) return;

        function set(open) {
            sheet.hidden = !open;
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
            btn.textContent = open ? 'Close' : 'Menu';
            document.body.style.overflow = open ? 'hidden' : '';
        }
        btn.addEventListener('click', function () { set(sheet.hidden); });
        sheet.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) { set(false); btn.focus(); } });
        window.matchMedia('(min-width: 1001px)').addEventListener('change', function (e) { if (e.matches) set(false); });
    }

    /* ---------- Bar: leaves on the way down, returns on the first way up ---- */
    function buildBar() {
        var bar = document.getElementById('bar');
        if (!bar) return;
        var last = window.scrollY;
        var ticking = false;
        window.addEventListener('scroll', function () {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(function () {
                var y = window.scrollY;
                var sheet = document.getElementById('sheet');
                var menuOpen = sheet && !sheet.hidden;
                if (menuOpen || y < 120 || y < last - 2) bar.classList.remove('is-hidden');
                else if (y > last + 2) bar.classList.add('is-hidden');
                last = y;
                ticking = false;
            });
        }, { passive: true });
        bar.addEventListener('focusin', function () { bar.classList.remove('is-hidden'); });
    }

    /* ---------- Current section in the nav ---------------------------------- */
    function buildSpy() {
        var links = Array.prototype.slice.call(document.querySelectorAll('.bar__links a[href^="#"]'));
        if (!links.length || !('IntersectionObserver' in window)) return;
        var map = {};
        links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                links.forEach(function (a) { a.removeAttribute('aria-current'); });
                var a = map[entry.target.id];
                if (a) a.setAttribute('aria-current', 'true');
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        Object.keys(map).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) spy.observe(el);
        });
    }

    /* ---------- Entrances: parts arrive in reading order, once ------------- */
    var revealIO = null;
    function watch(el) {
        if (reduceMotion || !('IntersectionObserver' in window)) { el.classList.add('is-in'); return; }
        if (!revealIO) {
            revealIO = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('is-in');
                    revealIO.unobserve(entry.target);
                });
            }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
        }
        revealIO.observe(el);
    }

    function buildReveal() {
        Array.prototype.forEach.call(document.querySelectorAll('[data-reveal]'), watch);
    }

    /* ---------- Publications: filter by theme -------------------------------- */
    function buildFilter() {
        var tool = document.getElementById('pubTool');
        var filters = document.getElementById('filters');
        var rows = Array.prototype.slice.call(document.querySelectorAll('#pubs tbody tr'));
        var countEl = document.getElementById('pubCount');
        if (!tool || !filters || !rows.length) return;

        function setCount(n) {
            if (countEl) countEl.textContent = n + (n === 1 ? ' paper' : ' papers');
        }

        function apply(theme) {
            var shown = 0;
            rows.forEach(function (row) {
                var themes = (row.getAttribute('data-theme') || '').split(/\s+/);
                var match = theme === 'all' || themes.indexOf(theme) !== -1;
                row.classList.toggle('is-hidden', !match);
                if (match) shown++;
            });
            setCount(shown);
        }

        filters.addEventListener('click', function (e) {
            var btn = e.target.closest('.filter');
            if (!btn) return;
            filters.querySelectorAll('.filter').forEach(function (b) {
                b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
            });
            apply(btn.getAttribute('data-filter'));
        });

        setCount(rows.length);
        tool.hidden = false;
    }

    /* ---------- Field notes: rows from posts/posts.json ---------------------- */
    function postHref(post, prefix) {
        return post.status === 'draft' ? '#' : prefix + 'posts/' + esc(post.slug) + '.html';
    }

    function postRow(post) {
        var date = post.status === 'draft' ? 'Forthcoming' : esc(String(post.date));
        return '<tr data-topic="' + esc(post.topic) + '">' +
            '<td class="lineup__when">' + date + '</td>' +
            '<td class="lineup__title"><a href="' + postHref(post, '') + '"><span class="lineup__name">' + esc(post.title) + '</span>' +
            '<span class="lineup__by">' + esc(post.topic) + ' · ' + esc(post.readTime) + ' read</span></a></td>' +
            '<td class="lineup__dek">' + esc(post.dek) + '</td></tr>';
    }

    function buildHomePosts() {
        var list = document.getElementById('homePosts');
        if (!list) return;
        fetch('posts/posts.json')
            .then(function (res) { return res.json(); })
            .then(function (posts) {
                list.innerHTML = posts.slice(0, 3).map(function (p) {
                    var date = p.status === 'draft' ? 'Forthcoming' : esc(String(p.date));
                    return '<li><p class="ledger__when">' + date + '</p>' +
                        '<div class="ledger__role"><h3><a href="' + postHref(p, '') + '">' + esc(p.title) + '</a></h3>' +
                        '<p>' + esc(p.topic) + ' · ' + esc(p.readTime) + ' read</p></div>' +
                        '<p class="ledger__desc">' + esc(p.dek) + '</p></li>';
                }).join('');
                Array.prototype.forEach.call(list.children, function (li, i) {
                    li.setAttribute('data-reveal', '');
                    li.style.setProperty('--i', i);
                    watch(li);
                });
            })
            .catch(function () {});
    }

    function buildWritingPage() {
        var body = document.getElementById('postList');
        if (!body) return;
        var filtersEl = document.getElementById('postFilters');
        var countEl = document.getElementById('noteCount');
        var tool = document.getElementById('postTool');

        fetch('posts/posts.json')
            .then(function (res) { return res.json(); })
            .then(function (posts) {
                var sorted = posts.slice().sort(function (a, b) { return (b.featured ? 1 : 0) - (a.featured ? 1 : 0); });
                body.innerHTML = sorted.map(function (p) { return postRow(p); }).join('');
                Array.prototype.forEach.call(body.querySelectorAll('tr'), function (row, i) {
                    row.setAttribute('data-reveal', '');
                    row.style.setProperty('--i', i);
                    watch(row);
                });

                var topics = [];
                posts.forEach(function (p) { if (topics.indexOf(p.topic) === -1) topics.push(p.topic); });
                filtersEl.innerHTML = '<button class="filter" type="button" data-filter="all" aria-pressed="true">All</button>' +
                    topics.map(function (t) {
                        return '<button class="filter" type="button" data-filter="' + esc(t) + '" aria-pressed="false">' + esc(t) + '</button>';
                    }).join('');

                function setCount(n) { countEl.textContent = n + (n === 1 ? ' note' : ' notes'); }
                setCount(posts.length);
                tool.hidden = false;

                filtersEl.addEventListener('click', function (e) {
                    var btn = e.target.closest('.filter');
                    if (!btn) return;
                    filtersEl.querySelectorAll('.filter').forEach(function (b) {
                        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
                    });
                    var f = btn.getAttribute('data-filter');
                    var shown = 0;
                    body.querySelectorAll('tr').forEach(function (row) {
                        var match = f === 'all' || row.getAttribute('data-topic') === f;
                        row.classList.toggle('is-hidden', !match);
                        if (match) shown++;
                    });
                    setCount(shown);
                });
            })
            .catch(function () {
                body.innerHTML = '<tr><td colspan="3">The notes could not be loaded. Please try again shortly.</td></tr>';
            });
    }

    function init() {
        buildMenu();
        buildBar();
        buildSpy();
        buildReveal();
        buildFilter();
        buildHomePosts();
        buildWritingPage();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
