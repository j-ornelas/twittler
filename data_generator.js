// line 1-200 is from the timeago Library, used for "a few seconds ago" type
// visual time representation.
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function ($) {
  $.timeago = function(timestamp) {
    if (timestamp instanceof Date) {
      return inWords(timestamp);
    } else if (typeof timestamp === "string") {
      return inWords($.timeago.parse(timestamp));
    } else if (typeof timestamp === "number") {
      return inWords(new Date(timestamp));
    } else {
      return inWords($.timeago.datetime(timestamp));
    }
  };
  var $t = $.timeago;

  $.extend($.timeago, {
    settings: {
      refreshMillis: 60000,
      allowPast: true,
      allowFuture: false,
      localeTitle: false,
      cutoff: 0,
      strings: {
        prefixAgo: null,
        prefixFromNow: null,
        suffixAgo: "ago",
        suffixFromNow: "from now",
        inPast: 'any moment now',
        seconds: "less than a minute",
        minute: "about a minute",
        minutes: "%d minutes",
        hour: "about an hour",
        hours: "about %d hours",
        day: "a day",
        days: "%d days",
        month: "about a month",
        months: "%d months",
        year: "about a year",
        years: "%d years",
        wordSeparator: " ",
        numbers: []
      }
    },

    inWords: function(distanceMillis) {
      if(!this.settings.allowPast && ! this.settings.allowFuture) {
        throw 'timeago allowPast and allowFuture settings can not both be set to false.';
      }

      var $l = this.settings.strings;
      var prefix = $l.prefixAgo;
      var suffix = $l.suffixAgo;
      if (this.settings.allowFuture) {
        if (distanceMillis < 0) {
          prefix = $l.prefixFromNow;
          suffix = $l.suffixFromNow;
        }
      }

      if(!this.settings.allowPast && distanceMillis >= 0) {
        return this.settings.strings.inPast;
      }

      var seconds = Math.abs(distanceMillis) / 1000;
      var minutes = seconds / 60;
      var hours = minutes / 60;
      var days = hours / 24;
      var years = days / 365;

      function substitute(stringOrFunction, number) {
        var string = $.isFunction(stringOrFunction) ? stringOrFunction(number, distanceMillis) : stringOrFunction;
        var value = ($l.numbers && $l.numbers[number]) || number;
        return string.replace(/%d/i, value);
      }

      var words = seconds < 45 && substitute($l.seconds, Math.round(seconds)) ||
      seconds < 90 && substitute($l.minute, 1) ||
      minutes < 45 && substitute($l.minutes, Math.round(minutes)) ||
      minutes < 90 && substitute($l.hour, 1) ||
      hours < 24 && substitute($l.hours, Math.round(hours)) ||
      hours < 42 && substitute($l.day, 1) ||
      days < 30 && substitute($l.days, Math.round(days)) ||
      days < 45 && substitute($l.month, 1) ||
      days < 365 && substitute($l.months, Math.round(days / 30)) ||
      years < 1.5 && substitute($l.year, 1) ||
      substitute($l.years, Math.round(years));

      var separator = $l.wordSeparator || "";
      if ($l.wordSeparator === undefined) { separator = " "; }
        return $.trim([prefix, words, suffix].join(separator));
      },

      parse: function(iso8601) {
        var s = $.trim(iso8601);
        s = s.replace(/\.\d+/,""); // remove milliseconds
        s = s.replace(/-/,"/").replace(/-/,"/");
        s = s.replace(/T/," ").replace(/Z/," UTC");
        s = s.replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2"); // -04:00 -> -0400
        s = s.replace(/([\+\-]\d\d)$/," $100"); // +09 -> +0900
        return new Date(s);
      },
      datetime: function(elem) {
        var iso8601 = $t.isTime(elem) ? $(elem).attr("datetime") : $(elem).attr("title");
        return $t.parse(iso8601);
      },
      isTime: function(elem) {
        // jQuery's `is()` doesn't play well with HTML5 in IE
        return $(elem).get(0).tagName.toLowerCase() === "time"; // $(elem).is("time");
      }
    });

    // functions that can be called via $(el).timeago('action')
    // init is default when no action is given
    // functions are called with context of a single element
    var functions = {
      init: function(){
        var refresh_el = $.proxy(refresh, this);
        refresh_el();
        var $s = $t.settings;
        if ($s.refreshMillis > 0) {
          this._timeagoInterval = setInterval(refresh_el, $s.refreshMillis);
        }
      },
      update: function(time){
        var parsedTime = $t.parse(time);
        $(this).data('timeago', { datetime: parsedTime });
        if($t.settings.localeTitle) $(this).attr("title", parsedTime.toLocaleString());
        refresh.apply(this);
      },
      updateFromDOM: function(){
        $(this).data('timeago', { datetime: $t.parse( $t.isTime(this) ? $(this).attr("datetime") : $(this).attr("title") ) });
        refresh.apply(this);
      },
      dispose: function () {
        if (this._timeagoInterval) {
          window.clearInterval(this._timeagoInterval);
          this._timeagoInterval = null;
        }
      }
    };

    $.fn.timeago = function(action, options) {
      var fn = action ? functions[action] : functions.init;
      if(!fn){
        throw new Error("Unknown function name '"+ action +"' for timeago");
      }
      // each over objects here and call the requested function
      this.each(function(){
        fn.call(this, options);
      });
      return this;
    };

    function refresh() {
      var data = prepareData(this);
      var $s = $t.settings;

      if (!isNaN(data.datetime)) {
        if ( $s.cutoff == 0 || Math.abs(distance(data.datetime)) < $s.cutoff) {
          $(this).text(inWords(data.datetime));
        }
      }
      return this;
    }

    function prepareData(element) {
      element = $(element);
      if (!element.data("timeago")) {
        element.data("timeago", { datetime: $t.datetime(element) });
        var text = $.trim(element.text());
        if ($t.settings.localeTitle) {
          element.attr("title", element.data('timeago').datetime.toLocaleString());
        } else if (text.length > 0 && !($t.isTime(element) && element.attr("title"))) {
          element.attr("title", text);
        }
      }
      return element.data("timeago");
    }

    function inWords(date) {
      return $t.inWords(distance(date));
    }

    function distance(date) {
      return (new Date().getTime() - date.getTime());
    }

    // fix for IE6 suckage
    document.createElement("abbr");
    document.createElement("time");
  }));


/*
 * NOTE: This file generates fake tweet data, and is not intended to be part of your implementation.
 * You can safely leave this file untouched, and confine your changes to index.html.
 */

// set up data structures
window.streams = {};
streams.home = [];
streams.users = {};
streams.tags = {};
streams.users.shawndrost = [];
streams.users.sharksforcheap = [];
streams.users.mracus = [];
streams.users.douglascalhoun = [];
window.users = Object.keys(streams.users);

// utility function for adding tweets to our data structures
var addTweet = function(newTweet){
  var username = newTweet.user;
  var hashtag = newTweet.tag;
  streams.users[username].push(newTweet);
  streams.home.push(newTweet);

  if (streams.tags[hashtag] === undefined){
    streams.tags[hashtag] = [newTweet];
  } else {
    streams.tags[hashtag].push(newTweet);
  }
};

// utility function
var randomElement = function(array){
  var randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

// random tweet generator
var opening = ['just', '', '', '', '', 'ask me how i', 'completely', 'nearly', 'productively', 'efficiently', 'last night i', 'the president', 'that wizard', 'a ninja', 'a seedy old man'];
var verbs = ['downloaded', 'interfaced', 'deployed', 'developed', 'built', 'invented', 'experienced', 'navigated', 'aided', 'enjoyed', 'engineered', 'installed', 'debugged', 'delegated', 'automated', 'formulated', 'systematized', 'overhauled', 'computed'];
var objects = ['my', 'your', 'the', 'a', 'my', 'an entire', 'this', 'that', 'the', 'the big', 'a new form of'];
var nouns = ['cat', 'koolaid', 'system', 'city', 'worm', 'cloud', 'potato', 'money', 'way of life', 'belief system', 'security system', 'bad decision', 'future', 'life', 'pony', 'mind'];
var tags = ['#techlife', '#burningman', '#sf', '#iknowhow', '#forreal', '#sxsw', '#ballin', '#omg', '#yolo', '#magic', '', '', '', ''];

var randomMessage = function(){
  return [randomElement(opening), randomElement(verbs), randomElement(objects), randomElement(nouns)].join(' ');
};

var randomTag = function(){
  return randomElement(tags);
}
//converts date object into name of the month string
var convertMonth = function(num){
 var months = {
   01: "Jan",
   02: "Feb",
   03: "Mar",
   04: "April",
   05: "May",
   06: "June",
   07: "July",
   08: "Aug",
   09: "Sept",
   10: "Oct",
   11: "Nov",
   12: "Dec"
 };
 return months[num];
};

// generate random tweets on a random schedule
var generateRandomTweet = function(){
  var tweet = {};
  tweet.user = randomElement(users);
  tweet.message = randomMessage();
  tweet.tag = randomTag()
  tweet.created_at = new Date();

  var date = new Date();  
  var options = {  
    weekday: "long", year: "numeric", month: "short",  
    day: "numeric", hour: "2-digit", minute: "2-digit"  
  };  

  tweet.timeTest = date.toLocaleTimeString("en-US", options)
  tweet.timeAgo = $.timeago(tweet.created_at)
  tweet.fullDate = tweet.created_at.toISOString()
  tweet.month = convertMonth(tweet.created_at.toISOString().split("-")[1]);
  tweet.year = tweet.created_at.toISOString().split("-")[0];
  tweet.day = tweet.created_at.toISOString().split("-")[2].slice(0,2);
  tweet.time = tweet.created_at.toISOString().slice(11,16)
  tweet.displayDate = tweet.month + " " + tweet.day + " at " + tweet.time
  addTweet(tweet);
};

for(var i = 0; i < 10; i++){
  generateRandomTweet();
}

var scheduleNextTweet = function(){
  generateRandomTweet();
  setTimeout(scheduleNextTweet, Math.random() * 10500);
};
scheduleNextTweet();

// utility function for letting students add "write a tweet" functionality
// (note: not used by the rest of this file.)
var writeTweet = function(message){
  if(!visitor){
    throw new Error('set the global visitor property!');
  }
  var tweet = {};
  tweet.user = visitor;
  tweet.message = message;
  addTweet(tweet);
};





