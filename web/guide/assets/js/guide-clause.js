// guide-clause.js

(function ($) {
    // common
    var $win = $(window);
    var $doc = $(document);

    // monacoSet
    function monacoSet($view, value, language, maxHeight, customOptions, customPaths) {
        if (!(typeof customOptions === 'object')) {
            customOptions = {};
        }
        if (!(typeof customPaths === 'object')) {
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

            if (!(typeof maxHeight === 'number')) return;

            var ignoreEvent = false;

            function updateHeight() {
                var contentWidth = $view.width();
                var contentHeight = Math.min(maxHeight, editor.obj.getContentHeight());

                try {
                    ignoreEvent = true;
                    editor.obj.layout({
                        width: contentWidth,
                        height: contentHeight,
                    });
                } finally {
                    ignoreEvent = false;
                }
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

    // editor
    var editor = {
        render: function () {
            $('._guideClauseEditor').each(function () {
                var $wrap = $(this);
                var $button = $wrap.find('._guideClauseEditor__button');
                var $doc = $wrap.find('._guideClauseEditor__doc');
                var $editor = $wrap.find('[type="clause-editor"]');
                var $view = $('<div class="_guideClauseEditor__code"></div>');
                var text = $editor.text();
                var value = getCode(text);

                $editor.after($view);
                $doc.html(value);

                var editor = monacoSet($view, value, 'html');

                $button.on('click.guideClauseJS', function () {
                    if (editor.obj) {
                        $doc.html(editor.obj.getValue());
                    }
                });
            });
        },
    };

    // component
    var component = {
        render: function () {
            $('._guideClauseComponent').each(function () {
                var $wrap = $(this);
                var $navList = $wrap.find('._guideClauseComponent__navList');
                var $sections = $wrap.find('._guideClauseSection');
                var navHtml = '';

                $sections.each(function (i) {
                    var $this = $(this);
                    var title = $this.find('._guideClauseSection__title').text();

                    navHtml += '<li class="_guideClauseComponent__navItem">';
                    navHtml += '    <div class="_guideClauseComponent__navLink" role="button" tabindex="0" data-section="#guideClauseSection' + i + '">' + title + '</div>';
                    navHtml += '</li>';

                    $this.attr('id', 'guideClauseSection' + i);
                });

                $navList.html(navHtml);

                var $tabs = $navList.find('._guideClauseComponent__navLink');

                $sections.eq(0).addClass('isShow');
                $tabs.eq(0).addClass('isActive');

                $tabs.on('click.guideClauseJS', function () {
                    var $this = $(this);
                    var section = $this.attr('data-section');
                    var $section = $(section);

                    $sections.removeClass('isShow');
                    $section.addClass('isShow');

                    $tabs.removeClass('isActive');
                    $this.addClass('isActive');
                });
            });

            $('._guideClausePreview').each(function () {
                var $this = $(this);

                $this.wrapInner('<div class="_guideClausePreview__doc"></div>');
            });

            $('[type="clause-component"]').each(function () {
                var $this = $(this);
                var $view = $('<div class="_guideClauseComponentCode"></div>');
                var text = $this.text();
                var value = getCode(text);

                $this.after($view);

                monacoSet($view, value, 'html', null, {
                    readOnly: true,
                });
            });
        },
    };

    // dom ready
    $(function () {
        var $html = $('html');
        var $body = $('body');

        editor.render();
        component.render();
    });

    // win load, scroll, resize
    $win.on('load.guideClauseJS', function () {
        //
    })
        .on('scroll.guideClauseJS', function () {
            //
        })
        .on('resize.guideClauseJS', function () {
            //
        })
        .on('orientationchange.guideClauseJS', function () {
            //
        });
})(jQuery);
