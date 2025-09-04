import { createClient } from 'redis';  // Import redis client
import { NextResponse } from 'next/server';  // For Next.js responses

// Initialize the Redis client
const redis = createClient({
  url: process.env.REDIS_URL  // Get Redis URL from environment variables
});

await redis.connect();  // Connect to Redis

export const POST = async () => {
  try {
    // Fetch a value from Redis using the key "item"
    const result = await redis.get("item");
    
    // Return the result as a JSON response
    return new NextResponse(JSON.stringify({ result }), { status: 200 });
  } catch (error) {
    console.error("Redis error:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to fetch data" }), { status: 500 });
  }
};
