// guide-script.js

(function ($) {
    // common
    var $win = $(window);
    var $doc = $(document);

    // index
    var guideIndex = window.guideIndex || null;
    var index = {
        timer: null,
        dates: [],
        count: {
            total: 0,
        },
        resize: function () {
            var $nav = $('#guideIndexNav');

            if (!$nav.length) return;

            var $navBlock = $nav.find('._guideIndexNav__block');

            $nav.height($navBlock.outerHeight());
        },
        scroll: function () {
            var $nav = $('#guideIndexNav');

            if (!$nav.length) return;

            var $navBlock = $nav.find('._guideIndexNav__block');
            var scrollLeft = $win.scrollLeft();

            $navBlock.css('margin-left', -scrollLeft + 'px');
        },
        render: function () {
            guideIndex = window.guideIndex || null;

            if (!guideIndex) return;

            var $title = $('title');
            var $headerTitle = $('._guideHeader__titleLink');
            var $datas = $('#guideIndexDatas');
            var $complete = $('#guideIndexCompleteRate');
            var $total = $('#guideIndexTotalCount');
            var $counts = $('[data-index-count]');
            var $nav = $('#guideIndexNav');
            var $navList = $nav.find('._guideIndexNav__list');
            var html = index.makeHtml();

            $title.text(guideIndex.title);
            $headerTitle.text(guideIndex.title);
            $datas.html(html.data);
            $navList.append(html.nav);

            if (index.dates.length) {
                index.dates.sort();

                $datas.find('[data-date="' + index.dates[index.dates.length - 1] + '"]').each(function () {
                    var $this = $(this);
                    var $row = $this.closest('tr');

                    $this.addClass('isEmphasis');
                    $row.addClass('isEmphasis');
                });
            }

            $complete.text(((100 / index.count.total) * index.count.end).toFixed(2) + ' %');
            $total.text(index.count.total);

            $counts.each(function () {
                var $this = $(this);
                var name = $this.attr('data-index-count');
                var val = 0;

                if (index.count[name]) {
                    val = index.count[name];
                }

                $this.text(val);
            });
        },
        makeHtml: function () {
            var head = guideIndex.head;
            var data = guideIndex.data;
            var headLength = head.length;
            var html = '';
            var colHtml = '';
            var headHtml = '';
            var navHtml = '';

            colHtml += '          <col style="width: 50px" />';
            headHtml += '          <th class="_guideIndexTable__no">No</th>';

            for (var h = 0; h < headLength; h++) {
                colHtml += '          <col style="' + (head[h].width ? 'width: ' + head[h].width : '') + '" />';
                headHtml += '          <th class="_guideIndexTable__' + head[h].name + '">' + head[h].text + '</th>';
            }

            for (var s = 0; s < data.length; s++) {
                html += '<section class="_guideIndexSection" id="guideIndexSection' + s + '">';
                html += '  <h2 class="_guideIndexSection__title">' + data[s].depth1 + '</h2>';
                html += '  <div class="_guideIndexTable">';
                html += '    <table>';
                html += '      <colgroup>';
                html += colHtml;
                html += '      </colgroup>';
                html += '      <thead>';
                html += '        <tr>';
                html += headHtml;
                html += '        </tr>';
                html += '      </thead>';
                html += '      <tbody>';
                html += index.makeDataHtml(data[s].data);
                html += '      </tbody>';
                html += '    </table>';
                html += '  </div>';
                html += '</section>';

                navHtml += '<li class="_guideIndexNav__item">';
                navHtml += '    <a href="#guideIndexSection' + s + '" class="_guideIndexNav__link">' + data[s].depth1 + '</a>';
                navHtml += '</li>';
            }

            return { data: html, nav: navHtml };
        },
        makeDataHtml: function (data) {
            var html = '';

            for (var i = 0; i < data.length; i++) {
                html += '        <tr class="' + (data[i].status === 'delete' ? 'isDelete' : '') + '">';
                html += '          <td class="_guideIndexTable__no">' + (i + 1) + '</td>';
                html += index.makeRowHtml(data[i], i, data);
                html += '        </tr>';

                if (index.count[data[i].status]) {
                    index.count[data[i].status]++;
                } else {
                    index.count[data[i].status] = 1;
                }

                if (data[i].status !== 'delete') {
                    index.count.total++;
                }
            }

            return html;
        },
        makeRowHtml: function (rowData, i, data) {
            var head = guideIndex.head;
            var headLength = head.length;
            var html = '';

            for (var h = 0; h < headLength; h++) {
                if (head[h].name === 'path') {
                    html += index.makePathHtml(rowData.path);
                } else if (head[h].name === 'status') {
                    html += index.makeStatusHtml(rowData.status);
                } else if (head[h].name === 'create') {
                    html += index.makeCreateHtml(rowData.create);
                } else if (head[h].name === 'update') {
                    html += index.makeUpdateHtml(rowData.log);
                } else if (head[h].name === 'log') {
                    html += index.makeLogHtml(rowData.log);
                } else if (head[h].name.match(/id|depth/)) {
                    html += index.makeCellHtml(head[h].name, rowData, i, data);
                } else {
                    html += '          <td class="_guideIndexTable__' + head[h].name + '">' + rowData[head[h].name].replace(/\n/g, '<br />') + '</td>';
                }
            }

            return html;
        },
        makeCellHtml: function (name, data, i, items) {
            var html = '';

            if (i > 0 && items[i - 1][name] === data[name]) {
                html += '          <td class="_guideIndexTable__' + name + '"></td>';
            } else {
                html += '          <td class="_guideIndexTable__' + name + '">' + data[name].replace(/\n/g, '<br />') + '</td>';
            }

            return html;
        },
        makePathHtml: function (path) {
            var root = guideIndex.pathRoot;
            var html = '';

            html += '          <td class="_guideIndexTable__path">';
            html += '            <a href="' + root + path + '" class="_guideIndexTable__link" target="_blank">' + path + '</a>';
            html += '          </td>';

            return html;
        },
        makeStatusHtml: function (status) {
            var statusObj = guideIndex.status;
            var html = '';

            if (status.length) {
                html += '          <td class="_guideIndexTable__status">';
                html += '            <span class="_guideStatus _guideStatus--' + status + '">' + statusObj[status] + '</span>';
                html += '          </td>';
            } else {
                html += '          <td class="_guideIndexTable__status"></td>';
            }

            return html;
        },
        makeCreateHtml: function (create) {
            var html = '';

            html += '          <td class="_guideIndexTable__create" data-date="' + create + '">' + create + '</td>';

            if (index.dates.indexOf(create) === -1) {
                index.dates.push(create);
            }

            return html;
        },
        makeUpdateHtml: function (log) {
            var logLength = log.length;
            var last = null;
            var html = '';

            log.sort(function (a, b) {
                if (a.date > b.date) {
                    return 1;
                }
                if (a.date < b.date) {
                    return -1;
                }
                return 0;
            });

            if (logLength) {
                last = log[logLength - 1];

                html += '          <td class="_guideIndexTable__update" data-date="' + last.date + '">' + last.date + '</td>';

                if (index.dates.indexOf(last.date) === -1) {
                    index.dates.push(last.date);
                }
            } else {
                html += '          <td class="_guideIndexTable__update"></td>';
            }

            return html;
        },
        makeLogHtml: function (log) {
            var logLength = log.length;
            var html = '';

            log.sort(function (a, b) {
                if (a.date > b.date) {
                    return 1;
                }
                if (a.date < b.date) {
                    return -1;
                }
                return 0;
            });

            html += '          <td class="_guideIndexTable__log">';

            if (logLength) {
                html += '            <ul class="_guideIndexLog">';
            }

            for (var i = 0; i < logLength; i++) {
                html += '              <li class="_guideIndexLog__item" data-date="' + log[i].date + '">';
                html += '                <span class="_guideIndexLog__date">' + log[i].date + '</span>';
                html += '                <span class="_guideIndexLog__text">' + log[i].text.replace(/\n/g, '<br />') + '</span>';
                html += '              </li>';
            }

            if (logLength) {
                html += '            </ul>';
            }

            html += '          </td>';

            return html;
        },
    };
    $doc.on('click.guideJS', '._guideIndexNav__link', function () {
        var $this = $(this);
        var href = $this.attr('href');
        var $section = $(href);
        var $sections = $('._guideIndexSection');

        $sections.removeClass('isClicked');

        clearTimeout(index.timer);

        index.timer = setTimeout(function () {
            clearTimeout(index.timer);
            $section.addClass('isClicked');
        });
    });

    // monacoSet
    function monacoSet($view, value, language, maxHeight, customOptions, customPaths) {
        if (typeof customOptions !== 'object') {
            customOptions = {};
        }
        if (typeof customPaths !== 'object') {
            customPaths = {};
        }

        var options = $.extend(
            {
                value: value,
                language: language,
                automaticLayout: true,
                theme: 'vs-dark',
                renderWhitespace: 'all',
                wordWrap: 'on',
                hover: {
                    enabled: false,
                },
                fontFamily: "'D2Coding ligature', Consolas, 'Courier New', monospace",
                fontSize: '16px',
                fontWeight: '700',
                scrollBeyondLastLine: false,
                scrollbar: {
                    alwaysConsumeMouseWheel: false,
                },
            },
            customOptions
        );
        var paths = $.extend({ vs: './assets/lib/monaco-editor/min/vs' }, customPaths);
        var editor = {};

        require.config({ paths: paths });

        require(['vs/editor/editor.main'], function () {
            editor.obj = monaco.editor.create($view.get(0), options);

            if (typeof maxHeight !== 'number') return;

            function updateHeight() {
                var contentWidth = $view.width();
                var contentHeight = Math.min(maxHeight, editor.obj.getContentHeight());

                editor.obj.layout({
                    width: contentWidth,
                    height: contentHeight,
                });
            }

            editor.obj.onDidContentSizeChange(updateHeight);
            updateHeight();
        });

        return editor;
    }

    // getCode
    function getCode(originText) {
        var text = originText.replace(/^\n+/, '');
        var tab = text.match(/^( *|	*)./);
        var value = '';

        if (tab) {
            value = text.replace(new RegExp('^' + tab[1], 'g'), '').replace(new RegExp('\n' + tab[1], 'g'), '\n');
        } else {
            value = text;
        }

        value = value.replace(/ *$|	*$/, '').replace(/<\\\/script>/g, '</script>');

        return value;
    }

    // setting code
    var settingCode = {
        render: function () {
            $('[type="setting-code"]').each(function () {
                var $this = $(this);
                var text = $this.text();
                var value = getCode(text);
                var html = '';
                var isSet = false;
                var language = $this.attr('data-language');
                var title = $this.attr('data-title');

                html += '<div class="_guideIndexSettingCode">';
                html += '  <div role="button" tabindex="0" class="_guideIndexSettingCode__button">';
                html += '    ' + title + ' <span>▼</span>';
                html += '  </div>';
                html += '  <div class="_guideIndexSettingCode__view"></div>';
                html += '</div>';

                var $wrap = $(html);
                var $button = $wrap.find('._guideIndexSettingCode__button');
                var $buttonText = $wrap.find('._guideIndexSettingCode__button > span');
                var $view = $wrap.find('._guideIndexSettingCode__view');

                $this.after($wrap);

                $button.on('click.guideJS', function (e) {
                    if (!isSet) {
                        isSet = true;
                        monacoSet($view, value, language, 300, null, { vs: './guide/assets/lib/monaco-editor/min/vs' });
                    }

                    if ($wrap.hasClass('isShow')) {
                        $wrap.removeClass('isShow');
                        $buttonText.text('▼');
                    } else {
                        $wrap.addClass('isShow');
                        $buttonText.text('▲');
                    }
                });
            });
        },
    };

    // component code
    var componentCode = {
        render: function () {
            $('[type="component-code"]').each(function () {
                var $this = $(this);
                var text = $this.text();
                var value = getCode(text);
                var html = '';
                var isSet = false;

                html += '<div class="_guideComponentCode">';
                html += '  <div role="button" tabindex="0" class="_guideComponentCode__button">Show Code ▼</div>';
                html += '  <div class="_guideComponentCode__view"></div>';
                html += '</div>';

                var $wrap = $(html);
                var $button = $wrap.find('._guideComponentCode__button');
                var $view = $wrap.find('._guideComponentCode__view');

                $this.after($wrap);

                $button.on('click.guideJS', function (e) {
                    if (!isSet) {
                        isSet = true;
                        monacoSet($view, value, 'html', 500);
                    }

                    if ($wrap.hasClass('isShow')) {
                        $wrap.removeClass('isShow');
                        $button.text('Show Code ▼');
                    } else {
                        $wrap.addClass('isShow');
                        $button.text('Hide Code ▲');
                    }
                });
            });
        },
    };

    // code view
    var codeView = {
        render: function () {
            $('[type="code-view"]').each(function () {
                var $this = $(this);
                var $view = $('<div class="_guideCodeView"></div>');
                var text = $this.text();
                var value = getCode(text);
                var language = $this.attr('data-language');

                $this.after($view);

                monacoSet($view, value, language, 300, {
                    minimap: {
                        enabled: false,
                    },
                });
            });
        },
    };

    // guide nav
    var guideNav = {
        resize: function () {
            var $nav = $('#guideNav');

            if (!$nav.length) return;

            var $navBlock = $nav.find('._guideNav__block');

            $nav.height($navBlock.outerHeight());
        },
        scroll: function () {
            var $nav = $('#guideNav');

            if (!$nav.length) return;

            var $navBlock = $nav.find('._guideNav__block');
            var scrollLeft = $win.scrollLeft();

            $navBlock.css('margin-left', -scrollLeft + 'px');
        },
        render: function () {
            var $nav = $('#guideNav');

            if (!$nav.length) return;

            var html = '';
            var $navList = $nav.find('._guideNav__list');
            var $sections = $('._guideSection');

            $sections.each(function (i) {
                var $this = $(this);
                var title = $this.find('._guideSection__title').text();

                html += '<li class="_guideNav__item">';
                html += '    <a href="#guideSection' + i + '" class="_guideNav__link">' + title + '</a>';
                html += '</li>';

                $this.attr('id', 'guideSection' + i);
            });

            $navList.append(html);
        },
    };

    // preview
    var preview = {
        init: function () {
            $('._guidePreview').each(function () {
                var $wrap = $(this);
                var html = '';

                html += '<div class="_guidePreview__controller">';
                html += '  <div class="_guidePreview__block">';
                html += '    <div class="_guidePreview__text">투명 그리드</div>';
                html += '    <div class="_guidePreview__switch" role="button" tabindex="0"></div>';
                html += '  </div>';
                html += '</div>';

                var $controller = $(html);
                var $switch = $controller.find('._guidePreview__switch');

                $wrap.prepend($controller);

                $switch.on('click.guideJS', function (e) {
                    var $this = $(this);

                    if ($this.hasClass('isActive')) {
                        $this.removeClass('isActive');
                        $wrap.removeClass('isTransparent');
                    } else {
                        $this.addClass('isActive');
                        $wrap.addClass('isTransparent');
                    }
                });
            });
        },
    };

    // dom ready
    $(function () {
        index.render();
        index.resize();
        index.scroll();

        settingCode.render();

        componentCode.render();

        codeView.render();

        preview.init();

        guideNav.render();
        guideNav.resize();
        guideNav.scroll();
    });

    // win load, scroll, resize
    $win.on('load.guideJS', function () {
        index.resize();
        index.scroll();

        guideNav.resize();
        guideNav.scroll();
    })
        .on('scroll.guideJS', function () {
            index.scroll();

            guideNav.scroll();
        })
        .on('resize.guideJS', function () {
            index.resize();
            index.scroll();

            guideNav.resize();
            guideNav.scroll();
        })
        .on('orientationchange.guideJS', function () {
            index.resize();
            index.scroll();

            guideNav.resize();
            guideNav.scroll();
        });
})(jQuery);
