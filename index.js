/**
 * Globals
 */
var baseUrl;      // required cos cors policy and im an idiot
var descriptions; // loaded when DOMContentLoaded fires

/**
 * Audio player controls
 */
var player = document.getElementById('audio-player');
var pauseBtn = document.getElementById('player-control-pause');
var playBtn = document.getElementById('player-control-play');
var seekerBar = document.getElementById('player-seeker-bar');
var seekerBarFill = document.getElementById('player-seeker-bar-fill');
var loopAllBtn = document.querySelector('.loop-all-btn');
var loopOneBtn = document.querySelector('.loop-one-btn');
var loopOffBtn = document.querySelector('.loop-off-btn');
var selectElement = document.getElementById('music-selector');
var shareBtn = document.getElementById('share-beat-btn');
var musicSelector = document.getElementById('music-selector');

/**
 * Audio player state
 */
var playerTrackTitle = document.getElementById('track-title-0');
var seekerTimeCurrent = document.getElementById('seeker-time-current');
var seekerTimeRemaining = document.getElementById('seeker-time-remaining');
var linkDisplay = document.getElementById('link-display');
var notification = document.getElementById('notification');
var isDragging = false;
var loopMode = 'all'; // choices: all, one, undefined
var desc = document.getElementById('beat-description');

if (window.location.href.includes('nbdybeats.com')) {
    baseUrl = "https://nbdybeats.com";
} else {
    baseUrl = "https://nbdybeats.github.io";
}




/**
 * Formatting
 */
function timeToString(t) {
    let minutes = String(Math.floor(t/60));
    let seconds = String(Math.floor(t%60));
    seconds = seconds.length === 1? '0'+seconds:seconds;
    return {minutes, seconds};
}

/**
 * Share
 */
function fallbackCopyTextToClipboard(text) {
    let textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "absolute";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        let successful = document.execCommand('copy');
        let msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        alert('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
  }


function copyLink() {
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
    let selectedValue = musicSelector.value;
    let newUrl = `${baseUrl}?beat=${selectedValue.replaceAll(' ', '%20')}`;
    if (linkDisplay.style.display === 'none') {
        linkDisplay.style.display = 'block';
    }
    if (shareBtn.style.display === 'block') {
        shareBtn.style.display = 'none';
    }
    linkDisplay.value = newUrl;
    copyLink();
}

/**
 * Controls
 */
function setLoopMode(newMode) {
    if (newMode === 'all') {
        loopMode = 'all';
        loopAllBtn.disabled = true; loopOneBtn.disabled = false;
        loopOffBtn.disabled = false;
    } else if (newMode === 'one') {
        loopMode = 'one';
        loopAllBtn.disabled = false; loopOneBtn.disabled = true;
        loopOffBtn.disabled = false;
    } else {
        loopMode = '';
        loopAllBtn.disabled = false; loopOneBtn.disabled = false;
        loopOffBtn.disabled = true;
    }
}

function changeTrack() {
    if (linkDisplay.style.display === 'block')
        linkDisplay.style.display = 'none';
    if (shareBtn.style.display === 'none') shareBtn.style.display = 'block';

    let selectedTrack = musicSelector.value;

    playerTrackTitle.innerHTML = selectedTrack;

    player.src = 'beats/' + selectedTrack + '.mp3';
    player.load();
    player.play();

    desc.textContent = descriptions[selectedTrack];
    desc.style.color = 'white';
}

function goToNextTrack() {
    let selectedTrack = musicSelector.value;
    console.log(`${selectedTrack} ended.`);
    let tracklist = Object.keys(descriptions);
    let selectedIndex = tracklist.indexOf(selectedTrack);
    let next = tracklist[(selectedIndex+1)%tracklist.length];
    console.log(`playing ${next} now.`);
    musicSelector.value = next;
    changeTrack();
}

function updateAudioTime(event) {
    let barRect = seekerBar.getBoundingClientRect();
    let clickPosition = (event.clientX - barRect.left) / barRect.width;
    let newTime = clickPosition * player.duration;
    if (!Number.isNaN(newTime)) {
        updateSeekerBarFill(clickPosition);
        updateSeekerTimeCurrent(newTime);
        updateSeekerTimeRemaining(newTime, player.duration);
    }
}

function updateSeekerBarFill(currentPosition) {
    seekerBarFill.style.width = `${(1 + (currentPosition*100))%100}%`;
}

function updateSeekerTimeCurrent(currentTime) {
    let {minutes, seconds} = timeToString(currentTime);
    seekerTimeCurrent.textContent = `${minutes}:${seconds}`;
}

function updateSeekerTimeRemaining(currentTime, duration) {
    let {minutes, seconds} = timeToString(duration-currentTime);
    seekerTimeRemaining.textContent = `-${minutes}:${seconds}`;
}

/**
 * Event handlers - elements
 */
seekerBar.addEventListener('mousedown', function(event) {
    isDragging = true;
    updateAudioTime(event);
});

player.onended = function () {
    if (loopMode === 'all') goToNextTrack();
    else if (loopMode === 'one') player.play();
}

player.oncanplay = function () {
    playBtn.disabled = false;
}

player.onplay = function() {
    pauseBtn.style.display = 'flex';
    playBtn.style.display = 'none';
    let selectedValue = musicSelector.value;
    document.getElementById("page-title").text = "nbdybeats/"+selectedValue;
}

player.onpause = function() {
    playBtn.style.display = 'flex';
    pauseBtn.style.display = 'none';
}

player.ondurationchange = function(e) {
    let {minutes, seconds} = timeToString(e.target.duration);
    seekerTimeRemaining.textContent = `${minutes}:${seconds}`;
}

player.ontimeupdate = function(e) {
    if (isDragging) return;
    let {currentTime, duration} =  e.target;
    if (currentTime===0) {
        seekerBarFill.style.width = '0%';
        if (!Number.isNaN(duration)) {
            seekerTimeCurrent.textContent = duration;
        }
    } else {
        let currentPosition = currentTime/duration;
        updateSeekerBarFill(currentPosition);
        updateSeekerTimeCurrent(currentTime);
        updateSeekerTimeRemaining(currentTime, duration);
    }
}

/**
 * Event handlers - document
 */
document.addEventListener('mousemove', function(event) {
    if (isDragging) {
        updateAudioTime(event);
    }
});

document.addEventListener('mouseup', function(event) {
    if (isDragging) {
        let barRect = seekerBar.getBoundingClientRect();
        let clickPosition = (event.clientX - barRect.left) / barRect.width;
        let newTime = clickPosition * player.duration;
        if (!Number.isNaN(newTime)) {
            updateSeekerBarFill(clickPosition);
            player.currentTime = newTime;
        }
    }
    isDragging = false;
});

document.addEventListener('DOMContentLoaded', function() {
    function getParameterByName(name, url = window.location.href) {
        name = name.replace(/[\[\]]/g, '\\$&');
        let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
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
            let chosenOne = getParameterByName('beat');

            if (chosenOne && Object.keys(descriptions).includes(chosenOne)) {
                musicSelector.value = chosenOne;
                changeTrack();
            }
        });
    } else {
        var chosenOne = getParameterByName('beat');
        if (chosenOne && Object.keys(descriptions).includes(chosenOne)) {
            musicSelector.value = chosenOne;
            changeTrack();
        }
    }
});