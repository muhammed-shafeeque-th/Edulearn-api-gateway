import { HttpStatus } from '@/shared/constants/http-status';

export const AUTH_MESSAGES = {
  REGISTER_USER: {
    message:
      'Registration successful. An OTP has been sent to your email address for verification.',
    statusCode: HttpStatus.CREATED,
  },
  CHANGE_PASSWORD: {
    message: 'Your password has been changed successfully.',
    statusCode: HttpStatus.OK,
  },
  RESET_PASSWORD: {
    message:
      'Your password has been reset successfully. You can now log in with your new password.',
    statusCode: HttpStatus.OK,
  },
  FORGOT_PASSWORD: {
    message:
      'A password reset link has been sent to your email address. Please check your inbox and follow the instructions.',
    statusCode: HttpStatus.OK,
  },
  OAUTH_SIGN: {
    message: 'OAuth sign-in successful. You are now logged in.',
    statusCode: HttpStatus.OK,
  },
  EMAIL_AVAILABLE: {
    message: 'The provided email address is available for registration.',
    statusCode: HttpStatus.OK,
  },
  EMAIL_TAKEN: {
    message:
      'The provided email address is already in use. Please use a different email.',
    statusCode: HttpStatus.CONFLICT,
  },
  RESEND_OTP: {
    message: 'A new OTP has been sent to your email address.',
    statusCode: HttpStatus.OK,
  },
  VERIFY_USER: {
    message: 'Your account has been verified and you are now logged in.',
    statusCode: HttpStatus.OK,
  },
  LOGIN_USER: {
    message: 'Login successful. Welcome back!',
    statusCode: HttpStatus.OK,
  },
  LOGOUT_USER: {
    message: 'You have been logged out successfully.',
    statusCode: HttpStatus.OK,
  },
  REFRESH_TOKEN: {
    message: 'Token refreshed successfully. You are still authenticated.',
    statusCode: HttpStatus.OK,
  },

  // Additional (previously separate) structured messages
  PASSWORD_RESET_EMAIL_SENT: {
    message:
      'A password reset link has been sent to your email address. Please check your inbox and follow the instructions.',
    statusCode: HttpStatus.OK,
  },
  TOKEN_REFRESH_SUCCESS: {
    message: 'Token refreshed successfully. You are still authenticated.',
    statusCode: HttpStatus.OK,
  },

  // Error Messages
  INVALID_CREDENTIALS: {
    message: 'Invalid email or password',
    statusCode: HttpStatus.UNAUTHORIZED,
  },
  USER_ALREADY_EXISTS: {
    message:
      'The provided email address is already in use. Please use a different email.',
    statusCode: HttpStatus.CONFLICT,
  },
  UNAUTHORIZED: {
    message: 'Unauthorized access',
    statusCode: HttpStatus.UNAUTHORIZED,
  },
  TOKEN_EXPIRED: {
    message: 'Token has expired',
    statusCode: HttpStatus.UNAUTHORIZED,
  },
  INVALID_TOKEN: {
    message: 'Invalid or malformed token',
    statusCode: HttpStatus.UNAUTHORIZED,
  },
  ACCOUNT_DISABLED: {
    message: 'Account has been disabled',
    statusCode: HttpStatus.FORBIDDEN,
  },
  EMAIL_NOT_VERIFIED: {
    message: 'Email address not verified',
    statusCode: HttpStatus.FORBIDDEN,
  },
  INVALID_RESET_TOKEN: {
    message: 'Invalid or expired reset token',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  WEAK_PASSWORD: {
    message: 'Password does not meet security requirements',
    statusCode: HttpStatus.BAD_REQUEST,
  },
};
