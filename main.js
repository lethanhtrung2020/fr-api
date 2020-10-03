import express from 'express'
import cors from 'cors'
import nnnRouter from 'nnn-router'
import bodyParser from 'body-parser'
import camelcaseKeys from 'camelcase-keys'
import handleError from '@middleware/handleError'
import promiseRouter from 'express-promise-router'
const app = express()

express.response.success = function (responseData) {
  this.send(camelcaseKeys(responseData, {deep: true}))
}

app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))

app.use(
  cors({
    origin: true,
    credential: true
  }),
  (error, req, res, next) => {
    if (error) {
      return res.status(400).json({
        message: error.message
      })
    }
    next()
  }
)

app.use(
  nnnRouter({ routeDir: '/routes', baseRouter: promiseRouter() }),
  (error, req, res, next) => {
    handleError(error, req, res)
  }
)

app.listen(process.env.PORT || 8080, err => {
    console.log(`Listening on port 8080`);
  if (err) {
    return console.error(err)
  }
})

export default app
