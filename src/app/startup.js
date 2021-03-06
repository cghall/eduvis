define(['jquery', 'knockout', './router', 'bootstrap', 'knockout-projections'], function($, ko, router) {

    // Components can be packaged as AMD modules, such as the following:
    ko.components.register('nav-bar', { require: 'components/nav-bar/nav-bar' });
    ko.components.register('home-page', { require: 'components/home-page/home' });

    // ... or for template-only components, you can just point to a .html file directly:
    ko.components.register('about-page', {
        template: { require: 'text!components/about-page/about.html' }
    });

    ko.components.register('blog-page', { require: 'components/blog-page/blog' });
    ko.components.register('loading', { require: 'components/loading/loading' });
    ko.components.register('selection', { require: 'components/selection/selection' });
    ko.components.register('chart', { require: 'components/chart/chart' });
    ko.components.register('display-options', { require: 'components/display-options/display-options' });
    ko.components.register('sharing', { require: 'components/sharing/sharing' });
    ko.components.register('chart-description', { require: 'components/chart-description/chart-description' });
    ko.components.register('filter', { require: 'components/filter/filter' });
    ko.components.register('ukmap', { require: 'components/ukmap/ukmap' });
    ko.components.register('tableview', { require: 'components/tableview/tableview' });

    // [Scaffolded component registrations will be inserted here. To retain this feature, don't remove this comment.]

    // Start the application
    ko.applyBindings({ route: router.currentRoute });
});
