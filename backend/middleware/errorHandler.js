export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Default error response
  let error = {
    message: 'Internal Server Error',
    status: 500
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.message = err.message;
    error.status = 400;
  } else if (err.code === 'ER_DUP_ENTRY') {
    error.message = 'Duplicate entry - record already exists';
    error.status = 409;
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    error.message = 'Referenced record does not exist';
    error.status = 400;
  } else if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.status = 401;
  } else if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.status = 401;
  } else if (err.message) {
    error.message = err.message;
    error.status = err.status || 500;
  }

  // Log error details in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
      status: error.status
    });
  }

  res.status(error.status).json({
    error: error.message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      code: err.code 
    })
  });
};
