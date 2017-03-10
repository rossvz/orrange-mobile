angular.module('starter.controllers', [])

  .controller('SongsCtrl', function ($scope, songs, $timeout) {
    var me = this
    this.reorder = false

    function reset () {
      me.song = {
        title: '',
        bpm: 0,
        key: '',
        segments: [{
          label: 'Intro',
          chords: ''
        }]
      }
    }

    this.up = function (seg, i) {
      me.song.segments.splice(i, 1)
      me.song.segments.splice(i - 1, 0, seg)
    }
    this.down = function (seg, i) {
      me.song.segments.splice(i, 1)
      me.song.segments.splice(i + 1, 0, seg)
    }

    this.moveSegment = function (seg, from, to) {
      console.log('moving from ', from, 'to ', to)
      me.song.segments.splice(from, 1)
      me.song.segments.splice(to, 0, seg)
    }

    this.focusSegment = function (i) {
      me.song.segments[i].focused = true
      $timeout(function () {
        me.song.segments[i].focused = false

      }, 3000)
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
        reset()
      })
    }
    reset()
  })

  .controller('ListCtrl', function ($scope, songs) {
    var me = this
    songs.get().then(function (res) {
      me.songs = songs.allsongs
    })

    this.toggleExpand = function (song) {
      song.expand = !song.expand
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
