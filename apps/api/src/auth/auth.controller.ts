import { Controller, Post, Body, HttpCode, HttpStatus, Res, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(registerDto);

    // Set cookies
    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    return {
      user: result.user,
      message: 'Registration successful',
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(loginDto);

    // Set cookies
    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    return {
      user: result.user,
      message: 'Login successful',
    };
  }

  @Public()
  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@CurrentUser() user: any, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.refreshTokens(user.userId, user.refreshToken);

    // Set new cookies
    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    return {
      message: 'Token refreshed successfully',
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@CurrentUser() user: any, @Res({ passthrough: true }) res: Response) {
    const refreshToken = res.req.cookies?.refresh_token;

    if (refreshToken) {
      await this.authService.logout(user.id, refreshToken);
    }

    // Clear cookies
    this.clearAuthCookies(res);

    return {
      message: 'Logout successful',
    };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Returns current user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@CurrentUser() user: any) {
    return user;
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const cookieDomain = this.configService.get<string>('COOKIE_DOMAIN');
    const cookieSecure = this.configService.get<string>('COOKIE_SECURE') === 'true';
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    const cookieOptions = {
      httpOnly: true,
      secure: cookieSecure || isProduction,
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
      domain: cookieDomain,
      path: '/',
    };

    res.cookie('access_token', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private clearAuthCookies(res: Response) {
    const cookieDomain = this.configService.get<string>('COOKIE_DOMAIN');

    res.clearCookie('access_token', {
      domain: cookieDomain,
      path: '/',
    });

    res.clearCookie('refresh_token', {
      domain: cookieDomain,
      path: '/',
    });
  }
}
