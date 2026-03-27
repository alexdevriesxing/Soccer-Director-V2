import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getTransactionsForClub(clubId: number) {
  const finances = await prisma.clubFinances.findUnique({
    where: { clubId }
  });
  return finances ? [finances] : [];
}

export async function requestLoan(clubId: number, amount: number, _bankId: number, type: string) {
  // Stubbed - CreditFacility model doesn't exist
  const finances = await prisma.clubFinances.findUnique({ where: { clubId } });
  if (finances) {
    // Add to transfer budget instead of balance
    await prisma.clubFinances.update({
      where: { clubId },
      data: { transferBudget: { increment: amount } }
    });
  }
  return { success: true, message: `Loan of ${amount} approved (stub)`, type, amount };
}

export async function acceptInvestment(clubId: number, _investorId: number, _offerId: number) {
  // Stubbed - InvestorOffer model doesn't exist
  const investmentAmount = 1000000;
  const finances = await prisma.clubFinances.findUnique({ where: { clubId } });

  if (finances) {
    await prisma.clubFinances.update({
      where: { clubId },
      data: { transferBudget: { increment: investmentAmount } }
    });
  }
  return { success: true, message: 'Investment accepted (stub)', amount: investmentAmount };
}

export async function negotiateSponsorship(clubId: number, sponsorName: string, _type: string, value: number, duration: number) {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setFullYear(now.getFullYear() + duration);

  const sponsorship = await prisma.sponsorship.create({
    data: {
      clubId,
      name: sponsorName,
      value: value,
      duration: 3 // years
    }
  });

  return sponsorship;
}

export async function updateClubFinances(clubId: number, data: any) {
  const allowedFields = [
    'transferBudget', 'wageBudget', 'matchdayIncome', 'seasonTicketIncome',
    'sponsorship', 'tvRevenue', 'merchandising', 'wagesCurrent', 'transferSpend'
  ];
  const updateData: any = {};
  for (const key of allowedFields) {
    if (data[key] !== undefined) updateData[key] = data[key];
  }
  return prisma.clubFinances.update({ where: { clubId }, data: updateData });
}

export async function deleteClubFinances(clubId: number) {
  await prisma.clubFinances.delete({ where: { clubId } });
}

export async function updateSponsorship(id: number, data: any) {
  const allowedFields = ['name', 'annualValue', 'startDate', 'endDate'];
  const updateData: any = {};
  for (const key of allowedFields) {
    if (data[key] !== undefined) updateData[key] = data[key];
  }
  return prisma.sponsorship.update({ where: { id }, data: updateData });
}

export async function deleteSponsorship(id: number) {
  await prisma.sponsorship.delete({ where: { id } });
}

export async function getClubFinances(clubId: number) {
  return prisma.clubFinances.findUnique({ where: { clubId } });
}

export async function getClubSponsorships(clubId: number) {
  return prisma.sponsorship.findMany({ where: { clubId } });
}