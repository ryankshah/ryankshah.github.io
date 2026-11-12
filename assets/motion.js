(function () {
    'use strict';
    var gsap = window.gsap;
    if (!gsap || !window.ScrollTrigger) return;

    var ST = window.ScrollTrigger;
    var Split = window.SplitText || null;
    gsap.registerPlugin(ST);
    if (Split) gsap.registerPlugin(Split);
    window.__motionReady = true;

    function $(sel, root) { return (root || document).querySelector(sel); }
    function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

    var mm = gsap.matchMedia();

    mm.add({ ok: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' }, function (ctx) {
        var ok = ctx.conditions.ok;
        var dist = ok ? 24 : 0;
        var dur = ok ? 0.9 : 0.2;

        function reveal(els, opts) {
            opts = opts || {};
            gsap.fromTo(els, { opacity: 0, y: dist }, {
                opacity: 1, y: 0, duration: dur, ease: 'power3.out',
                stagger: ok ? (opts.stagger || 0.08) : 0, overwrite: 'auto', clearProps: 'transform', delay: opts.delay || 0
            });
        }

        window.__motion = {

            watch: function (nodes) {
                nodes.forEach(function (el) {
                    ST.create({ trigger: el, start: 'top 92%', once: true, onEnter: function () { reveal(el); } });
                });
            },

            filtered: function (rows) {
                gsap.fromTo(rows, { opacity: 0, y: ok ? 10 : 0 }, { opacity: 1, y: 0, duration: ok ? 0.45 : 0.15, ease: 'power3.out', stagger: ok ? 0.035 : 0, overwrite: 'auto', clearProps: 'transform' });
            }
        };

        function start() {

            if (document.documentElement.classList.contains('no-wait')) return;

            var h1 = $('.hero h1');
            if (h1) {
                if (ok && Split) {
                    Split.create(h1, {
                        type: 'lines', mask: 'lines', autoSplit: true,
                        onSplit: function (self) {
                            gsap.set(h1, { opacity: 1 });
                            return gsap.from(self.lines, { yPercent: 115, duration: 1.1, ease: 'power4.out', stagger: 0.09, delay: 0.1 });
                        }
                    });
                } else {
                    gsap.to(h1, { opacity: 1, duration: 0.2 });
                }
            }

            var rises = $$('[data-rise]');
            if (rises.length) {
                gsap.fromTo(rises, { opacity: 0, y: ok ? 16 : 0 }, { opacity: 1, y: 0, duration: ok ? 0.9 : 0.2, ease: 'power3.out', stagger: ok ? 0.12 : 0, delay: ok ? 0.55 : 0, clearProps: 'transform' });
            }

            var portrait = $('#portrait');
            if (portrait) {
                var img = $('img', portrait);
                if (ok) {
                    var ptl = gsap.timeline({ delay: 0.25, defaults: { ease: 'power3.out' } });
                    ptl.fromTo(portrait, { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 1.1, clearProps: 'transform' })
                       .fromTo(img, { scale: 1.2 }, { scale: 1.05, duration: 1.8, ease: 'power3.out' }, 0);

                    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
                        var xTo = gsap.quickTo(img, 'x', { duration: 0.9, ease: 'power3' });
                        var yTo = gsap.quickTo(img, 'y', { duration: 0.9, ease: 'power3' });
                        var hero = $('.hero');
                        hero.addEventListener('pointermove', function (e) {
                            var r = hero.getBoundingClientRect();
                            xTo(((e.clientX - r.left) / r.width - 0.5) * -22);
                            yTo(((e.clientY - r.top) / r.height - 0.5) * -22);
                        });
                        hero.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
                    }
                } else {
                    gsap.to(portrait, { opacity: 1, duration: 0.2 });
                }
            }

            if ($('#progress')) {
                gsap.fromTo('#progress', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: ok ? 0.3 : true } });
            }

            $$('.section__head, .creds__head').forEach(function (head) {
                gsap.set(head, { opacity: 1 });
                var h = $('h2', head);
                var rest = $$(':scope > :not(h2)', head);
                var trig = { trigger: head, start: 'top 85%', once: true };
                if (ok && Split && h) {
                    Split.create(h, {
                        type: 'lines', mask: 'lines', autoSplit: true,
                        onSplit: function (self) {
                            return gsap.from(self.lines, { yPercent: 115, duration: 1, ease: 'power4.out', stagger: 0.08, scrollTrigger: trig });
                        }
                    });
                    if (rest.length) gsap.from(rest, { opacity: 0, y: 14, duration: 0.9, ease: 'power3.out', delay: 0.15, scrollTrigger: trig });
                } else {
                    gsap.from(head.children, { opacity: 0, duration: 0.2, scrollTrigger: trig });
                }
            });

            var generic = $$('[data-reveal]').filter(function (el) {
                return !el.classList.contains('section__head') && !el.classList.contains('creds__head') && !el.closest('#homePosts') && !el.closest('#postList');
            });
            generic.forEach(function (el) {
                ST.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () { reveal(el); } });
            });

            var statement = $('#statement');
            if (ok && statement && Split) {
                Split.create(statement, {
                    type: 'words', autoSplit: true,
                    onSplit: function (self) {
                        return gsap.fromTo(self.words, { opacity: 0.18 }, {
                            opacity: 1, ease: 'none', stagger: 0.12,
                            scrollTrigger: { trigger: statement, start: 'top 80%', end: 'bottom 50%', scrub: 0.6 }
                        });
                    }
                });
            }

            var trail = $('#trail');
            if (trail) {
                var items = $$('.trail__item', trail);
                if (ok) {
                    gsap.fromTo('.trail__spine', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: trail, start: 'top 75%', end: 'bottom 65%', scrub: 0.5 } });
                    gsap.set(items, { opacity: 0, '--tick': 0 });
                } else {
                    gsap.set(items, { opacity: 0 });
                }
                ST.batch(items, {
                    start: 'top 92%', once: true,
                    onEnter: function (batch) {
                        gsap.to(batch, { opacity: 1, '--tick': 1, y: 0, duration: ok ? 0.8 : 0.2, ease: 'power3.out', stagger: ok ? 0.1 : 0, overwrite: 'auto' });
                    }
                });
                if (ok) gsap.set(items, { y: 18 });
            }

            var reading = $('#pubReading');
            if (ok && reading) {
                var target = parseInt(reading.textContent, 10) || 0;
                var counter = { n: 0 };
                reading.textContent = '0';
                gsap.to(counter, {
                    n: target, duration: 1.4, ease: 'power3.out', snap: { n: 1 },
                    onUpdate: function () { reading.textContent = String(counter.n); },
                    scrollTrigger: { trigger: reading, start: 'top 90%', once: true }
                });
            }

            var caps = $('.caps');
            if (ok && caps) {
                gsap.from($$('.cap li', caps), { opacity: 0, y: 8, duration: 0.6, ease: 'power3.out', stagger: 0.025, scrollTrigger: { trigger: caps, start: 'top 80%', once: true } });
            }

            var flow = $('#flow');
            if (ok && flow) {
                gsap.fromTo($$('li', flow), { opacity: 0, '--tick': 0 }, { opacity: 1, '--tick': 1, duration: 0.7, ease: 'power3.out', stagger: 0.28, scrollTrigger: { trigger: flow, start: 'top 80%', once: true } });
            }

            ST.refresh();
        }

        var started = false;
        function once() { if (started) return; started = true; start(); }
        if (document.fonts && document.fonts.ready) { document.fonts.ready.then(once); setTimeout(once, 600); }
        else once();
    });
})();
