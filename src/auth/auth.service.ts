import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { TokensDto } from './dto/tokens.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from 'src/schemas/users/index.schema';
import { jwtConstants } from './common/constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) { }

  /**
   * Valida las credenciales de un usuario
   * @param email - Correo electrónico del usuario
   * @param pass - Contraseña del usuario
   * @returns Información del usuario sin datos sensibles
   * @throws UnauthorizedException si las credenciales son incorrectas
   * @throws InternalServerErrorException si ocurre un error inesperado
   */
  async validateUser(email: string, pass: string): Promise<any> {
    try {
      const user = await this.userModel.findOne({ email }).select('+password').exec();
      if (!user) {
        throw new UnauthorizedException('Credenciales incorrectas');
      }
      
      const isMatch = await bcrypt.compare(pass, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Credenciales incorrectas');
      }

      const { password, refreshToken, ...result } = user.toObject();
      return result;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al validar usuario');
    }
  }

  /**
   * Inicia sesión y genera tokens de acceso
   * @param loginDto - DTO con credenciales de inicio de sesión
   * @returns Tokens de acceso y refresh
   * @throws UnauthorizedException si las credenciales son incorrectas
   * @throws InternalServerErrorException si ocurre un error inesperado
   */
  async login(loginDto: LoginUserDto): Promise<TokensDto> {
    try {
      const user = await this.validateUser(loginDto.email, loginDto.password);
      const tokens = await this.getTokens(user._id, user.email, user.roles);
      await this.updateRefreshToken(user._id, tokens.refreshToken);
      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Error durante el inicio de sesión');
    }
  }

  /**
   * Cierra la sesión del usuario eliminando su refresh token
   * @param userId - ID del usuario
   * @throws InternalServerErrorException si ocurre un error inesperado
   */
  async logout(userId: string) {
    try {
      await this.userModel.findByIdAndUpdate(
        userId,
        { refreshToken: null },
        { new: true }
      ).exec();
    } catch (error) {
      throw new InternalServerErrorException('Error al cerrar sesión');
    }
  }

  /**
   * Renueva los tokens de acceso usando el refresh token
   * @param userId - ID del usuario
   * @param refreshToken - Refresh token actual
   * @returns Nuevos tokens de acceso y refresh
   * @throws UnauthorizedException si el refresh token es inválido
   * @throws InternalServerErrorException si ocurre un error inesperado
   */
  async refreshTokens(userId: string, refreshToken: string): Promise<TokensDto> {
    try {
      const user: any = await this.userModel.findById(userId).exec();
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Acceso denegado');
      }

      const refreshTokenMatches = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );
      if (!refreshTokenMatches) {
        throw new UnauthorizedException('Acceso denegado');
      }

      const tokens = await this.getTokens(user._id, user.email, user.roles);
      await this.updateRefreshToken(user._id, tokens.refreshToken);
      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al renovar tokens');
    }
  }

  /**
   * Genera tokens JWT de acceso y refresh
   * @param userId - ID del usuario
   * @param email - Correo electrónico del usuario
   * @param roles - Roles del usuario
   * @returns Tokens de acceso y refresh
   * @throws InternalServerErrorException si ocurre un error al generar tokens
   */
  private async getTokens(
    userId: string,
    email: string,
    roles: string[],
  ): Promise<TokensDto> {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(
          {
            sub: userId,
            email,
            roles,
          },
          {
            secret: jwtConstants.secret,
            expiresIn: jwtConstants.expiresIn,
          },
        ),
        this.jwtService.signAsync(
          {
            sub: userId,
            email,
            roles,
          },
          {
            secret: jwtConstants.secret,
            expiresIn: jwtConstants.refreshExpiresIn,
          },
        ),
      ]);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al generar tokens');
    }
  }

  /**
   * Actualiza el refresh token del usuario en la base de datos
   * @param userId - ID del usuario
   * @param refreshToken - Nuevo refresh token
   * @throws InternalServerErrorException si ocurre un error al actualizar el token
   */
  private async updateRefreshToken(userId: string, refreshToken: string) {
    try {
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      await this.userModel.findByIdAndUpdate(
        userId,
        { refreshToken: hashedRefreshToken },
        { new: true }
      ).exec();
    } catch (error) {
      throw new InternalServerErrorException('Error al actualizar refresh token');
    }
  }
}
