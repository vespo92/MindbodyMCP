# Quick Setup Guide

## 1. Install Dependencies

```bash
cd C:\Users\VinSpo\Desktop\MindbodyMCP
npm install
```

## 2. Configure Environment

Create a `.env` file in the project root:

```bash
copy .env.example .env
```

Then edit `.env` with your Mindbody credentials.

## 3. Test the Connection

Run the test script to verify everything works:

```bash
npm run test:tool
```

This will attempt to fetch Alexia Bauer's schedule. If successful, you'll see her classes listed.

## 4. Build the Project

```bash
npm run build
```

## 5. Configure Claude Desktop

Edit `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mindbody": {
      "command": "node",
      "args": ["C:\\Users\\VinSpo\\Desktop\\MindbodyMCP\\dist\\index.js"],
      "env": {
        "MINDBODY_API_KEY": "your_api_key",
        "MINDBODY_SITE_ID": "-99",
        "MINDBODY_SOURCE_NAME": "your_source_name",
        "MINDBODY_SOURCE_PASSWORD": "your_source_password"
      }
    }
  }
}
```

## 6. Restart Claude Desktop

After saving the config, restart Claude Desktop to load the MCP server.

## 7. Test in Claude

Try asking:
- "Using the mindbody tool, show me Alexia Bauer's schedule for this week"
- "What classes is Alexia teaching tomorrow?"
- "Get the schedule for [teacher name] from [date] to [date]"

## Troubleshooting

If the test script fails:
1. Check your `.env` file has all 4 required variables
2. Verify your API credentials are correct
3. Ensure the teacher name exists in your Mindbody site
4. Check the console for specific error messages

If Claude can't find the tool:
1. Make sure you built the project (`npm run build`)
2. Verify the path in claude_desktop_config.json is correct
3. Check Claude's MCP logs for errors
4. Restart Claude Desktop completely
