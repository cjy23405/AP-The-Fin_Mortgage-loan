// ui-script.js

(function ($) {
    var userAgent = navigator.userAgent;
    var userAgentCheck = {
        ieMode: document.documentMode,
        isIos: Boolean(userAgent.match(/iPod|iPhone|iPad/)),
        isAndroid: Boolean(userAgent.match(/Android/)),
    };
    if (userAgent.match(/Edge|Edg/gi)) {
        userAgentCheck.ieMode = 'edge';
    }
    userAgentCheck.androidVersion = (function () {
        if (userAgentCheck.isAndroid) {
            try {
                var match = userAgent.match(/Android (\d+(?:\.\d+){0,2})/);
                return match[1];
            } catch (e) {
                console.log(e);
            }
        }
    })();
    window.userAgentCheck = userAgentCheck;

    // min 포함 max 불포함 랜덤 정수
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    // 랜덤 문자열
    var hashCodes = [];
    function uiGetHashCode(length) {
        var string = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var result = '';
        var stringLength = string.length;

        length = typeof length === 'number' && length > 0 ? length : 10;

        function getCode(length) {
            var code = '';
            for (var i = 0; i < length; i++) {
                code += string[getRandomInt(0, stringLength)];
            }
            if (hashCodes.indexOf(code) > -1) {
                code = getCode(length);
            }
            return code;
        }

        result = getCode(length);
        hashCodes.push(result);

        return result;
    }

    // common
    var $win = $(window);
    var $doc = $(document);

    // UiAccordion
    var UiAccordion = function (target, option) {
        var _ = this;
        var $wrap = $(target).eq(0);

        _.className = {
            opened: 'jsAccordionOpened',
            active: 'jsAccordionActive',
            animated: 'jsAccordionAnimated',
        };
        _.options = option;
        _.wrap = $wrap;
        _.init();
        _.on();
    };
    $.extend(UiAccordion.prototype, {
        init: function () {
            var _ = this;

            _.hashCode = uiGetHashCode();
            _.getElements();

            if (_.layer.length && _.item.length && _.item.filter('[data-initial-open]').length) {
                _.item.each(function () {
                    var $this = $(this);
                    if ($this.attr('data-initial-open') === 'true') {
                        _.open($this, 0);
                    }
                });
            }

            _.options.onInit();
        },
        getElements: function () {
            var _ = this;

            if (_.options.opener) {
                if (typeof _.options.opener === 'string') {
                    _.opener = _.wrap.find(_.options.opener);
                } else {
                    _.opener = _.options.opener;
                }
            }

            if (_.options.layer) {
                if (typeof _.options.layer === 'string') {
                    _.layer = _.wrap.find(_.options.layer);
                } else {
                    _.layer = _.options.layer;
                }
            }

            if (_.options.item) {
                if (typeof _.options.item === 'string') {
                    _.item = _.wrap.find(_.options.item);
                } else {
                    _.item = _.options.item;
                }
            }
        },
        on: function () {
            var _ = this;

            if (_.opener.length && _.layer.length) {
                _.opener.on('click.uiAccordion' + _.hashCode, function () {
                    _.toggle($(this).closest(_.item));
                });

                $doc.on('keydown.uiAccordion' + _.hashCode, function (e) {
                    if (e.keyCode === 9 && _.blockTabKey) {
                        e.preventDefault();
                    }
                }).on('focusin.uiAccordion' + _.hashCode, function (e) {
                    var $item = ($(e.target).is(_.layer) || $(e.target).closest(_.layer).length) && $(e.target).closest(_.item);

                    if (_.options.focusInOpen && $item) {
                        _.open($item, 0);
                    }
                });
            }
        },
        off: function () {
            var _ = this;

            if (_.opener.length && _.layer.length) {
                _.opener.off('click.uiAccordion' + _.hashCode);
                $doc.off('keydown.uiAccordion' + _.hashCode).off('focusin.uiAccordion' + _.hashCode);
            }
        },
        toggle: function ($item) {
            var _ = this;

            if ($item.hasClass(_.className.opened)) {
                _.close($item);
            } else {
                _.open($item);
            }
        },
        open: function ($item, speed) {
            var _ = this;
            var $layer = null;
            var $opener = null;
            var beforeH = 0;
            var afterH = 0;
            speed = speed instanceof Number ? Number(speed) : typeof speed === 'number' ? speed : _.options.speed;

            if (!$item.hasClass(_.className.opened)) {
                $layer = $item.find(_.layer);
                $layer.stop().css('display', 'block');
                beforeH = $layer.height();
                $layer.css('height', 'auto');
                $opener = $item.find(_.opener);
                $item.addClass(_.className.opened);
                $opener.addClass(_.className.active);
                $layer.addClass(_.className.opened);
                afterH = $layer.height();
                if (beforeH === afterH) {
                    speed = 0;
                }
                if (speed > 0) {
                    $item.addClass(_.className.animated);
                }
                $layer
                    .css('height', beforeH)
                    .animate(
                        {
                            height: afterH,
                        },
                        speed,
                        function () {
                            $item.removeClass(_.className.animated);
                            $layer
                                .css({
                                    height: 'auto',
                                })
                                .trigger('uiAccordionAfterOpened');
                        }
                    )
                    .trigger('uiAccordionOpened', [beforeH, afterH]);

                if (_.options.once) {
                    _.item.not($item).each(function () {
                        _.close($(this));
                    });
                }
            }
        },
        close: function ($item, speed) {
            var _ = this;
            var $layer = null;
            var $opener = null;
            var beforeH = 0;
            var itemBeforeH = 0;
            var afterH = 0;
            speed = speed instanceof Number ? Number(speed) : typeof speed === 'number' ? speed : _.options.speed;

            if ($item.hasClass(_.className.opened)) {
                _.blockTabKey = true;
                $layer = $item.find(_.layer);
                $layer.stop().css('display', 'block');
                beforeH = $layer.height();
                itemBeforeH = $item.height();
                $item.css('height', itemBeforeH);
                $layer.css('height', '');
                $opener = $item.find(_.opener);
                $item.removeClass(_.className.opened);
                $opener.removeClass(_.className.active);
                $layer.removeClass(_.className.opened);
                afterH = $layer.height();
                if (beforeH === afterH) {
                    speed = 0;
                }
                if (speed > 0) {
                    $item.addClass(_.className.animated);
                }
                $item.css('height', '');
                $layer
                    .css('height', beforeH)
                    .animate(
                        {
                            height: afterH,
                        },
                        speed,
                        function () {
                            $item.removeClass(_.className.animated);
                            $layer
                                .css({
                                    display: '',
                                    height: '',
                                })
                                .trigger('uiAccordionAfterClosed');
                            _.blockTabKey = false;
                        }
                    )
                    .trigger('uiAccordionClosed', [beforeH, afterH]);
            }
        },
        allClose: function () {
            var _ = this;

            _.item.each(function () {
                _.close($(this));
            });
        },
        update: function (newOptions) {
            var _ = this;

            _.off();
            $.extend(_.options, newOptions);
            _.getElements();
            _.on();
        },
    });
    $.fn.uiAccordion = function (custom) {
        var defaultOption = {
            item: null,
            opener: null,
            layer: null,
            once: false,
            speed: 500,
            focusInOpen: true,
            onInit: function () {},
        };
        var other = [];

        custom = custom || {};

        $.each(arguments, function (i) {
            if (i > 0) {
                other.push(this);
            }
        });

        this.each(function () {
            var options = {};
            var uiAccordion = this.uiAccordion;

            if (typeof custom === 'object' && !uiAccordion) {
                options = $.extend({}, defaultOption, custom);
                this.uiAccordion = new UiAccordion(this, options);
            } else if (typeof custom === 'string' && uiAccordion) {
                switch (custom) {
                    case 'allClose':
                        uiAccordion.allClose();
                        break;
                    case 'close':
                        uiAccordion.close(other[0], other[1]);
                        break;
                    case 'open':
                        uiAccordion.open(other[0], other[1]);
                        break;
                    case 'update':
                        uiAccordion.update(other[0]);
                        break;
                    default:
                        break;
                }
            }
        });

        return this;
    };

    // UiTabPanel
    var UiTabPanel = function (target, option) {
        var _ = this;
        var $wrap = $(target).eq(0);

        _.className = {
            active: 'jsTabpanelActive',
            opened: 'jsTabpanelOpened',
        };
        _.options = option;
        _.wrap = $wrap;
        _.crrTarget = '';
        _.init();
        _.on();
    };
    $.extend(UiTabPanel.prototype, {
        init: function () {
            var _ = this;
            var initialOpen = typeof _.options.initialOpen === 'string' && _.options.initialOpen;

            if (_.options.opener) {
                if (typeof _.options.opener === 'string') {
                    _.opener = _.wrap.find(_.options.opener);
                } else {
                    _.opener = _.options.opener;
                }
            }

            _.openerItems = _.opener;

            _.openerList = (function () {
                var $list = _.wrap;
                var eachBreak = false;

                if (_.opener && _.opener.length >= 2) {
                    _.opener
                        .eq(0)
                        .parents()
                        .each(function () {
                            var $this = $(this);
                            _.opener
                                .eq(1)
                                .parents()
                                .each(function () {
                                    var $secondThis = $(this);
                                    var $children = $this.children();

                                    if ($this.is($secondThis)) {
                                        $list = $this;
                                        eachBreak = true;

                                        if ($children.filter(_.opener).length <= 0) {
                                            _.openerItems = $this.children().filter(function () {
                                                if ($(this).find(_.opener).length) {
                                                    return true;
                                                } else {
                                                    return false;
                                                }
                                            });
                                        }

                                        return false;
                                    }
                                });

                            if (eachBreak) {
                                return false;
                            }
                        });
                }

                return $list;
            })();

            if (_.options.item) {
                if (typeof _.options.item === 'string') {
                    _.item = _.wrap.find(_.options.item);
                } else {
                    _.item = _.options.item;
                }
            }

            if (_.opener.length && _.item.length) {
                _.hashCode = uiGetHashCode();

                if (!initialOpen) {
                    initialOpen = _.opener.eq(0).attr('data-tab-open');
                }

                if (_.options.a11y) {
                    _.initA11y();
                }

                _.open(initialOpen, false);
            }
        },
        on: function () {
            var _ = this;
            var itemClickCheck = false;

            if (_.opener.length && _.item.length) {
                if (!_.openerItems.is(_.opener)) {
                    _.openerItems.on('click.uiTabPanel' + _.hashCode, function (e) {
                        var $this = $(this);
                        var $target = $(e.target);

                        if ($target.is($this)) {
                            itemClickCheck = true;
                            $target.find(_.opener).trigger('click');
                        }
                    });
                }
                _.opener.on('click.uiTabPanel' + _.hashCode, function (e) {
                    var $this = $(this);
                    var target = $this.attr('data-tab-open');

                    _.open(target);

                    if ($this.is('a')) {
                        e.preventDefault();
                    }

                    if (itemClickCheck) {
                        e.stopPropagation();
                        itemClickCheck = false;
                    }
                });
                $doc.on('focusin.uiTabPanel' + _.hashCode, function (e) {
                    var $panel = ($(e.target).is(_.item) && $(e.target)) || ($(e.target).closest(_.item).length && $(e.target).closest(_.item));

                    if ($panel && !$panel.is(':hidden')) {
                        _.open($panel.attr('data-tab'));
                    }
                });
                $doc.on('keydown.uiTabPanel' + _.hashCode, function (e) {
                    var keyCode = e.keyCode;
                    var isFocus = Boolean(_.openerItems.filter(':focus').length);

                    if (_.options.a11y && isFocus) {
                        if ([13, 32, 35, 36, 37, 38, 39, 40].indexOf(keyCode) > -1) {
                            e.preventDefault();
                        }
                    }
                }).on('keyup.uiTabPanel' + _.hashCode, function (e) {
                    var keyCode = e.keyCode;
                    var $focusOpener = _.openerItems.filter(':focus');
                    var isFocus = Boolean($focusOpener.length);
                    var target = isFocus ? $focusOpener.attr('data-tab-open') : '';

                    if (_.options.a11y && isFocus) {
                        switch (keyCode) {
                            case 35:
                                _.goEnd();
                                break;
                            case 36:
                                _.goStart();
                                break;
                            case 37:
                                _.prev();
                                break;
                            case 38:
                                _.prev();
                                break;
                            case 39:
                                _.next();
                                break;
                            case 40:
                                _.next();
                                break;
                            case 13:
                                _.open(target);
                                break;
                            case 32:
                                _.open(target);
                                break;
                            default:
                                break;
                        }
                    }
                });
            }
        },
        open: function (target, focus) {
            var _ = this;
            target = String(target);
            focus = focus instanceof Boolean ? (String(focus) === 'false' ? false : null) : focus;
            var $opener = _.opener.filter('[data-tab-open="' + target + '"]');
            var $panel = _.item.filter('[data-tab="' + target + '"]');

            if (!$panel.hasClass(_.className.opened)) {
                if (_.options.a11y) {
                    _.setActiveA11y(target, focus);
                }

                _.crrTarget = target;
                _.opener.not($opener).removeClass(_.className.active);
                _.item.not($panel).removeClass(_.className.opened);
                $opener.addClass(_.className.active);
                $panel.addClass(_.className.opened).trigger('uiTabPanelChange', [$opener, $panel, _.opener, _.item]);
            }
        },
        indexOpen: function (i, focus) {
            var _ = this;
            target = Number(i);
            var target = _.opener.eq(i).attr('data-tab-open');

            _.open(target, focus);
        },
        next: function () {
            var _ = this;
            var length = _.opener.length;
            var i = _.opener.index(_.opener.filter('[data-tab-open="' + _.crrTarget + '"]')) + 1;
            if (i >= length) {
                i = 0;
            }
            _.indexOpen(i);
        },
        prev: function () {
            var _ = this;
            var length = _.opener.length;
            var i = _.opener.index(_.opener.filter('[data-tab-open="' + _.crrTarget + '"]')) - 1;
            if (i < 0) {
                i = length - 1;
            }
            _.indexOpen(i);
        },
        goStart: function () {
            var _ = this;
            _.indexOpen(0);
        },
        goEnd: function () {
            var _ = this;
            _.indexOpen(_.opener.length - 1);
        },
        initA11y: function () {
            var _ = this;

            _.opener.each(function (i) {
                var $this = $(this);
                var target = $this.attr('data-tab-open');
                var $item = (function () {
                    var $item = $this.closest(_.openerItems);

                    if ($item.length) {
                        return $item;
                    } else {
                        return $this;
                    }
                })();
                var $replaceWith = $this;

                $item
                    .attr('role', 'tab')
                    .attr('id', 'tabpanel-opener-' + target + '-' + _.hashCode)
                    .attr('aria-controls', 'tabpanel-' + target + '-' + _.hashCode);

                if (!$this.is($item)) {
                    $replaceWith = $(
                        $this
                            .get(0)
                            .outerHTML.replace(/^<[a-zA-Z]+/, '<span')
                            .replace(/\/[a-zA-Z]+>$/, '/span>')
                    );

                    $this.replaceWith($replaceWith);

                    _.opener[i] = $replaceWith.get(0);
                }
            });

            _.item.each(function () {
                var $this = $(this);
                var target = $this.attr('data-tab');

                $this
                    .attr('role', 'tabpanel')
                    .attr('id', 'tabpanel-' + target + '-' + _.hashCode)
                    .attr('aria-labelledby', 'tabpanel-opener-' + target + '-' + _.hashCode);
            });

            _.openerList.attr('role', 'tablist');
        },
        setActiveA11y: function (target, focus) {
            var _ = this;

            focus = focus === false ? false : true;

            _.opener.each(function () {
                var $this = $(this);
                var crrTarget = $this.attr('data-tab-open');
                var $item = (function () {
                    var $item = $this.closest(_.openerItems);

                    if ($item.length) {
                        return $item;
                    } else {
                        return $this;
                    }
                })();

                if (crrTarget === target) {
                    $item.attr('tabindex', '0').attr('aria-selected', 'true');
                    if (focus) {
                        $item.focus();
                    }
                } else {
                    $item.attr('tabindex', '-1').attr('aria-selected', 'false');
                }
            });

            _.item.each(function () {
                var $this = $(this);
                var crrTarget = $this.attr('data-tab');

                if (crrTarget === target) {
                    $this.removeAttr('hidden');
                } else {
                    $this.attr('hidden', '');
                }
            });
        },
        addA11y: function () {
            var _ = this;

            if (!_.options.a11y) {
                _.options.a11y = true;
                _.initA11y();
                _.setActiveA11y(_.crrTarget);
            }
        },
        clearA11y: function () {
            var _ = this;

            if (_.options.a11y) {
                _.options.a11y = false;
                _.opener.removeAttr('role').removeAttr('id').removeAttr('aria-controls').removeAttr('tabindex').removeAttr('aria-selected');

                _.item.removeAttr('role').removeAttr('id').removeAttr('aria-labelledby').removeAttr('hidden');

                _.wrap.removeAttr('role');
            }
        },
    });
    $.fn.uiTabPanel = function (custom) {
        var defaultOption = {
            item: null,
            opener: null,
            initialOpen: null,
            a11y: false,
        };
        var other = [];

        custom = custom || {};

        $.each(arguments, function (i) {
            if (i > 0) {
                other.push(this);
            }
        });

        this.each(function () {
            var options = {};
            var uiTabPanel = this.uiTabPanel;

            if (typeof custom === 'object' && !uiTabPanel) {
                options = $.extend({}, defaultOption, custom);
                this.uiTabPanel = new UiTabPanel(this, options);
            } else if (typeof custom === 'string' && uiTabPanel) {
                switch (custom) {
                    case 'addA11y':
                        uiTabPanel.addA11y();
                        break;
                    case 'clearA11y':
                        uiTabPanel.clearA11y();
                        break;
                    case 'open':
                        uiTabPanel.open(other[0], other[1]);
                        break;
                    case 'indexOpen':
                        uiTabPanel.indexOpen(other[0], other[1]);
                        break;
                    case 'next':
                        uiTabPanel.next();
                        break;
                    case 'prev':
                        uiTabPanel.prev();
                        break;
                    case 'goStart':
                        uiTabPanel.goStart();
                        break;
                    case 'goEnd':
                        uiTabPanel.goEnd();
                        break;
                    default:
                        break;
                }
            }
        });

        return this;
    };

    // scrollbars width
    var scrollbarsWidth = {
        width: 0,
        set: function () {
            var _ = scrollbarsWidth;
            var $html = $('html');
            var $body = $('body');
            $html.css('overflow', 'hidden');
            var beforeW = $body.width();
            $html.css('overflow', 'scroll');
            var afterW = $body.width();
            $html.css('overflow', '');
            _.width = beforeW - afterW;
        },
    };
    function checkScrollbars() {
        var $html = $('html');
        if (Boolean(scrollbarsWidth.width) && !$html.hasClass('isScrollbarsWidth')) {
            $html.addClass('isScrollbarsWidth');
        }
    }

    // scrollBlock
    var scrollBlock = {
        scrollTop: 0,
        scrollLeft: 0,
        className: {
            block: 'isScrollBlocking',
        },
        block: function () {
            var _ = scrollBlock;
            var $html = $('html');
            var $wrap = $('#wrap');

            if (!$html.hasClass(_.className.block)) {
                scrollBlock.scrollTop = $win.scrollTop();
                scrollBlock.scrollLeft = $win.scrollLeft();

                $html.addClass(_.className.block);
                $win.scrollTop(0);
                $wrap.scrollTop(_.scrollTop);
                $win.scrollLeft(0);
                $wrap.scrollLeft(_.scrollLeft);
            }
        },
        clear: function () {
            var _ = scrollBlock;
            var $html = $('html');
            var $wrap = $('#wrap');

            if ($html.hasClass(_.className.block)) {
                $html.removeClass(_.className.block);
                $wrap.scrollTop(0);
                $win.scrollTop(_.scrollTop);
                $wrap.scrollLeft(0);
                $win.scrollLeft(_.scrollLeft);
            }
        },
        update: function (scroll) {
            var _ = scrollBlock;

            if (scroll && scroll.top) {
                _.scrollTop = scroll.top;
            }

            if (scroll && scroll.left) {
                _.scrollLeft = scroll.left;
            }
        },
    };
    window.uiJSScrollBlock = scrollBlock;

    // elFocus
    var elFocus = ($el) => {
        var setTabindex = false;

        if (!$el.attr('tabindex')) {
            $el.attr('tabindex', '0');
            setTabindex = true;
        }

        $el.focus();

        if (setTabindex) {
            $el.removeAttr('tabindex');
        }
    };

    // layer
    var uiLayer = {
        zIndex: 10000,
        classNames: {
            notInert: 'jsLayerNotInert',
            beforeLoop: 'jsLayerBeforeLoopFocus',
            afterLoop: 'jsLayerAfterLoopFocus',
            opened: 'jsLayerOpened',
            closed: 'jsLayerClosed',
            animated: 'jsLayerAnimated',
            htmlOpened: 'jsHtmlLayerOpened',
            htmlClosedAnimated: 'jsHtmlLayerClosedAnimated',
            openerActive: 'jsLayerOpenerActive',
            allOpenerActive: 'jsLayerAllOpenerActive',
        },
        open: function (target, opener, speed) {
            var _ = uiLayer;
            var $html = $('html');
            var $body = $('body');
            var $layer = $('[data-layer="' + target + '"]');
            var $layerContainer = null;
            var $layers = $('[data-layer]');
            var $label = null;
            var $inElements = null;
            var $preOpenLayers = null;
            var $preOpenLayersContainer = null;
            var $ohterElements = null;
            var $preLayersElements = null;
            var $opener = Boolean(opener) && $(opener).length ? $(opener) : null;
            var $allOpener = $('[data-layer-open="' + target + '"]');
            var timer = null;
            var hasScrollBlock = true;
            var isFocus = true;
            var isCycleFocus = true;
            var isDimClose = true;
            var speed = typeof speed === 'number' ? speed : 350;
            var hashCode = '';
            var labelID = '';
            var display = 'block';
            var notOhterElements =
                'script, link, style, base, meta, br, [aria-hidden], [inert], [data-ui-js], option, ul, dl, table, thead, tbody, tfoot, tr, colgroup, col, :empty:not([tabindex]), .uiLoading, .uiLoading *, .' +
                _.classNames.notInert +
                ', .' +
                _.classNames.notInert +
                ' *';

            if ($layer.length && !$layer.hasClass(_.classNames.opened)) {
                $layer.trigger('layerBeforeOpened');

                if (!$layer.parent().is($body)) {
                    $body.append($layer);
                }

                $layerContainer = $layer.find('.layerContainer');
                $label = $layer.find('h1, h2, h3, h4, h5, h6, p').eq(0);
                $inElements = $layer.find('[data-ui-js="hidden"]');
                $preOpenLayers = $layers.filter('.' + _.classNames.opened).not($layer);
                $preOpenLayersContainer = $preOpenLayers.find('.layerContainer');
                $ohterElements = $('body *').filter(function () {
                    var $this = $(this);
                    return !$this.is('[data-layer]') && !$this.closest('[data-layer]').length && !$this.is(notOhterElements) && $this.is(':visible');
                });
                $preLayersElements = $preOpenLayers.find('*').filter(function () {
                    var $this = $(this);
                    return !$this.is(notOhterElements);
                });
                timer = $layer.data('timer') || timer;

                hashCode = (function () {
                    var code = $layer.data('uiJSHashCode');
                    if (!(typeof code === 'string')) {
                        code = uiGetHashCode();
                        $layer.data('uiJSHashCode', code);
                    }
                    return code;
                })();
                hasScrollBlock = (function () {
                    var val = $layer.data('scroll-block');
                    return typeof val === 'boolean' ? val : hasScrollBlock;
                })();
                isFocus = (function () {
                    var val = $layer.data('focus');
                    return typeof val === 'boolean' ? val : isFocus;
                })();
                isCycleFocus = (function () {
                    var val = $layer.data('cycle-focus');
                    return typeof val === 'boolean' ? val : isCycleFocus;
                })();
                isDimClose = (function () {
                    var val = $layer.data('dim-close');
                    return typeof val === 'boolean' ? val : isDimClose;
                })();
                display = (function () {
                    var val = $layer.data('layer-display');
                    return typeof val === 'string' ? val : display;
                })();

                _.zIndex++;
                clearTimeout(timer);

                if (hasScrollBlock) {
                    scrollBlock.block();
                }

                $layer.data('layerOpener', $opener);

                $layerContainer.attr('role', 'dialog').attr('aria-hidden', 'true').css('visibility', 'hidden').attr('hidden', '');

                if ($label.length) {
                    labelID = (function () {
                        var id = $label.attr('id');
                        if (!(typeof id === 'string' && id.length)) {
                            id = target + '_' + hashCode;
                            $label.attr('id', id);
                        }
                        return id;
                    })();
                    $layerContainer.attr('aria-labelledby', labelID);
                }

                $layer.removeAttr('aria-hidden').removeAttr('inert');
                $inElements.removeAttr('aria-hidden').removeAttr('inert').removeAttr('data-ui-js');
                $ohterElements.attr('aria-hidden', 'true').attr('data-ui-js', 'hidden');
                $preLayersElements.attr('aria-hidden', 'true').attr('data-ui-js', 'hidden');
                $preOpenLayersContainer.attr('aria-hidden', 'true').attr('data-ui-js', 'hidden');
                $preOpenLayers.attr('aria-hidden', 'true');

                if (!userAgentCheck.isAndroid && !userAgentCheck.isIos) {
                    $ohterElements.attr('inert', '');
                    $preLayersElements.attr('inert', '');
                    $preOpenLayersContainer.attr('inert', '');
                    $preOpenLayers.attr('inert', '');
                }

                if (isCycleFocus) {
                    if (!$layer.children('.' + _.classNames.beforeLoop).length) {
                        $('<div class="' + _.classNames.beforeLoop + '" tabindex="0"></div>')
                            .on('focusin.uiLayer', function () {
                                var $lastChild = (function () {
                                    var $el = $layerContainer.find(':last-child');
                                    var length = $el.length;
                                    return length ? $el.eq(length - 1) : null;
                                })();

                                if ($lastChild) {
                                    elFocus($lastChild);
                                } else {
                                    $layerContainer.focus();
                                }
                            })
                            .prependTo($layer);
                    }

                    if (!$layer.children('.' + _.classNames.afterLoop).length) {
                        $('<div class="' + _.classNames.afterLoop + '" tabindex="0"></div>')
                            .on('focusin.uiLayer', function () {
                                $layerContainer.focus();
                            })
                            .appendTo($layer);
                    }
                }

                if (isDimClose) {
                    $body.off('click.uiLayer_' + target).on('click.uiLayer_' + target, function (e) {
                        var $target = $(e.target);
                        var $closest = $target.closest('[data-layer]');

                        if (!$layer.data('containerClick') && !($target.is('[data-layer]') && !$target.is($layer)) && !($closest.length && !$closest.is($layer))) {
                            uiLayer.close(target);
                        }

                        $layer.data('containerClick', false);
                    });
                    $layerContainer.off('click.uiLayer_' + target).on('click.uiLayer_' + target, function (e) {
                        $layer.data('containerClick', true);
                    });
                }

                $layer.stop().removeClass(_.classNames.closed).css({
                    display: display,
                    zIndex: _.zIndex,
                });
                $layerContainer.attr('tabindex', '0').attr('aria-hidden', 'false').attr('aria-modal', 'true').css('visibility', 'visible').removeAttr('hidden');

                timer = setTimeout(function () {
                    clearTimeout(timer);

                    if ($opener && $opener.length) {
                        $opener.addClass(_.classNames.openerActive);
                    }
                    if ($allOpener.length) {
                        $allOpener.addClass(_.classNames.allOpenerActive);
                    }

                    $html.addClass(_.classNames.htmlOpened + ' ' + _.classNames.htmlOpened + '_' + target);
                    $layer
                        .addClass(_.classNames.opened + ' ' + _.classNames.animated)
                        .animate(
                            {
                                opacity: 1,
                            },
                            speed,
                            function () {
                                if (isFocus) {
                                    $layerContainer.focus();
                                }
                                $layer.removeClass(_.classNames.animated).trigger('layerAfterOpened');
                            }
                        )
                        .trigger('layerOpened');
                }, 0);

                $layer.data('timer', timer);
            }
        },
        close: function (target, speed) {
            var _ = uiLayer;
            var $html = $('html');
            var $body = $('body');
            var $layer = $('[data-layer="' + target + '"]');
            var $layerContainer = null;
            var $opener = $layer.data('layerOpener');
            var $allOpener = $('[data-layer-open="' + target + '"]');
            var timer = null;
            var speed = typeof speed === 'number' ? speed : 350;
            var display = 'block';
            var isOpenerFocusToAfterClose = (function () {
                var val = $layer.data('opener-focus-to-after-close');
                return typeof val === 'boolean' ? val : true;
            })();

            if ($layer.length && $layer.hasClass(_.classNames.opened)) {
                $layer.trigger('layerBeforeClosed');

                $layerContainer = $layer.find('.layerContainer');
                timer = $layer.data('timer') || timer;
                display = (function () {
                    var val = $layer.data('layer-display');
                    return typeof val === 'string' ? val : display;
                })();

                clearTimeout(timer);

                $body.off('click.uiLayer_' + target);
                $layerContainer.off('click.uiLayer_' + target);

                $layer.stop().css('display', display);
                $layerContainer.attr('aria-hidden', 'true').removeAttr('aria-modal').attr('hidden', '');

                timer = setTimeout(function () {
                    clearTimeout(timer);

                    $html.addClass(_.classNames.htmlClosedAnimated);

                    if ($allOpener && $allOpener.length) {
                        $allOpener.removeClass(_.classNames.openerActive + ' ' + _.classNames.allOpenerActive);
                    }

                    $layer
                        .addClass(_.classNames.closed + ' ' + _.classNames.animated)
                        .removeClass(_.classNames.opened)
                        .animate(
                            {
                                opacity: 0,
                            },
                            speed,
                            function () {
                                var $preOpenLayers = $('[data-layer].' + _.classNames.opened).not($layer);
                                var $preOpenLayer = (function () {
                                    if (!$preOpenLayers.length) return null;

                                    var higherZIndex = (() => {
                                        var arr = [];
                                        for (var i = 0; i < $preOpenLayers.length; i++) {
                                            arr.push($preOpenLayers.eq(i).css('z-index'));
                                        }
                                        arr.sort();
                                        return arr[arr.length - 1];
                                    })();

                                    return $preOpenLayers.filter(function () {
                                        var zIndex = $(this).css('z-index');

                                        return zIndex === higherZIndex;
                                    });
                                })();
                                var $preOpenLayerContainer = $preOpenLayer && $preOpenLayer.length ? $preOpenLayer.find('.layerContainer') : null;
                                var $preOpenLayerOhterElements = $preOpenLayer ? $preOpenLayer.find('[data-ui-js="hidden"]') : null;
                                var $ohterElements = null;
                                var isPreOpenLayerHasScrollBlock = (function () {
                                    if (!$preOpenLayer || !$preOpenLayer.length) return true;

                                    var val = $preOpenLayer.data('scroll-block');

                                    return typeof val === 'boolean' ? val : true;
                                })();
                                var isScrollBlock = $html.hasClass(scrollBlock.className.block);

                                if ($preOpenLayer && $preOpenLayer.length) {
                                    $preOpenLayerOhterElements.removeAttr('aria-hidden').removeAttr('inert').removeAttr('data-ui-js');
                                    $preOpenLayerContainer.removeAttr('inert').attr('aria-hidden', 'false').attr('aria-modal', 'true');
                                    $preOpenLayer.removeAttr('aria-hidden').removeAttr('inert').removeAttr('data-ui-js');
                                } else {
                                    $ohterElements = $('body').find('[data-ui-js="hidden"]');

                                    $html.removeClass(_.classNames.htmlOpened);
                                    $ohterElements.removeAttr('aria-hidden').removeAttr('inert').removeAttr('data-ui-js');
                                }

                                if (!$preOpenLayers.length || (!isPreOpenLayerHasScrollBlock && isScrollBlock)) {
                                    scrollBlock.clear();
                                } else if (isPreOpenLayerHasScrollBlock && !isScrollBlock) {
                                    scrollBlock.block();
                                }

                                if ($opener && $opener.length) {
                                    if (isOpenerFocusToAfterClose) {
                                        if ($preOpenLayer && $preOpenLayer.length) {
                                            if ($opener.closest('[data-layer]').is($preOpenLayer)) {
                                                elFocus($opener);
                                            }
                                        } else {
                                            elFocus($opener);
                                        }
                                    }
                                    $layer.data('layerOpener', null);
                                } else {
                                    elFocus($html);
                                }

                                $html.removeClass(_.classNames.htmlClosedAnimated + ' ' + _.classNames.htmlOpened + '_' + target);
                                $layerContainer.css('visibility', 'hidden');
                                $layer
                                    .css('display', 'none')
                                    .removeClass(_.classNames.closed + ' ' + _.classNames.animated)
                                    .trigger('layerAfterClosed');
                            }
                        )
                        .trigger('layerClosed');
                }, 0);

                $layer.data('timer', timer);
            }
        },
    };
    window.uiJSLayer = uiLayer;

    $doc.on('click.uiLayer', '[data-role="layerClose"]', function () {
        var $this = $(this);
        var $layer = $this.closest('[data-layer]');
        if ($layer.length) {
            uiLayer.close($layer.attr('data-layer'));
        }
    })
        .on('click.uiLayer', '[data-layer-open]', function (e) {
            var $this = $(this);
            var layer = $this.attr('data-layer-open');
            var $layer = $('[data-layer="' + layer + '"]');
            var isToggle = (function () {
                var val = $this.data('toggle');
                return typeof val === 'boolean' ? val : false;
            })();

            if ($layer.length) {
                if (isToggle && $layer.hasClass(_.classNames.opened)) {
                    uiLayer.close(layer);
                } else {
                    if (isToggle) {
                        $this.addClass('jsLayerOpenerActive');
                    }
                    uiLayer.open(layer, $this);
                }
            }

            e.preventDefault();
        })
        .on('layerAfterOpened.uiLayer', '[data-layer-timer-close]', function () {
            var $this = $(this);
            var layer = $this.attr('data-layer');
            var delay = Number($this.attr('data-layer-timer-close'));
            var timer = setTimeout(function () {
                uiLayer.close(layer);
                clearTimeout(timer);
            }, delay);
            $this.data('layer-timer', timer);
        })
        .on('layerBeforeClosed.uiLayer', '[data-layer-timer-close]', function () {
            var $this = $(this);
            var timer = $this.data('layer-timer');
            clearTimeout(timer);
        });

    // alert
    function uiAlert(customOption) {
        var defaultOption = {
            title: '',
            message: '',
            buttons: [{}],
        };
        var defaultButtonsOption = {
            text: '확인',
            type: '', // secondary
            html: function (options, triggerClassName) {
                var html = '';
                var type = options.type.length ? 'uiBasicButton--' + options.type : '';

                html += '<button type="button" class="uiButton uiBasicButton uiBasicButton--medium ' + type + ' ' + triggerClassName + '">';
                html += '<span class="uiBasicButton__text">' + options.text + '</span>';
                html += '</button>';

                return html;
            },
            callback: function (closeFn) {
                closeFn();
            },
        };
        var options = $.extend({}, defaultOption, customOption);
        var hashCode = uiGetHashCode();
        var html = '';
        var triggerClassName = 'jsUiAlertButton';
        var $buttons = [];
        var $layer = null;
        var layerName = 'uiAlert_' + hashCode;
        var closeFn = function () {
            uiLayer.close(layerName);
        };
        var buttonsCallback = [];
        var $lastFocus = $(':focus');

        $.each(options, function (key, val) {
            if (key === 'buttons') {
                $.each(val, function (i, button) {
                    options.buttons[i] = $.extend({}, defaultButtonsOption, button);

                    var $el = $(
                        '<li class="uiButtons__item">' +
                            options.buttons[i].html(
                                {
                                    text: options.buttons[i].text,
                                    type: options.buttons[i].type,
                                },
                                triggerClassName
                            ) +
                            '</li>'
                    );

                    $el.find('.' + triggerClassName).on('click.uiAlert', function () {
                        options.buttons[i].callback(closeFn);
                    });

                    buttonsCallback[i] = function () {
                        options.buttons[i].callback(closeFn);
                    };

                    $buttons.push($el);
                });
            }
        });

        html += '<div class="layerWrap layerWrap--alert" data-layer="' + layerName + '" data-dim-close="false">';
        html += '    <div class="layerContainer">';
        html += '        <section class="uiAlert">';

        if (options.title.length || options.message.length) {
            html += '            <div class="uiAlert__body">';
            html += '                <div class="uiAlert__bodyInner">';
            if (options.title.length) {
                html += '                    <h2 class="uiAlert__title">' + options.title.replace(/\n/g, '<br />') + '</h2>';
            }
            if (options.message.length) {
                html += '                    <p class="uiAlert__message">' + options.message.replace(/\n/g, '<br />') + '</p>';
            }
            html += '                </div>';
            html += '            </div>';
        }

        html += '            <div class="uiAlert__foot">';
        html += '                <div class="uiButtons uiButtons--noMargin">';
        html += '                    <ul class="uiButtons__list"></ul>';
        html += '                </div>';
        html += '            </div>';
        html += '        </section>';
        html += '    </div>';
        html += '</div>';

        $layer = $(html);

        var $buttonList = $layer.find('.uiAlert__foot .uiButtons__list');

        $.each($buttons, function (i, $el) {
            $buttonList.append($el);
        });

        $layer.on('layerAfterClosed.uiAlert', function () {
            $layer.remove();
        });

        $('body').append($layer);

        uiLayer.open(layerName, $lastFocus);

        return {
            title: options.title,
            message: options.message,
            layerName: layerName,
            $layer: $layer,
            close: closeFn,
            clear: function () {
                uiLayer.close(layerName, 0);
            },
            buttonsCallback: buttonsCallback,
        };
    }
    window.uiJSAlert = uiAlert;

    // toast alert
    function toastAlert(wrap, message) {
        var $body = $('body');
        var $wrap = $(wrap);
        var $inner = (function () {
            var $el = $wrap.find('.uiToastAlert__inner');
            if (!$el.length) {
                $wrap.append('<div class="uiToastAlert__inner"></div>');
                $el = $wrap.find('.uiToastAlert__inner');
            }
            return $el;
        })();
        var $message = $('<p class="uiToastAlert__text" aria-role="alert" aria-live="assertive">' + message.replace(/\n/g, '<br />') + '</p>');

        if (!$wrap.parent().is($body)) {
            $body.append($wrap);
        }

        $message.css('opacity', 0);
        $inner.append($message);
        $message.animate({ opacity: 1 }, 300, function () {
            var timer = setTimeout(function () {
                $message.prop('translateY', 0).animate(
                    {
                        translateY: -100,
                        opacity: 0,
                    },
                    {
                        duration: 300,
                        step: function (now, fx) {
                            if (fx.prop === 'translateY') {
                                $message.css('transform', 'translateY(' + now + '%)');
                            }
                        },
                        complete: function () {
                            $message.remove();
                            clearTimeout(timer);
                        },
                    }
                );
            }, 3000);
        });
    }
    window.uiJSToastAlert = toastAlert;

    // loading
    var loading = {
        show: function () {
            var $body = $('body');
            var $loading = $('.uiLoading');

            if ($loading.length) {
                if (!$loading.parent().is($body)) {
                    $body.append($loading);
                }

                $loading.stop().fadeIn(300);
            } else {
                // 없으면 기본값 넣기
                let htmlTemplate = `
                <div class="uiLoading">
                    <div class="uiLoading__block">
                        <div class="uiLoading__object"></div>
                        <div class="uiLoading__text"></div>
                    </div>
                </div>
                `;
                $body.append($(htmlTemplate));
                this.show();
            }
        },
        hide: function () {
            var $loading = $('.uiLoading');

            $loading.stop().fadeOut(300);
        },
    };
    window.uiJSLoading = loading;

    // fixBarSet
    function fixBarSet() {
        var $layoutWrap = $('.layoutWrap');
        var $top = $('.fixTopWrap');
        var $fakeTop = $('.jsFakeTop');
        var $bottom = $('.fixBottomWrap');
        var $fakeBottom = $('.jsFakeBottom');
        var topH = 0;
        var bottomH = 0;
        var fakeTopH = 0;
        var fakeBottomH = 0;

        if ($top.length && !$top.is(':hidden')) {
            topH = $top.outerHeight();
            if (!$fakeTop.length) {
                $layoutWrap.prepend('<div class="jsFakeTop"></div>');
                $fakeTop = $('.jsFakeTop');
            }
            fakeTopH = $fakeTop.height();
            if (!(topH === fakeTopH)) {
                $fakeTop.height(topH);
            }
        } else {
            $('.jsFakeTop').css('height', 0);
        }

        if ($bottom.length && !$bottom.is(':hidden')) {
            bottomH = $bottom.outerHeight();
            if (!$fakeBottom.length) {
                $layoutWrap.append('<div class="jsFakeBottom"></div>');
                $fakeBottom = $('.jsFakeBottom');
            }
            fakeBottomH = $fakeBottom.height();
            if (!(bottomH === fakeBottomH)) {
                $fakeBottom.height(bottomH);
            }
        } else {
            $('.jsFakeBottom').css('height', 0);
        }
    }

    // fixBarScroll
    function fixBarScroll() {
        var $fixBar = $('.fixTopWrap, .fixBottomWrap');
        var scrollX = $('#wrap').scrollLeft() || $win.scrollLeft();

        $fixBar.css('margin-left', -scrollX);
    }

    // input disabled class
    function checkDisabledClass($root) {
        if (!$root) {
            $root = $doc;
        }

        var $inputs = $root.find('.uiInput__input');

        $inputs.each(function () {
            var $this = $(this);
            var $parent = $this.parent('.uiInput');
            var disabledClassName = 'isDisabled';
            var isDisabled = $this.is(':disabled');
            var disabledHasClass = $parent.hasClass(disabledClassName);
            var readonlyClassName = 'isReadonly';
            var isReadonly = $this.is('[readonly]');
            var readonlyHasClass = $parent.hasClass(readonlyClassName);

            if (isDisabled && !disabledHasClass) {
                $parent.addClass(disabledClassName);
            } else if (!isDisabled && disabledHasClass) {
                $parent.removeClass(disabledClassName);
            }

            if (isReadonly && !readonlyHasClass) {
                $parent.addClass(readonlyClassName);
            } else if (!isReadonly && readonlyHasClass) {
                $parent.removeClass(readonlyClassName);
            }
        });
    }

    // select
    var uiSelect = {
        init: function ($root) {
            if (!$root) {
                $root = $doc;
            }

            $root.find('[data-select-option].isSelectActive').each(function () {
                uiSelect.optionSelected($(this));
            });
        },
        optionSelected: function ($selected) {
            var name = $selected.attr('data-select-option');
            var $layer = $selected.closest('[data-layer]');
            var $input = $('[data-select-input="' + name + '"]');
            var $view = $('[data-select-view="' + name + '"]');
            var $options = $('[data-select-option="' + name + '"]');
            var selectedText = $selected.attr('data-select-text');
            var selectedVal = $selected.attr('data-select-value');

            $options.removeAttr('title').removeClass('isSelectActive');
            $selected.eq(0).attr('title', '선택됨').addClass('isSelectActive');
            $view.text(selectedText);
            $input.val(selectedVal);

            if ($layer.length) {
                uiLayer.close($layer.attr('data-layer'));
            }
        },
    };
    $doc.on('click.uiSelect', '[data-select-option]', function () {
        uiSelect.optionSelected($(this));
    });

    // checkbox group
    var checkboxGroup = {
        init: function ($root) {
            if (!$root) {
                $root = $doc;
            }
            $($root.find('[data-checkbox-group-child]').get().reverse()).each(function () {
                checkboxGroup.update($(this));
            });
        },
        on: function () {
            $doc.on('change.uiJSCheckboxGroup', '[data-checkbox-group], [data-checkbox-group-child]', function (e, eventBy) {
                checkboxGroup.update($(this), eventBy);
            });
        },
        update: function ($input, eventBy) {
            var parentName = $input.attr('data-checkbox-group');
            var childName = $input.attr('data-checkbox-group-child');

            if (typeof childName === 'string' && childName.length) {
                checkboxGroup.updateChild(childName, eventBy);
            }
            if (typeof parentName === 'string' && parentName.length) {
                checkboxGroup.updateParent(parentName, eventBy);
            }
        },
        updateParent: function (name, eventBy) {
            var $parent = $('[data-checkbox-group=' + name + ']').not('[disabled]');
            var $child = $('[data-checkbox-group-child=' + name + ']').not('[disabled]');
            var checked = $parent.is(':checked');

            if (!(typeof eventBy === 'string' && eventBy === 'checkboxGroupUpdateChild')) {
                $child.each(function () {
                    var $thisChild = $(this);
                    var beforeChecked = $thisChild.is(':checked');

                    if (checked) {
                        $thisChild.prop('checked', true).attr('checked', '');
                    } else {
                        $thisChild.prop('checked', false).removeAttr('checked');
                    }

                    var afterChecked = $thisChild.is(':checked');

                    if (beforeChecked !== afterChecked) {
                        $thisChild.trigger('change');
                    }
                });
            }
        },
        updateChild: function (name, eventBy) {
            var $parent = $('[data-checkbox-group=' + name + ']').not('[disabled]');
            var $child = $('[data-checkbox-group-child=' + name + ']').not('[disabled]');
            var length = $child.length;
            var checkedLength = $child.filter(':checked').length;

            $parent.each(function () {
                var $thisParent = $(this);
                var beforeChecked = $thisParent.is(':checked');

                if (length === checkedLength) {
                    $thisParent.prop('checked', true).attr('checked', '');
                } else {
                    $thisParent.prop('checked', false).removeAttr('checked');
                }

                var afterChecked = $thisParent.is(':checked');

                if (beforeChecked !== afterChecked) {
                    $thisParent.trigger('change', 'checkboxGroupUpdateChild');
                }
            });
        },
    };
    checkboxGroup.on();

    // area disabled
    var areaDisabled = {
        className: {
            disabled: 'isAreaDisabled',
        },
        init: function ($root) {
            if (!$root) {
                $root = $doc;
            }
            $root.find('[data-area-disabled]').each(function () {
                var $this = $(this);
                areaDisabled.eventCall($this);
            });
        },
        eventCall: function ($this) {
            var isRadio = $this.attr('type') === 'radio';
            var name = $this.attr('name');

            if (isRadio) {
                $('[name="' + name + '"]')
                    .not($this)
                    .each(function () {
                        areaDisabled.update($(this));
                    });
            }

            areaDisabled.update($this);
        },
        update: function ($input) {
            var target = $input.attr('data-area-disabled');
            var $sameInput = $('[data-area-disabled="' + target + '"]').not($input);
            var $target = $('[data-area-disabled-target="' + target + '"]');
            var selector = 'input, select, button, textarea, fieldset, optgroup';
            var isChecked = $input.is(':checked') || $sameInput.filter(':checked').length;

            if ($input.attr('data-area-disabled-type') === 'multi') {
                isChecked = $input.is(':checked') && $sameInput.length === $sameInput.filter(':checked').length;
            }

            $target.each(function () {
                var $this = $(this);
                var isReverse = $this.attr('data-area-disabled-reverse') === 'true';
                var isDisabled = isReverse ? !isChecked : isChecked;

                if (isDisabled) {
                    $this.removeClass(areaDisabled.className.disabled);
                    if ($this.is(selector)) {
                        $this.prop('disabled', false).removeAttr('disabled');
                    }
                    $this.find(selector).prop('disabled', false).removeAttr('disabled');
                } else {
                    $this.addClass(areaDisabled.className.disabled);
                    if ($this.is(selector)) {
                        $this.prop('disabled', true).attr('disabled', '');
                    }
                    $this.find(selector).prop('disabled', true).attr('disabled', '');
                }
            });

            checkDisabledClass($target);
        },
    };
    $doc.on('change.areaDisabled', '[data-area-disabled]', function () {
        var $this = $(this);
        areaDisabled.eventCall($this);
    });

    // checkbox tab
    var checkboxTab = {
        init: function ($root) {
            if (!$root) {
                $root = $doc;
            }
            $root.find('[data-checkbox-tab]:not(:checked)').each(function () {
                checkboxTab.update($(this));
            });
            $root.find('[data-checkbox-tab]:checked').each(function () {
                checkboxTab.update($(this));
            });
        },
        update: function ($input) {
            var name = $input.data('checkbox-tab');
            var $panels = $('[data-checkbox-tab-panel]');
            var $panel = $panels.filter(function () {
                var $this = $(this);
                var val = $this.attr('data-checkbox-tab-panel');
                var array = val.replace(/\s/g, '').split(',');

                return array.indexOf(name) >= 0;
            });
            var isChecked = $input.is(':checked');

            if (isChecked) {
                $panel.addClass('is-opened').show();
            } else {
                $panel.removeClass('is-opened').css('display', 'none');
            }

            $panel.trigger('checkboxTabChange');
        },
    };
    $doc.on('change.checkboxTab', '[data-checkbox-tab]', function () {
        var $this = $(this);
        var group = $this.attr('data-checkbox-tab-group');
        var $groupSiblings = $('[data-checkbox-tab-group="' + group + '"]');
        var name = $this.attr('name');
        var $siblings = $('[name="' + name + '"]').not($this);

        if (typeof group === 'string') {
            $groupSiblings.not(':checked').each(function () {
                checkboxTab.update($(this));
            });
            $groupSiblings.filter(':checked').each(function () {
                checkboxTab.update($(this));
            });
        } else {
            if ($this.is('[type="radio"]')) {
                $siblings.each(function () {
                    checkboxTab.update($(this));
                });
            }
            checkboxTab.update($this);
        }
    });

    // comma input
    var commaInput = {
        keyCode: null,
        init: function ($root) {
            if (!$root) {
                $root = $doc;
            }
            $root.find('.jsCommaInput').each(function () {
                commaInput.update($(this));
            });
        },
        update: function ($input, keyCode, eventType) {
            var _ = commaInput;

            if (eventType === 'keydown') {
                _.keyCode = keyCode;
            }

            switch (_.keyCode) {
                case 8:
                case 37:
                case 38:
                case 39:
                case 40:
                case 46:
                    if (eventType === 'keyup') {
                        _.keyCode = null;
                    }
                    return;
                default:
                    break;
            }

            _.keyCode = null;

            var el = $input.get(0);
            var val = $input.val();
            var isNegative = Boolean(val.match(/^-/g));
            var dotI = val.replace(/[^\d\.]/g, '').search(/\./g);
            var toVal = (function () {
                var v = val.replace(/[^\d]/g, '');
                var slice = '';

                if (dotI >= 0) {
                    slice = v.slice(dotI, v.length);
                    v = v.slice(0, dotI);
                }

                v = v.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

                return (isNegative ? '-' : '') + (dotI >= 0 ? v + '.' + slice : v);
            })();
            var selectionEnd = el.selectionEnd;
            var slice = (function () {
                var sliceOrigin = val.slice(selectionEnd, val.length);
                var sliceDotI = sliceOrigin.replace(/[^\d\.]/g, '').search(/\./g);
                var v = sliceOrigin.replace(/[^\d]/g, '');
                var reg = new RegExp(v + '$');
                var search = val.replace(/[^\d]/g, '').search(reg);
                var slice = null;
                var isDot = false;

                if (dotI >= 0 && search >= dotI) {
                    slice = v;
                    v = '';
                } else if (dotI >= 0 && search < dotI) {
                    slice = v.slice(sliceDotI, v.length);
                    v = v.slice(0, sliceDotI);
                    isDot = true;
                }

                v = v.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

                return isDot ? v + '.' + slice : slice ? slice : v;
            })();
            var selectionIndex = (function () {
                var reg = new RegExp(slice + '$');
                var length = slice.length;
                var search = toVal.search(reg);

                if (val.length === selectionEnd) {
                    return toVal.length + 1;
                } else if (isNegative && selectionEnd === 0) {
                    return 0;
                } else if (length) {
                    return search;
                } else {
                    return 0;
                }
            })();

            $input.val(toVal);
            el.setSelectionRange(selectionIndex, selectionIndex);
        },
    };
    $doc.on('focusin.commaInput focusout.commaInput keydown.commaInput keyup.commaInput change.commaInput input.commaInput', '.jsCommaInput', function (e) {
        commaInput.update($(this), e.keyCode, e.type);
    });

    // invalid
    $.fn.invalid = function (isInvalid, message) {
        message = typeof message === 'string' ? message : '';

        this.each(function () {
            var $this = $(this);
            var $el = (function () {
                var $uiWrap = $this.closest('.uiInput, .uiSelect');
                if ($uiWrap.length) {
                    return $uiWrap;
                } else {
                    return $this;
                }
            })();
            var $wrap = $el.closest('.uiInvalid');
            var $message = $wrap.children('.uiInvalid__message');

            if (typeof isInvalid === 'boolean' && isInvalid) {
                if (!$message.length) {
                    $message = $('<p class="uiInvalid__message" aria-role="alert" aria-live="assertive"></p>');
                    $wrap.append($message);
                }

                elFocus($this);

                $message.html(message.replace(/\n/g, '<br />'));

                $el.addClass('isInvalid');
                $wrap.addClass('isShow');
            } else {
                if ($message.length) {
                    $message.remove();
                }

                $el.removeClass('isInvalid');
                $wrap.removeClass('isShow');
            }
        });

        return $(this);
    };

    // common js
    function uiJSCommon($root) {
        if (!$root) {
            $root = $doc;
        }

        // set
        checkScrollbars();
        fixBarSet();
        checkDisabledClass($root);
        checkboxGroup.init($root);
        areaDisabled.init($root);
        checkboxTab.init($root);
        commaInput.init($root);

        // select
        uiSelect.init($root);

        // accordion
        $root.find('.jsUiAccordion').each(function () {
            var $this = $(this);
            var once = $this.attr('data-once') === 'true';
            var focusInOpen = !($this.attr('data-focus-open') === 'false');
            var filter = function () {
                var $thisItem = $(this);
                var $wrap = $thisItem.closest('.jsUiAccordion');

                if ($wrap.is($this)) {
                    return true;
                } else {
                    return false;
                }
            };
            var $items = $this.find('.jsUiAccordion__item').filter(filter);
            var $openers = $this.find('.jsUiAccordion__opener').filter(filter);
            var $layers = $this.find('.jsUiAccordion__layer').filter(filter);

            if ($this.get(0).uiAccordion) {
                $this.uiAccordion('update', {
                    item: $items,
                    opener: $openers,
                    layer: $layers,
                });
            } else {
                $this.uiAccordion({
                    item: $items,
                    opener: $openers,
                    layer: $layers,
                    once: once,
                    focusInOpen: focusInOpen,
                });
            }
        });

        // tab panel
        $root.find('.jsUiTabPanel').each(function () {
            var $this = $(this);
            var initial = $this.attr('data-initial');
            var filter = function () {
                var $thisItem = $(this);
                var $wrap = $thisItem.closest('.jsUiTabPanel');

                if ($wrap.is($this)) {
                    return true;
                } else {
                    return false;
                }
            };
            var $items = $this.find('[data-tab]').filter(filter);
            var $openers = $this.find('[data-tab-open]').filter(filter);

            $this.uiTabPanel({
                a11y: true,
                item: $items,
                opener: $openers,
                initialOpen: initial,
            });
        });
    }
    window.uiJSCommon = uiJSCommon;

    // uiJSResize
    function uiJSResize() {
        fixBarSet();
    }
    window.uiJSResize = uiJSResize;

    // area focus
    function areaFocus(area) {
        $doc.on('focusin.areaFocus', area, function () {
            var $this = $(this);
            var timer = $this.data('areaFocusTimer');

            clearTimeout(timer);

            $this.addClass('isFocus').trigger('areaFocusIn');
        }).on('focusout.areaFocus', area, function () {
            var $this = $(this);
            var timer = $this.data('areaFocusTimer');

            clearTimeout(timer);

            $this.data(
                'areaFocusTimer',
                setTimeout(function () {
                    var isFocus = $this.find(':focus').length;
                    if (!isFocus) {
                        $this.removeClass('isFocus').trigger('areaFocusOut');
                    }
                }, 100)
            );
        });
    }
    areaFocus('.uiInput');

    // inputed
    function inputedCheck($input, parent) {
        var val = $input.val();
        var $wrap = $input.closest(parent);

        if ($wrap.length) {
            if (typeof val === 'string' && val.length > 0) {
                $wrap.addClass('isInputed');
            } else {
                $wrap.removeClass('isInputed');
            }
        }
    }
    $doc.on('focusin.inputedCheck focusout.inputedCheck keydown.inputedCheck keyup.inputedCheck change.inputedCheck input.commaInput', '.uiInput__input', function (e) {
        inputedCheck($(this), '.uiInput');
    });

    // input delete
    $doc.on('focusin.inputDelete', 'input.uiInput__input, textarea.uiInput__input', function () {
        var $this = $(this);
        var $wrap = $this.closest('.uiInput');
        var isNoDelete = $wrap.is('.uiInput--noDelete');
        var type = $this.attr('type') || '';
        var isText = Boolean(type.match(/text|password|search|email|url|number|tel|date|time/)) || $this.is('textarea');
        var $delete = $wrap.find('.uiInput__delete');
        var isDisabled = $this.is('[readonly]') || $this.is('[disabled]');

        if (isText && !isNoDelete) {
            if (!$delete.length && !isDisabled) {
                $wrap.addClass('isUseDelete').append('<button type="button" class="uiButton uiInput__delete"><span class="forA11y">입력 내용 지우기</span></button>');
                $delete = $wrap.find('.uiInput__delete');
            }

            if (isDisabled) {
                $delete.prop('disabled', true).attr('disabled', '');
            } else {
                $delete.prop('disabled', false).removeAttr('disabled', '');
            }
        }
    }).on('click.inputDelete', '.uiInput__delete', function () {
        var $this = $(this);
        var $input = $this.closest('.uiInput').find('.uiInput__input');

        $input.val('').focus();
    });

    // layer opened scroll to start
    function layerOpenedScrollToStart($wrap, target) {
        var $scroller = $wrap.find(target);

        if ($scroller.length) {
            $scroller.scrollTop(0).scrollLeft(0);
        }
    }
    $doc.on('layerOpened.layerOpenedScrollToStart', '.layerWrap', function () {
        var $this = $(this);

        $this.scrollTop(0).scrollLeft(0);
        layerOpenedScrollToStart($this, '.toastLayer__body');
    });

    // dom ready
    $(function () {
        var $html = $('html');
        var $body = $('body');

        scrollbarsWidth.set();

        // css set
        if (scrollbarsWidth.width > 0) {
            $body.prepend(
                '<style type="text/css">' +
                    '.isScrollBlocking.isScrollbarsWidth #wrap {' +
                    'margin-right: ' +
                    scrollbarsWidth.width +
                    'px;' +
                    '}\n' +
                    '.isScrollBlocking.isScrollbarsWidth .fixTopWrap {' +
                    'right: ' +
                    scrollbarsWidth.width +
                    'px;' +
                    '}\n' +
                    '.isScrollBlocking.isScrollbarsWidth .fixBottomWrap {' +
                    'right: ' +
                    scrollbarsWidth.width +
                    'px;' +
                    '}' +
                    '</style>'
            );
        }

        // init
        uiJSCommon();
        fixBarScroll();

        // resize
        uiJSResize();
    });

    // win load, scroll, resize
    $win.on('load.uiJS', function () {
        uiJSResize();
    })
        .on('scroll.uiJS', function () {
            fixBarScroll();
        })
        .on('resize.uiJS', function () {
            uiJSResize();
            fixBarScroll();
        })
        .on('orientationchange.uiJS', function () {
            uiJSResize();
            fixBarScroll();
        });
})(jQuery);
