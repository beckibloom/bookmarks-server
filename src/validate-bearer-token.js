const { API_KEY } = require('./config')
const logger = require('./logger')

function validateBearerToken(req, res, next) {
  const authToken = req.get('Authorization')
  logger.error(`Unauthorized request to path: ${req.path}`)

  if (!authToken || authToken.split(' ')[1] !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized request' })
  }

  next()
}

module.exports = validateBearerToken