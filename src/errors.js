class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends HttpError {
  constructor(message) {
    super(404, message);
  }
}

class ResourceUnreachableError extends HttpError {
  constructor() {
    super(503, "An internal resource is unreachable.");
  }
}

module.exports = { NotFoundError, ResourceUnreachableError };
