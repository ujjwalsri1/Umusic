new Vue({
  el: "#app",
  data() {
    return {
      audio: null,
      circleLeft: null,
      barWidth: null,
      duration: "00:00",
      currentTime: "00:00",
      isTimerPlaying: false,
      tracks: [
        {
          name: "KABHI KABHI ADITI 💔",
          artist: "RASHID ALI",
          cover: "./img/1.jpg",
          source: "./mp3/1.mp3",
          url: "https://youtu.be/AX7t8ZwroHQ?feature=shared",
          favorited: false
        },
        // 👉 rest of your songs unchanged
      ],
      currentTrack: null,
      currentTrackIndex: 0,
      transitionName: null
    };
  },

  methods: {
    // 🎵 NEW: Load files from device
    loadFiles(e) {
      const files = Array.from(e.target.files);

      files.forEach(file => {
        this.tracks.push({
          name: file.name,
          artist: "Local File",
          cover: "./img/umusic.jfif",
          source: URL.createObjectURL(file),
          url: "#",
          favorited: false
        });
      });

      // auto play first uploaded song
      if (files.length) {
        this.currentTrackIndex = this.tracks.length - files.length;
        this.currentTrack = this.tracks[this.currentTrackIndex];
        this.resetPlayer();
      }
    },

    // 🎯 NEW: select from playlist
    selectTrack(index) {
      this.currentTrackIndex = index;
      this.currentTrack = this.tracks[index];
      this.resetPlayer();
    },

    play() {
      if (this.audio.paused) {
        this.audio.play();
        this.isTimerPlaying = true;
      } else {
        this.audio.pause();
        this.isTimerPlaying = false;
      }
    },

    generateTime() {
      let width = (100 / this.audio.duration) * this.audio.currentTime;
      this.barWidth = width + "%";
      this.circleLeft = width + "%";

      let durmin = Math.floor(this.audio.duration / 60);
      let dursec = Math.floor(this.audio.duration % 60);
      let curmin = Math.floor(this.audio.currentTime / 60);
      let cursec = Math.floor(this.audio.currentTime % 60);

      this.duration = `${durmin.toString().padStart(2, "0")}:${dursec
        .toString()
        .padStart(2, "0")}`;
      this.currentTime = `${curmin.toString().padStart(2, "0")}:${cursec
        .toString()
        .padStart(2, "0")}`;
    },

    updateBar(x) {
      let progress = this.$refs.progress;
      let maxduration = this.audio.duration;
      let position = x - progress.offsetLeft;
      let percentage = (100 * position) / progress.offsetWidth;

      percentage = Math.max(0, Math.min(100, percentage));

      this.barWidth = percentage + "%";
      this.circleLeft = percentage + "%";
      this.audio.currentTime = (maxduration * percentage) / 100;
      this.audio.play();
    },

    clickProgress(e) {
      this.isTimerPlaying = true;
      this.audio.pause();
      this.updateBar(e.pageX);
    },

    prevTrack() {
      this.transitionName = "scale-in";

      if (this.currentTrackIndex > 0) {
        this.currentTrackIndex--;
      } else {
        this.currentTrackIndex = this.tracks.length - 1;
      }

      this.currentTrack = this.tracks[this.currentTrackIndex];
      this.resetPlayer();
    },

    nextTrack() {
      this.transitionName = "scale-out";

      if (this.currentTrackIndex < this.tracks.length - 1) {
        this.currentTrackIndex++;
      } else {
        this.currentTrackIndex = 0;
      }

      this.currentTrack = this.tracks[this.currentTrackIndex];
      this.resetPlayer();
    },

    resetPlayer() {
      this.barWidth = 0;
      this.circleLeft = 0;
      this.audio.currentTime = 0;
      this.audio.src = this.currentTrack.source;

      setTimeout(() => {
        if (this.isTimerPlaying) {
          this.audio.play();
        }
      }, 300);
    },

    favorite() {
      this.tracks[this.currentTrackIndex].favorited =
        !this.tracks[this.currentTrackIndex].favorited;
    }
  },

  created() {
    let vm = this;

    this.currentTrack = this.tracks[0];
    this.audio = new Audio();
    this.audio.src = this.currentTrack.source;

    this.audio.ontimeupdate = function () {
      vm.generateTime();
    };

    this.audio.onloadedmetadata = function () {
      vm.generateTime();
    };

    this.audio.onended = function () {
      vm.nextTrack();
      vm.isTimerPlaying = true;
    };

    // preload covers
    this.tracks.forEach(track => {
      let link = document.createElement("link");
      link.rel = "prefetch";
      link.href = track.cover;
      link.as = "image";
      document.head.appendChild(link);
    });
  }
});
