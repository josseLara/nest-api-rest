import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokensDto } from './dto/tokens.dto';
import { Response, Request } from 'express';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso', type: TokensDto })
  @ApiResponse({ status: 401, description: 'Credenciales incorrectas' })
  async login(@Body() loginDto: LoginUserDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(loginDto);
    this.setCookies(res, tokens);
    return tokens;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const userId = req.user['userId'];
    await this.authService.logout(userId);
    this.clearCookies(res);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refrescar tokens' })
  @ApiResponse({ status: 200, description: 'Tokens refrescados', type: TokensDto })
  @ApiResponse({ status: 401, description: 'Acceso denegado' })
  async refreshTokens(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    const tokens = await this.authService.refreshTokens(userId, refreshToken);
    this.setCookies(res, tokens);
    return tokens;
  }

  private setCookies(res: Response, tokens: TokensDto) {
    res.cookie('Authentication', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.cookie('Refresh', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
    });
  }

  private clearCookies(res: Response) {
    res.clearCookie('Authentication');
    res.clearCookie('Refresh');
  }
}