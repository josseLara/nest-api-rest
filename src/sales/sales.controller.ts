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

@ApiTags('Sales')
@ApiBearerAuth()
@Controller('sales')
export class SalesController {
    constructor(private readonly salesService: SalesService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard) // Usa ambos guards
    @Roles(Role.Admin, Role.User)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new sale', description: 'Registers a new sale in the system' })
    @ApiCreatedResponse({
        description: 'Sale successfully created',
        type: Sale
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data'
    })
    async create(@Body() createSaleDto: CreateSaleDto): Promise<Sale> {
        return this.salesService.create(createSaleDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard) // Usa ambos guards
    @Roles(Role.Admin, Role.User)
    @ApiOperation({
        summary: 'List all sales',
        description: 'Retrieves a paginated list of all sales with optional filters'
    })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: ['pending', 'completed', 'cancelled'],
        description: 'Filter sales by status'
    })
    @ApiQuery({
        name: 'sellerId',
        required: false,
        type: String,
        description: 'Filter sales by seller ID'
    })
    @ApiOkResponse({
        description: 'Sales retrieved successfully',
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
    @UseGuards(JwtAuthGuard, RolesGuard) // Usa ambos guards
    @Roles(Role.Admin, Role.User)
    @ApiOperation({ summary: 'Get sale details', description: 'Retrieves detailed information about a specific sale' })
    @ApiParam({ name: 'id', description: 'Sale ID', type: String })
    @ApiOkResponse({ description: 'Sale found', type: Sale })
    @ApiNotFoundResponse({ description: 'Sale not found' })
    async findOne(
        @Param('id', new ParseUUIDPipe()) id: string
    ): Promise<Sale> {
        const sale = await this.salesService.findOne(id);
        if (!sale) {
            throw new NotFoundException(`Sale with ID ${id} not found`);
        }
        return sale;
    }

    @Get('seller/:sellerId')
    @UseGuards(JwtAuthGuard, RolesGuard) // Usa ambos guards
    @Roles(Role.Admin, Role.User)
    @ApiOperation({
        summary: 'Get sales by seller',
        description: 'Retrieves all sales made by a specific seller'
    })
    @ApiParam({
        name: 'sellerId',
        description: 'Seller ID',
        type: String
    })
    @ApiOkResponse({
        description: 'Sales retrieved successfully',
        type: [Sale]
    })
    @ApiNotFoundResponse({
        description: 'No sales found for this seller'
    })
    async findBySeller(
        @Param('sellerId', new ParseUUIDPipe()) sellerId: string
    ): Promise<Sale[]> {
        const sales = await this.salesService.findBySeller(sellerId);
        if (sales.length === 0) {
            throw new NotFoundException(`No sales found for seller with ID ${sellerId}`);
        }
        return sales;
    }

    @Put(':id/complete')
    @UseGuards(JwtAuthGuard, RolesGuard) // Usa ambos guards
    @Roles(Role.Admin, Role.User)
    @ApiOperation({
        summary: 'Mark sale as completed',
        description: 'Updates the sale status to "completed"'
    })
    @ApiParam({ name: 'id', description: 'Sale ID', type: String })
    @ApiOkResponse({ description: 'Sale marked as completed', type: Sale })
    @ApiNotFoundResponse({ description: 'Sale not found' })
    @ApiConflictResponse({
        description: 'Sale cannot be completed (invalid current status)'
    })
    async completeSale(
        @Param('id', new ParseUUIDPipe()) id: string
    ): Promise<Sale> {
        return this.salesService.updateStatus(id, 'completed');
    }

    @Put(':id/cancel')
    @UseGuards(JwtAuthGuard, RolesGuard) // Usa ambos guards
    @Roles(Role.Admin, Role.User)
    @ApiOperation({
        summary: 'Cancel sale',
        description: 'Updates the sale status to "cancelled"'
    })
    @ApiParam({ name: 'id', description: 'Sale ID', type: String })
    @ApiOkResponse({ description: 'Sale cancelled successfully', type: Sale })
    @ApiNotFoundResponse({ description: 'Sale not found' })
    @ApiConflictResponse({
        description: 'Sale cannot be cancelled (invalid current status)'
    })
    async cancelSale(
        @Param('id', new ParseUUIDPipe()) id: string
    ): Promise<Sale> {
        return this.salesService.updateStatus(id, 'cancelled');
    }
}