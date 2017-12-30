
        var $body = $('body');
        $body.html('');

        $(document).ready(function(){
        var index = streams.home.length - 1;
        while(index >= 0){

          var tweet = streams.home[index];
          var $tweet = $('<div></div>');
          $tweet.addClass('tweet')

          var $user = $('<a></a>');
          $user.attr({'href': '#', 'class': 'username', 'data-user': tweet.user})
          $user.text('@' + tweet.user + ': ');
          $user.appendTo($tweet)

          var $message = $('<a></a>');
          $message.addClass('message')
          $message.text(tweet.message)
          $message.appendTo($tweet)

          var $timestamp = $('<a></a>')
          $timestamp.addClass('timestamp')
          $timestamp.text(' ~ ' + tweet.displayDate)
          $timestamp.appendTo($tweet)

          $tweet.appendTo($body);

          index -= 1;
        }
      });