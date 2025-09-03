import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sale } from 'src/schemas/sales/sales.schema';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(@InjectModel(Sale.name) private saleModel: Model<Sale>) {}

  /**
   * Crea una nueva venta en el sistema
   * @param createSaleDto - DTO con los datos de la venta a crear
   * @returns La venta creada
   * @throws InternalServerErrorException si ocurre un error inesperado al crear la venta
   */
  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    try {
      const createdSale = new this.saleModel(createSaleDto);
      return await createdSale.save();
    } catch (error) {
      throw new InternalServerErrorException('Error al crear la venta');
    }
  }

  /**
   * Obtiene todas las ventas del sistema
   * @returns Lista de todas las ventas
   * @throws InternalServerErrorException si ocurre un error inesperado al obtener las ventas
   */
  async findAll(): Promise<Sale[]> {
    try {
      return await this.saleModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener todas las ventas');
    }
  }

  /**
   * Obtiene una venta específica por su ID
   * @param id - ID de la venta a buscar
   * @returns La venta encontrada
   * @throws NotFoundException si no se encuentra la venta
   * @throws InternalServerErrorException si ocurre un error inesperado al buscar la venta
   */
  async findOne(id: string): Promise<Sale> {
    try {
      const sale = await this.saleModel.findById(id).exec();
      if (!sale) {
        throw new NotFoundException(`Venta con ID ${id} no encontrada`);
      }
      return sale;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener la venta');
    }
  }

  /**
   * Obtiene todas las ventas de un vendedor específico
   * @param sellerId - ID del vendedor
   * @returns Lista de ventas del vendedor
   * @throws InternalServerErrorException si ocurre un error inesperado al buscar las ventas
   */
  async findBySeller(sellerId: string): Promise<Sale[]> {
    try {
      return await this.saleModel.find({ sellerId }).exec();
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener las ventas del vendedor');
    }
  }

  /**
   * Actualiza el estado de una venta
   * @param id - ID de la venta a actualizar
   * @param status - Nuevo estado ('completed' o 'cancelled')
   * @returns La venta actualizada
   * @throws NotFoundException si no se encuentra la venta
   * @throws InternalServerErrorException si ocurre un error inesperado al actualizar la venta
   */
  async updateStatus(id: string, status: 'completed' | 'cancelled'): Promise<Sale> {
    try {
      const updatedSale = await this.saleModel
        .findByIdAndUpdate(id, { status }, { new: true })
        .exec();
      
      if (!updatedSale) {
        throw new NotFoundException(`Venta con ID ${id} no encontrada`);
      }
      
      return updatedSale;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el estado de la venta');
    }
  }
}
