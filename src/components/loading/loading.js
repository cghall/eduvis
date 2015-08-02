define(['knockout', 'underscore', 'text!./loading.html'], function (ko, _, templateMarkup) {

    function Loading(params) {

    }

    var ellipsis = {
        'value': ['&nbsp;&nbsp;&nbsp;&nbsp;', '.&nbsp;&nbsp;&nbsp;', '..&nbsp;&nbsp;', '...&nbsp;'],
        'count': 0,
        'run': false,
        'timer': null,
        'element': '.ellipsis',
        'start': function () {
            var t = this;
            this.run = true;
            this.timer = setInterval(function () {
                if (t.run) {
                    $(t.element).html(t.value[t.count % t.value.length]).text();
                    t.count++;
                }
            }, 500);
        },
        'stop': function () {
            this.run = false;
            clearInterval(this.timer);
            this.count = 0;
        }
    };

    var ellipsis_reverse = _.clone(ellipsis);
    ellipsis_reverse.value = _.clone(ellipsis.value).reverse();
    ellipsis_reverse.element = '.ellipsis-reverse';

    ellipsis.start();
    ellipsis_reverse.start();

    return {viewModel: Loading, template: templateMarkup};

});
