import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    HttpStatus,
    HttpCode,
    Query,
    ParseUUIDPipe,
    NotFoundException,
    UseGuards
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiNotFoundResponse,
    ApiConflictResponse
} from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Sale } from 'src/schemas/sales/sales.schema';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { Role } from 'src/schemas/users/enums/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('Ventas')
@ApiBearerAuth()
@Controller('sales')
export class SalesController {
    constructor(private readonly salesService: SalesService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.User)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Crear una nueva venta', description: 'Registra una nueva venta en el sistema' })
    @ApiCreatedResponse({
        description: 'Venta creada exitosamente',
        type: Sale
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Datos de entrada inválidos'
    })
    async create(@Body() createSaleDto: CreateSaleDto): Promise<Sale> {
        return this.salesService.create(createSaleDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.User)
    @ApiOperation({
        summary: 'Listar todas las ventas',
        description: 'Recupera una lista paginada de todas las ventas con filtros opcionales'
    })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: ['pending', 'completed', 'cancelled'],
        description: 'Filtrar ventas por estado'
    })
    @ApiQuery({
        name: 'sellerId',
        required: false,
        type: String,
        description: 'Filtrar ventas por ID del vendedor'
    })
    @ApiOkResponse({
        description: 'Ventas recuperadas exitosamente',
        type: [Sale]
    })
    async findAll(
        @Query() pagination: PaginationDto,
        @Query('status') status?: string,
        @Query('sellerId') sellerId?: string
    ): Promise<Sale[]> {
        return this.salesService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.User)
    @ApiOperation({ summary: 'Obtener detalles de la venta', description: 'Recupera información detallada sobre una venta específica' })
    @ApiParam({ name: 'id', description: 'ID de la venta', type: String })
    @ApiOkResponse({ description: 'Venta encontrada', type: Sale })
    @ApiNotFoundResponse({ description: 'Venta no encontrada' })
    async findOne(
        @Param('id', new ParseUUIDPipe()) id: string
    ): Promise<Sale> {
        const sale = await this.salesService.findOne(id);
        if (!sale) {
            throw new NotFoundException(`Venta con ID ${id} no encontrada`);
        }
        return sale;
    }

    @Get('seller/:sellerId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.User)
    @ApiOperation({
        summary: 'Obtener ventas por vendedor',
        description: 'Recupera todas las ventas realizadas por un vendedor específico'
    })
    @ApiParam({
        name: 'sellerId',
        description: 'ID del vendedor',
        type: String
    })
    @ApiOkResponse({
        description: 'Ventas recuperadas exitosamente',
        type: [Sale]
    })
    @ApiNotFoundResponse({
        description: 'No se encontraron ventas para este vendedor'
    })
    async findBySeller(
        @Param('sellerId', new ParseUUIDPipe()) sellerId: string
    ): Promise<Sale[]> {
        const sales = await this.salesService.findBySeller(sellerId);
        if (sales.length === 0) {
            throw new NotFoundException(`No se encontraron ventas para el vendedor con ID ${sellerId}`);
        }
        return sales;
    }

    @Put(':id/complete')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.User)
    @ApiOperation({
        summary: 'Marcar venta como completada',
        description: 'Actualiza el estado de la venta a "completada"'
    })
    @ApiParam({ name: 'id', description: 'ID de la venta', type: String })
    @ApiOkResponse({ description: 'Venta marcada como completada', type: Sale })
    @ApiNotFoundResponse({ description: 'Venta no encontrada' })
    @ApiConflictResponse({
        description: 'La venta no se puede completar (estado actual inválido)'
    })
    async completeSale(
        @Param('id', new ParseUUIDPipe()) id: string
    ): Promise<Sale> {
        return this.salesService.updateStatus(id, 'completed');
    }

    @Put(':id/cancel')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.User)
    @ApiOperation({
        summary: 'Cancelar venta',
        description: 'Actualiza el estado de la venta a "cancelada"'
    })
    @ApiParam({ name: 'id', description: 'ID de la venta', type: String })
    @ApiOkResponse({ description: 'Venta cancelada exitosamente', type: Sale })
    @ApiNotFoundResponse({ description: 'Venta no encontrada' })
    @ApiConflictResponse({
        description: 'La venta no se puede cancelar (estado actual inválido)'
    })
    async cancelSale(
        @Param('id', new ParseUUIDPipe()) id: string
    ): Promise<Sale> {
        return this.salesService.updateStatus(id, 'cancelled');
    }
}