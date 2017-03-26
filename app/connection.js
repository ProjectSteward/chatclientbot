function EikonMessengerConnection() {

    var BOSH_SERVICE = 'https://collab.thomsonreuters.com/nhttp-bind/';

    var connection = new Strophe.Connection(BOSH_SERVICE);
    var walked = false;

    var username = null;
    var password = null;

    var onConnectCb = null;
    var onBeforeDisconnectCb = null;
    var onDisconnectedCb = null;
    var onReceivedMessageCb = null;
    var onSentCb = null;
    var onTypingCb = null;
    var onErrorCb = null;
    var keepOnline = false;
    var onRawLogCb = null;
    var isConnected = false;

    function notifyCb(cbObj, data){
        if (typeof cbObj === 'function') {
            cbObj(data);
        }
    }

    function Reconnect() {

        var olduser = username;
        var oldpassword = password;

        var attr = {
            onConnect: onConnectCb,
            onBeforeDisconnect: onBeforeDisconnectCb,
            onDisconnected: onDisconnectedCb,
            onReceivedMessage: onReceivedMessageCb,
            onSent: onSentCb,
            onTyping: onTypingCb,
            onError: onErrorCb,
            onRawLog: onRawLogCb,
            keepOnline: keepOnline
        };

        Disconnect();
        setTimeout(function() {
            Connect(olduser, oldpassword, attr);
        }, 1000 * 10);

    }

    function startOnlineTimer() {
        connection.send($pres().tree());
        setTimeout(function() {
            Reconnect();
        }, 5 * 1000 * 60);
    }

    function offlineAfter(mins) {
        connection.send($pres().tree());
        setTimeout(function() {
            Disconnect();
        }, mins * 1000 * 60);
    }

    function onConnect(status) {
        if (status === Strophe.Status.CONNECTING) {
            notifyCb(onRawLogCb, "connecting");
        }
        else if (status === Strophe.Status.CONNFAIL) {
            notifyCb(onErrorCb);
            notifyCb(onRawLogCb, "connection is failed");
        }
        else if (status === Strophe.Status.DISCONNECTING) {
            // do nothing
        }
        else if (status === Strophe.Status.DISCONNECTED) {
            notifyCb(onDisconnectCb);
            notifyCb(onRawLogCb, "Disconnected");
        }
        else if (status === Strophe.Status.CONNECTED) {
            notifyCb(onConnectCb);
            notifyCb(onRawLogCb, "Connected");
            isConnected = true;

            connection.addHandler(onMessage, null, 'message', null, null,  null);

            if (keepOnline) {
                startOnlineTimer();
            }
            else {
                offlineAfter(3);
            }
        }
    }

    function removeNotNeededMsg(msg) {
        var ignoreMsg = '[[:Conversations will be recorded and may be monitored by the participants and their employers, and may be disclosed to governmental or other regulatory bodies in compliance with applicable laws.:]]';
        return msg.replace(ignoreMsg, '');
    }

    function onMessage(msg) {
        var to = msg.getAttribute('to');
        var from = msg.getAttribute('from');
        var type = msg.getAttribute('type');
        var body = msg.getElementsByTagName('body');

        if (type === "chat" && body.length > 0) {

            var reply = removeNotNeededMsg(Strophe.getText(body[0]));

            notifyCb(onReceivedMessageCb, {
                from: from,
                message: reply
            });
        }

        // we must return true to keep the handler alive.
        // returning false would remove it after it finishes.
        return true;
    }

    function Send(to, message) {
        try {

            var msg = $msg( {
                to: to,
                from: username,
                type: "chat"
            }).cnode(Strophe.xmlElement('body', null, message));

            connection.send(msg.tree());

            notifyCb(onSentCb, { to: to, message: message});
        }
        catch (err) {
            notifyCb(onErrorCb, err);
        }
    }

    function SendTyping(to) {
        try {
            var typingMsg = $msg( {
                to: to,
                from: username,
                type: "normal"
            }).cnode(Strophe.xmlElement('composing', {xmlns: "http://jabber.org/protocol/chatstates"}));

            connection.send(typingMsg.tree());
        }
        catch (err) {
            notifyCb(onErrorCb, err);
        }
    }

    function Connect(user, pass, attr) {
        if (attr) {
            onConnectCb = typeof attr.onConnect === 'function' ? attr.onConnect : null;
            onBeforeDisconnectCb = typeof attr.onBeforeDisconnect === 'function' ? attr.onBeforeDisconnect : null;
            onDisconnectedCb = typeof attr.onDisconnected === 'function' ? attr.onDisconnected : null;
            onReceivedMessageCb = typeof attr.onReceivedMessage === 'function' ? attr.onReceivedMessage : null;
            onSentCb = typeof attr.onSent === 'function' ? attr.onSent : null;
            onTypingCb = typeof attr.onTyping === 'function' ? attr.onTyping : null;
            onErrorCb = typeof attr.onError === 'function' ? attr.onError : null;
            onRawLogCb = typeof attr.onRawLog === 'function' ? attr.onRawLog : null;
            keepOnline = attr.keepOnline ? attr.keepOnline : false;
        }

        try {
            connection.connect(user, pass, onConnect);

            username = user;
            password = pass;
        }
        catch(err) {
            notifyCb(onErrorCb, err);
        }
    }

    function Disconnect() {

        notifyCb(onBeforeDisconnectCb);

        isConnected = false;
        onConnectCb = null;
        onReceivedMessageCb = null;
        onSentCb = null;
        onTypingCb = null;
        onErrorCb = null;
        username = null;
        password = null;
        keepOnline = false;
        onBeforeDisconnectCb = null;
        connection.disconnect();

        notifyCb(onDisconnectedCb);
        onDisconnectedCb = null;
    }

    return {
        IsConnected: isConnected,
        Connect: Connect,
        Disconnect: Disconnect,
        Send: Send,
        SendTyping: SendTyping
    }
}