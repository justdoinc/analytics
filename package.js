Package.describe({
  name: 'justdoinc:analytics',
  version: '1.0.9',
  summary: 'okgrow:analytics with some modifications to meet justdoinc projects structure',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.3.1');
  api.use('mongo');
  api.use('accounts-base', ['client', 'server'], {weak: true});
  api.use('browser-policy-content', 'server', {weak: true});

  //weak dependencies indicate we will load after the following packages
  // and constrain their versions IF another package, or app brings them in
  api.use('iron:router@1.0.7', 'client', {weak: true});
  api.use('meteorhacks:flow-router@1.17.2', 'client', {weak: true});

  api.addFiles([
    'server/browser-policy.js',
    'server/publications.js'
  ], 'server');
  api.addFiles([
    'vendor/analytics.min.js',
    'client/collections.js',
    'client/meteor-analytics.js',
  ], 'client');

  // Do not export InitAnalytics to allow first tick to load properly if the analytics plugin is blocked by ad blockers #10727
  // If we export something Meteor tries to access it on the first tick, and if the plugin is blocked, the app
  // will collapse due to exception in the first tick.
  // That's why we bind to window.InitAnalytics.
  // api.export('InitAnalytics', 'client'); 
});
