import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Building } from '../models/Building';
import { AppError } from '../utils/appError';
import { validate } from 'class-validator';
import { Repository } from 'typeorm';

export class BuildingController {
  private buildingRepo: Repository<Building>;

  constructor() {
    this.buildingRepo = AppDataSource.getRepository(Building);
  }

  // Create a new building
  async create(req: Request, res: Response) {
    try {
      const building = this.buildingRepo.create(req.body as Partial<Building>);

      // Validate building data
      const errors = await validate(building);
      if (errors.length > 0) {
        throw new AppError('Validation failed', 400, errors);
      }

      // Check if building with same name and address exists
      const existingBuilding = await this.buildingRepo.findOne({
        where: {
          name: building.name,
          address: building.address,
          city: building.city,
          state: building.state,
          zipCode: building.zipCode
        }
      });

      if (existingBuilding) {
        throw new AppError('Building with this address already exists', 400);
      }

      await this.buildingRepo.save(building);
      res.status(201).json(building);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message, errors: error.errors });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  // Get all buildings with optional filters
  async getAll(req: Request, res: Response) {
    try {
      const {
        type,
        status,
        city,
        state,
        hasParking,
        hasGym,
        hasPool,
        isPetFriendly,
        minUnits,
        maxUnits,
        search
      } = req.query;

      const queryBuilder = this.buildingRepo.createQueryBuilder('building');

      // Apply filters
      if (type) {
        queryBuilder.andWhere('building.type = :type', { type });
      }
      if (status) {
        queryBuilder.andWhere('building.status = :status', { status });
      }
      if (city) {
        queryBuilder.andWhere('building.city = :city', { city });
      }
      if (state) {
        queryBuilder.andWhere('building.state = :state', { state });
      }
      if (hasParking !== undefined) {
        queryBuilder.andWhere('building.hasParking = :hasParking', { hasParking });
      }
      if (hasGym !== undefined) {
        queryBuilder.andWhere('building.hasGym = :hasGym', { hasGym });
      }
      if (hasPool !== undefined) {
        queryBuilder.andWhere('building.hasPool = :hasPool', { hasPool });
      }
      if (isPetFriendly !== undefined) {
        queryBuilder.andWhere('building.isPetFriendly = :isPetFriendly', { isPetFriendly });
      }
      if (minUnits) {
        queryBuilder.andWhere('building.totalUnits >= :minUnits', { minUnits });
      }
      if (maxUnits) {
        queryBuilder.andWhere('building.totalUnits <= :maxUnits', { maxUnits });
      }
      if (search) {
        queryBuilder.andWhere(
          '(building.name ILIKE :search OR building.address ILIKE :search OR building.city ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      const buildings = await queryBuilder.getMany();
      res.json(buildings);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get a single building by ID
  async getOne(req: Request, res: Response) {
    try {
      const building = await this.buildingRepo.findOne({
        where: { id: req.params.id },
        relations: ['units', 'assignments']
      });

      if (!building) {
        throw new AppError('Building not found', 404);
      }

      res.json(building);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  // Update a building
  async update(req: Request, res: Response) {
    try {
      const building = await this.buildingRepo.findOne({
        where: { id: req.params.id }
      });

      if (!building) {
        throw new AppError('Building not found', 404);
      }

      // Update building properties
      this.buildingRepo.merge(building, req.body);

      // Validate updated building
      const errors = await validate(building);
      if (errors.length > 0) {
        throw new AppError('Validation failed', 400, errors);
      }

      await this.buildingRepo.save(building);
      res.json(building);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message, errors: error.errors });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  // Delete a building
  async delete(req: Request, res: Response) {
    try {
      const building = await this.buildingRepo.findOne({
        where: { id: req.params.id },
        relations: ['units', 'assignments']
      });

      if (!building) {
        throw new AppError('Building not found', 404);
      }

      // Check if building has active assignments or units
      if (building.assignments?.length > 0 || building.units?.length > 0) {
        throw new AppError('Cannot delete building with active assignments or units', 400);
      }

      await this.buildingRepo.remove(building);
      res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  // Get building statistics
  async getStats(req: Request, res: Response) {
    try {
      const building = await this.buildingRepo.findOne({
        where: { id: req.params.id }
      });

      if (!building) {
        throw new AppError('Building not found', 404);
      }

      const stats = {
        totalUnits: building.totalUnits,
        occupiedUnits: building.occupiedUnits,
        occupancyRate: (building.occupiedUnits / building.totalUnits) * 100,
        averageRent: building.averageRent,
        amenities: building.amenities,
        type: building.type,
        status: building.status
      };

      res.json(stats);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
} 