$(document).ready(function() {
    const socket = io();
    let nickname = '';

    $('#enter-chat').click(function() {
        nickname = $('#nickname').val().trim();
        if (nickname) {
            socket.emit('join', nickname);
            $('#login-screen').addClass('hidden');
            $('#chat-container').removeClass('hidden');
        }
    });

    $('#send-message').click(sendMessage);
    $('#message-input').keypress(function(e) {
        if (e.which == 13) sendMessage();
    });

    function sendMessage() {
        const message = $('#message-input').val().trim();
        if (message) {
            socket.emit('chat message', { nickname, message });
            $('#message-input').val('');
        }
    }

    socket.on('chat message', function(data) {
        const linkifiedMessage = linkifyMessage(data.message);
        $('#messages').append(`<p><strong>${data.nickname}:</strong> ${linkifiedMessage}</p>`);
    });

    socket.on('update members', function(members) {
        $('#member-count').text(`(${members.length})`);
        $('#buddy-list-members').empty();
        members.forEach(member => {
            $('#buddy-list-members').append(`<li>${member}</li>`);
        });
    });

    function linkifyMessage(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, function(url) {
            return '<a href="' + url + '" target="_blank">' + url + '</a>';
        });
    }
});

