var request = require('request')
var flowerPower = require('flower-power')

module.exports = function (callback) {
  var devices = []
  var objects = []

  // Request to the database
  request.get('http://' + process.env.NETBEAST + '/api/resources?app=flower-power-plugin',
  function (err, resp, body) {
    if (body) body = JSON.parse(body)
    if (err) return callback(err)
    if (body === undefined || !body) return
    // Store the found devices in 'objects' array
    if (body.length > 0) {
      body.forEach(function (device) {
        if (objects.indexOf(device.hook.split('/')[2]) < 0) objects.push(device.hook.split('/')[2])
      })
    }
  })

  // Implement the device discovery method
  flowerPower.discoverAll(function (device) {
    devices.push(device) // Save flowerPower on devices object. It will be used on routes.js
    var indx = objects.indexOf(device._peripheral._noble.address)
    if (indx >= 0) {
      objects.splice(indx, 1)
    } else {
      request.post({url: 'http://' + process.env.NETBEAST + '/api/resources',
      json: {
        app: 'flower-power-plugin',
        location: 'none',
        topic: 'temperature',
        groupname: 'none',
        hook: '/temperature/' + device._peripheral._noble.address
      }},
      function (err, resp, body) {
        if (err) return callback(err)
      })

      request.post({url: 'http://' + process.env.NETBEAST + '/api/resources',
      json: {
        app: 'flower-power-plugin',
        location: 'none',
        topic: 'humidity',
        groupname: 'none',
        hook: '/humidity/' + device._peripheral._noble.address
      }},
      function (err, resp, body) {
        if (err) return callback(err)
      })

      request.post({url: 'http://' + process.env.NETBEAST + '/api/resources',
      json: {
        app: 'flower-power-plugin',
        location: 'none',
        topic: 'luminosity',
        groupname: 'none',
        hook: '/luminosity/' + device._peripheral._noble.address
      }},
      function (err, resp, body) {
        if (err) return callback(err)
      })

      request.post({url: 'http://' + process.env.NETBEAST + '/api/resources',
      json: {
        app: 'flower-power-plugin',
        location: 'none',
        topic: 'battery',
        groupname: 'none',
        hook: '/battery/' + device._peripheral._noble.address
      }},
      function (err, resp, body) {
        if (err) return callback(err)
      })
    }
  })

  setTimeout(function () {
    flowerPower.stopDiscoverAll(callback)
  }, 10000)

  setTimeout(function () {
    if (objects.length > 0) {
      objects.forEach(function (hooks) {
        request.del('http://' + process.env.NETBEAST + '/api/resources?hook=/temperature/' + hooks,
        function (err, resp, body) {
          if (err) callback(err)
        })
        request.del('http://' + process.env.NETBEAST + '/api/resources?hook=/humidity/' + hooks,
        function (err, resp, body) {
          if (err) callback(err)
        })
        request.del('http://' + process.env.NETBEAST + '/api/resources?hook=/luminosity/' + hooks,
        function (err, resp, body) {
          if (err) callback(err)
        })
        request.del('http://' + process.env.NETBEAST + '/api/resources?hook=/battery/' + hooks,
        function (err, resp, body) {
          if (err) callback(err)
        })
      })
    }
    callback(null, devices)
  }, 20000)
}
