var express = require('express')
var handleMandrillEvents = require('./email/process').handleMandrillEvents
var log = require('./log')

/**
 * Expose `router`
 */

var router = module.exports = express.Router()

/**
 * Mandrill
 */

router.post('/mandrill', function (req, res) {
  // TODO: Authenticate requests
  var events = req.body.mandrill_events
  if (!Array.isArray(events)) events = JSON.parse(events)

  handleMandrillEvents(events, function (err, batch) {
    if (err) {
      log.error(err)
      res.status(400).send(err)
    }
    batch.end(function (err) {
      if (err) {
        log.error(err)
        res.status(400).send(err)
      } else {
        res.status(204).end()
      }
    })
  })
})
