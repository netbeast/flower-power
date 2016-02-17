/*
  This file is responsible of the communication with the end-device.
  We should read the received data and talk to the device.

  This file contains 4 routes:
    1. get  /HOOK/:id
    2. get  /HOOK/:id/info
    3. get  /discover
    4. post /HOOK/:id
*/

var express = require('express')
var router = express.Router()
var async = require('async')
var helper = require('./helpers')
var mqtt = require('mqtt')

// Require the discovery function
var loadResources = require('./resources')

loadResources(function (err, devices) {
  if (err) throw err

  devices = devices || []

  router.get('/temperature/:id', function (req, res, next) {

    async.waterfall([
      async.apply(helper.getFlowerPowerById, devices, req.params.id),
      async.apply(helper.connectAndSetup),
      async.apply(helper.temperature),
      async.apply(helper.disconnect)
      ],
    function (err, results){
        if (err) return res.status(500).send(err)
          return res.json({temperature: results})
    })
  })

  router.get('/humidity/:id', function (req, res, next) {

    async.waterfall([
      async.apply(helper.getFlowerPowerById, devices, req.params.id),
      async.apply(helper.connectAndSetup),
      async.apply(helper.humidity),
      async.apply(helper.disconnect)
      ],
    function (err, results){
        if (err) return res.status(500).send(err)
          return res.json({humidity: results})
    })
  })


  router.get('/luminosity/:id', function (req, res, next) {

    async.waterfall([
      async.apply(helper.getFlowerPowerById, devices, req.params.id),
      async.apply(helper.connectAndSetup),
      async.apply(helper.luminosity),
      async.apply(helper.disconnect)
      ],
    function (err, results){
        if (err) return res.status(500).send(err)
          return res.json({luminosity: results})
    })
  })
  router.get('/battery/:id', function (req, res, next) {

    async.waterfall([
      async.apply(helper.getFlowerPowerById, devices, req.params.id),
      async.apply(helper.connectAndSetup),
      async.apply(helper.battery),
      async.apply(helper.disconnect)
      ],
    function (err, results){
        if (err) return res.status(500).send(err)
          return res.send({battery: results})
    })

  })


  router.get('/discover', function (req, res, next) {
    loadResources(function (err) {
      if (err) return res.status(500).send(err)
    })
  })


  router.post('/*/:id', function (req, res, next) {
    if (err) return res.status(500).send(err)
    return res.status(501).send('Post Not Implemented')
  })

  if (devices.length > 0) {
    var client = mqtt.connect()
    devices.foEach(function (flowerPower) {
      flowerPower.enableLiveMode()
      flowerPower.on('airTemperatureChange', function (temperature) {
        client.publish('netbeast/temperature', JSON.stringify({temperature: temperature}))
      })
      flowerPower.on('soilMoistureChange', function (humidity) {
        client.publish('netbeast/humidity', JSON.stringify({humidity: humidity}))
      })
      flowerPower.on('sunlightChange', function (luminosity) {
        client.publish('netbeast/luminosity', JSON.stringify({luminosity: luminosity}))
      })
      flowerPower.on('disconnect', function () {
        client.close()
      })
    })
  }
})

// Used to serve the routes
module.exports = router
