import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/schemas/users/enums/role.enum';

@ApiTags('Productos')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard) // Usa ambos guards
  @Roles(Role.Admin, Role.User)
  @ApiOperation({
    summary: 'Obtener todos los productos',
    description: 'Retorna una lista de todos los productos disponibles en el inventario',
  })
  @ApiOkResponse({
    description: 'Lista de productos obtenida exitosamente',
    type: [CreateProductDto],
  })
  @ApiNotFoundResponse({ description: 'No se encontraron productos' })
  async findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) // Usa ambos guards
  @Roles(Role.Admin, Role.User)
  @ApiOperation({
    summary: 'Obtener un producto por ID',
    description: 'Retorna un producto específico basado en su ID único',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del producto',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    description: 'Producto encontrado exitosamente',
    type: CreateProductDto,
  })
  @ApiNotFoundResponse({ description: 'Producto no encontrado' })
  @ApiBadRequestResponse({ description: 'ID inválido' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard) // Usa ambos guards
  @Roles(Role.Admin, Role.User)
  @ApiOperation({
    summary: 'Crear un nuevo producto',
    description: 'Crea un nuevo registro de producto en el sistema',
  })
  @ApiBody({
    type: CreateProductDto,
    description: 'Datos del nuevo producto a crear',
  })
  @ApiCreatedResponse({
    description: 'Producto creado exitosamente',
    type: CreateProductDto,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o faltantes',
  })
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) // Usa ambos guards
  @Roles(Role.Admin, Role.User)
  @ApiOperation({
    summary: 'Actualizar un producto existente',
    description: 'Actualiza la información de un producto basado en su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del producto a actualizar',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: UpdateProductDto,
    description: 'Nuevos datos del producto',
  })
  @ApiOkResponse({
    description: 'Producto actualizado exitosamente',
    type: CreateProductDto,
  })
  @ApiNotFoundResponse({ description: 'Producto no encontrado' })
  @ApiBadRequestResponse({ description: 'ID inválido o datos incorrectos' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) // Usa ambos guards
  @Roles(Role.Admin, Role.User)
  @ApiOperation({
    summary: 'Eliminar un producto',
    description: 'Elimina permanentemente un producto del sistema basado en su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del producto a eliminar',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiOkResponse({ description: 'Producto eliminado exitosamente' })
  @ApiNotFoundResponse({ description: 'Producto no encontrado' })
  @ApiBadRequestResponse({ description: 'ID inválido' })
  async delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}