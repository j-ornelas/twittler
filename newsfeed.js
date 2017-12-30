
        var $newsfeed = $('.newsfeed');


        $(document).ready(function(){

          $feed = $('<div></div>')
          $feed.appendTo($newsfeed);

          var showTweets = function(context){
            var toDisplay;
            if(context === 'home'){
              toDisplay = streams.home
            } else if (context){
              toDisplay = streams.users[context]
            }

          $feed.html('');


          var index = toDisplay.length - 1;
          while(index >= 0){

            var tweet = toDisplay[index];
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

            var $hashtag = $('<a></a>')
            $hashtag.addClass('hashtag')
            $hashtag.text()

            var $timestamp = $('<a></a>')
            $timestamp.addClass('timestamp')
            $timestamp.text(' ~ ' + tweet.displayDate)
            $timestamp.appendTo($tweet)

            $tweet.appendTo($feed);

            index -= 1;
          }

          $('.username').on('click', function (page) {
            page.preventDefault();
            showTweets($(this).data('user'));
          });

          $('.updateButton').on('click', function(page){
            page.preventDefault();
            showTweets('home')
          });

        }


      showTweets('home')


      });