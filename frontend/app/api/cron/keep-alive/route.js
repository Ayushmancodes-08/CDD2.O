import { MongoClient } from 'mongodb'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

let client
let db

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME)
  }
  return db
}

export async function GET(request) {
  // Security Check: Verify CRON_SECRET
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const database = await connectToMongo()
    
    // Ping the database
    await database.command({ ping: 1 })

    return NextResponse.json({
      success: true,
      message: 'MongoDB Atlas cluster pinged successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Cron Keep-Alive Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to ping MongoDB Atlas'
    }, { status: 500 })
  }
}
