#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import tools
import { getTeacherScheduleTool } from './tools/teacherSchedule';

// Validate required environment variables
const requiredEnvVars = [
  'MINDBODY_API_KEY',
  'MINDBODY_SITE_ID',
  'MINDBODY_SOURCE_NAME',
  'MINDBODY_SOURCE_PASSWORD'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    console.error('Please copy .env.example to .env and fill in your credentials');
    process.exit(1);
  }
}

// Create MCP server
const server = new Server(
  {
    name: process.env.MCP_SERVER_NAME || 'mindbody-mcp',
    version: process.env.MCP_SERVER_VERSION || '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'getTeacherSchedule',
        description: 'Get a teacher\'s class schedule for a specified date range',
        inputSchema: {
          type: 'object',
          properties: {
            teacherName: {
              type: 'string',
              description: 'The name of the teacher (e.g., "Alexia Bauer")',
            },
            startDate: {
              type: 'string',
              description: 'Start date in YYYY-MM-DD format (defaults to today)',
            },
            endDate: {
              type: 'string',
              description: 'End date in YYYY-MM-DD format (defaults to 7 days from start)',
            },
          },
          required: ['teacherName'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'getTeacherSchedule': {
        const result = await getTeacherScheduleTool(
          args.teacherName as string,
          args.startDate as string | undefined,
          args.endDate as string | undefined
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Mindbody MCP Server started');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
