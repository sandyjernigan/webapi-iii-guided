const express = require('express');

const Hubs = require('./hubs-model.js');
const Messages = require('../messages/messages-model.js');

const router = express.Router();

// this only runs if the url has /api/hubs in it
router.get('/', async (req, res) => {
  try {
    const hubs = await Hubs.find(req.query);
    res.status(200).json(hubs);
  } catch (error) {
    // log error to server
    console.log(error);
    res.status(500).json({
      message: 'Error retrieving the hubs',
    });
  }
});

router.get('/:id', validateID, (req, res) => { 
  res.status(200).json(req.hub)
});

router.post('/', requiredBody, async (req, res, next) => {
  try {
    const hub = await Hubs.add(req.body);
    res.status(201).json(hub);
  } catch (error) {
    // log error to server
    console.log(error);
    catchError(req, res);
    // next({
    //   message: 'Error adding the hub'
    // });
  }
});

router.delete('/:id', validateID, async (req, res) => {
  try {
    const count = await Hubs.remove(req.params.id);
    if (count > 0) {
      res.status(200).json({ message: 'The hub has been nuked' });
    } else {
      res.status(404).json({ message: 'The hub could not be found' });
    }
  } catch (error) {
    // log error to server
    console.log(error);
    res.status(500).json({
      message: 'Error removing the hub',
    });
  }
});

router.put('/:id', [validateID, requiredBody], async (req, res) => {
  try {
    const hub = await Hubs.update(req.params.id, req.body);
    if (hub) {
      res.status(200).json(hub);
    } else {
      res.status(404).json({ message: 'The hub could not be found' });
    }
  } catch (error) {
    // log error to server
    console.log(error);
    catchError(req, res);
    // res.status(500).json({
    //   message: 'Error updating the hub',
    // });
  }
});

// add an endpoint that returns all the messages for a hub
// this is a sub-route or sub-resource
router.get('/:id/messages', validateID, async (req, res) => {
  try {
    const messages = await Hubs.findHubMessages(req.params.id);

    res.status(200).json(messages);
  } catch (error) {
    // log error to server
    console.log(error);
    res.status(500).json({
      message: 'Error getting the messages for the hub',
    });
  }
});

// add an endpoint for adding new message to a hub
router.post('/:id/messages', [validateID, requiredBody], async (req, res) => {
  const messageInfo = { ...req.body, hub_id: req.params.id };

  try {
    const message = await Messages.add(messageInfo);
    res.status(210).json(message);
  } catch (error) {
    // log error to server
    console.log(error);
    res.status(500).json({
      message: 'Error getting the messages for the hub',
    });
  }
});

function validateID(req, res, next){
  const { id } = req.params
  Hubs.findById(id)
  .then(hub => {
    if(hub) {
      req.hub = hub;
      next();
    } else {
      res.status(404).json({ message: 'The hub could not be found' });
    }
  })
  .catch(error => {
    // log error
    console.log(error);
    catchError(req, res);
  });
}

function requiredBody(req, res, next) {
  const { body } = req

  if (req.body && Object.keys(req.body).length > 0) {
    next();
  } else {
      // res.status(400).json({ // 404: Not Found
      //   message: "Please verify request and resubmit."
      // });
      next({ message: "Please verify request and resubmit." });
  }
}

function catchError(req, res) {
  // log error
  res.status(500).json({
    message: 'Error processing request'
  });
}

module.exports = router;
