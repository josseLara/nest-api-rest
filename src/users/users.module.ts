import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from 'src/schemas/users/index.schema';
import { JwtStrategy } from 'src/auth/common/strategies/jwt.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }), // Configura Passport
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy], // Añade JwtStrategy como provider
  exports: [UsersService],
})
export class UsersModule {}