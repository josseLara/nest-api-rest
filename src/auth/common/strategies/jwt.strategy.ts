import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../constants';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // constructor() {
  //   super({
  //     jwtFromRequest: ExtractJwt.fromExtractors([
  //       (request: Request) => {
  //         return request?.cookies?.Authentication;
  //       },
  //       ExtractJwt.fromAuthHeaderAsBearerToken(),
  //     ]),
  //     ignoreExpiration: false,
  //     secretOrKey: jwtConstants.secret,
  //   });
  // }
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Solo token en el header
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.email, roles: payload.roles };
  }
}