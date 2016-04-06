# nactorino
A minimalistic Actor Model library for nodeJS.

[![Build Status](https://travis-ci.org/gcacace/nactorino.svg)](https://travis-ci.org/gcacace/nactorino)
[![devDependency Status](https://david-dm.org/gcacace/nactorino/dev-status.svg)](https://david-dm.org/gcacace/nactorino#info=devDependencies)
[![NPM version](https://badge.fury.io/js/nactorino.svg)](https://www.npmjs.com/package/nactorino)
[![Downloads](https://img.shields.io/npm/dm/nactorino.svg?style=flat)](https://www.npmjs.com/package/nactorino)

In a Nutshell
-------------
Node is great, as event-driven language. Everything is non-blocking, callbacks are called asynchronously.
But sometimes you need to ensure atomicity of multiple asynchronous calls, which is not really trivial without the usage of a specific library.
An example for that would be that scenario:

```
function addToPlaylist(song, callback) {
    // Get song playlist
    player.getPlaylist(function (err, playlist) {
        if (err) {
            return callback(err);
        }

        // Check if song is already in the playlist
        if(playlist.getSongs().indexOf(song) > -1) {
            return callback('Song already in playlist');
        }

        // Add song to the playlist
        playlist.addSong(song, function (err) {
            if (err) {
                return callback(err);
            }
            return callback(null, true);
        });
    });
}
```

The code above contains calls to several asynchronous methods, and this doesn't guarantee atomicity in the execution of the whole function `addToPlaylist()`.

This library aims to help developers implementing a very basic Actor Model in node (nothing more than a command queue system).

> **Note:** For more advanced features, please have a look at libraries such as [drama](https://github.com/stagas/drama) and [NActor](https://github.com/benlau/nactor).

How to use
-------------
### Installation
```
npm install --save nactorino
```

### Example usage

```js
var Actor = require('nactorino');

var playlistActor = new Actor({

    // This method returns a Promise
    addToPlaylist: function(song) {
        return new Promise(function (resolve, reject) {
            // Get song playlist
            player.getPlaylist(function (err, playlist) {
                if (err) {
                    return reject(err);
                }

                // Check if song is already in the playlist
                if(playlist.getSongs().indexOf(song) > -1) {
                    return reject('Song already in playlist');
                }

                // Add song to the playlist
                playlist.addSong(song, function (err) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(true);
                });
            });
        });
    },
    removeFromPlaylist: function (song) {
        // [...]
    },

    // This method returns a materialized result
    ping: function (pingData) {
        return pingData;
    }
});

playlistActor.ask('addToPlaylist', song)
    .then(function (result) {
        console.info('Song ' + song.title + ' added to the playlist');
    })
    .catch(function (error) {
        console.error('Unable to add song ' + song.title + ' to the playlist', error);
    });

playlistActor.ask('removeFromPlaylist', song)
    .then(function (result) {
        console.info('Song ' + song.title + ' removed from the playlist');
    })
    .catch(function (error) {
        console.error('Unable to remove song ' + song.title + ' to the playlist', error);
    });

```

> **Note:** All the methods declared into the same actor are executed sequentially. This is extremely useful when accessing a shared object (in that case a playlist).

Caveats
-------------
Currently there is no support for asynchronous calls using the classic node callback structure.
In the meantime those calls can be wrapped in a Promise using `Promise.denodeify()`.

License
-------------
Copyright © 2016 Gianluca Cacace

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the “Software”), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
