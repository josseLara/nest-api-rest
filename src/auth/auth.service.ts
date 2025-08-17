import { Injectable, UnauthorizedException } from '@nestjs/common';
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

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userModel.findOne({ email }).select('+password').exec();
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    let u = user.password;
    
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const { password, refreshToken, ...result } = user.toObject();
    return result;
  }

  async login(loginDto: LoginUserDto): Promise<TokensDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    const tokens = await this.getTokens(user._id, user.email, user.roles);
    await this.updateRefreshToken(user._id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(
      userId,
      { refreshToken: null },
      { new: true }
    ).exec();
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<TokensDto> {
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
  }

  private async getTokens(
    userId: string,
    email: string,
    roles: string[],
  ): Promise<TokensDto> {
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
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userModel.findByIdAndUpdate(
      userId,
      { refreshToken: hashedRefreshToken },
      { new: true }
    ).exec();
  }
}