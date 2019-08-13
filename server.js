const express = require('express'); // importing a CommonJS module
const helmet = require('helmet');
const logger = require('morgan');

const hubsRouter = require('./hubs/hubs-router.js');

const server = express();

// Middleware
server.use(express.json());
server.use(helmet());
server.use(logger('dev'));
server.use(methodLogger);
server.use(addName);
// server.use(lockout);
// server.use(noPass);

server.use('/api/hubs', hubsRouter);

server.get('/', (req, res) => {
  const nameInsert = (req.name) ? ` ${req.name}` : '';

  res.send(`
    <h2>Lambda Hubs API</h2>
    <p>Welcome${nameInsert} to the Lambda Hubs API</p>
    `);
});

// Custom Middleware
function methodLogger(req, res, next) {
  console.log(`${req.method} Request`);
  next();
}

function addName(req, res, next) {
  req.name = 'You (person on the other side of the screen)';
  next();
}

function lockout(req, res, next) {
  res.status(403).json({ message: 'Api Lockout'});
}

function noPass(req, res, next) {
  const seconds = new Date().getSeconds();
  console.log(seconds)
  if (seconds % 3 === 0) {
    res.status(403).json({ message: 'You shall not pass'})
  } else {
    next();
  }
}

server.use((error, req, res, next) => {
  res.status(400).json({ 
    message: "Bad Panda!",
    error
  });
});

module.exports = server;