import express from 'express'
import stormpath from 'express-stormpath'

import Journey from './model'

const router = express.Router()

export default router

router.get('/', stormpath.authenticationRequired, function (req, res) {
  Journey
    .find({
      created_by: req.user.id,
      trashed: undefined
    })
    .populate('locations')
    .exec((err, journeys) => {
      if (err) {
        res.status(400).send(err)
      } else {
        res.status(200).send(journeys)
      }
    })
})

router.post('/', stormpath.authenticationRequired, function (req, res) {
  const data = req.body
  data.created_by = req.user.id

  Journey.generate(req.body, (err, journey) => {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(201).send(journey)
    }
  })
})

/**
 * Get a Journey
 */

router.get('/:id', stormpath.authenticationRequired, findById, function (req, res) {
  res.status(200).send(req.journey)
})

/**
 * Remove
 */

router.delete('/:id', stormpath.authenticationRequired, findById, function (req, res) {
  req.journey.trash((err) => {
    if (err) {
      res.status(400).send('Failed to remove journey.')
    } else {
      res.status(204).end()
    }
  })
})

/**
 * Find by id
 */

function findById (req, res, next) {
  Journey.findById(req.params.id, (err, journey) => {
    if (err) {
      res.status(400).send(err)
    } else if (!journey || journey.trashed !== undefined) {
      res.status(404).send('Journey does not exist.')
    } else {
      req.journey = journey
      next()
    }
  })
}
