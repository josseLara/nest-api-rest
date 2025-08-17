import { IsEmail, IsNotEmpty, IsNumber, IsPositive, IsString, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSaleDto {
  @ApiProperty({
    description: 'ID del producto vendido (debe existir en la base de datos)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Nombre del producto vendido',
    example: 'Laptop HP EliteBook',
  })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({
    description: 'Cantidad vendida (mínimo 1, máximo 100)',
    example: 2,
    minimum: 1,
    maximum: 100,
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(100)
  quantity: number;

  @ApiProperty({
    description: 'Precio total de la venta (mayor que 0)',
    example: 1999.99,
  })
  @IsNumber()
  @IsPositive()
  totalPrice: number;

  @ApiProperty({
    description: 'Email del cliente que realiza la compra',
    example: 'cliente@example.com',
  })
  @IsEmail()
  customerEmail: string;

  @ApiProperty({
    description: 'ID del vendedor (usuario que registra la venta)',
    example: '507f1f77bcf86cd799439012',
  })
  @IsString()
  @IsNotEmpty()
  sellerId: string;

  @ApiPropertyOptional({
    description: 'Estado inicial de la venta (opcional)',
    example: 'pending',
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
  })
  @IsOptional()
  @IsString()
  status?: 'pending' | 'completed' | 'cancelled';
}