/*
  We use this file to discover the devices.
  Once we find a device, we shuold:
    1. Register the device in the database, by following the given structure
    2. If the device is not available anymore, we should delete it from the database
*/

var request = require('request')
var flowerPower = require('flower-power')

var devices = []

module.exports = function (callback) {

  // First we ask the database for all the devices of the same brand that are stored
  // We stored the hooks of this devices in the 'objects' array
  var objects = []

  // Request to the database
  request.get('http://' + process.env.NETBEAST + '/api/resources?app=flower-power-plugin',
  function (err, resp, body) {
    if (err) return callback(err)
    if (!body) return callback()

    body = JSON.parse(body)

    // Store the found devices in 'objects' array
    if (body.length > 0) {
      body.forEach(function (device) {
        if (objects.indexOf(device.hook) < 0) objects.push(device.hook)
      })
    }
  })



  // Implement the device discovery method

  //Discovery method for flowerPower
  flowerPower.discoverAll(function(device){
    devices.push(device) // Save flowerPower on devices object. It will be used on routes.js
    // When we find a device
    //  1. Look if its already exists on the database.
    var indx = objects.indexOf('/flower-power-plugin/' + device._peripheral._noble.address) // hook == /Namebrand/id. Example. /hueLights, /Sonos
    // We will use the id to access to the device and modify it.
    // Any value to refer this device (MacAddress, for example) can work as id

    //  2. If the hook is in 'objects' array, delete it from the array
    if (indx >= 0) {
      objects.splice(indx, 1)

    // 3. If this device is not registered on the database, you should register it
    } else {
      //  Use this block to register the found device on the netbeast database
      //  in order to using it later
      request.post({url: 'http://' + process.env.NETBEAST + '/api/resources',
      json: {
        app: 'flower-power-plugin',          // Name of the device brand
        location: 'none',
        topic: 'temperature',      // lights, bridge, switch, temperature, sounds, etc
        groupname: 'none',
        hook: '/temperature/' + device._peripheral._noble.address  // HOOK == /Namebrand  Example. /hueLights, /Sonos
        // We will use the id to access to the device and modify it.
        // Any value to refer this device (MacAddress, for example) can work as id
      }},
      function (err, resp, body) {
        if (err) return callback(err)
        callback
      })

      request.post({url: 'http://' + process.env.NETBEAST + '/api/resources',
      json: {
        app: 'flower-power-plugin',          // Name of the device brand
        location: 'none',
        topic: 'humidity',      // lights, bridge, switch, temperature, sounds, etc
        groupname: 'none',
        hook: '/humidity/' + device._peripheral._noble.address  // HOOK == /Namebrand  Example. /hueLights, /Sonos
        // We will use the id to access to the device and modify it.
        // Any value to refer this device (MacAddress, for example) can work as id
      }},
      function (err, resp, body) {
        if (err) return callback(err)
        callback
      })

      request.post({url: 'http://' + process.env.NETBEAST + '/api/resources',
      json: {
        app: 'flower-power-plugin',          // Name of the device brand
        location: 'none',
        topic: 'luminosity',      // lights, bridge, switch, temperature, sounds, etc
        groupname: 'none',
        hook: '/luminosity/' + device._peripheral._noble.address  // HOOK == /Namebrand  Example. /hueLights, /Sonos
        // We will use the id to access to the device and modify it.
        // Any value to refer this device (MacAddress, for example) can work as id
      }},
      function (err, resp, body) {
        if (err) return callback(err)
        callback
      })

      request.post({url: 'http://' + process.env.NETBEAST + '/api/resources',
      json: {
        app: 'flower-power-plugin',          // Name of the device brand
        location: 'none',
        topic: 'battery',      // lights, bridge, switch, temperature, sounds, etc
        groupname: 'none',
        hook: '/battery/' + device._peripheral._noble.address  // HOOK == /Namebrand  Example. /hueLights, /Sonos
        // We will use the id to access to the device and modify it.
        // Any value to refer this device (MacAddress, for example) can work as id
      }},
      function (err, resp, body) {
        if (err) return callback(err)
      })

    }
  })


  setTimeout(function () {
    flowerPower.stopDiscoverAll (callback)
    if (objects.length > 0) {
    objects.forEach(function (hooks) {
      request.del('http://' + process.env.NETBEAST + '/api/resources?hook=' + hooks,
      function (err, resp, body) {
        if (err) callback(err)
      })
    })
  }
  callback(null, devices.slice())
  devices = []
  }, 10000)

}
