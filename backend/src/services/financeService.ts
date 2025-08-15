import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getTransactionsForClub(clubId: number) {
  // Return the last 12 weeks of ClubFinances for the club
  const finances = await prisma.clubFinances.findMany({
    where: { clubId },
    orderBy: { week: 'desc' },
    take: 12,
    select: {
      id: true,
      season: true,
      week: true,
      balance: true,
      gateReceiptsTotal: true,
      sponsorshipTotal: true,
      tvRightsTotal: true,
      prizeMoneyTotal: true,
      transferIncome: true,
      playerWagesTotal: true,
      staffWagesTotal: true,
      transferExpenses: true,
      facilityCosts: true,
      maintenanceCosts: true,
      debtTotal: true,
      equityValue: true,
      marketValue: true,
    },
  });
  return finances;
}

export async function requestLoan(clubId: number, amount: number, bankId: number, type: string) {
  // Create a new CreditFacility for the club
  const now = new Date();
  const endDate = new Date(now);
  endDate.setFullYear(now.getFullYear() + 1); // 1 year loan by default
  const interestRate = 0.05; // 5% default
  const facility = await prisma.creditFacility.create({
    data: {
      clubId,
      bankId,
      type,
      amount,
      usedAmount: amount,
      interestRate,
      startDate: now,
      endDate,
      status: 'active',
    },
  });
  // Add funds to club finances (latest week)
  const finances = await prisma.clubFinances.findFirst({ where: { clubId }, orderBy: { week: 'desc' } });
  if (finances) {
    await prisma.clubFinances.update({ where: { id: finances.id }, data: { balance: { increment: amount }, debtTotal: { increment: amount } } });
  }
  return facility;
}

export async function acceptInvestment(clubId: number, investorId: number, offerId: number) {
  // Mark the offer as accepted
  const offer = await prisma.investorOffer.update({
    where: { id: offerId },
    data: { status: 'accepted', boardApproval: true, shareholderApproval: true, regulatoryApproval: true },
  });
  // Add funds to club finances
  const finances = await prisma.clubFinances.findFirst({ where: { clubId }, orderBy: { week: 'desc' } });
  if (finances) {
    await prisma.clubFinances.update({ where: { id: finances.id }, data: { balance: { increment: offer.totalValue }, equityValue: { increment: offer.totalValue } } });
  }
  return offer;
}

export async function negotiateSponsorship(clubId: number, sponsorName: string, type: string, value: number, duration: number) {
  // Create a new Sponsorship
  const now = new Date();
  const endDate = new Date(now);
  endDate.setFullYear(now.getFullYear() + duration);
  const sponsorship = await prisma.sponsorship.create({
    data: {
      clubId,
      sponsorName,
      type,
      value,
      startDate: now,
      endDate,
      isActive: true,
    },
  });
  // Add value to club finances (latest week)
  const finances = await prisma.clubFinances.findFirst({ where: { clubId }, orderBy: { week: 'desc' } });
  if (finances) {
    await prisma.clubFinances.update({ where: { id: finances.id }, data: { balance: { increment: value }, sponsorshipTotal: { increment: value } } });
  }
  return sponsorship;
}

export async function updateClubFinances(id: number, data: any) {
  // Only allow updating certain fields for safety
  const allowedFields = [
    'balance', 'season', 'week', 'gateReceiptsTotal', 'sponsorshipTotal', 'tvRightsTotal', 'prizeMoneyTotal',
    'transferIncome', 'playerWagesTotal', 'staffWagesTotal', 'transferExpenses', 'facilityCosts', 'maintenanceCosts',
    'transferBudget', 'wageBudget', 'debtTotal', 'equityValue', 'marketValue'
  ];
  const updateData: any = {};
  for (const key of allowedFields) {
    if (data[key] !== undefined) updateData[key] = data[key];
  }
  return prisma.clubFinances.update({ where: { id }, data: updateData });
}

export async function deleteClubFinances(id: number) {
  await prisma.clubFinances.delete({ where: { id } });
}

export async function updateSponsorship(id: number, data: any) {
  // Only allow updating certain fields
  const allowedFields = ['sponsorName', 'type', 'value', 'startDate', 'endDate', 'isActive'];
  const updateData: any = {};
  for (const key of allowedFields) {
    if (data[key] !== undefined) updateData[key] = data[key];
  }
  return prisma.sponsorship.update({ where: { id }, data: updateData });
}

export async function deleteSponsorship(id: number) {
  await prisma.sponsorship.delete({ where: { id } });
} 