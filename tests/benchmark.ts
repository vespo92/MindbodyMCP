// Performance comparison script
console.log('=== MCP Server Performance Test ===\n');

const startTime = process.hrtime.bigint();

// Simulate MCP server startup
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';
import axios from 'axios';

// Time various operations
const markers: Record<string, bigint> = {
  start: startTime,
};

// Load env
dotenv.config();
markers.envLoaded = process.hrtime.bigint();

// Import our modules
const { getTeacherScheduleTool } = await import('../src/tools/teacherSchedule');
markers.toolsLoaded = process.hrtime.bigint();

// Create server instance
const server = new Server(
  { name: 'perf-test', version: '1.0.0' },
  { capabilities: { tools: {} } }
);
markers.serverCreated = process.hrtime.bigint();

// Calculate timings
const timings = {
  'Environment Loading': Number(markers.envLoaded - markers.start) / 1_000_000,
  'Tools Loading': Number(markers.toolsLoaded - markers.envLoaded) / 1_000_000,
  'Server Creation': Number(markers.serverCreated - markers.toolsLoaded) / 1_000_000,
  'Total Startup': Number(markers.serverCreated - markers.start) / 1_000_000,
};

// Display results
const runtime = typeof Bun !== 'undefined' ? 'Bun' : 'Node.js';
console.log(`Runtime: ${runtime} ${process.version}\n`);

console.log('Startup Times (ms):');
Object.entries(timings).forEach(([key, value]) => {
  console.log(`  ${key}: ${value.toFixed(2)}ms`);
});

console.log('\nMemory Usage:');
const mem = process.memoryUsage();
console.log(`  RSS: ${(mem.rss / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Heap Used: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`);

// Test actual API call (if env is configured)
if (process.env.MINDBODY_API_KEY) {
  console.log('\nTesting API call...');
  const apiStart = process.hrtime.bigint();
  
  try {
    await getTeacherScheduleTool('Alexia Bauer');
    const apiTime = Number(process.hrtime.bigint() - apiStart) / 1_000_000;
    console.log(`  First API Call: ${apiTime.toFixed(2)}ms`);
  } catch (error: any) {
    console.log(`  API Error: ${error.message}`);
  }
}

console.log('\n✨ Test complete!');
process.exit(0);
