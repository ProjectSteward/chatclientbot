var connection = new EikonMessengerConnection();
var steward = new Steward();

function log(msg) {
    $('#log').append('<div></div>').append(document.createTextNode(msg));
}

$(document).ready(function(){
    function onReplyCallback(replyTo, message) {
        connection.Send(replyTo, message);
    }

    steward.onReply(onReplyCallback);

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
                    // connection.Send(msg.from, 'OK, I got your message - "' + msg.message + '"');
                    // connection.Send(msg.from, '"' + msg.message + '"');

                    steward.Ask(msg.from, msg.message);
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



