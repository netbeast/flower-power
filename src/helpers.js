var helper = module.exports = {}
var ApiError = require('./api-error')
// We create this two variables to improve app accurancy.
var flowerPowerAux

helper.getFlowerPowerById = function (devices, id, done) {
  flowerPowerAux = devices.filter(function (device) {
    if (device._peripheral._noble.address === id) return true
  })[0]
  if (!flowerPowerAux) return done(new ApiError(404, 'Device not found'))
  return done(null, flowerPowerAux)
}

helper.temperature = function (flowerPower, done) {
  flowerPower.readAirTemperature(function (err, temperature) {
    if (err) return done(err)
    return done(null, temperature.toFixed(2))
  })
}

helper.humidity = function (flowerPower, done) {
  flowerPower.readSoilMoisture(function (err, humidity) {
    if (err) return done(err)
    return done(null, humidity.toFixed(2))
  })
}

helper.luminosity = function (flowerPower, done) {
  flowerPower.readSunlight(function (err, luminosity) {
    if (err) return done(err)
    return done(null, luminosity.toFixed(2))
  })
}

helper.battery = function (flowerPower, done) {
  flowerPower.readBatteryLevel(function (err, battery) {
    if (err) return done(err)
    return done(null, battery.toFixed(2))
  })
}
