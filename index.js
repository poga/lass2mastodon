var request = require('superagent')
var exec = require('child_process').exec
var fs = require('fs')

var gif = 'https://pm25.lass-net.org/LASS/assets/IDW_gif/Taiwan_latest_thumbnail.gif'
var HOST = process.env.HOST
var TOKEN = process.env.TOKEN

exec(`curl ${gif} > a.gif`, function (err) {
  if (err) throw err

  exec(`convert -limit memory 1mb -coalesce a.gif zz%03d.png`, function (err) {
    if (err) throw err

    fs.readdir('.', function (err, files) {
      if (err) throw err

      var lastFrame = files.sort().slice(-1)[0]
      uploadMedia(lastFrame, function (err, mediaID) {
        if (err) throw err
        post(mediaID, function (err) {
          if (err) throw err

          // remove temp frames
          fs.readdir('.', function (err, files) {
            if (err) throw err
            files.forEach(f => {
              if (f.startsWith('zz')) fs.unlinkSync(f)
            })
          })
        })
      })
    })
  })
})

function uploadMedia (filename, cb) {
  request
    .post(`${HOST}/api/v1/media`)
    .query({ access_token: TOKEN })
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
    .query({ access_token: TOKEN })
    .type('form')
    .send({ status: '空污情報', 'media_ids[]': mediaID })
    .end(cb)
}
