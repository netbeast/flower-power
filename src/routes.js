var express = require('express')
var router = express.Router()
var async = require('async')
var helper = require('./helpers')
var mqtt = require('mqtt')
var netbeast = require('netbeast')

// Require the discovery function
var loadResources = require('./resources')

var client = mqtt.connect('ws://' + process.env.NETBEAST)

loadResources(function (err, devices) {
  if (err) {
    console.trace(new Error(err))
    netbeast().error(err, 'Something wrong!')
  }
  router.get('/temperature/:id', function (req, res, next) {
    async.waterfall([
      async.apply(helper.getFlowerPowerById, devices, req.params.id),
      async.apply(helper.temperature)
    ],
    function (err, results) {
      if (err) return res.status(500).send(err)
      return res.json({temperature: results})
    })
  })

  router.get('/humidity/:id', function (req, res, next) {
    async.waterfall([
      async.apply(helper.getFlowerPowerById, devices, req.params.id),
      async.apply(helper.humidity)
    ],
    function (err, results) {
      if (err) return res.status(500).send(err)
      return res.json({humidity: results})
    })
  })

  router.get('/luminosity/:id', function (req, res, next) {
    async.waterfall([
      async.apply(helper.getFlowerPowerById, devices, req.params.id),
      async.apply(helper.luminosity)
    ],
    function (err, results) {
      if (err) return res.status(500).send(err)
      return res.json({luminosity: results})
    })
  })
  router.get('/battery/:id', function (req, res, next) {
    async.waterfall([
      async.apply(helper.getFlowerPowerById, devices, req.params.id),
      async.apply(helper.battery)
    ],
    function (err, results) {
      if (err) return res.status(500).send(err)
      return res.send({battery: results})
    })
  })

  router.get('/discover', function (req, res, next) {
    loadResources(function (err, devices) {
      if (err) return res.status(500).send(err)
      res.json(devices)
    })
  })

  router.post('*', function (req, res, next) {
    if (err) return res.status(500).send(err)
    return res.status(501).send('Post Not Implemented')
  })

  if (devices !== undefined && devices.length > 0) {
    devices.forEach(function (flowerPower, indx) {
      flowerPower.connectAndSetup(function (err) {
        if (err) return console.log(new Error('Can not connect and setup FlowerPower'))
        flowerPower.enableLiveMode(function (err) {
          if (err) return console.log(new Error(err))
          devices[indx] = flowerPower
          flowerPower.on('sunlightChange', function (luminosity) {
            client.publish('netbeast/luminosity', JSON.stringify({luminosity: luminosity}))
          })
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
      })
    })
  }
})

// Used to serve the routes
module.exports = router
