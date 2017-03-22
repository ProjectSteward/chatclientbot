'use strict';

/**
 * Echo Bot - the XMPP Hello World
 **/
var Client = require('node-xmpp-client');

var client = new Client({
    jid: 'eikon.steward.thomsonreuters.com@reuters.net',
    password: 'Thomson67',
    preferred: 'PLAIN',
    bosh: {
        url: 'https://collab.thomsonreuters.com/nhttp-bind/'
    }
});

client.on('online', function () {
    console.log('online');
    client.send(new Client.Stanza('presence', { })
        .c('show').t('chat').up()
        .c('status').t('Happily echoing your <message/> stanzas')
    )
});

client.on('stanza', function (stanza) {
    if (stanza.is('message') &&
        // Important: never reply to errors!
        (stanza.attrs.type !== 'error')) {
        // Swap addresses...
        stanza.attrs.to = stanza.attrs.from;
        delete stanza.attrs.from;
        // and send back
        console.log('Sending response: ' + stanza.root().toString());
        client.send(stanza)
    }
});

client.on('error', function (e) {
    console.error(e)
});