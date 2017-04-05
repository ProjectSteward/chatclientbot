function StewardConversation(conv) {

    var userName = conv.name;
    var conversationId = conv.cid;
    var socketUrl = conv.surl;

    var websocket = null;
    var SOCKET_TIMEOUT = 15*60*1000; // 15 MINS
    var currentTimeoutId = null;

    var onReplyCb = null;
    var onEndCb = null;

    function ConversationFinished() {

        DisconnectWebSocket();

        if (onEndCb)
            onEndCb();
    }

    function onMsg(event) {
        if (event && event.data) {
            var eventObj = JSON.parse(event.data);
            if (eventObj && eventObj.activities && eventObj.activities.length > 0) {
                var response = eventObj.activities[0];
                if (response.from.id === 'StewardTRBot') {
                    var replyText = "";
                    if (response.text && response.text !== "") {
                        replyText = response.text;
                    }
                    else {
                        if (response.attachments && response.attachments.length > 0 && response.attachments[0].content) {
                            replyText = response.attachments[0].content.text;
                        }
                    }

                    if (replyText && replyText !== ""){
                        if (onReplyCb) {
                            onReplyCb(replyText);
                        }
                    }
                }
            }
        }
    }

    function ClearTimeOut() {
        if (currentTimeoutId) {
            clearTimeout(currentTimeoutId);
            currentTimeoutId = null;
        }
    }

    function DisconnectWebSocket() {

        ClearTimeOut();

        if (websocket) {
            websocket.onclose = function () {}; // disable onclose handler first
            websocket.close();
            websocket = null;
        }
    }

    function StartWebSocketConnection() {

        var defer = $.Deferred();
        if (websocket && websocket.readyState === 1) {
            defer.resolve();
            return defer.promise();
        }

        DisconnectWebSocket();

        // Reconnect
        $.ajax({
            type: 'GET',
            contentType: "application/json",
            url: 'https://directline.botframework.com/v3/directline/conversations/' + conversationId ,
            headers: { 'Authorization': 'Bearer 8LcS8tQ0UGU.cwA.iUk._NqOkDxxx37e4d13RzIkxiEci-7WBFqk9c_rZSgzxZM' }
        }).done(function(result){
            if (result) {
                socketUrl = result.streamUrl;

                websocket = new WebSocket(socketUrl);
                websocket.onmessage = onMsg;

                currentTimeoutId = setTimeout(ConversationFinished, SOCKET_TIMEOUT);

                defer.resolve();
            }
        })
        .fail(function(){
            console.log('error during connecting');
            defer.reject();
        });

        return defer.promise();
    }

    function Ask(question) {

        StartWebSocketConnection().then(function() {
            $.ajax({
                type: 'POST',
                contentType: "application/json",
                url: 'https://directline.botframework.com/v3/directline/conversations/' + conversationId + '/activities',
                headers: { 'Authorization': 'Bearer 8LcS8tQ0UGU.cwA.iUk._NqOkDxxx37e4d13RzIkxiEci-7WBFqk9c_rZSgzxZM' },
                data: JSON.stringify({
                    "type": "message",
                    "from": {
                        "id": userName
                    },
                    "text": question
                })
            }).done(function(result){
                console.log(result);
            })
            .fail(function(){
                console.log('error during send message');
            });
        });
    }

    function Replying(replyingCb) {
        onReplyCb = replyingCb;
    }

    function End(endCb) {
        onEndCb = endCb;
    }

    return {
        Ask: Ask,
        Replying: Replying,
        End: End,
        Reconnect: StartWebSocketConnection,
        Disconnect: DisconnectWebSocket,
        Name: userName,
        ConversationId: conversationId,
        SocketUrl: socketUrl,
        WebSocket: websocket
    }
}