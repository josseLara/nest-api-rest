import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { Role } from 'src/schemas/users/enums/role.enum';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('Usuarios')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo usuario', description: 'Crea un nuevo usuario en el sistema' })
  @ApiCreatedResponse({ description: 'Usuario creado exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos de entrada inválidos' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard) // Usa ambos guards
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Obtener todos los usuarios', description: 'Solo disponible para administradores' })
  @ApiOkResponse({ description: 'Lista de usuarios obtenida exitosamente' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  @ApiForbiddenResponse({ description: 'Permisos insuficientes' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) // Usa ambos guards
  @Roles(Role.Admin, Role.Moderator)
  @ApiOperation({ summary: 'Obtener usuario por ID', description: 'Disponible para administradores y moderadores' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiOkResponse({ description: 'Usuario encontrado' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) // Usa ambos guards
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Actualizar usuario', description: 'Solo disponible para administradores' })
  @ApiParam({ name: 'id', description: 'ID del usuario a actualizar' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ description: 'Usuario actualizado exitosamente' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  @ApiBadRequestResponse({ description: 'Datos de entrada inválidos' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) // Usa ambos guards
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Eliminar usuario', description: 'Solo disponible para administradores' })
  @ApiParam({ name: 'id', description: 'ID del usuario a eliminar' })
  @ApiOkResponse({ description: 'Usuario eliminado exitosamente' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}