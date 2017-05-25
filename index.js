var request = require('superagent')
var exec = require('child_process').exec
var fs = require('fs')

var gif = 'https://pm25.lass-net.org/LASS/assets/IDW_gif/Taiwan_latest_last_24h.gif'
var HOST = process.env.HOST
var TOKEN = process.env.TOKEN

exec(`curl ${gif} > a.gif`, function (err) {
  if (err) throw err

  exec(`convert a.gif zz%03d.png`, function (err) {
    if (err) throw err

    fs.readdir('.', function (err, files) {
      if (err) throw err

      var lastFrame = files.sort().slice(-1)[0]
      uploadMedia(lastFrame, function (err, mediaID) {
        if (err) throw err
        console.log(mediaID)
        post(mediaID, function (err) {
          if (err) throw err
        })
      })
    })
  })
})

function uploadMedia (filename, cb) {
  request
    .post(`${HOST}/api/v1/media`)
    .query({access_token: TOKEN})
    .type('form')
    .attach('file', filename)
    .end(function (err, res) {
      if (err) return cb(err)

      cb(null, res.body.id)
    })
}

function post (mediaID, cb) {
  request
    .post(`${HOST}/api/v1/statuses`)
    .query({access_token: TOKEN})
    .type('form')
    .send({status: 'PM2.5', 'media_ids[]': mediaID})
    .end(cb)
}
