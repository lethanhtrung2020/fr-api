import * as errors from '@helpers/errors'

export default (error, req, res) => {
  const { message } = error

  if (error instanceof errors.BadRequestError) {
    return res.status(400).send({ message })
  }
  if (error instanceof errors.NotFoundError) {
    return res.status(404).send({ message })
  }
  if (error instanceof errors.ForbiddenError) {
    return res.status(403).send({ message })
  }
  if (error instanceof errors.InternalServerError) {
    return res.status(500).send({ message })
  }

  if (error instanceof errors.UnauthorizedError) {
    return res.status(401).send({ message })
  }

  console.error(error)
  return res.status(500).send({ message: 'Internal Server Error' })
}
