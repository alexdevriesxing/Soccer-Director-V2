import { createBoardroomService } from './boardroomService';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client');
const prisma = new PrismaClient();
const BoardroomService = createBoardroomService(prisma);

beforeAll(() => {
  Object.defineProperty(prisma, 'boardMember', {
    value: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    writable: true,
  });
  Object.defineProperty(prisma, 'boardMeeting', {
    value: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    writable: true,
  });
  Object.defineProperty(prisma, 'boardObjective', {
    value: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    writable: true,
  });
  Object.defineProperty(prisma, 'boardDecision', {
    value: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    writable: true,
  });
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('BoardroomService', () => {
  it('should get board members', async () => {
    (prisma.boardMember.findMany as jest.Mock).mockResolvedValue([{ id: 1, name: 'Chairman', clubId: 1 }]);
    const result = await BoardroomService.getBoardMembers(1);
    expect(result).toEqual([{ id: 1, name: 'Chairman', clubId: 1 }]);
  });

  it('should create a board member', async () => {
    (prisma.boardMember.create as jest.Mock).mockResolvedValue({ id: 2, name: 'Director', clubId: 1 });
    const result = await BoardroomService.createBoardMember({ name: 'Director', clubId: 1 });
    expect(result).toEqual({ id: 2, name: 'Director', clubId: 1 });
  });

  it('should update a board member', async () => {
    (prisma.boardMember.update as jest.Mock).mockResolvedValue({ id: 1, name: 'Updated', clubId: 1 });
    const result = await BoardroomService.updateBoardMember(1, { name: 'Updated' });
    expect(result).toEqual({ id: 1, name: 'Updated', clubId: 1 });
  });

  it('should delete a board member', async () => {
    (prisma.boardMember.delete as jest.Mock).mockResolvedValue({ id: 1, name: 'Deleted', clubId: 1 });
    const result = await BoardroomService.deleteBoardMember(1);
    expect(result).toEqual({ id: 1, name: 'Deleted', clubId: 1 });
  });

  it('should get board meetings', async () => {
    (prisma.boardMeeting.findMany as jest.Mock).mockResolvedValue([{ id: 1, clubId: 1, agenda: 'Budget', date: new Date() }]);
    const result = await BoardroomService.getBoardMeetings(1);
    expect(result[0].agenda).toBe('Budget');
  });

  it('should create a board meeting', async () => {
    const meeting = { id: 2, clubId: 1, agenda: 'Strategy', date: new Date() };
    (prisma.boardMeeting.create as jest.Mock).mockResolvedValue(meeting);
    const result = await BoardroomService.createBoardMeeting(meeting);
    expect(result).toEqual(meeting);
  });

  it('should update a board meeting', async () => {
    (prisma.boardMeeting.update as jest.Mock).mockResolvedValue({ id: 1, agenda: 'Updated', clubId: 1, date: new Date() });
    const result = await BoardroomService.updateBoardMeeting(1, { agenda: 'Updated' });
    expect(result.agenda).toBe('Updated');
  });

  it('should delete a board meeting', async () => {
    (prisma.boardMeeting.delete as jest.Mock).mockResolvedValue({ id: 1, agenda: 'Deleted', clubId: 1, date: new Date() });
    const result = await BoardroomService.deleteBoardMeeting(1);
    expect(result.agenda).toBe('Deleted');
  });

  it('should get board objectives', async () => {
    (prisma.boardObjective.findMany as jest.Mock).mockResolvedValue([{ id: 1, boardMemberId: 1, description: 'Win league' }]);
    const result = await BoardroomService.getBoardObjectives(1);
    expect(result[0].description).toBe('Win league');
  });

  it('should create a board objective', async () => {
    const obj = { id: 2, boardMemberId: 1, description: 'Increase revenue' };
    (prisma.boardObjective.create as jest.Mock).mockResolvedValue(obj);
    const result = await BoardroomService.createBoardObjective(obj);
    expect(result).toEqual(obj);
  });

  it('should update a board objective', async () => {
    (prisma.boardObjective.update as jest.Mock).mockResolvedValue({ id: 1, description: 'Updated', boardMemberId: 1 });
    const result = await BoardroomService.updateBoardObjective(1, { description: 'Updated' });
    expect(result.description).toBe('Updated');
  });

  it('should delete a board objective', async () => {
    (prisma.boardObjective.delete as jest.Mock).mockResolvedValue({ id: 1, description: 'Deleted', boardMemberId: 1 });
    const result = await BoardroomService.deleteBoardObjective(1);
    expect(result.description).toBe('Deleted');
  });

  it('should get board decisions', async () => {
    (prisma.boardDecision.findMany as jest.Mock).mockResolvedValue([{ id: 1, boardMeetingId: 1, description: 'Approve budget' }]);
    const result = await BoardroomService.getBoardDecisions(1);
    expect(result[0].description).toBe('Approve budget');
  });

  it('should create a board decision', async () => {
    const dec = { id: 2, boardMeetingId: 1, description: 'Sign player' };
    (prisma.boardDecision.create as jest.Mock).mockResolvedValue(dec);
    const result = await BoardroomService.createBoardDecision(dec);
    expect(result).toEqual(dec);
  });

  it('should update a board decision', async () => {
    (prisma.boardDecision.update as jest.Mock).mockResolvedValue({ id: 1, description: 'Updated', boardMeetingId: 1 });
    const result = await BoardroomService.updateBoardDecision(1, { description: 'Updated' });
    expect(result.description).toBe('Updated');
  });

  it('should delete a board decision', async () => {
    (prisma.boardDecision.delete as jest.Mock).mockResolvedValue({ id: 1, description: 'Deleted', boardMeetingId: 1 });
    const result = await BoardroomService.deleteBoardDecision(1);
    expect(result.description).toBe('Deleted');
  });

  it('should trigger a board meeting', async () => {
    const meeting = { id: 3, clubId: 1, agenda: 'Emergency', date: new Date() };
    (prisma.boardMeeting.create as jest.Mock).mockResolvedValue(meeting);
    const result = await BoardroomService.triggerBoardMeeting(1, 'Emergency', new Date());
    expect(result.agenda).toBe('Emergency');
  });

  // Error/edge cases can be added as needed
}); 