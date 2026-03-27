import { PrismaClient } from '@prisma/client';
import {
  compressSaveSnapshotPayload,
  decodeSaveSnapshotPayload,
  MAX_MANUAL_SAVE_SLOTS_PER_CAREER
} from '../src/v2/services/saveSlotCodec';

const prisma = new PrismaClient();

async function main() {
  const slotRefs = await prisma.v2SaveSlot.findMany({
    select: {
      id: true,
      careerId: true,
      isAuto: true
    },
    orderBy: [{ careerId: 'asc' }, { isAuto: 'asc' }, { updatedAt: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }]
  });

  let rewrittenCount = 0;
  let prunedCount = 0;
  let bytesBefore = 0;
  let bytesAfter = 0;

  for (const slotRef of slotRefs) {
    const slot = await prisma.v2SaveSlot.findUnique({
      where: { id: slotRef.id },
      select: { snapshot: true }
    });
    if (!slot) {
      continue;
    }

    const currentPayload = String(slot.snapshot);
    const normalizedPayload = decodeSaveSnapshotPayload(currentPayload);
    const compactedPayload = compressSaveSnapshotPayload(normalizedPayload);

    bytesBefore += Buffer.byteLength(currentPayload, 'utf8');
    bytesAfter += Buffer.byteLength(compactedPayload, 'utf8');

    if (compactedPayload === currentPayload) {
      continue;
    }

    await prisma.v2SaveSlot.update({
      where: { id: slotRef.id },
      data: {
        snapshot: compactedPayload
      }
    });
    rewrittenCount += 1;
  }

  const careersWithManualSaves = await prisma.v2SaveSlot.findMany({
    where: { isAuto: false },
    select: { careerId: true },
    distinct: ['careerId']
  });

  for (const { careerId } of careersWithManualSaves) {
    const removableSlots = await prisma.v2SaveSlot.findMany({
      where: {
        careerId,
        isAuto: false
      },
      select: {
        id: true
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
      skip: MAX_MANUAL_SAVE_SLOTS_PER_CAREER
    });

    if (removableSlots.length === 0) {
      continue;
    }

    const { count } = await prisma.v2SaveSlot.deleteMany({
      where: {
        id: {
          in: removableSlots.map((slot) => slot.id)
        }
      }
    });
    prunedCount += count;
  }

  await prisma.$executeRawUnsafe('VACUUM');

  // eslint-disable-next-line no-console
  console.log(JSON.stringify({
    totalSlots: slotRefs.length,
    rewrittenCount,
    prunedCount,
    bytesBefore,
    bytesAfter,
    bytesSaved: bytesBefore - bytesAfter
  }, null, 2));
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
