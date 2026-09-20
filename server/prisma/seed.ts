import { PrismaClient, UserRole, DocumentStatus, DocumentType, MessageRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Knovexa database...');

  // 1. Seed Admin
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@knovexa.com' },
    update: {},
    create: {
      email: 'admin@knovexa.com',
      name: 'System Admin',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
    },
  });

  // 2. Seed Standard User
  const userPasswordHash = await bcrypt.hash('UserPassword123!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'anant@knovexa.com' },
    update: {},
    create: {
      email: 'anant@knovexa.com',
      name: 'Anant Raj',
      passwordHash: userPasswordHash,
      role: UserRole.USER,
    },
  });

  // 3. Seed Collections
  const col1 = await prisma.collection.upsert({
    where: {
      userId_name: {
        userId: user.id,
        name: 'Research Papers',
      },
    },
    update: {},
    create: {
      userId: user.id,
      name: 'Research Papers',
    },
  });

  const col2 = await prisma.collection.upsert({
    where: {
      userId_name: {
        userId: user.id,
        name: 'Engineering Specs',
      },
    },
    update: {},
    create: {
      userId: user.id,
      name: 'Engineering Specs',
    },
  });

  // 4. Seed Example Document (Metadata only, public mock)
  const doc = await prisma.document.create({
    data: {
      userId: user.id,
      name: 'Knovexa Architecture Overview',
      originalName: 'knovexa-architecture.pdf',
      type: DocumentType.PDF,
      mimeType: 'application/pdf',
      sizeBytes: BigInt(245760),
      storagePath: 'storage/uploads/mock-knovexa-architecture.pdf',
      status: DocumentStatus.READY,
      pageCount: 3,
    },
  });

  // Link document to collection
  await prisma.collectionDocument.upsert({
    where: {
      collectionId_documentId: {
        collectionId: col2.id,
        documentId: doc.id,
      },
    },
    update: {},
    create: {
      collectionId: col2.id,
      documentId: doc.id,
    },
  });

  // 5. Seed Example Conversation & Messages
  const conversation = await prisma.conversation.create({
    data: {
      userId: user.id,
      documentId: doc.id,
      title: 'Knovexa Deployment Inquiries',
      messages: {
        create: [
          {
            role: MessageRole.USER,
            content: 'What is the recommended local port for the Express API?',
          },
          {
            role: MessageRole.ASSISTANT,
            content: 'According to the architecture specification, the Express API runs on port 4000 for local development.',
          },
        ],
      },
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
