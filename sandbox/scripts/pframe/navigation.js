(function (d) {
    var navCur = null, container = null, savedNavs = [], paused = 0;
    var navigation = {};

    navigation.areaSelector = '.nav-itm';
    navigation.highlightClass = 'focused';
    navigation.phantomSelector = '[data-nav-phantom]';

    navigation.getNavs = function(navContainer) {
        navContainer = navContainer || container;

        var items = navContainer.querySelectorAll(this.areaSelector);
        var navs = [];

        for (var i = 0, len = items.length; i < len; i++) {
            var item = items[i];

            if (item.isVisible() && !item.classList.contains('active')) { navs.push(item); }
        }

        return navs;
    };
    navigation.current = function(elem, fireMouseOver) {
        var length, phantom, toshibaNav = null;

        if (!elem || elem === 'none') { return navCur; }

        phantom = elem.getAttribute('data-nav-phantom');

        if (phantom) {
            elem = d.querySelector(phantom);
        }

        length = elem.length;

        if (length !== undefined) {
            if (length > 1) { throw new Error('Focused element must be only one!'); }
            if (!length) { return navCur; }
        }

        if (navCur) {
            /* TODO: remove isNested() */
            if (!this.isNested(elem, navCur)) {
                if(pframe.platform === 'phn' || pframe.platform === 'tsh'){
                    toshibaNav = navCur;
                    toshibaNav.classList.remove(navigation.highlightClass);
                } else {
                    navCur.classList.remove(this.highlightClass);
                }
            }

            if (navCur.classList.contains('videos-fltr-chooser-lst-itm') && !elem.classList.contains('videos-fltr-chooser-lst-itm')) {
                navCur.classList.add('active');
            }
            if (!navCur.classList.contains('videos-fltr-chooser-lst-itm')) {
                if (elem.classList.contains('videos-fltr-chooser-lst-itm') || elem.classList.contains('videos-fltr-chooser-scroll-up') || elem.classList.contains('videos-fltr-chooser-scroll-down')) {
                    elem = d.querySelector('.videos-fltr-chooser').querySelector('.active') || elem;

                    if (elem.classList.contains('active')) {
                        fireMouseOver = false;
                        elem.classList.remove('active');
                    }
                }
            }

            if (navCur.classList.contains('screen-keyboard-text')) {
                navCur.blur();
            }
            /*if (navCur.nodeName.toLowerCase() === 'textarea' || (navCur.nodeName.toLowerCase() === 'input' && (navCur.type === 'text' || navCur.type === 'password'))) { navCur.blur(); }*/
        }

        elem.classList.add(this.highlightClass);

        /* TODO: some kind of dirty hack */
        if (elem.classList.contains('videos-fltr-chooser-lst-itm') && fireMouseOver) {
            if ('createEvent' in d) {
                var event = d.createEvent('MouseEvents');
                event.initEvent('mouseover', true, false);
                elem.dispatchEvent(event);
            } else if (elem.fireEvent) {
                elem.fireEvent('onmouseover');
            }
        }
        /*if (elem.nodeName.toLowerCase() === 'textarea' || (elem.nodeName.toLowerCase() === 'input' && (elem.type === 'text' || elem.type === 'password'))) { elem.focus(); }*/
        if (elem.classList.contains('screen-keyboard-text')) {
            elem.focus();
        }

        return navCur = elem;
    };
    navigation.isPaused = function() {
        return !!paused;
    };
    navigation.pause = function() {
        paused++;
    };
    navigation.resume = function(force) {
        paused--;

        if (paused < 0 || force) { paused = 0; }
    };
    navigation.save = function() {
        savedNavs.push({
            navCur        : navCur,
            areaSelector  : this.areaSelector,
            highlightClass: this.highlightClass,
            container     : container
        });
    };
    navigation.restore = function() {
        if (savedNavs.length) {
            this.off();
            var foo = savedNavs.pop();
            this.areaSelector = foo.areaSelector;
            this.highlightClass = foo.highlightClass;
            return this.on(foo.container, foo.navCur);
        }
    };
    navigation.on = function(cont, cur) {
        this.off();

        container = cont ? cont : d.body;

        if (!cur) { cur = this.getNavs()[0]; }

        return this.current(cur, true);
    };
    navigation.off = function() {
        if (navCur) {
            navCur.classList.remove(this.highlightClass);
        }

        navCur = null;
    };
    navigation.checkUserDefined = function(elem, dir) {
        var ep = elem.getAttribute('data-nav_ud'), res = elem.getAttribute('data-nav_ud_' + dir), result = false;

        if (!ep && !res) { return false; }

        if (!res) {
            var sides = ep.split(','), dirs = ['up', 'right', 'down', 'left'];

            elem.setAttribute('data-nav_ud_up', sides[0]);
            elem.setAttribute('data-nav_ud_right', sides[1]);
            elem.setAttribute('data-nav_ud_down', sides[2]);
            elem.setAttribute('data-nav_ud_left', sides[3]);

            res = sides[dirs.indexOf(dir)];
        }

        if (res == 'none') {
            result = 'none';
        } else if (res === '0') {
            result = false;
        } else if (res) {
            result = d.querySelector(res);
        }

        return result;
    };
    navigation.checkEntryPoint = function(elem, dir) {
        var ep = elem.getAttribute('data-nav_ep'), res = elem.getAttribute('data-nav_ep_' + dir);

        if (!ep) { return true; }

        if (res === null) {
            var sides = ep.split(',');

            elem.setAttribute('data-nav_ep_up', sides[0]);
            elem.setAttribute('data-nav_ep_right', sides[1]);
            elem.setAttribute('data-nav_ep_down', sides[2]);
            elem.setAttribute('data-nav_ep_left', sides[3]);

            res = elem.getAttribute('data-nav_ep_' + dir);
        }

        return !!parseInt(res);
    };
    navigation.findNav = function(elem, dir, navs) {
        var user_defined = this.checkUserDefined(elem, dir);

        if (user_defined) { return user_defined; }

        var objBounds = elem.getBoundingClientRect(), arr = [], curBounds = null, cond1, cond2, i, l;

        for (i = 0, l = navs.length; i < l; i++) {
            curBounds = navs[i].getBoundingClientRect();

            if (curBounds.left == objBounds.left && curBounds.top == objBounds.top) { continue; }

            switch (dir) {
                case 'left':
                    cond1 = objBounds.left > curBounds.left;
                    break;
                case 'right':
                    cond1 = objBounds.right < curBounds.right;
                    break;
                case 'up':
                    cond1 = objBounds.top > curBounds.top;
                    break;
                case 'down':
                    cond1 = objBounds.bottom < curBounds.bottom;
                    break;
                default:
                    break;
            }

            if (cond1) {
                arr.push({
                    'obj'   : navs[i],
                    'bounds': curBounds
                });
            }
        }

        var min_dy = 9999999, min_dx = 9999999, min_d = 9999999, max_intersection = 0;
        var dy = 0, dx = 0, d = 0;

        function isIntersects(b1, b2, dir) {
            var temp = null;

            switch (dir) {
                case 'left':
                case 'right':
                    if (b1.top > b2.top) {
                        temp = b2;
                        b2 = b1;
                        b1 = temp;
                    }
                    if (b1.bottom > b2.top) {
                        if (b1.top > b2.right) {
                            return b2.top - b1.right;
                        } else {
                            return b2.height;
                        }
                    }
                    break;
                case 'up':
                case 'down':
                    if (b1.left > b2.left) {
                        temp = b2;
                        b2 = b1;
                        b1 = temp;
                    }
                    if (b1.right > b2.left) {
                        if (b1.left > b2.right) {
                            return b2.left - b1.right;
                        } else {
                            return b2.width;
                        }
                    }
                    break;
                default:
                    break;
            }
            return false;
        }

        var intersects_any = false;
        var found = false;

        for (i = 0, l = arr.length; i < l; i++) {
            if (!this.checkEntryPoint(arr[i].obj, dir)) { continue; }

            var b = arr[i].bounds;
            var intersects = isIntersects(objBounds, b, dir);
            dy = Math.abs(b.top - objBounds.top);
            dx = Math.abs(b.left - objBounds.left);
            d = Math.sqrt(dy * dy + dx * dx);
            if (intersects_any && !intersects) { continue; }
            if (intersects && !intersects_any) {
                min_dy = dy;
                min_dx = dx;
                max_intersection = intersects;
                found = arr[i].obj;
                intersects_any = true;
                continue;
            }

            switch (dir) {
                case 'left':
                case 'right':
                    if (intersects_any) {
                        cond2 = dx < min_dx || (dx == min_dx && dy < min_dy);
                    } else {
                        cond2 = dy < min_dy || (dy == min_dy && dx < min_dx);
                    }
                    break;
                case 'up':
                case 'down':
                    if (intersects_any) {
                        cond2 = dy < min_dy || (dy == min_dy && dx < min_dx);
                    } else {
                        cond2 = dx < min_dx || (dx == min_dx && dy < min_dy);
                    }
                    break;
                default:
                    break;
            }
            if (cond2) {
                min_dy = dy;
                min_dx = dx;
                min_d = d;
                found = arr[i].obj;
            }
        }

        return found;
    };
    navigation.isNested = function(elem, parent) {
        var node = elem.parentNode;

        while (node && node != d) {
            if (node == parent) {
                return true;
            }

            node = node.parentNode;
        }

        return false;
    };
    navigation.hoverHandler = function(e) {
        var target = e.target, parent = target.parentNode, newTarget = (target.classList.contains('nav-itm') || parent.nodeName === 'HTML') ? target : target.parentNode;

        if (!target.isVisible()) {
            return;
        }

        if (newTarget && newTarget.classList && newTarget.classList.contains('nav-itm') && !newTarget.classList.contains('active')) {
            navigation.current(newTarget, false);
        }

        return this;
    };
    navigation.directionHandler = function(dir) {
        if (paused || !navCur) { return; }

        var parent = navCur.parentNode, loop = parent.getAttribute('data-nav_loop') || 'none', children = parent.querySelectorAll(this.areaSelector), firstChild, lastChild, child, navs, n, i;

        if (dir === 'up' && navCur.classList.contains('up-button')) {
            radio('app.nav.enter').broadcast();
            return;
        }
        if (dir === 'down' && navCur.classList.contains('down-button')) {
            radio('app.nav.enter').broadcast();
            return;
        }

        for (i = 0; i < children.length; i++) {
            child = children[i];

            if (!child.classList.contains('active') && child.isVisible()) {
                firstChild = child;
                break;
            }

            firstChild = children[0];
        }

        for (i = children.length - 1; i >= 0; i--) {
            child = children[i];

            if (!child.classList.contains('active') && child.isVisible()) {
                lastChild = child;
                break;
            }

            lastChild = children[children.length - 1];
        }

        if (((loop === 'h' && dir === 'left') || (loop === 'v' && dir === 'up')) && navCur === firstChild) {
            navs = this.getNavs();
            n = lastChild;
        } else if (((loop === 'h' && dir === 'right') || (loop === 'v' && dir === 'down')) && navCur === lastChild) {
            navs = this.getNavs();
            n = firstChild;
        } else {
            navs = this.getNavs();
            n = this.findNav(navCur, dir, navs);
        }

        n && this.current(n, true);
    };
    navigation.enterHandler = function(e) {
        if (paused || !navCur) { return; }

        if (navCur) {
            pframe.key.fireClick(navCur);
        }
    };

    navigation._init = function() {
        var self = this;

        self.on();
        d.addEventListener('mouseover', self.hoverHandler);

        radio('app.nav.up').subscribe(function() {
            self.directionHandler('up');
        });
        radio('app.nav.down').subscribe(function() {
            self.directionHandler('down');
        });
        radio('app.nav.right').subscribe(function() {
            self.directionHandler('right');
        });
        radio('app.nav.left').subscribe(function() {
            self.directionHandler('left');
        });
        radio('app.nav.enter').subscribe(function() {
            self.enterHandler();
        });

        return this;
    };

    if (window.pframe == null) {
        window.pframe = {}
    }
    window.pframe.nav = navigation._init();
})(document);
