import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { AuthService } from '@/domains/service-clients/auth';
import { NotificationService } from '@/domains/service-clients/notification';
import validateSchema from '@/services/validate-schema';
import { RegisterUserSchema } from '../../schemas/register-user.schema';
import { LoginUserSchema } from '../../schemas/login-user.schema';
import { ResponseWrapper } from '@/shared/utils/response-wrapper';
import { VerifyUserSchema } from '../../schemas/verify-user.schema';
import { ResendOtpSchema } from '../../schemas/resend-otp.schema';
import { Auth2SignSchema } from '../../schemas/auth2-sign.schema';
import { LogoutUserSchema } from '../../schemas/logout.schema';
import { refreshTokenSchema } from '../../schemas/refresh-token.schema';
import { emailAvailabilitySchema } from '../../../user/schemas/email-availability.schema';
import { LoggingService } from '@/services/observability/logging/logging.service';
import { changePasswordSchema } from '../../schemas/change-password.schema';
import { BloomFilterFacade } from '@/services/bloom-filter';
import { forgotPasswordSchema } from '../../schemas/forgot-password.schema';
import { authRefreshToken } from '../../utils/constants';
import { attachCookies, clearCookies } from '../../utils/manage-cookies copy';
import { resetPasswordSchema } from '../../schemas/reset-password.schema';
import { attachMetadata } from '../../utils/attach-metadata';
import { AUTH_MESSAGES } from '../../utils/resposne-messages';
import { Trace, MonitorGrpc } from '@/shared/utils/decorators';
import { TYPES } from '@/services/di';

@injectable()
export class AuthController {
  private _emailAvailabilityService?: BloomFilterFacade;

  constructor(
    @inject(TYPES.LoggingService) private logger: LoggingService,
    @inject(TYPES.AuthService) private userServiceClient: AuthService,
    @inject(TYPES.NotificationService)
    private notificationService: NotificationService
  ) {}

  // Lazy getter for BloomFilterFacade
  private get emailAvailabilityService(): BloomFilterFacade {
    if (!this._emailAvailabilityService) {
      this.logger.debug('Initializing BloomFilterFacade...');
      this._emailAvailabilityService = BloomFilterFacade.getInstance();
    }
    return this._emailAvailabilityService;
  }

  @Trace('AuthController.registerUser')
  @MonitorGrpc('AuthService', 'RegisterUser')
  async registerUser(req: Request, res: Response) {
    this.logger.debug(`Processing grpc method 'registerUser'`);

    const { email, password, role, avatar, firstName, lastName, authType } =
      validateSchema(req.body, RegisterUserSchema)!;

    this.logger.debug('Initiate `RegisterUser` request to `AuthService`', {
      ...req.body,
    });

    const response = await this.userServiceClient.registerUser(
      {
        avatar: avatar || '',
        email,
        password,
        firstName,
        lastName,
        role,
        authType,
      },
      { metadata: attachMetadata(req) }
    );

    this.logger.debug(
      '`RegisterUser` request for `AuthService` has completed',
      { userId: response.userId || '' }
    );

    // this.logger.debug(
    //   'Initiated `SendOtp` request for `NotificationService` ',
    //   { userId: response.userId || '', email }
    // );

    // // calls to notificationService for OTP would go here (commented out in original)

    // this.logger.debug(
    //   '`SendOtp` request to `NotificationService` has completed ',
    //   { userId: response.userId || '', email }
    // );

    const resWrap = new ResponseWrapper(res);
    resWrap
      .status(AUTH_MESSAGES.REGISTER_USER.statusCode)
      .success(response, AUTH_MESSAGES.REGISTER_USER.message);
  }

  @Trace('AuthController.changePassword')
  @MonitorGrpc('AuthService', 'ChangePassword')
  async changePassword(req: Request, res: Response) {
    const { currentPassword, newPassword, userId } = validateSchema(
      { ...req.body, userId: req.user?.userId },
      changePasswordSchema
    )!;

    await this.userServiceClient.changePassword(
      { oldPassword: currentPassword, newPassword, userId },
      { metadata: attachMetadata(req) }
    );

    return new ResponseWrapper(res)
      .status(AUTH_MESSAGES.CHANGE_PASSWORD.statusCode)
      .success({ updated: true }, AUTH_MESSAGES.CHANGE_PASSWORD.message);
  }

  @Trace('AuthController.resetPassword')
  @MonitorGrpc('AuthService', 'ResetPassword')
  async resetPassword(req: Request, res: Response) {
    const schemaResponse = validateSchema(
      { ...req.body, ...req.params },
      resetPasswordSchema
    )!;

    await this.userServiceClient.resetPassword(schemaResponse, {
      metadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(AUTH_MESSAGES.RESET_PASSWORD.statusCode)
      .success({ updated: true }, AUTH_MESSAGES.RESET_PASSWORD.message);
  }

  @Trace('AuthController.forgotPassword')
  @MonitorGrpc('AuthService', 'ForgotPassword')
  async forgotPassword(req: Request, res: Response) {
    const schemaResponse = validateSchema(req.body, forgotPasswordSchema)!;

    const { success } = await this.userServiceClient.forgotPassword(
      schemaResponse,
      { metadata: attachMetadata(req) }
    );

    await this.notificationService.forgotPassword(success!);

    return new ResponseWrapper(res)
      .status(AUTH_MESSAGES.FORGOT_PASSWORD.statusCode)
      .success({ updated: true }, AUTH_MESSAGES.FORGOT_PASSWORD.message);
  }

  @Trace('AuthController.oauthSign')
  @MonitorGrpc('AuthService', 'Auth2Sign')
  async oauthSign(req: Request, res: Response) {
    const { provider, token, authType } = validateSchema(
      req.body,
      Auth2SignSchema
    )!;

    const { success: serverResponse } = await this.userServiceClient.auth2Sign({
      provider,
      token,
      authType,
    });

    return new ResponseWrapper(res)
      .status(AUTH_MESSAGES.OAUTH_SIGN.statusCode)
      .success(serverResponse, AUTH_MESSAGES.OAUTH_SIGN.message);
  }

  @Trace('AuthController.checkEmailAvailability')
  async checkEmailAvailability(req: Request, res: Response) {
    const { email } = validateSchema(req.query, emailAvailabilitySchema)!;

    const isEmailAvailable =
      await this.emailAvailabilityService.isEmailAvailable(email);
    return new ResponseWrapper(res)
      .status(AUTH_MESSAGES.EMAIL_AVAILABLE.statusCode)
      .success(
        { exists: !isEmailAvailable },
        isEmailAvailable
          ? AUTH_MESSAGES.EMAIL_AVAILABLE.message
          : AUTH_MESSAGES.EMAIL_TAKEN.message
      );
  }

  @Trace('AuthController.resendOtp')
  @MonitorGrpc('NotificationService', 'SendOtp')
  async resendOtp(req: Request, res: Response) {
    const { email, userId, username } = validateSchema(
      req.body,
      ResendOtpSchema
    )!;

    await this.notificationService.sendOtp({
      email,
      userId: userId || '',
      username: username || 'User',
    });

    new ResponseWrapper(res)
      .status(AUTH_MESSAGES.RESEND_OTP.statusCode)
      .success({}, AUTH_MESSAGES.RESEND_OTP.message);
  }

  @Trace('AuthController.verifyUser')
  @MonitorGrpc('AuthService', 'VerifyUser')
  async verifyUser(req: Request, res: Response) {
    const { email, code } = validateSchema(req.body, VerifyUserSchema)!;

    await this.notificationService.verifyOtp({
      email,
      otp: code,
    });

    // Initial verification via Notification Service successful, now confirm with User Service
    const { success: successResponse } =
      await this.userServiceClient.verifyUser({
        email,
      })!;

    // Update email into bloom filter
    this.emailAvailabilityService.addEmail(email);

    const resWrap = new ResponseWrapper(res);
    attachCookies(
      resWrap,
      successResponse!.refreshToken,
      successResponse!.accessToken
    );

    return resWrap
      .status(AUTH_MESSAGES.VERIFY_USER.statusCode)
      .success(
        { token: successResponse!.accessToken },
        AUTH_MESSAGES.VERIFY_USER.message
      );
  }

  @Trace('AuthController.loginUser')
  @MonitorGrpc('AuthService', 'LoginUser')
  async loginUser(req: Request, res: Response) {
    const { email, password, rememberMe } = validateSchema(
      req.body,
      LoginUserSchema
    )!;

    const { success } = await this.userServiceClient.loginUser({
      email,
      password,
      rememberMe,
    });
    const resWrap = new ResponseWrapper(res);
    attachCookies(resWrap, success!.refreshToken, success!.accessToken);

    return resWrap
      .status(AUTH_MESSAGES.LOGIN_USER.statusCode)
      .success(
        { token: success!.accessToken },
        AUTH_MESSAGES.LOGIN_USER.message
      );
  }

  @Trace('AuthController.logoutUser')
  @MonitorGrpc('AuthService', 'LogoutUser')
  async logoutUser(req: Request, res: Response) {
    const { userId } = validateSchema(req.user, LogoutUserSchema)!;

    const serverResponse = await this.userServiceClient.logoutUser({
      userId,
    });

    const resWrap = new ResponseWrapper(res);
    clearCookies(resWrap);

    return resWrap
      .status(AUTH_MESSAGES.LOGOUT_USER.statusCode)
      .success(serverResponse, AUTH_MESSAGES.LOGOUT_USER.message);
  }

  @Trace('AuthController.refreshToken')
  @MonitorGrpc('AuthService', 'RefreshToken')
  async refreshToken(req: Request, res: Response) {
    const { refreshToken } = validateSchema(
      { refreshToken: req.cookies[authRefreshToken] },
      refreshTokenSchema
    )!;

    const { success } = await this.userServiceClient.refreshToken({
      refreshToken,
    });
    const resWrap = new ResponseWrapper(res);

    attachCookies(resWrap, success!.refreshToken, success!.accessToken);

    return resWrap
      .status(AUTH_MESSAGES.REFRESH_TOKEN.statusCode)
      .success(
        { token: success!.accessToken },
        AUTH_MESSAGES.TOKEN_REFRESH_SUCCESS.message
      );
  }
}
