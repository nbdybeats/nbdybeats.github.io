var descriptions;
var baseUrl = "https://nbdybeats.github.io";

function changeTrack() {
    var linkDisplay = document.getElementById('link-display');
    if (linkDisplay.style.display === 'block') {
        linkDisplay.style.display = 'none';
    }
    var shareBtn = document.getElementById('share-beat-btn');
    if (shareBtn.style.display === 'none') {
        shareBtn.style.display = 'block';
    }

    var player = document.getElementById('audio-player');
    var musicSelector = document.getElementById('music-selector');
    var selectedTrack = musicSelector.value;

    player.src = 'beats/' + selectedTrack + '.mp3';
    player.load();
    player.play();

    var desc = document.getElementById('beat-description');
    desc.textContent = descriptions[selectedTrack];
}

function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "absolute";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
      alert('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
  }


function copyLink() {
    var notification = document.getElementById('notification');
    async function notify() {
        if (notification.style.display === 'none') {
            notification.style.display = 'block';
            setTimeout(
                function() {
                    notification.style.display = 'none';
                },
                3000
            );
        }
    }
    newUrl = document.getElementById('link-display').value;
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(newUrl);
        notify();
    } else {
        navigator.clipboard.writeText(newUrl).then(notify);
    }
}

function generateLink() {
    var selectElement = document.getElementById('music-selector');
    var selectedValue = selectElement.value;
    var baseUrl = window.location.href.split('?')[0];
    var newUrl = `${baseUrl}?beat=${selectedValue.replaceAll(' ', '%20')}`;
    var linkDisplay = document.getElementById('link-display');
    if (linkDisplay.style.display === 'none') {
        linkDisplay.style.display = 'block';
    }
    var shareBtn = document.getElementById('share-beat-btn');
    if (shareBtn.style.display === 'block') {
        shareBtn.style.display = 'none';
    }
    linkDisplay.value = newUrl;

    copyLink();
}

document.addEventListener('DOMContentLoaded', function() {
    function getParameterByName(name, url = window.location.href) {
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    if (typeof(descriptions) === 'undefined') {
        // JSON Parser
        fetch(`${baseUrl}/assets/descriptions.json`).then(
            response => response.json()
        ).then(data => {descriptions = data;}).then(() => {
            var chosenOne = getParameterByName('beat');

            if (chosenOne && Object.keys(descriptions).includes(chosenOne)) {
                var selectElement = document.getElementById('music-selector');
                selectElement.value = chosenOne;
                changeTrack();
            }
        });
    } else {
        var chosenOne = getParameterByName('beat');
        if (chosenOne && Object.keys(descriptions).includes(chosenOne)) {
            var selectElement = document.getElementById('music-selector');
            selectElement.value = chosenOne;
            changeTrack();
        }
    }

});