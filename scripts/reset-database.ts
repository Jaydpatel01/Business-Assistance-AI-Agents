import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetDatabase() {
  console.log('🗑️  Starting database reset...')
  
  try {
    // Delete in correct order to respect foreign key constraints
    console.log('Deleting Messages...')
    await prisma.message.deleteMany({})
    
    console.log('Deleting Decisions...')
    await prisma.decision.deleteMany({})
    
    console.log('Deleting Documents...')
    await prisma.document.deleteMany({})
    
    console.log('Deleting Participants...')
    await prisma.participant.deleteMany({})
    
    console.log('Deleting Boardroom Sessions...')
    await prisma.boardroomSession.deleteMany({})
    
    console.log('Deleting Scenarios...')
    await prisma.scenario.deleteMany({})
    
    console.log('Deleting Vector Embeddings...')
    await prisma.vectorEmbedding.deleteMany({})
    
    console.log('Deleting Sessions...')
    await prisma.session.deleteMany({})
    
    console.log('Deleting Accounts...')
    await prisma.account.deleteMany({})
    
    console.log('Deleting Verification Tokens...')
    await prisma.verificationToken.deleteMany({})
    
    console.log('Deleting Users...')
    await prisma.user.deleteMany({})
    
    console.log('✅ Database reset complete! All user data has been cleared.')
    console.log('You can now test from a fresh state.')
  } catch (error) {
    console.error('❌ Error resetting database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

resetDatabase()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
