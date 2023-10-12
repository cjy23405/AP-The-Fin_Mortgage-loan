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

    // layer
    var uiLayer = {
        zIndex: 10000,
        open: function (target, opener, speed) {
            var _ = uiLayer;
            var $html = $('html');
            var $layer = $('[data-layer="' + target + '"]');
            var timer = null;
            var hasScrollBlock = true;
            var isFocus = true;
            var isCycleFocus = true;
            var speed = typeof speed === 'number' ? speed : 350;
            var $label = null;
            var hashCode = '';
            var labelID = '';
            var $layers = $('[data-layer]');
            var $preOpenLayers = $layers.filter('.js-layer-opened').not($layer);
            var notOhterElements =
                'script, link, style, base, meta, br, [aria-hidden], [inert], .js-not-inert, .js-not-inert *, [data-ui-js], [data-layer], [data-layer] *, option, ul, dl, table, thead, tbody, tfoot, tr, colgroup, col, :empty, .popup_wrapper, .popup_wrapper *';
            var $ohterElements = $('body *').filter(function () {
                var $this = $(this);
                return !$this.is(notOhterElements) && $this.is(':visible');
            });
            var $preLayersElements = $preOpenLayers.find('*').not(notOhterElements);

            $layers.parents().each(function () {
                $ohterElements = $ohterElements.not($(this));
            });

            if ($layer.length && !$layer.hasClass('js-layer-opened')) {
                $label = $layer.find('h1, h2, h3, h4, h5, h6, p').eq(0);
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
                    return typeof val === 'boolean' ? val : true;
                })();
                isFocus = (function () {
                    var val = $layer.data('focus');
                    return typeof val === 'boolean' ? val : true;
                })();
                isCycleFocus = (function () {
                    var val = $layer.data('cycle-focus');
                    return typeof val === 'boolean' ? val : true;
                })();

                _.zIndex++;
                $layer.trigger('layerBeforeOpened').attr('role', 'dialog').attr('aria-hidden', 'true').css('visibility', 'hidden').attr('hidden', '');
                if ($label.length) {
                    labelID = (function () {
                        var id = $label.attr('id');
                        if (!(typeof id === 'string' && id.length)) {
                            id = target + '-' + hashCode;
                            $label.attr('id', id);
                        }
                        return id;
                    })();
                    $layer.attr('aria-labelledby', labelID);
                }
                $html.addClass('js-html-layer-opened js-html-layer-opened-' + target);

                $ohterElements.attr('aria-hidden', 'true').attr('inert', '').attr('data-ui-js', 'hidden');
                $preLayersElements.attr('aria-hidden', 'true').attr('inert', '').attr('data-ui-js', 'hidden');
                $preOpenLayers.attr('aria-hidden', 'true').attr('inert', '').removeAttr('aria-modal');

                if (isCycleFocus && !$layer.children('.js-loop-focus').length) {
                    $('<div class="js-loop-focus" tabindex="0"></div>')
                        .on('focusin.uiLayer', function () {
                            $layer.focus();
                        })
                        .appendTo($layer);
                }

                $layer
                    .stop()
                    .removeClass('js-layer-closed')
                    .css({
                        display: 'block',
                        zIndex: _.zIndex,
                    })
                    .animate(
                        {
                            opacity: 1,
                        },
                        speed,
                        function () {
                            if (isFocus) {
                                $layer.focus();
                            }
                            $layer.removeClass('js-layer-animated').trigger('layerAfterOpened');
                        }
                    )
                    .attr('tabindex', '0')
                    .attr('aria-hidden', 'false')
                    .attr('aria-modal', 'true')
                    .css('visibility', 'visible')
                    .removeAttr('hidden')
                    .data('layerIndex', $('.js-layer-opened').length);

                if (hasScrollBlock) {
                    scrollBlock.block();
                }

                if (Boolean(opener) && $(opener).length) {
                    $layer.data('layerOpener', $(opener));
                }

                timer = setTimeout(function () {
                    clearTimeout(timer);
                    $layer.addClass('js-layer-opened js-layer-animated').trigger('layerOpened');
                }, 0);
            }
        },
        close: function (target, speed) {
            var $html = $('html');
            var $layer = $('[data-layer="' + target + '"]');
            var $opener = $layer.data('layerOpener');
            var $allOpener = $('[data-layer-open="' + target + '"]');
            var isScrollBlock = $html.hasClass(scrollBlock.className.block);
            var timer = null;
            var speed = typeof speed === 'number' ? speed : 350;

            if ($layer.length && $layer.hasClass('js-layer-opened')) {
                if ($allOpener && $allOpener.length) {
                    $allOpener.removeClass('js-layer-opener-active');
                }

                $layer
                    .trigger('layerBeforeClosed')
                    .stop()
                    .removeClass('js-layer-opened')
                    .addClass('js-layer-closed js-layer-animated')
                    .css('display', 'block')
                    .data('layerIndex', null)
                    .attr('aria-hidden', 'true')
                    .removeAttr('aria-modal')
                    .animate(
                        {
                            opacity: 0,
                        },
                        speed,
                        function () {
                            var $ohterElements = $('body').find('[data-ui-js="hidden"]');
                            var $preOpenLayers = $('[data-layer].js-layer-opened').not($layer);
                            var $preOpenLayerHasScrollBlock = $preOpenLayers.not(function () {
                                var val = $(this).data('scroll-block');
                                return typeof val === 'boolean' ? val : false;
                            });
                            var preOpenLayersHigherZIndex = (function () {
                                var array = [];
                                $preOpenLayers.each(function () {
                                    var zIndex = $(this).css('z-index');
                                    array.push(zIndex);
                                });
                                array.sort();
                                return array[array.length - 1];
                            })();
                            var $preOpenLayer = $preOpenLayers.filter(function () {
                                var zIndex = $(this).css('z-index');

                                return zIndex === preOpenLayersHigherZIndex;
                            });
                            var $preOpenLayerOhterElements = $preOpenLayer.find('[data-ui-js="hidden"]');
                            var $openerClosest = null;

                            $(this).css('display', 'none').css('visibility', 'hidden').attr('hidden', '').removeClass('js-layer-closed');

                            $html.removeClass('js-html-layer-closed-animate js-html-layer-opened-' + target);

                            if ($preOpenLayer.length) {
                                $preOpenLayerOhterElements.removeAttr('aria-hidden').removeAttr('inert').removeAttr('data-ui-js');
                                $preOpenLayer.attr('aria-hidden', 'false').removeAttr('inert').attr('aria-modal', 'true');
                            }

                            if (!$preOpenLayers.length) {
                                $html.removeClass('js-html-layer-opened');
                                $ohterElements.removeAttr('aria-hidden').removeAttr('inert').removeAttr('data-ui-js');
                            }

                            if (!$preOpenLayerHasScrollBlock.length && isScrollBlock) {
                                scrollBlock.clear();
                            }

                            if ($opener && $opener.length) {
                                if ($preOpenLayers.length) {
                                    $openerClosest = $opener.closest($preOpenLayers);
                                    if ($openerClosest.length && $openerClosest.hasClass('js-layer-opened')) {
                                        $opener.focus();
                                    }
                                } else {
                                    $opener.focus();
                                }
                                $layer.data('layerOpener', null);
                            } else {
                                $html.attr('tabindex', '0').focus().removeAttr('tabindex');
                            }

                            $layer.removeClass('js-layer-animated').trigger('layerAfterClosed');
                        }
                    )
                    .trigger('layerClosed');

                timer = setTimeout(function () {
                    clearTimeout(timer);
                    $html.addClass('js-html-layer-closed-animate');
                }, 0);
            }
        },
        checkFocus: function (e) {
            var $layer = $('[data-layer]')
                .not(':hidden')
                .not(function () {
                    var val = $(this).data('scroll-block');
                    if (typeof val === 'boolean' && !val) {
                        return true;
                    } else {
                        return false;
                    }
                });
            var $target = $(e.target);
            var $closest = $target.closest('[data-layer]');
            var lastIndex = (function () {
                var index = 0;
                $layer.each(function () {
                    var crrI = $(this).data('layerIndex');
                    if (crrI > index) {
                        index = crrI;
                    }
                });
                return index;
            })();
            var checkLayer =
                $layer.length && !($target.is($layer) && $target.data('layerIndex') === lastIndex) && !($closest.length && $closest.is($layer) && $closest.data('layerIndex') === lastIndex);

            if (checkLayer) {
                $layer
                    .filter(function () {
                        return $(this).data('layerIndex') === lastIndex;
                    })
                    .focus();
            }
        },
    };
    window.uiJSLayer = uiLayer;

    $doc.on('focusin.uiLayer', uiLayer.checkFocus)
        .on('click.uiLayer', '[data-role="layerClose"]', function () {
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
                if (isToggle && $layer.hasClass('js-layer-opened')) {
                    uiLayer.close(layer);
                } else {
                    if (isToggle) {
                        $this.addClass('js-layer-opener-active');
                    }
                    uiLayer.open(layer);
                    $layer.data('layerOpener', $this);
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

    // common js
    function uiJSCommon($root) {
        if (!$root) {
            $root = $doc;
        }

        checkScrollbars();
        fixBarSet();
    }
    window.uiJSCommon = uiJSCommon;

    // uiJSResize
    function uiJSResize() {
        fixBarSet();
    }
    window.uiJSResize = uiJSResize;

    // area focus
    function areaFocus(area) {
        $doc.on('focus.areaFocus', area, function () {
            var $this = $(this);
            var timer = $this.data('areaFocusTimer');

            clearTimeout(timer);
            $this.addClass('isFocus').trigger('areaFocusIn');
        }).on('blur.areaFocus', area, function () {
            var $this = $(this);
            var timer = $this.data('areaFocusTimer');

            clearTimeout(timer);
            $this.data(
                'areaFocusTimer',
                setTimeout(function () {
                    $this.removeClass('isFocus').trigger('areaFocusOut');
                }, 100)
            );
        });
    }
    areaFocus('.uiInputBlock');

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
    $doc.on('focus.inputedCheck blur.inputedCheck keydown.inputedCheck keyup.inputedCheck change.inputedCheck', '.uiInputBlock__input', function () {
        inputedCheck($(this), '.uiInputBlock');
    });

    // input delete
    $doc.on('focus.inputDelete', 'input.uiInputBlock__input, textarea.uiInputBlock__input', function () {
        var $this = $(this);
        var $wrap = $this.closest('.uiInputBlock');
        var isNoDelete = $wrap.is('.uiInputBlock--noDelete');
        var type = $this.attr('type') || '';
        var isText = Boolean(type.match(/text|password|search|email|url|number|tel|date|time/)) || $this.is('textarea');
        var $delete = $wrap.find('.uiInputBlock__delete');
        var isDisabled = $this.is('[readonly]') || $this.is('[disabled]');

        if (isText && !isNoDelete) {
            if (!$delete.length && !isDisabled) {
                $wrap.addClass('isUseDelete').append('<button type="button" class="uiButton uiInputBlock__delete"><span class="forA11y">입력 내용 지우기</span></button>');
                $delete = $wrap.find('.uiInputBlock__delete');
            }

            if (isDisabled) {
                $delete.prop('disabled', true).attr('disabled', '');
            } else {
                $delete.prop('disabled', false).removeAttr('disabled', '');
            }
        }
    }).on('click.inputDelete', '.uiInputBlock__delete', function () {
        var $this = $(this);
        var $input = $this.closest('.uiInputBlock').find('.uiInputBlock__input');

        $input.val('').trigger('focus');
    });

    // layer opened scroll to start
    function layerOpenedScrollToStart($wrap, target) {
        var $scroller = $wrap.find(target);

        if ($scroller.length) {
            $scroller.scrollTop(0).scrollLeft(0);
        }
    }
    $doc.on('layerOpened.layerOpenedScrollToStart', '.layerWrap', function () {
        layerOpenedScrollToStart($(this), '.uiLayer__body');
    });

    function checkboxGroup(e) {
        var checkElem = $(e.target);
        var currentState = checkElem.is(':checked');
        var isHeader = checkElem.closest('.uiCheckBoxHeader').length == 1;
        var groupElem = checkElem.closest('.uiCheckBoxGroup');
        if (isHeader) {
            groupElem.find('.uiCheckBoxBody input[type=checkbox]').prop('checked', currentState);
        } else {
            var isCheckAll = groupElem.find('.uiCheckBoxBody input[type=checkbox]').not(':checked').length == 0;

            groupElem.find('.uiCheckBoxHeader input[type=checkbox]').prop('checked', isCheckAll);
        }
    }
    $doc.on('change.checkboxGroup', '.uiCheckBoxGroup input[type=checkbox]', function (e) {
        checkboxGroup(e);
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
