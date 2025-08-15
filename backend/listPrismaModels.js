const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('Prisma model accessors:');
console.log(Object.keys(prisma)); 