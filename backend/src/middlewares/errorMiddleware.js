export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    detail: `Route ${req.originalUrl} not found`,
    error: 'NotFoundError',
  });
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let detail = err.message || 'Internal Server Error';

  if (err.name === 'CastError') {
    statusCode = 400;
    detail = `Invalid ${err.path || 'ID'} format`;
  }

  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    detail = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    detail = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    detail = 'Invalid JSON payload provided';
  }

  res.status(statusCode).json({
    detail,
    error: err.name || 'Error',
  });
};
