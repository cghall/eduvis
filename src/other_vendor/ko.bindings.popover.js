/*
 *
 * Knockout-popover
 * https://github.com/s-stude/knockout-popover
 *
 * Knockout custom binding for Twitter Bootstrap Popover
 *
 * Created by: Akim Khalilov (https://github.com/s-stude)
 * License: MIT
 *
 */

/*
 * HOW TO USE:
 *
 * TBD...
 *
 * */

define(['jquery', 'knockout'], function ($, ko, undefined) {

    var
        htmlDataAttributePrefix = 'popover-',
        defaults = {
            animation: undefined,
            html: undefined,
            placement: 'top',
            selector: undefined,
            trigger: 'hover',
            title: 'Default Title',
            content: 'Default content',
            delay: undefined,
            container: 'body'
        };

    ko.bindingHandlers.popover = {

        init: function (element, valueAccessor, allBindingsAccessor) {
            var $elem = $(element),
                isPopover = valueAccessor(),
                popoverOptions = allBindingsAccessor().popoverOptions;

            if (isPopover) {
                initPopover($elem, popoverOptions);
                return;
            }

            if (popoverOptions.elem) {
                var elems = $elem.find(popoverOptions.elem);

                if (!elems) {
                    throw new Error('Element \'$ELEM$\' was not found'.replace('$ELEM$', popoverOptions.elem));
                }

                initPopover(elems, popoverOptions);
            }
        }
    };

    function initPopover (elems, overrides) {
        elems.each(function () {
            var dataValues = {};

            for (var p in defaults) {
                dataValues[p] = $(this).data(htmlDataAttributePrefix + p);
            }

            $(this).popover($.extend({}, defaults, dataValues, overrides));
        });

    }

});
