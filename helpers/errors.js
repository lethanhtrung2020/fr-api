class HttpError extends Error {
  constructor(message, params = {}) {
    super(message)
    const overridableProperties = ['message']
    Object.keys(params).forEach((key) => {
      if (
        !Error.prototype.hasOwnProperty(key) ||
        overridableProperties.includes(key)
      ) {
        this[key] = params[key]
      }
    })
  }
}

class BadRequestError extends HttpError {
  constructor(message = 'Invalid Parameters', params = {}) {
    super(message, { ...params })
  }
}

class NotFoundError extends HttpError {
  constructor(message = 'Not Found', params = {}) {
    super(message, { ...params })
  }
}

class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden', params = {}) {
    super(message, { ...params })
  }
}

class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized', params = {}) {
    super(message, { ...params })
  }
}

class InternalServerError extends HttpError {
  constructor(message = 'Internal Server Error', params = {}) {
    super(message, { ...params })
  }
}

export {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
  InternalServerError,
}
