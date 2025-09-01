class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }

  static success(data, message = 'Operation successful') {
    return new ApiResponse(200, data, message);
  }

  static created(data, message = 'Resource created successfully') {
    return new ApiResponse(201, data, message);
  }

  static noContent(message = 'No content') {
    return new ApiResponse(204, null, message);
  }

  static badRequest(message = 'Bad Request', errors = null) {
    const response = new ApiResponse(400, null, message);
    if (errors) response.errors = errors;
    return response;
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiResponse(401, null, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiResponse(403, null, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiResponse(404, null, message);
  }

  static conflict(message = 'Resource already exists') {
    return new ApiResponse(409, null, message);
  }

  static validationError(errors, message = 'Validation failed') {
    const response = new ApiResponse(422, null, message);
    response.errors = errors;
    return response;
  }

  static error(statusCode = 500, message = 'Internal Server Error', errors = null) {
    const response = new ApiResponse(statusCode, null, message);
    if (errors) response.errors = errors;
    return response;
  }

  toJSON() {
    return {
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
      ...(this.errors && { errors: this.errors })
    };
  }

  send(res) {
    return res.status(this.statusCode).json(this.toJSON());
  }
}

// Helper function to handle async/await in route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  ApiResponse,
  asyncHandler
};
