$(document).ready(function() {
            $('#expandButton').click(function() {
                chrome.tabs.create({url: 'expanded.html'});
            });
        });