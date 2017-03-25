/**
 * Created by Adipat on 3/23/2017.
 */
function Steward() {

    var conversations = []; // [{name: "adipat.larprattanakul.thomsonreuters.com@reuters.net", cid: 3, surl: [websocket]}]

    function getRealUserName(name) {
        var n = name.indexOf("@reuters.net/");
        if (n < 0) {
            return name;
        }

        return name.substring(0, n+12);
    }

    function getConversationFromName(name) {
        var defer = $.Deferred();

        var username = getRealUserName(name);

        var result = $.grep(conversations, function(e) {
            return e.Name === username;
        });

        if (result.length > 0) {
            defer.resolve(result[0]);
        }
        else if (result.length === 0)
        {
            $.ajax({
                type: 'POST',
                url: 'https://directline.botframework.com/v3/directline/conversations',
                headers: { 'Authorization': 'Bearer 8LcS8tQ0UGU.cwA.iUk._NqOkDxxx37e4d13RzIkxiEci-7WBFqk9c_rZSgzxZM' }
            }).done(function (result) {
                var conv = {
                    name: username,
                    cid: result.conversationId,
                    surl: result.streamUrl
                };
                var stewardConv = new StewardConversation(conv);
                conversations.push(stewardConv);

                defer.resolve(stewardConv);
            }).fail(function () {
                defer.reject();
            });
        }
        else
            defer.reject();

        return defer.promise();
    }

    function GetConversation(username) {
        var defer = $.Deferred();

        getConversationFromName(username)
            .done(function(conv){
                defer.resolve(conv);
            })
            .fail(function(){
                defer.reject('cannot get conversation');
            });

        return defer.promise();
    }

    function Disconnect() {
        if (conversations) {
            conversations.forEach(function(elem) {
                elem.Disconnect();
            });

            conversations.length = 0;
            conversations = [];
        }
    }

    return {
        GetConversation: GetConversation,
        Disconnect: Disconnect
    }
}