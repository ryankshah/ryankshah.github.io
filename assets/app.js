(function () {
    'use strict';

    function esc(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function $(sel, root) { return (root || document).querySelector(sel); }
    function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
    function motion() { return window.__motion || null; }

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
        window.matchMedia('(min-width: 961px)').addEventListener('change', function (e) { if (e.matches) set(false); });
    }

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

    function buildSpy() {
        var links = $$('.bar__links a[href^="#"]');
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

    function buildTrail() {
        var trail = document.getElementById('trail');
        var btn = document.getElementById('trailToggle');
        if (!trail || !btn) return;
        var items = $$('details', trail);

        function sync() {
            var all = items.every(function (d) { return d.open; });
            btn.textContent = all ? 'Close all roles' : 'Open all roles';
            btn.setAttribute('data-state', all ? 'open' : 'closed');
        }
        btn.addEventListener('click', function () {
            var open = btn.getAttribute('data-state') !== 'open';
            items.forEach(function (d) { d.open = open; });
            sync();
        });
        items.forEach(function (d) { d.addEventListener('toggle', sync); });
        sync();
    }

    function buildFilter() {
        var tool = document.getElementById('pubTool');
        var filters = document.getElementById('filters');
        var rows = $$('#pubs tbody tr');
        var countEl = document.getElementById('pubCount');
        if (!tool || !filters || !rows.length) return;

        function setCount(n) { if (countEl) countEl.textContent = n + (n === 1 ? ' paper' : ' papers'); }

        function apply(theme) {
            var shown = [];
            rows.forEach(function (row) {
                var themes = (row.getAttribute('data-theme') || '').split(/\s+/);
                var match = theme === 'all' || themes.indexOf(theme) !== -1;
                row.classList.toggle('is-hidden', !match);
                if (match) shown.push(row);
            });
            setCount(shown.length);
            var m = motion();
            if (m && m.filtered) m.filtered(shown);
        }

        filters.addEventListener('click', function (e) {
            var btn = e.target.closest('.chip');
            if (!btn) return;
            $$('.chip', filters).forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
            apply(btn.getAttribute('data-filter'));
        });

        setCount(rows.length);
        tool.hidden = false;
    }

    function postHref(post) {
        return post.status === 'draft' ? '#' : 'posts/' + esc(post.slug) + '.html';
    }
    function postDate(p) { return p.status === 'draft' ? 'Forthcoming' : esc(String(p.date)); }

    function revealLater(nodes) {
        if (!window.gsap) return;
        nodes.forEach(function (n) { n.setAttribute('data-reveal', ''); });
        var m = motion();
        if (m && m.watch) m.watch(nodes);
    }

    function buildHomePosts() {
        var list = document.getElementById('homePosts');
        if (!list) return;
        fetch('posts/posts.json')
            .then(function (res) { return res.json(); })
            .then(function (posts) {
                list.innerHTML = posts.slice(0, 3).map(function (p) {
                    return '<li><p class="notes__when measured">' + postDate(p) + '</p>' +
                        '<div><h3><a href="' + postHref(p) + '">' + esc(p.title) + '</a></h3>' +
                        '<p class="notes__topic"><span>' + esc(p.topic) + '</span><span>' + esc(p.readTime) + ' read</span></p></div>' +
                        '<p class="notes__dek">' + esc(p.dek) + '</p></li>';
                }).join('');
                revealLater($$('li', list));
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
                body.innerHTML = sorted.map(function (p) {
                    return '<tr data-topic="' + esc(p.topic) + '">' +
                        '<td class="lineup__when">' + postDate(p) + '</td>' +
                        '<td class="lineup__title"><a href="' + postHref(p) + '"><span class="lineup__name">' + esc(p.title) + '</span>' +
                        '<span class="lineup__by lineup__meta"><span>' + esc(p.topic) + '</span><span>' + esc(p.readTime) + ' read</span></span></a></td>' +
                        '<td class="lineup__dek">' + esc(p.dek) + '</td></tr>';
                }).join('');
                revealLater($$('tr', body));

                var topics = [];
                posts.forEach(function (p) { if (topics.indexOf(p.topic) === -1) topics.push(p.topic); });
                filtersEl.innerHTML = '<button class="chip" type="button" data-filter="all" aria-pressed="true">All</button>' +
                    topics.map(function (t) {
                        return '<button class="chip" type="button" data-filter="' + esc(t) + '" aria-pressed="false">' + esc(t) + '</button>';
                    }).join('');

                function setCount(n) { countEl.textContent = n + (n === 1 ? ' note' : ' notes'); }
                setCount(posts.length);
                tool.hidden = false;

                filtersEl.addEventListener('click', function (e) {
                    var btn = e.target.closest('.chip');
                    if (!btn) return;
                    $$('.chip', filtersEl).forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
                    var f = btn.getAttribute('data-filter');
                    var shown = [];
                    $$('tr', body).forEach(function (row) {
                        var match = f === 'all' || row.getAttribute('data-topic') === f;
                        row.classList.toggle('is-hidden', !match);
                        if (match) shown.push(row);
                    });
                    setCount(shown.length);
                    var m = motion();
                    if (m && m.filtered) m.filtered(shown);
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
        buildTrail();
        buildFilter();
        buildHomePosts();
        buildWritingPage();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
