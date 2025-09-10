#!/usr/bin/env bun
/**
 * SSE Client Test Script
 * Tests the Mindbody MCP Server SSE transport
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

// Configuration
const SSE_URL = process.env.SSE_URL || 'http://localhost:3000/sse';
const TEST_TIMEOUT = 30000; // 30 seconds

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

// Test results
interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

const results: TestResult[] = [];

// Helper functions
function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(name: string) {
  log(`\nTesting: ${name}`, colors.blue);
}

function logSuccess(message: string) {
  log(`✓ ${message}`, colors.green);
}

function logError(message: string) {
  log(`✗ ${message}`, colors.red);
}

function logInfo(message: string) {
  log(`ℹ ${message}`, colors.yellow);
}

// Test functions
async function testHealthCheck(): Promise<TestResult> {
  const name = 'Health Check Endpoint';
  logTest(name);
  const start = Date.now();
  
  try {
    const healthUrl = SSE_URL.replace('/sse', '/health');
    const response = await fetch(healthUrl);
    const data = await response.json();
    
    if (response.ok && data.status === 'healthy') {
      logSuccess(`Health check passed: ${JSON.stringify(data)}`);
      return { name, passed: true, duration: Date.now() - start };
    } else {
      throw new Error(`Unexpected health status: ${JSON.stringify(data)}`);
    }
  } catch (error: any) {
    logError(`Health check failed: ${error.message}`);
    return { name, passed: false, error: error.message, duration: Date.now() - start };
  }
}

async function testServerInfo(): Promise<TestResult> {
  const name = 'Server Info Endpoint';
  logTest(name);
  const start = Date.now();
  
  try {
    const infoUrl = SSE_URL.replace('/sse', '/info');
    const response = await fetch(infoUrl);
    const data = await response.json();
    
    if (response.ok && data.transport?.type === 'sse') {
      logSuccess(`Server info retrieved: ${data.name} v${data.version}`);
      logInfo(`Capabilities: ${JSON.stringify(data.capabilities)}`);
      return { name, passed: true, duration: Date.now() - start };
    } else {
      throw new Error(`Invalid server info: ${JSON.stringify(data)}`);
    }
  } catch (error: any) {
    logError(`Server info failed: ${error.message}`);
    return { name, passed: false, error: error.message, duration: Date.now() - start };
  }
}

async function testSSEConnection(): Promise<TestResult> {
  const name = 'SSE Connection';
  logTest(name);
  const start = Date.now();
  
  try {
    // Create SSE transport
    const transport = new SSEClientTransport(new URL(SSE_URL));
    
    // Create MCP client
    const client = new Client(
      {
        name: 'test-sse-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );
    
    // Connect with timeout
    await Promise.race([
      client.connect(transport),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), TEST_TIMEOUT)
      ),
    ]);
    
    logSuccess('Successfully connected to SSE server');
    
    // Clean up
    await client.close();
    
    return { name, passed: true, duration: Date.now() - start };
  } catch (error: any) {
    logError(`SSE connection failed: ${error.message}`);
    return { name, passed: false, error: error.message, duration: Date.now() - start };
  }
}

async function testListTools(): Promise<TestResult> {
  const name = 'List Tools';
  logTest(name);
  const start = Date.now();
  
  try {
    // Create connection
    const transport = new SSEClientTransport(new URL(SSE_URL));
    const client = new Client(
      {
        name: 'test-sse-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );
    
    await client.connect(transport);
    
    // List available tools
    const response = await client.listTools();
    
    if (response.tools && response.tools.length > 0) {
      logSuccess(`Found ${response.tools.length} tools`);
      logInfo(`Sample tools: ${response.tools.slice(0, 5).map(t => t.name).join(', ')}`);
    } else {
      throw new Error('No tools found');
    }
    
    // Clean up
    await client.close();
    
    return { name, passed: true, duration: Date.now() - start };
  } catch (error: any) {
    logError(`List tools failed: ${error.message}`);
    return { name, passed: false, error: error.message, duration: Date.now() - start };
  }
}

async function testCallTool(): Promise<TestResult> {
  const name = 'Call Tool (getSites)';
  logTest(name);
  const start = Date.now();
  
  try {
    // Create connection
    const transport = new SSEClientTransport(new URL(SSE_URL));
    const client = new Client(
      {
        name: 'test-sse-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );
    
    await client.connect(transport);
    
    // Call getSites tool (no parameters required)
    const response = await client.callTool('getSites', {});
    
    if (response.content && response.content.length > 0) {
      const result = JSON.parse(response.content[0].text);
      logSuccess(`Tool call successful: Retrieved site info`);
      if (result.Site) {
        logInfo(`Site ID: ${result.Site.Id}, Name: ${result.Site.Name}`);
      }
    } else {
      throw new Error('Empty response from tool');
    }
    
    // Clean up
    await client.close();
    
    return { name, passed: true, duration: Date.now() - start };
  } catch (error: any) {
    logError(`Tool call failed: ${error.message}`);
    return { name, passed: false, error: error.message, duration: Date.now() - start };
  }
}

async function testConcurrentConnections(): Promise<TestResult> {
  const name = 'Concurrent Connections';
  logTest(name);
  const start = Date.now();
  
  try {
    const NUM_CONNECTIONS = 3;
    const clients: Client[] = [];
    
    // Create multiple concurrent connections
    const connectionPromises = Array.from({ length: NUM_CONNECTIONS }, async (_, i) => {
      const transport = new SSEClientTransport(new URL(SSE_URL));
      const client = new Client(
        {
          name: `test-client-${i}`,
          version: '1.0.0',
        },
        {
          capabilities: {},
        }
      );
      
      await client.connect(transport);
      clients.push(client);
      return client;
    });
    
    await Promise.all(connectionPromises);
    logSuccess(`Successfully created ${NUM_CONNECTIONS} concurrent connections`);
    
    // Test each connection
    const testPromises = clients.map(async (client, i) => {
      const response = await client.listTools();
      logInfo(`Client ${i}: Found ${response.tools?.length || 0} tools`);
      return response;
    });
    
    await Promise.all(testPromises);
    
    // Clean up
    await Promise.all(clients.map(client => client.close()));
    
    return { name, passed: true, duration: Date.now() - start };
  } catch (error: any) {
    logError(`Concurrent connections failed: ${error.message}`);
    return { name, passed: false, error: error.message, duration: Date.now() - start };
  }
}

// Main test runner
async function runTests() {
  log('\n=================================', colors.magenta);
  log('  Mindbody MCP SSE Test Suite', colors.magenta);
  log('=================================', colors.magenta);
  log(`\nTesting SSE endpoint: ${SSE_URL}`, colors.yellow);
  
  // Check if server is running
  try {
    const healthUrl = SSE_URL.replace('/sse', '/health');
    await fetch(healthUrl);
  } catch (error) {
    logError('\nServer is not running! Please start the server with:');
    log('  bun run start:sse', colors.yellow);
    log('  or');
    log('  MCP_TRANSPORT=sse bun run start', colors.yellow);
    process.exit(1);
  }
  
  // Run tests
  const tests = [
    testHealthCheck,
    testServerInfo,
    testSSEConnection,
    testListTools,
    testCallTool,
    testConcurrentConnections,
  ];
  
  for (const test of tests) {
    try {
      const result = await test();
      results.push(result);
    } catch (error: any) {
      results.push({
        name: test.name,
        passed: false,
        error: error.message,
        duration: 0,
      });
    }
  }
  
  // Print summary
  log('\n=================================', colors.magenta);
  log('         Test Summary', colors.magenta);
  log('=================================', colors.magenta);
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  
  results.forEach(result => {
    const status = result.passed ? `${colors.green}✓ PASS` : `${colors.red}✗ FAIL`;
    const duration = `(${result.duration}ms)`;
    log(`${status}${colors.reset} ${result.name} ${colors.yellow}${duration}${colors.reset}`);
    if (result.error) {
      log(`       ${colors.red}Error: ${result.error}${colors.reset}`);
    }
  });
  
  log('\n---------------------------------');
  log(`Total: ${results.length} tests`, colors.blue);
  log(`Passed: ${passed}`, colors.green);
  log(`Failed: ${failed}`, failed > 0 ? colors.red : colors.green);
  log(`Duration: ${totalDuration}ms`, colors.yellow);
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  logError(`\nFatal error: ${error.message}`);
  process.exit(1);
});