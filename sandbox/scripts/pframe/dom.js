(function (d) {
    var prototype = Array.prototype,
        push = prototype.push,
        splice = prototype.splice,
        join = prototype.join;

    var DOMTokenList = function(el) {
        var classes = el.className.replace(/^\s+|\s+$/g, '').split(/\s+/);
        this.el = el;

        for (var i = 0; i < classes.length; i++) {
            push.call(this, classes[i]);
        }
    };

    DOMTokenList.prototype = {
        add: function(token) {
            if (this.contains(token)) {
                return;
            }
            push.call(this, token);
            this.el.className = this.toString();
        },
        contains: function(token) {
            return this.el.className.indexOf(token) != -1;
        },
        item: function(index) {
            return this[index] || null;
        },
        remove: function(token) {
            if (!this.contains(token)) {
                return;
            }
            for (var i = 0; i < this.length; i++) {
                if (this[i] == token) {
                    break;
                }
            }
            splice.call(this, i, 1);
            this.el.className = this.toString();
        },
        toString: function() {
            return join.call(this, ' ');
        },
        toggle: function(token) {
            if (!this.contains(token)) {
                this.add(token);
            } else {
                this.remove(token);
            }

            return this.contains(token);
        }
    };

    var defineElementGetter = function(obj, prop, getter) {
        if (Object.defineProperty) {
            Object.defineProperty(obj, prop, { getPlatform: getter });
        } else {
            obj.__defineGetter__(prop, getter);
        }
    };

    var _init = function() {
        if (Element.prototype.isVisible === undefined) {
            Element.prototype.isVisible = function() {
                function _isVisible(el, t, r, b, l, w, h) {
                    var p = el.parentNode, VISIBLE_PADDING = 2;

                    if (!_elementInDocument(el)) {
                        return false;
                    }

                    //-- Return true for document node
                    if (9 === p.nodeType) {
                        return true;
                    }

                    //-- Return false if our element is invisible
                    if ('none' === _getStyle(el, 'display') || 'hidden' === _getStyle(el, 'visibility')) {
                        return false;
                    }

                    if ('undefined' === typeof(t) || 'undefined' === typeof(r) || 'undefined' === typeof(b) || 'undefined' === typeof(l) || 'undefined' === typeof(w) || 'undefined' === typeof(h)) {
                        t = el.offsetTop;
                        l = el.offsetLeft;
                        b = t + el.offsetHeight;
                        r = l + el.offsetWidth;
                        w = el.offsetWidth;
                        h = el.offsetHeight;
                    }

                    var windowWidth = document.body.clientWidth;
                    var windowHeight = document.body.clientHeight;
                    var boundingClientRect = el.getBoundingClientRect();
                    var isOnScreen = (boundingClientRect.left >= 0 && (boundingClientRect.left + boundingClientRect.width <= windowWidth) && boundingClientRect.top >= 0 && (boundingClientRect.top + boundingClientRect.height <= windowHeight));
                    if(!isOnScreen && el.classList.contains('nav-itm')) {
                        return false;
                    }

                    //-- If we have a parent, let's continue:
                    if (p) {
                        //-- Check if the parent can hide its children.
                        if (('hidden' === _getStyle(p, 'overflow') || 'scroll' === _getStyle(p, 'overflow'))) {
                            //-- Only check if the offset is different for the parent
                            if (//-- If the target element is to the right of the parent elm
                            l + VISIBLE_PADDING > p.offsetWidth + p.scrollLeft || //-- If the target element is to the left of the parent elm
                            l + w - VISIBLE_PADDING < p.scrollLeft || //-- If the target element is under the parent elm
                            t + VISIBLE_PADDING > p.offsetHeight + p.scrollTop || //-- If the target element is above the parent elm
                            t + h - VISIBLE_PADDING < p.scrollTop )
                            {
                                //-- Our target element is out of bounds:
                                return false;
                            }
                        }
                        //-- Add the offset parent's left/top coords to our element's offset:
                        if (el.offsetParent === p) {
                            l += p.offsetLeft;
                            t += p.offsetTop;
                        }
                        //-- Let's recursively check upwards:
                        return _isVisible(p, t, r, b, l, w, h);
                    }
                    return true;
                }

                //-- Cross browser method to get style properties:
                function _getStyle(el, property) {
                    if (window.getComputedStyle) {
                        return document.defaultView.getComputedStyle(el, null)[property];
                    }
                    if (el.currentStyle) {
                        return el.currentStyle[property];
                    }
                }

                function _elementInDocument(element) {
                    while (element = element.parentNode) {
                        if (element == document) {
                            return true;
                        }
                    }
                    return false;
                }

                return _isVisible(this);
            };
        }

        if (typeof window.Element === "undefined" || "classList" in document.documentElement) {
            return this;
        }

        window.DOMTokenList = DOMTokenList;

        defineElementGetter(Element.prototype, 'classList', function() {
            return new DOMTokenList(this);
        });

        return this;
    };

    _init();
})(document);
