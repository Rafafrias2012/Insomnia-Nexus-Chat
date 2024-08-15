$(document).ready(function() {
    const socket = io();
    let nickname = '';
    let lastMessageTime = 0;
    const slowModeDelay = 3000; // 3 seconds
    let messageCount = 0;
    const spamLimit = 5;

    $('#enter-chat').click(function() {
        nickname = $('#nickname').val().trim().substring(0, 40);
        if (nickname) {
            socket.emit('join', nickname);
            $('#login-screen').addClass('hidden');
            $('#chat-container').removeClass('hidden');
        }
    });

    $('#send-message').click(sendMessage);
    $('#message-input').keypress(function(e) {
        if (e.which == 13 && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    function sendMessage() {
        const now = Date.now();
        if (now - lastMessageTime < slowModeDelay) {
            alert(`Slow mode is on. Please wait ${(slowModeDelay - (now - lastMessageTime)) / 1000} seconds.`);
            return;
        }

        if (messageCount >= spamLimit) {
            alert('You have reached the spam limit. Please wait before sending more messages.');
            return;
        }

        const message = $('#message-input').val().trim().substring(0, 1000);
        if (message) {
            if (message.startsWith('/image ') || message.startsWith('/video ') || message.startsWith('/audio ')) {
                const [command, url] = message.split(' ');
                socket.emit('media message', { nickname, command: command.slice(1), url });
            } else {
                socket.emit('chat message', { nickname, message });
            }
            $('#message-input').val('');
            lastMessageTime = now;
            messageCount++;
            setTimeout(() => messageCount--, 10000); // Reset message count after 10 seconds
        }
    }

    socket.on('chat message', function(data) {
        const linkifiedMessage = linkifyMessage(data.message);
        appendMessage(data.nickname, linkifiedMessage);
    });

    socket.on('media message', function(data) {
        let mediaElement;
        switch(data.command) {
            case 'image':
                mediaElement = `<img src="${data.url}" alt="User shared image">`;
                break;
            case 'video':
                mediaElement = `<video src="${data.url}" controls></video>`;
                break;
            case 'audio':
                mediaElement = `<audio src="${data.url}" controls></audio>`;
                break;
        }
        appendMessage(data.nickname, mediaElement);
    });

    socket.on('update members', function(members) {
        $('#member-count').text(`(${members.length})`);
        $('#buddy-list-members').empty();
        members.forEach(member => {
            $('#buddy-list-members').append(`<li>${member}</li>`);
        });
    });

    function appendMessage(nickname, content) {
        $('#messages').append(`
            <div class="message">
                <span class="nickname">${nickname}:</span>
                <div class="content">${content}</div>
            </div>
        `);
        $('#messages').scrollTop($('#messages')[0].scrollHeight);
    }

    function linkifyMessage(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, function(url) {
            return '<a href="' + url + '" target="_blank">' + url + '</a>';
        });
    }
});
