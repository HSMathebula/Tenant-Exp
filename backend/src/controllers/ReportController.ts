import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Payment, PaymentStatus } from '../models/Payment';
import { Unit } from '../models/Unit';
import { MaintenanceRequest } from '../models/MaintenanceRequest';
import { Between } from 'typeorm';

interface MaintenanceCategoryData {
  total: number;
  completed: number;
  pending: number;
  resolutionTimes: number[];
}

export class ReportController {
  static async getRevenueReport(req: Request, res: Response) {
    try {
      const { timeRange } = req.query;
      const paymentRepository = AppDataSource.getRepository(Payment);
      
      // Calculate date range based on timeRange
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(endDate.getMonth() - 1); // Default to last month
      }

      // Get payments within date range
      const payments = await paymentRepository.find({
        where: {
          createdAt: Between(startDate, endDate),
          status: PaymentStatus.COMPLETED
        },
        relations: ['unit', 'unit.property']
      });

      // Group payments by property
      const revenueByProperty = payments.reduce((acc: Record<string, number>, payment) => {
        const propertyName = payment.unit.property.name;
        if (!acc[propertyName]) {
          acc[propertyName] = 0;
        }
        acc[propertyName] += payment.amount;
        return acc;
      }, {});

      // Format data for chart
      const revenueData = Object.entries(revenueByProperty).map(([name, revenue]) => ({
        name,
        revenue
      }));

      return res.json(revenueData);
    } catch (error) {
      return res.status(500).json({ message: 'Error generating revenue report', error });
    }
  }

  static async getOccupancyReport(req: Request, res: Response) {
    try {
      const unitRepository = AppDataSource.getRepository(Unit);
      
      // Get all units
      const units = await unitRepository.find({
        relations: ['property']
      });

      // Calculate occupancy rates
      const occupiedUnits = units.filter(unit => unit.status === 'occupied').length;
      const availableUnits = units.filter(unit => unit.status === 'available').length;
      const maintenanceUnits = units.filter(unit => unit.status === 'maintenance').length;
      const reservedUnits = units.filter(unit => unit.status === 'reserved').length;

      // Format data for pie chart
      const occupancyData = [
        { name: 'Occupied', value: occupiedUnits },
        { name: 'Available', value: availableUnits },
        { name: 'Maintenance', value: maintenanceUnits },
        { name: 'Reserved', value: reservedUnits }
      ];

      return res.json(occupancyData);
    } catch (error) {
      return res.status(500).json({ message: 'Error generating occupancy report', error });
    }
  }

  static async getMaintenanceReport(req: Request, res: Response) {
    try {
      const { timeRange } = req.query;
      const maintenanceRepository = AppDataSource.getRepository(MaintenanceRequest);
      
      // Calculate date range based on timeRange
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(endDate.getMonth() - 1); // Default to last month
      }

      // Get maintenance requests within date range
      const requests = await maintenanceRepository.find({
        where: {
          createdAt: Between(startDate, endDate)
        }
      });

      // Group requests by category
      const maintenanceByCategory = requests.reduce((acc: Record<string, MaintenanceCategoryData>, request) => {
        const category = request.category;
        if (!acc[category]) {
          acc[category] = {
            total: 0,
            completed: 0,
            pending: 0,
            resolutionTimes: []
          };
        }
        
        acc[category].total++;
        
        if (request.status === 'completed') {
          acc[category].completed++;
          if (request.completion?.completedDate) {
            const resolutionTime = new Date(request.completion.completedDate).getTime() - 
                                 new Date(request.createdAt).getTime();
            acc[category].resolutionTimes.push(resolutionTime);
          }
        } else {
          acc[category].pending++;
        }
        
        return acc;
      }, {});

      // Format data for table
      const maintenanceData = Object.entries(maintenanceByCategory).map(([category, data]: [string, MaintenanceCategoryData]) => ({
        category,
        total: data.total,
        completed: data.completed,
        pending: data.pending,
        avgResolutionTime: data.resolutionTimes.length > 0
          ? `${(data.resolutionTimes.reduce((a: number, b: number) => a + b, 0) / 
              data.resolutionTimes.length / (1000 * 60 * 60 * 24)).toFixed(1)} days`
          : 'N/A'
      }));

      return res.json(maintenanceData);
    } catch (error) {
      return res.status(500).json({ message: 'Error generating maintenance report', error });
    }
  }
} 