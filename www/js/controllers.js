angular.module('starter.controllers', [])

  .controller('SongsCtrl', function ($scope, songs, $timeout, $state) {
    var me = this
    this.reorder = false

    function reset () {
      return {
        title: '',
        bpm: 0,
        key: '',
        segments: [{
          label: 'Intro',
          chords: ''
        }]
      }
    }

    if (angular.equals(songs.currentSong, {})) {
      me.song = reset()
    } else {
      me.song = songs.currentSong
    }


    this.up = function (seg, i) {
      me.song.segments.splice(i, 1)
      me.song.segments.splice(i - 1, 0, seg)
    }
    this.down = function (seg, i) {
      me.song.segments.splice(i, 1)
      me.song.segments.splice(i + 1, 0, seg)
    }

    this.update = function (song) {
      songs.update(song).then(function (res) {
        console.log(res)
        $state.go('tab.list')
      })
    }

    this.segmentLabels = [
      'Intro',
      'Verse',
      'Chorus',
      'Bridge',
      'Tag',
      'Instrumental',
      'Custom'
    ]

    this.addSegment = function () {
      this.song.segments.push({
        label: 'Intro',
        chords: '',
        focused: false
      })
    }
    this.create = function () {
      songs.create(this.song).then(function (res) {
        console.log(res)
        me.song = reset()
      })
    }

    this.delete = function (song) {
      songs.delete(song).then(function (res) {
        console.log(res)
        me.song = reset()
        $state.go('tab.list')
      })
    }
  })

  .controller('ListCtrl', function ($scope, songs, $state) {
    var me = this
    songs.get().then(function (res) {
      me.songs = songs.allsongs
    })

    this.toggleExpand = function (song) {
      song.expand = !song.expand
    }

    this.editSong = function (song) {
      songs.currentSong = song
      $state.go('tab.song')
    }
  })

  .controller('SetlistCtrl', function ($scope, setlist, songs, $state, $ionicPopup) {
    var me = this
    setlist.get().then(function () {
      me.sets = setlist.allsets
    })
    this.expandSet = function (set) {
      set.expand = !set.expand
    }

    this.goToSet = function (set) {
      setlist.currentSet = set
      console.log('setting set as current: ',
        setlist.currentSet
      )
      $state.go('setlist-detail')
    }

    this.removeSet = function (set, i) {
      setlist.allsets.splice(i, 1)
      setlist.delete(set)
    }

    this.addNewSet = function () {
      $scope.data = {}
      var popup = $ionicPopup.show({
        scope: $scope,
        template: '<input type="text" ng-model="data.name" placeholder="Set Title" /> <br><input ng-model="data.date" placeholder="Date (options)" />',
        buttons: [
          {text: 'Cancel'},
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function (e) {
              return $scope.data

            }
          }
        ]
      })
      popup.then(function (data) {

        setlist.create(data)
      })
    }
  })
  .controller('SetlistDetailCtrl', function (setlist, songs) {
    this.set = setlist.currentSet
    this.toggleExpandSong = function (song) {
      song.expand = !song.expand
    }

    this.addSongToSet = function (set) {
      var name = prompt('enter song name')
      var results = songs.fuzzySearchByName(name)
      var sure = confirm('Did you mean ' + results[0][1])
      if (sure) {
        setlist.addSongByName(set, results[0][1])
      }
    }

    this.removeSongFromSet = function (set, song, i) {
      set.songs.splice(i, 1)
      setlist.update(set)
    }
  })
