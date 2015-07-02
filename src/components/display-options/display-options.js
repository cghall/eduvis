define(['knockout', 'text!./display-options.html'], function(ko, templateMarkup) {

  function DisplayOptions(params) {
    this.message = ko.observable('Hello from the display-options component!');
  }

  // This runs when the component is torn down. Put here any logic necessary to clean up,
  // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
  DisplayOptions.prototype.dispose = function() { };
  
  return { viewModel: DisplayOptions, template: templateMarkup };

});
