$(document).ready(function() {
    const messagesContainer = $('#messages');
    const userInput = $('#userInput');
    const sendButton = $('#sendButton');
    const attachButton = $('#attachButton');
    const fileInput = $('#fileInput');
    const fileInfo = $('#fileInfo');

    let currentAttachment = null;

    function addMessage(content, isUser = false) {
        const messageClass = isUser ? 'user-message' : 'assistant-message';
        messagesContainer.append(`
            <div class="message-container">
                <div class="message ${messageClass}">${content}</div>
            </div>
        `);
        messagesContainer.scrollTop(messagesContainer[0].scrollHeight);
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }

    function updateFileInfo() {
        if (currentAttachment) {
            fileInfo.html(`
                <div class="file-info">
                    <i class="fas fa-file file-icon"></i>
                    <div class="file-details">
                        <span class="file-name">${currentAttachment.name}</span>
                        <span class="file-size">${formatFileSize(currentAttachment.size)}</span>
                    </div>
                    <span class="cancel-file"><i class="fas fa-times"></i></span>
                </div>
            `);
        } else {
            fileInfo.empty();
        }
    }

    function sendMessage() {
        const message = userInput.val().trim();
        const formData = new FormData();

        if (message) {
            formData.append('message', message);
            addMessage(message, true);
        }

        if (currentAttachment) {
            formData.append('file', currentAttachment);
            addMessage(`File attached: ${currentAttachment.name}`, true);
        }

        if (message || currentAttachment) {
            // API call for sending user message and file
            $.ajax({
                url: 'https://api.example.com/send-message',
                method: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    console.log("Message sent successfully");
                    // After sending the message, fetch the assistant's response
                    fetchAssistantResponse();
                },
                error: function(xhr, status, error) {
                    console.error("Error sending message:", error);
                    addMessage("Sorry, there was an error sending your message. Please try again later.", false);
                }
            });

            userInput.val('');
            currentAttachment = null;
            fileInput.val('');
            updateFileInfo();
        }
    }

    function fetchAssistantResponse() {
        // Show a loading message
        const loadingMessage = "Assistant is typing...";
        addMessage(loadingMessage, false);

        $.ajax({
            url: 'https://api.example.com/get-assistant-response',
            method: 'GET',
            success: function(response) {
                // Remove the loading message
                messagesContainer.children().last().remove();
                // Add the assistant's response
                addMessage(response.message, false);
            },
            error: function(xhr, status, error) {
                // Remove the loading message
                messagesContainer.children().last().remove();
                console.error("Error fetching assistant response:", error);
                addMessage("I apologize, but I'm having trouble responding right now. Please try again in a moment.", false);
            }
        });
    }

    sendButton.click(sendMessage);

    userInput.keypress(function(e) {
        if (e.which == 13) {
            sendMessage();
            return false;
        }
    });

    attachButton.click(function() {
        fileInput.click();
    });

    fileInput.change(function(e) {
        currentAttachment = e.target.files[0];
        if (currentAttachment) {
            updateFileInfo();
        }
    });

    $(document).on('click', '.cancel-file', function() {
        currentAttachment = null;
        fileInput.val('');
        updateFileInfo();
    });
});