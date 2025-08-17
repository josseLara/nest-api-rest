import { IsEmail, IsString, IsNotEmpty, MinLength, IsOptional, IsArray, ArrayContains } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/schemas/users/enums/role.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre completo del usuario' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'juan@example.com', description: 'Email del usuario (único)' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    example: 'Password123!', 
    description: 'Contraseña (mínimo 8 caracteres)',
    minLength: 8
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ 
    example: ['user'], 
    description: 'Roles del usuario',
    enum: Role,
    default: [Role.User],
    required: false
  })
  @IsArray()
  @IsOptional()
  roles?: Role[];
}