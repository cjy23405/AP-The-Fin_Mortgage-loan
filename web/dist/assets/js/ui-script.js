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
            var timer = null;
            var hasScrollBlock = true;
            var isFocus = true;
            var isCycleFocus = true;
            var speed = typeof speed === 'number' ? speed : 350;
            var hashCode = '';
            var labelID = '';
            var display = 'block';
            var notOhterElements =
                'script, link, style, base, meta, br, [aria-hidden], [inert], .jsNotInert, .jsNotInert *, [data-ui-js], option, ul, dl, table, thead, tbody, tfoot, tr, colgroup, col, :empty:not([tabindex])';

            if ($layer.length && !$layer.hasClass('jsLayerOpened')) {
                $layer.trigger('layerBeforeOpened');

                if (!$layer.parent().is($body)) {
                    $body.append($layer);
                }

                $layerContainer = $layer.find('.layerContainer');
                $label = $layer.find('h1, h2, h3, h4, h5, h6, p').eq(0);
                $inElements = $layer.find('[data-ui-js="hidden"]');
                $preOpenLayers = $layers.filter('.jsLayerOpened').not($layer);
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
                display = (function () {
                    var val = $layer.data('layer-display');
                    return typeof val === 'string' ? val : display;
                })();

                _.zIndex++;
                clearTimeout(timer);

                if (hasScrollBlock) {
                    scrollBlock.block();
                }

                if (Boolean(opener) && $(opener).length) {
                    $layer.data('layerOpener', $(opener));
                }

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
                    if (!$layer.children('.jsLayerBeforeLoopFocus').length) {
                        $('<div class="jsLayerBeforeLoopFocus" tabindex="0"></div>')
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

                    if (!$layer.children('.jsLayerAfterLoopFocus').length) {
                        $('<div class="jsLayerAfterLoopFocus" tabindex="0"></div>')
                            .on('focusin.uiLayer', function () {
                                $layerContainer.focus();
                            })
                            .appendTo($layer);
                    }
                }

                $layer.stop().removeClass('jsLayerClosed').css({
                    display: display,
                    zIndex: _.zIndex,
                });
                $layerContainer.attr('tabindex', '0').attr('aria-hidden', 'false').attr('aria-modal', 'true').css('visibility', 'visible').removeAttr('hidden');

                timer = setTimeout(function () {
                    clearTimeout(timer);

                    $html.addClass('jsHtmlLayerOpened jsHtmlLayerOpened_' + target);
                    $layer
                        .addClass('jsLayerOpened jsLayerAnimated')
                        .animate(
                            {
                                opacity: 1,
                            },
                            speed,
                            function () {
                                if (isFocus) {
                                    $layerContainer.focus();
                                }
                                $layer.removeClass('jsLayerAnimated').trigger('layerAfterOpened');
                            }
                        )
                        .trigger('layerOpened');
                }, 0);

                $layer.data('timer', timer);
            }
        },
        close: function (target, speed) {
            var $html = $('html');
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

            if ($layer.length && $layer.hasClass('jsLayerOpened')) {
                $layer.trigger('layerBeforeClosed');

                $layerContainer = $layer.find('.layerContainer');
                timer = $layer.data('timer') || timer;
                display = (function () {
                    var val = $layer.data('layer-display');
                    return typeof val === 'string' ? val : display;
                })();

                clearTimeout(timer);

                $layer.stop().css('display', display);
                $layerContainer.attr('aria-hidden', 'true').removeAttr('aria-modal').attr('hidden', '');

                timer = setTimeout(function () {
                    clearTimeout(timer);

                    $html.addClass('jsHtmlLayerClosedAnimate');

                    if ($allOpener && $allOpener.length) {
                        $allOpener.removeClass('jsLayerOpenerActive');
                    }

                    $layer
                        .addClass('jsLayerClosed jsLayerAnimated')
                        .removeClass('jsLayerOpened')
                        .animate(
                            {
                                opacity: 0,
                            },
                            speed,
                            function () {
                                var $preOpenLayers = $('[data-layer].jsLayerOpened').not($layer);
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

                                    $html.removeClass('jsHtmlLayerOpened');
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

                                $html.removeClass('jsHtmlLayerClosedAnimate jsHtmlLayerOpened_' + target);
                                $layerContainer.css('visibility', 'hidden');
                                $layer.css('display', 'none').removeClass('jsLayerClosed jsLayerAnimated').trigger('layerAfterClosed');
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
                if (isToggle && $layer.hasClass('jsLayerOpened')) {
                    uiLayer.close(layer);
                } else {
                    if (isToggle) {
                        $this.addClass('jsLayerOpenerActive');
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

        html += '<div class="layerWrap layerWrap--alert" data-layer="' + layerName + '">';
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
