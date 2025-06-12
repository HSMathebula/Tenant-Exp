import { AppDataSource } from '../data-source';
import { Ticket } from '../models/Ticket';
import { TicketComment } from '../models/TicketComment';
import { BuildingAssignment } from '../models/BuildingAssignment';
import { AppError } from '../middleware/error.middleware';

export class TicketService {
  static async createTicket(
    userId: string,
    title: string,
    description: string,
    buildingId: string,
    category: string,
    priority: string
  ): Promise<Ticket> {
    const ticketRepository = AppDataSource.getRepository(Ticket);
    const buildingAssignmentRepository = AppDataSource.getRepository(BuildingAssignment);

    // Verify user has access to the building
    const assignment = await buildingAssignmentRepository.findOne({
      where: {
        user: { id: userId },
        building: { id: buildingId },
        isActive: true
      }
    });

    if (!assignment) {
      throw new AppError(403, 'User does not have access to this building');
    }

    const ticket = ticketRepository.create({
      title,
      description,
      building: { id: buildingId },
      category,
      priority,
      status: 'OPEN',
      createdBy: { id: userId }
    });

    return ticketRepository.save(ticket);
  }

  static async getUserTickets(
    userId: string,
    buildingId: string,
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ tickets: Ticket[]; total: number }> {
    const ticketRepository = AppDataSource.getRepository(Ticket);
    const buildingAssignmentRepository = AppDataSource.getRepository(BuildingAssignment);

    // Verify user has access to the building
    const assignment = await buildingAssignmentRepository.findOne({
      where: {
        user: { id: userId },
        building: { id: buildingId },
        isActive: true
      }
    });

    if (!assignment) {
      throw new AppError(403, 'User does not have access to this building');
    }

    const query = {
      building: { id: buildingId },
      ...(status && { status })
    };

    const [tickets, total] = await ticketRepository.findAndCount({
      where: query,
      relations: ['building', 'createdBy', 'assignedTo'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit
    });

    return { tickets, total };
  }

  static async getTicketDetails(ticketId: string, userId: string): Promise<Ticket> {
    const ticketRepository = AppDataSource.getRepository(Ticket);
    const buildingAssignmentRepository = AppDataSource.getRepository(BuildingAssignment);

    const ticket = await ticketRepository.findOne({
      where: { id: ticketId },
      relations: ['building', 'createdBy', 'assignedTo', 'comments']
    });

    if (!ticket) {
      throw new AppError(404, 'Ticket not found');
    }

    // Verify user has access to the building
    const assignment = await buildingAssignmentRepository.findOne({
      where: {
        user: { id: userId },
        building: { id: ticket.building.id },
        isActive: true
      }
    });

    if (!assignment) {
      throw new AppError(403, 'User does not have access to this ticket');
    }

    return ticket;
  }

  static async addComment(
    ticketId: string,
    userId: string,
    content: string
  ): Promise<TicketComment> {
    const ticketRepository = AppDataSource.getRepository(Ticket);
    const commentRepository = AppDataSource.getRepository(TicketComment);
    const buildingAssignmentRepository = AppDataSource.getRepository(BuildingAssignment);

    const ticket = await ticketRepository.findOne({
      where: { id: ticketId },
      relations: ['building']
    });

    if (!ticket) {
      throw new AppError(404, 'Ticket not found');
    }

    // Verify user has access to the building
    const assignment = await buildingAssignmentRepository.findOne({
      where: {
        user: { id: userId },
        building: { id: ticket.building.id },
        isActive: true
      }
    });

    if (!assignment) {
      throw new AppError(403, 'User does not have access to this ticket');
    }

    const comment = commentRepository.create({
      ticket: { id: ticketId },
      content,
      createdBy: { id: userId }
    });

    return commentRepository.save(comment);
  }

  static async updateTicketStatus(
    ticketId: string,
    userId: string,
    status: string
  ): Promise<Ticket> {
    const ticketRepository = AppDataSource.getRepository(Ticket);
    const buildingAssignmentRepository = AppDataSource.getRepository(BuildingAssignment);

    const ticket = await ticketRepository.findOne({
      where: { id: ticketId },
      relations: ['building']
    });

    if (!ticket) {
      throw new AppError(404, 'Ticket not found');
    }

    // Verify user has access to the building
    const assignment = await buildingAssignmentRepository.findOne({
      where: {
        user: { id: userId },
        building: { id: ticket.building.id },
        isActive: true
      }
    });

    if (!assignment) {
      throw new AppError(403, 'User does not have access to this ticket');
    }

    ticket.status = status;
    return ticketRepository.save(ticket);
  }
} 