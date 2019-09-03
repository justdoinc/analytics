// var SETTINGS = Meteor.settings && Meteor.settings.public &&
//                Meteor.settings.public.analyticsSettings || {};

// analytics.js might not have loaded it's integrations by the time we start
// tracking events, page views and identifies.
// So we can use these *WhenReady() functions to cause the action to be
// deferred until all the intgrations are ready.
//
// TODO consider whether we should export something like this, maybe provide
// our own api instead of just using analytics.js' api
var trackEventWhenReady = function () {
  var _args = arguments;
  analytics.ready(function () {analytics.track.apply(this, _args);});
};

var trackPageWhenReady = function () {
  var _args = arguments;
  analytics.ready(function () {analytics.page.apply(this, _args);});
};

var identifyWhenReady = function () {
  var _args = arguments;
  analytics.ready(function () {analytics.identify.apply(this, _args);});
};

/*
* getUserEmail()
* Figure out the user's correct email address. This helps the differing keys
* in the database when using oAuth login.
*/
getUserEmail = function() {
  if (Meteor.userId()) {
    var user = AnalyticsUsers.findOne({_id: Meteor.userId()}, {
      fields: {
        emails: 1,
        "services.facebook.email": 1,
        "services.google.email": 1,
        "services.github.email": 1
      }
    });
    if ( user && user.emails ) {
      if (user.emails[0]) {
        return user.emails[0].address;
      } else {
        return null;
      }
    } else if ( user && user.services ) {
      var services = user.services;
      if ( services.facebook ) {
        return services.facebook.email;
      } else if ( services.github ) {
        return services.github.email;
      } else if ( services.google ) {
        return services.google.email;
      } else {
        return null;
      }
    }
  }
};

var initialized;
var trackLogins = function () {
  // don't run the first time, but we need to access Meteor.userId()
  // so that it's reactive
  Meteor.userId();
  if (initialized) {
    // when Meteor.userId() changes this will run
    if (Meteor.userId()) {
      // TODO I think it's not guaranteed that userEmail has been set because
      // the 'analyticsusers' publication might not be ready yet.
      identifyWhenReady(Meteor.userId(), {email: userEmail});
      trackEventWhenReady("Signed in");
    } else {
      trackEventWhenReady("Signed out");
    }
  }
  initialized = true;
};

var _IronRouter = (Package['iron:router'] && Package['iron:router'].Router);

initIronRouter = function() {
  if (_IronRouter) {
    _IronRouter.onRun(function() {
      var router = this;
      Tracker.afterFlush(function () { trackPageWhenReady(router.route.getName()); });
      this.next();
    });
  }
}

var userEmail;
InitAnalytics = function (settings) {
  if (!_.isEmpty(settings)) {
    if (settings.autorun !== false) {
      initIronRouter();
    }
    analytics.initialize(settings);
  } else {
    console.error("InitAnalytics: invlaid settings object provided");
  }

  if (Package['accounts-base']) {
    Tracker.autorun(function () {
      userEmail = getUserEmail();
    });
    Tracker.autorun(trackLogins);
  }
}
