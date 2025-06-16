// Quick test to verify MCP SDK works with Bun
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

console.log('✅ MCP SDK imports working with Bun');
console.log('✅ Server class:', typeof Server);
console.log('✅ Transport class:', typeof StdioServerTransport);

// Test our other imports
import { config } from 'dotenv';
import axios from 'axios';

config();

console.log('✅ Dotenv working');
console.log('✅ Axios working');

// Test async/await
async function testAsync() {
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  await delay(100);
  console.log('✅ Async/await working');
}

testAsync().then(() => {
  console.log('\n🎉 All systems go! Bun is ready for MCP development.');
});
