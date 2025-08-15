import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient, Prisma, Player, Club, TransferListing, TransferOffer } from '@prisma/client';
import { t } from '../utils/i18n';
import { authenticateToken } from '../middleware/auth';
import { z } from 'zod';
import { z as zod } from 'zod';

type PlayerWithClub = Player & {
  club: Club | null;
  transferListings: TransferListing[];
};

type TransferOfferWithRelations = TransferOffer & {
  player: PlayerWithClub;
  fromClub: Club;
  toClub: Club;
};

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: { id: number };
    }
  }
}

const router = express.Router();
const prisma = new PrismaClient();

// Input validation schemas using Zod
const transferListingSchema = z.object({
  playerId: z.number().int().positive(),
  askingPrice: z.number().int().positive(),
  deadline: z.string().datetime(),
});

const transferOfferSchema = z.object({
  playerId: z.number().int().positive(),
  fromClubId: z.number().int().positive(),
  toClubId: z.number().int().positive(),
  fee: z.number().int().positive(),
  wageOffer: z.number().int().nonnegative(),
  contractLength: z.number().int().min(1).max(5),
  message: z.string().optional(),
});

const respondToOfferSchema = z.object({
  response: z.enum(['ACCEPTED', 'REJECTED', 'COUNTERED']) as z.ZodType<Prisma.EnumTransferStatusFilter>,
  message: z.string().optional(),
  counterOffer: z.object({
    fee: z.number().int().positive(),
    wageOffer: z.number().int().nonnegative(),
    contractLength: z.number().int().min(1).max(5),
  }).optional(),
});

// Error handling middleware
class ApiError extends Error {
  statusCode: number;
  code: string;
  
  constructor(message: string, statusCode: number, code: string = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

const handleError = (res: Response, error: unknown, message: string) => {
  console.error(message, error);
  return res.status(500).json({ 
    error: t('error.server_error', 'en'),
    details: error.message 
  });
};

// GET /api/transfer-market - Get all players on the transfer market
// Input validation schema for query parameters
const transferMarketQuerySchema = zod.object({
  position: zod.string().optional(),
  minSkill: zod.string().optional(),
  maxSkill: zod.string().optional(),
  nationality: zod.string().optional(),
  maxAge: zod.string().optional(),
  minValue: zod.string().optional(),
  maxValue: zod.string().optional(),
  page: zod.string().optional().default('1'),
  limit: zod.string().optional().default('25')
});

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Validate query parameters
    const query = transferMarketQuerySchema.parse(req.query);
    
    // Build where clause for filtering
    const whereClause: Prisma.PlayerWhereInput = {
      transferListings: {
        some: {
          status: 'ACTIVE'
        }
      },
      transferStatus: {
        in: ['LISTED', 'AVAILABLE']
      },
      // Only show players who are not currently in a transfer
      transfers: {
        none: {
          status: 'PENDING'
        }
      },
      // Only show players who are not currently on loan
      loans: {
        none: {
          status: 'ACTIVE'
        }
      },
      // Only show players who are not injured or on international duty
      injured: false,
      onInternationalDuty: false
    };
    
    if (position && position !== 'all') {
      whereClause.position = position;
    }
    
    if (minSkill) {
      whereClause.skill = { gte: parseInt(minSkill as string) };
    }
    
    if (maxSkill) {
      whereClause.skill = { ...whereClause.skill, lte: parseInt(maxSkill as string) };
    }
    
    if (nationality && nationality !== 'all') {
      whereClause.nationality = nationality;
    }
    
    // Apply filters (duplicate code removed)
    
    if (maxAge) {
      whereClause.age = { lte: parseInt(maxAge as string) };
    }
    
    // Get pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await prisma.player.count({ where: whereClause });
    
    // Get players with pagination
    const players = await prisma.player.findMany({
      where: whereClause,
      include: {
        club: {
          select: {
            id: true,
            name: true,
            league: {
              select: {
                id: true,
                name: true,
                tier: true
              }
            }
          }
        },
        // Include transfer listing information if available
        transferListings: {
          where: {
            status: 'ACTIVE'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: { 
        skill: 'desc' 
      },
      skip,
      take: limit
    });
    
    // Format response with calculated values and pagination info
    const response = {
      data: players.map(player => {
        // Calculate base value
        const baseValue = player.skill * 10000;
        const ageMultiplier = Math.max(0.5, 1 - (player.age - 18) * 0.05);
        const potentialBonus = (player.potential - player.skill) * 5000;
        const calculatedValue = Math.round(baseValue * ageMultiplier + potentialBonus);
        
        // Get asking price from transfer listing or use calculated value
        const listing = player.transferListings[0];
        const askingPrice = listing?.askingPrice || calculatedValue;
        
        return {
          id: player.id,
          name: player.name,
          position: player.position,
          age: player.age,
          skill: player.skill,
          potential: player.potential,
          wage: player.wage,
          contractExpiry: player.contractExpiry,
          nationality: player.nationality,
          club: {
            id: player.club?.id,
            name: player.club?.name,
            league: player.club?.league
          },
          value: calculatedValue,
          askingPrice: askingPrice,
          transferStatus: player.transferStatus,
          listingId: listing?.id
        };
      }),
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit
      }
    };
    
    res.json(response);
  } catch (error) {
    return handleError(res, error, 'Failed to fetch transfer market:');
  }
});

// GET /api/transfer-market/positions - Get all available positions
router.get('/positions', authenticateToken, async (req, res) => {
  try {
    const positions = await prisma.player.groupBy({
      by: ['position'],
      _count: {
        position: true
      },
      where: {
        transferStatus: {
          in: ['LISTED', 'AVAILABLE']
        }
      },
      orderBy: {
        position: 'asc'
      }
    });
    
    res.json({
      positions: positions.map(p => ({
        position: p.position,
        count: p._count.position
      }))
    });
  } catch (error) {
    return handleError(res, error, 'Failed to fetch positions:');
  }
});

// GET /api/transfer-market/nationalities - Get all available nationalities
router.get('/nationalities', authenticateToken, async (req, res) => {
  try {
    const nationalities = await prisma.player.groupBy({
      by: ['nationality'],
      _count: {
        nationality: true
      },
      where: {
        transferStatus: {
          in: ['LISTED', 'AVAILABLE']
        },
        nationality: {
          not: null
        }
      },
      orderBy: {
        nationality: 'asc'
      }
    });
    
    res.json({
      nationalities: nationalities.map(n => ({
        nationality: n.nationality,
        count: n._count.nationality
      }))
    });
  } catch (error) {
    return handleError(res, error, 'Failed to fetch nationalities:');
  }
});

// POST /api/transfer-market/list - List a player on the transfer market
router.post('/list', authenticateToken, async (req, res) => {
  try {
    const { playerId, askingPrice, deadline } = req.body;
    const userId = (req as any).user.id;
    
    if (!playerId || !askingPrice) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if user has permission to list this player
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        club: {
          include: {
            manager: true
          }
        }
      }
    });
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    if (player.club.managerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to list this player' });
    }
    
    // Create transfer listing
    const listing = await prisma.transferListing.create({
      data: {
        playerId,
        clubId: player.clubId!,
        askingPrice: parseInt(askingPrice as string),
        deadline: deadline ? new Date(deadline as string) : null,
        status: 'ACTIVE'
      }
    });
    
    // Update player's transfer status
    await prisma.player.update({
      where: { id: playerId },
      data: { transferStatus: 'LISTED' }
    });
    
    res.status(201).json(listing);
  } catch (error) {
    return handleError(res, error, 'Failed to list player:');
  }
});

// POST /api/transfer-market/:id/bid - Place a bid on a player
router.post('/:id/bid', authenticateToken, async (req, res) => {
  try {
    const { amount, wageOffer, contractLength } = req.body;
    const playerId = parseInt(req.params.id);
    const userId = (req as any).user.id;
    
    if (!amount || !wageOffer || !contractLength) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get player and check if they're listed
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        club: true,
        transferListings: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    if (!['LISTED', 'AVAILABLE'].includes(player.transferStatus || '')) {
      return res.status(400).json({ error: 'Player is not available for transfer' });
    }
    
    // Get bidding club (current user's club)
    const biddingClub = await prisma.club.findFirst({
      where: { managerId: userId }
    });
    
    if (!biddingClub) {
      return res.status(403).json({ error: 'You must manage a club to place bids' });
    }
    
    // Check if bid meets minimum requirements
    const listing = player.transferListings[0];
    if (listing && amount < listing.askingPrice) {
      return res.status(400).json({ 
        error: `Bid amount must be at least ${listing.askingPrice}` 
      });
    }
    
    // Check if club has enough budget
    if (biddingClub.balance < amount) {
      return res.status(400).json({ 
        error: 'Insufficient funds to place this bid' 
      });
    }
    
    // Create transfer offer
    const transferOffer = await prisma.transferOffer.create({
      data: {
        playerId,
        fromClubId: player.clubId!,
        toClubId: biddingClub.id,
        fee: parseInt(amount as string),
        wage: parseInt(wageOffer as string),
        contractLength: parseInt(contractLength as string),
        status: 'PENDING',
        initiator: 'USER'
      }
    });
    
    // Notify clubs about the offer (in a real app, this would be a WebSocket event)
    // ...
    
    res.status(201).json(transferOffer);
  } catch (error) {
    return handleError(res, error, 'Failed to place bid:');
  }
});

// GET /api/transfer-market/bids - Get user's active bids
router.get('/bids', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    
    // Get user's club
    const club = await prisma.club.findFirst({
      where: { managerId: userId },
      select: { id: true }
    });
    
    if (!club) {
      return res.json({ bids: [] });
    }
    
    // Get active bids
    const bids = await prisma.transferOffer.findMany({
      where: {
        toClubId: club.id,
        status: 'PENDING'
      },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            position: true,
            age: true,
            skill: true
          }
        },
        fromClub: {
          select: {
            id: true,
            name: true
          }
        },
        toClub: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json({ bids });
  } catch (error) {
    return handleError(res, error, 'Failed to fetch bids:');
  }
});

// POST /api/transfer-market/bids/:id/respond - Respond to a bid
router.post('/bids/:id/respond', authenticateToken, async (req, res) => {
  try {
    const { response, message } = req.body;
    const bidId = parseInt(req.params.id);
    const userId = (req as any).user.id;
    
    if (!['ACCEPT', 'REJECT', 'COUNTER'].includes(response)) {
      return res.status(400).json({ error: 'Invalid response type' });
    }
    
    // Get the bid
    const bid = await prisma.transferOffer.findUnique({
      where: { id: bidId },
      include: {
        player: {
          include: {
            club: true
          }
        },
        fromClub: true,
        toClub: true
      }
    });
    
    if (!bid) {
      return res.status(404).json({ error: 'Bid not found' });
    }
    
    // Check if user has permission to respond to this bid
    if (bid.player.club.managerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to respond to this bid' });
    }
    
    // Update bid status based on response
    let updatedBid;
    
    if (response === 'ACCEPT') {
      // Process the transfer
      await prisma.$transaction([
        // Update player's club
        prisma.player.update({
          where: { id: bid.playerId },
          data: { 
            clubId: bid.toClubId,
            transferStatus: 'NOT_FOR_SALE',
            wage: bid.wage,
            contractExpiry: new Date(
              new Date().setFullYear(new Date().getFullYear() + bid.contractLength)
            )
          }
        }),
        
        // Update clubs' balances
        prisma.club.update({
          where: { id: bid.fromClubId },
          data: { 
            balance: { increment: bid.fee }
          }
        }),
        
        prisma.club.update({
          where: { id: bid.toClubId },
          data: { 
            balance: { decrement: bid.fee }
          }
        }),
        
        // Update bid status
        prisma.transferOffer.update({
          where: { id: bidId },
          data: { 
            status: 'ACCEPTED',
            respondedAt: new Date()
          }
        }),
        
        // Close any other pending offers for this player
        prisma.transferOffer.updateMany({
          where: { 
            playerId: bid.playerId,
            status: 'PENDING',
            id: { not: bidId }
          },
          data: { 
            status: 'REJECTED',
            respondedAt: new Date()
          }
        })
      ]);
      
      // In a real app, you would also:
      // 1. Create a news item about the transfer
      // 2. Notify both clubs
      // 3. Update any affected league tables
      
    } else if (response === 'REJECT') {
      updatedBid = await prisma.transferOffer.update({
        where: { id: bidId },
        data: { 
          status: 'REJECTED',
          respondedAt: new Date(),
          responseMessage: message
        }
      });
    } else if (response === 'COUNTER') {
      const { counterFee, counterWage, counterContractLength } = req.body;
      
      if (!counterFee || !counterWage || !counterContractLength) {
        return res.status(400).json({ error: 'Missing counter offer details' });
      }
      
      updatedBid = await prisma.transferOffer.update({
        where: { id: bidId },
        data: { 
          status: 'COUNTERED',
          counterFee: parseInt(counterFee as string),
          counterWage: parseInt(counterWage as string),
          counterContractLength: parseInt(counterContractLength as string),
          respondedAt: new Date(),
          responseMessage: message
        }
      });
    }
    
    res.json({ 
      success: true,
      bid: updatedBid || { id: bidId, status: response }
    });
    
  } catch (error) {
    return handleError(res, error, 'Failed to respond to bid:');
  }
});

// GET /api/transfers
router.get('/transfers', async (req, res) => {
  try {
    const transfers = await prisma.transfer.findMany({
      include: {
        fromClub: {
          select: { name: true }
        },
        toClub: {
          select: { name: true }
        },
        player: {
          select: { name: true }
        }
      },
      orderBy: { date: 'desc' },
      take: 50 // Limit to recent transfers
    });
    
    const formattedTransfers = transfers.map(transfer => ({
      id: transfer.id,
      playerName: transfer.player.name,
      fromClub: transfer.fromClub?.name || 'Free Agent',
      toClub: transfer.toClub?.name || 'Free Agent',
      fee: transfer.fee || 0,
      date: transfer.date,
      status: transfer.status || 'completed'
    }));
    
    res.json({ transfers: formattedTransfers });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_transfers', (req as any).language || 'en') });
  }
});

// GET /api/transfers/:id
router.get('/transfers/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: {
        fromClub: { select: { name: true } },
        toClub: { select: { name: true } },
        player: { select: { name: true } }
      }
    });
    if (!transfer) return res.status(404).json({ error: 'Transfer not found' });
    res.json({
      id: transfer.id,
      playerId: transfer.playerId,
      playerName: transfer.player?.name || null,
      fromClub: transfer.fromClub?.name || 'Free Agent',
      toClub: transfer.toClub?.name || 'Free Agent',
      fee: transfer.fee || 0,
      date: transfer.date,
      status: transfer.status || 'completed'
    });
  } catch (error) {
    res.status(500).json({ error: t('error.failed_to_fetch_transfer', (req as any).language || 'en') });
  }
});

export default router; 