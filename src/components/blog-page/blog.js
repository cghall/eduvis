define(['knockout', 'text!./blog.html'], function(ko, templateMarkup) {

  function BlogPage(params) {
    this.message = ko.observable('Blog coming soon...');
  }
  
  return { viewModel: BlogPage, template: templateMarkup };

});
