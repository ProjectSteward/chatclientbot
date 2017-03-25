$(document).ready(function(){
    var connection = new EikonMessengerConnection();
    var steward = new Steward();

    function log(msg) {
        $('#log').append('<div></div>').append(document.createTextNode(msg));
    }

    $('#connect').bind('click', function () {
        var button = $('#connect').get(0);
        if (button.value === 'connect') {
            button.value = 'disconnect';

            log('Connecting');
            connection.Connect($('#jid').get(0).value,  $('#pass').get(0).value, {
                onConnect: function() {
                    log('Connected');
                },
                onDisconnected: function() {
                    log('Disconnected');
                },
                onReceivedMessage: function(msg) {
                    log('Steward: I got a message from ' + msg.from + ': ' + msg.message);

                    steward.GetConversation(msg.from)
                        .done(function(conversation){
                            var defer = $.Deferred();
                            conversation.onReply = function(msg) {
                                connection.Send(msg.from, msg);
                            };
                            conversation.Ask(msg.message);

                            conversation.Replying(function(reply) {
                                connection.Send(msg.from, reply);
                            });

                            conversation.End(function(){
                                defer.resolve();
                            });
                            return defer.promise();
                        })
                        .fail(function(){
                            log('ERROR: cannot get conversation')
                        });
                },
                onError: function(err) {
                    log(err);
                },
                onSent: function(msg) {
                    log('Steward: I\'ve sent message to ' + msg.to + ': ' + msg.message);
                },
                keepOnline: true
            });
        } else {
            button.value = 'connect';
            connection.Disconnect();
        }
    });
});