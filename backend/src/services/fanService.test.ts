import { createFanService } from './fanService';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client');
const prisma = new PrismaClient();
const FanService = createFanService(prisma);

beforeAll(() => {
  Object.defineProperty(prisma, 'fanGroup', {
    value: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    writable: true,
  });
  Object.defineProperty(prisma, 'fanEvent', {
    value: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    writable: true,
  });
  Object.defineProperty(prisma, 'fanSentiment', {
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

describe('FanService', () => {
  it('should get fan groups', async () => {
    (prisma.fanGroup.findMany as jest.Mock).mockResolvedValue([{ id: 1, name: 'Ultras', clubId: 1 }]);
    const result = await FanService.getFanGroups(1);
    expect(result).toEqual([{ id: 1, name: 'Ultras', clubId: 1 }]);
  });

  it('should create a fan group', async () => {
    (prisma.fanGroup.create as jest.Mock).mockResolvedValue({ id: 2, name: 'Supporters', clubId: 1 });
    const result = await FanService.createFanGroup({ name: 'Supporters', clubId: 1 });
    expect(result).toEqual({ id: 2, name: 'Supporters', clubId: 1 });
  });

  it('should update a fan group', async () => {
    (prisma.fanGroup.update as jest.Mock).mockResolvedValue({ id: 1, name: 'Updated', clubId: 1 });
    const result = await FanService.updateFanGroup(1, { name: 'Updated' });
    expect(result).toEqual({ id: 1, name: 'Updated', clubId: 1 });
  });

  it('should delete a fan group', async () => {
    (prisma.fanGroup.delete as jest.Mock).mockResolvedValue({ id: 1, name: 'Deleted', clubId: 1 });
    const result = await FanService.deleteFanGroup(1);
    expect(result).toEqual({ id: 1, name: 'Deleted', clubId: 1 });
  });

  it('should get fan events', async () => {
    (prisma.fanEvent.findMany as jest.Mock).mockResolvedValue([{ id: 1, fanGroupId: 1, type: 'protest', description: 'Protest', date: new Date() }]);
    const result = await FanService.getFanEvents(1);
    expect(result[0].type).toBe('protest');
  });

  it('should create a fan event', async () => {
    const event = { id: 2, fanGroupId: 1, type: 'celebration', description: 'Party', date: new Date() };
    (prisma.fanEvent.create as jest.Mock).mockResolvedValue(event);
    const result = await FanService.createFanEvent(event);
    expect(result).toEqual(event);
  });

  it('should update a fan event', async () => {
    (prisma.fanEvent.update as jest.Mock).mockResolvedValue({ id: 1, type: 'updated', fanGroupId: 1, description: 'Updated', date: new Date() });
    const result = await FanService.updateFanEvent(1, { type: 'updated' });
    expect(result.type).toBe('updated');
  });

  it('should delete a fan event', async () => {
    (prisma.fanEvent.delete as jest.Mock).mockResolvedValue({ id: 1, type: 'deleted', fanGroupId: 1, description: 'Deleted', date: new Date() });
    const result = await FanService.deleteFanEvent(1);
    expect(result.type).toBe('deleted');
  });

  it('should get fan sentiments', async () => {
    (prisma.fanSentiment.findMany as jest.Mock).mockResolvedValue([{ id: 1, fanGroupId: 1, sentiment: 50, reason: 'Good result', date: new Date() }]);
    const result = await FanService.getFanSentiments(1);
    expect(result[0].sentiment).toBe(50);
  });

  it('should create a fan sentiment', async () => {
    const sentiment = { id: 2, fanGroupId: 1, sentiment: 80, reason: 'Promotion', date: new Date() };
    (prisma.fanSentiment.create as jest.Mock).mockResolvedValue(sentiment);
    const result = await FanService.createFanSentiment(sentiment);
    expect(result).toEqual(sentiment);
  });

  it('should update a fan sentiment', async () => {
    (prisma.fanSentiment.update as jest.Mock).mockResolvedValue({ id: 1, sentiment: 10, fanGroupId: 1, reason: 'Bad result', date: new Date() });
    const result = await FanService.updateFanSentiment(1, { sentiment: 10 });
    expect(result.sentiment).toBe(10);
  });

  it('should delete a fan sentiment', async () => {
    (prisma.fanSentiment.delete as jest.Mock).mockResolvedValue({ id: 1, sentiment: 0, fanGroupId: 1, reason: 'Deleted', date: new Date() });
    const result = await FanService.deleteFanSentiment(1);
    expect(result.sentiment).toBe(0);
  });

  it('should trigger a fan event', async () => {
    const event = { id: 3, fanGroupId: 1, type: 'online', description: 'Tweet', date: new Date() };
    (prisma.fanEvent.create as jest.Mock).mockResolvedValue(event);
    const result = await FanService.triggerFanEvent(1, 'online', 'Tweet', new Date());
    expect(result.type).toBe('online');
  });

  // Error/edge cases can be added as needed
}); 