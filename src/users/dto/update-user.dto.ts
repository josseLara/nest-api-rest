import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/schemas/users/enums/role.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ 
    description: 'Estado del usuario (activo/inactivo)',
    required: false 
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ 
    description: 'Roles actualizados del usuario',
    enum: Role,
    required: false
  })
  @IsArray()
  @IsOptional()
  roles?: Role[];

  @IsOptional()
  refreshToken?:string;
}