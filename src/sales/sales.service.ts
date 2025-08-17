import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sale } from 'src/schemas/sales/sales.schema';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(@InjectModel(Sale.name) private saleModel: Model<Sale>) {}

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    const createdSale = new this.saleModel(createSaleDto);
    return createdSale.save();
  }

  async findAll(): Promise<Sale[]> {
    return this.saleModel.find().exec();
  }

  async findOne(id: string): Promise<Sale> {
    return this.saleModel.findById(id).exec();
  }

  async findBySeller(sellerId: string): Promise<Sale[]> {
    return this.saleModel.find({ sellerId }).exec();
  }

  async updateStatus(id: string, status: 'completed' | 'cancelled'): Promise<Sale> {
    return this.saleModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
  }
}