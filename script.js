document.addEventListener("DOMContentLoaded", function () {
    // Select elements
    let hamburger = document.querySelector(".hamburger");
    let closeBtn = document.querySelector(".close");
    let leftPanel = document.querySelector(".left");

    // Initially hide the sidebar and close button
    leftPanel.style.left = "-100%";
    closeBtn.style.display = "none";

    // Open sidebar when clicking hamburger
    hamburger.addEventListener("click", function () {
        leftPanel.style.left = "0"; // Slide in sidebar
        closeBtn.style.display = "block"; // Show close button
    });

    // Close sidebar when clicking close button
    closeBtn.addEventListener("click", function () {
        leftPanel.style.left = "-100%"; // Slide out sidebar
        closeBtn.style.display = "none"; // Hide close button
    });

    // Song data
    let allSongs = [
        { name: "Ankhe Khuli", file: "songs/ankhe khuli.mp3" },
        { name: "Chalte Chalte", file: "songs/chalte chalte.mp3" },
        { name: "Hukum", file: "songs/hukum.mp3" },
        { name: "Soni Soni", file: "songs/soni soni.mp3" },
        { name: "Sultan KGF", file: "songs/sultan kgf.mp3" }
    ];
    
    let artists = [
        { name: "Pritam", songs: [allSongs[0], allSongs[1], allSongs[2]] },
        { name: "AR.Rahman", songs: [allSongs[1], allSongs[2], allSongs[3]] },
        { name: "Arijit Singh", songs: [allSongs[2], allSongs[3], allSongs[4]] }
    ];
    
    // Global variables
    let currentAudio = null;
    let currentPlayingIndex = -1;
    let isDragging = false;
    let currentSongs = [...allSongs]; // This will hold the currently displayed songs (all or artist selection)

    // Select elements
    let seekbar = document.querySelector(".seekbar");
    let circle = document.querySelector(".circle");
    let songInfo = document.querySelector(".songinfo");
    let songTime = document.querySelector(".songtime");
    let playButton = document.getElementById("play");
    let nextButton = document.getElementById("next");
    let prevButton = document.getElementById("previous");
    let songUL = document.querySelector(".songList ul");

    // Load songs into list
    function loadSongs(songsArray) {
        currentSongs = [...songsArray]; // Update the current songs
        songUL.innerHTML = ""; // Clear list before adding new items

        songsArray.forEach((song, index) => {
            let li = document.createElement("li");
            li.classList.add("song-item");
            li.style.cursor = "pointer";
            li.style.display = "flex";
            li.style.alignItems = "center";
            li.style.justifyContent = "space-between";
            li.style.padding = "18px";
            li.style.borderBottom = "1px solid gray";

            let musicIcon = document.createElement("img");
            musicIcon.src = "music.svg";
            musicIcon.width = 20;
            musicIcon.height = 20;
            musicIcon.alt = "Music Icon";
            musicIcon.style.filter = "invert(1)";

            let songName = document.createElement("span");
            songName.textContent = song.name;
            songName.style.flex = "1";
            songName.style.color = "white";

            let playIcon = document.createElement("img");
            playIcon.src = "play.svg";
            playIcon.width = 24;
            playIcon.height = 24;
            playIcon.alt = "Play Icon";
            playIcon.style.cursor = "pointer";
            playIcon.style.filter = "invert(1)";

            let playText = document.createElement("span");
            playText.textContent = "Play Now";
            playText.style.marginRight = "10px";

            // Play button event
            playIcon.addEventListener("click", (event) => {
                event.stopPropagation();
                togglePlayPause(index, playIcon);
            });

            li.appendChild(musicIcon);
            li.appendChild(songName);
            li.appendChild(playText);
            li.appendChild(playIcon);
            songUL.appendChild(li);
        });
    }

    // Function to get 3 random songs from an artist's songs
    function getRandomArtistSongs(artistSongs) {
        let shuffledSongs = [...artistSongs]; // Copy the artist's songs array
        shuffledSongs.sort(() => Math.random() - 0.5); // Shuffle the array
        return shuffledSongs.slice(0, 3); // Get the first 3 songs after shuffle
    }

    // Add event listener to each artist card
    let artistCards = document.querySelectorAll(".card"); // Changed to .card to match your existing selector
    
    artistCards.forEach(card => {
        card.addEventListener("click", function() {
            let artistName = this.querySelector("h2").innerText;
            let artist = artists.find(a => a.name === artistName);
            
            if (artist) {
                // Get 3 random songs from this artist's collection
                let randomSongs = getRandomArtistSongs(artist.songs);

                // Load the random songs into the song list
                loadSongs(randomSongs);
                
                // Reset current audio if playing
                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio = null;
                    currentPlayingIndex = -1;
                    playButton.src = "play.svg";
                    songInfo.textContent = "";
                    songTime.textContent = "";
                    circle.style.left = "0%";
                }
            }
        });
    });

    // Toggle song play/pause
    function togglePlayPause(index, playIcon) {
        let songPath = currentSongs[index].file.replace(/ /g, "%20");

        if (currentPlayingIndex === index && currentAudio && !currentAudio.paused) {
            currentAudio.pause();
            playIcon.src = "play.svg";
            playButton.src = "play.svg"; // Update global play button
        } else {
            if (currentAudio) {
                currentAudio.pause();
                let allPlayIcons = document.querySelectorAll(".songList ul li img:nth-child(4)");
                if (currentPlayingIndex !== -1) {
                    allPlayIcons[currentPlayingIndex].src = "play.svg";
                }
            }

            // Play new song
            currentAudio = new Audio(songPath);
            currentAudio.play();
            playIcon.src = "pause.svg";
            playButton.src = "pause.svg"; // Update global play button
            currentPlayingIndex = index;

            // Update playbar song info
            songInfo.textContent = currentSongs[index].name;

            // Seekbar Animation
            currentAudio.addEventListener("timeupdate", updateSeekbar);
            currentAudio.addEventListener("ended", () => resetUI(playIcon));
        }
    }

    // Update seekbar and song time
    function updateSeekbar() {
        if (!isDragging && currentAudio) {
            let progress = (currentAudio.currentTime / currentAudio.duration) * 100;
            circle.style.left = progress + "%";
            songTime.textContent = formatTime(currentAudio.currentTime) + " / " + formatTime(currentAudio.duration);
        }
    }

    // Seekbar dragging functionality
    circle.addEventListener("mousedown", function () {
        isDragging = true;
    });

    document.addEventListener("mouseup", function () {
        isDragging = false;
    });

    seekbar.addEventListener("click", function (event) {
        if (currentAudio) {
            let seekbarRect = seekbar.getBoundingClientRect();
            let clickPosition = (event.clientX - seekbarRect.left) / seekbarRect.width;
            currentAudio.currentTime = clickPosition * currentAudio.duration;
            updateSeekbar();
        }
    });

    // Reset UI when song ends
    function resetUI(playIcon) {
        playIcon.src = "play.svg";
        playButton.src = "play.svg";
        currentPlayingIndex = -1;
        circle.style.left = "0%";
    }

    // Toggle global play/pause
    function toggleGlobalPlayPause() {
        if (currentAudio) {
            if (currentAudio.paused) {
                currentAudio.play();
                playButton.src = "pause.svg";
            } else {
                currentAudio.pause();
                playButton.src = "play.svg";
            }
        }
    }

    // Change song (Next or Previous)
    function changeSong(direction) {
        if (currentSongs.length === 0) return;

        // Stop and reset the currently playing song
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0; // Reset time
            currentAudio = null; // Clear the current audio reference
        }

        let newIndex = (currentPlayingIndex + direction + currentSongs.length) % currentSongs.length;

        if (currentPlayingIndex !== -1) {
            let allPlayIcons = document.querySelectorAll(".songList ul li img:nth-child(4)");
            allPlayIcons[currentPlayingIndex].src = "play.svg";
        }

        let songPath = currentSongs[newIndex].file.replace(/ /g, "%20");
        currentAudio = new Audio(songPath);
        currentAudio.play();
        playButton.src = "pause.svg";
        currentPlayingIndex = newIndex;

        songInfo.textContent = currentSongs[newIndex].name;

        currentAudio.addEventListener("timeupdate", updateSeekbar);
        currentAudio.addEventListener("ended", () => resetUI(playButton));
    }

    // Format time in mm:ss
    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        let mins = Math.floor(seconds / 60);
        let secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    }

    // Playbar event listeners
    playButton.addEventListener("click", toggleGlobalPlayPause);
    nextButton.addEventListener("click", () => changeSong(1));
    prevButton.addEventListener("click", () => changeSong(-1));

    // Load all songs initially
    loadSongs(allSongs);
});