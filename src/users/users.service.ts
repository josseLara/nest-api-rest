import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/users/index.schema';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const createdUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
      });
      return await createdUser.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('El email ya está registrado');
      }
      if (error.name === 'ValidationError') {
        throw new BadRequestException('Datos de usuario inválidos');
      }
      throw new InternalServerErrorException('Error al crear el usuario');
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userModel.find().select('-password -refreshToken').exec();
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los usuarios');
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      const user = await this.userModel.findById(id).select('-password -refreshToken').exec();
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.name === 'CastError') {
        throw new BadRequestException('ID de usuario inválido');
      }
      throw new InternalServerErrorException('Error al obtener el usuario');
    }
  }

  async findByEmail(email: string): Promise<User | undefined> {
    try {
      return await this.userModel.findOne({ email }).exec();
    } catch (error) {
      throw new InternalServerErrorException('Error al buscar usuario por email');
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }
      
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true, runValidators: true })
        .select('-password -refreshToken')
        .exec();
      
      if (!updatedUser) {
        throw new NotFoundException('Usuario no encontrado');
      }
      
      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.name === 'CastError') {
        throw new BadRequestException('ID de usuario inválido');
      }
      if (error.name === 'ValidationError') {
        throw new BadRequestException('Datos de actualización inválidos');
      }
      if (error.code === 11000) {
        throw new BadRequestException('El email ya está registrado');
      }
      throw new InternalServerErrorException('Error al actualizar el usuario');
    }
  }

  async remove(id: string): Promise<User> {
    try {
      const deletedUser = await this.userModel
        .findByIdAndDelete(id)
        .select('-password -refreshToken')
        .exec();
      
      if (!deletedUser) {
        throw new NotFoundException('Usuario no encontrado');
      }
      
      return deletedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.name === 'CastError') {
        throw new BadRequestException('ID de usuario inválido');
      }
      throw new InternalServerErrorException('Error al eliminar el usuario');
    }
  }
}