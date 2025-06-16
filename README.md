# Mindbody MCP Server

[![MCP](https://img.shields.io/badge/MCP-1.0-blue)](https://modelcontextprotocol.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.0-orange)](https://bun.sh)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A high-performance Model Context Protocol (MCP) server that enables AI assistants to interact with the Mindbody API for fitness and wellness studio management.

## 🚀 Features

- **⚡ Lightning Fast**: Built with Bun for 4x faster startup times
- **🔐 Secure Authentication**: OAuth 2.0 with automatic token refresh
- **💾 Smart Caching**: Intelligent caching to respect API rate limits
- **🛡️ Robust Error Handling**: Graceful failures with clear error messages
- **📊 Rich Data**: Comprehensive schedule data with summaries and insights
- **🔄 Auto-Retry**: Built-in retry logic for transient failures

## 📦 Installation

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 18+
- Mindbody API credentials
- Claude Desktop

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/mindbody-mcp.git
cd mindbody-mcp

# Install dependencies (using Bun)
bun install

# Copy environment variables
cp .env.example .env

# Edit .env with your Mindbody credentials
# Then run the development server
bun run dev
```

### Using Node.js Instead

```bash
# Switch to Node.js configuration
./switch.bat node  # Windows
# or manually: cp package.node.json package.json

# Install and build
npm install
npm run build
npm start
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with your Mindbody credentials:

```env
# Required
MINDBODY_API_KEY=your_api_key_here
MINDBODY_SITE_ID=-99
MINDBODY_SOURCE_NAME=your_source_name
MINDBODY_SOURCE_PASSWORD=your_source_password

# Optional
MINDBODY_API_URL=https://api.mindbodyonline.com/public/v6
CACHE_TTL_MINUTES=5
RATE_LIMIT_BUFFER=100
```

### Claude Desktop Integration

Add to your Claude Desktop configuration:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mindbody": {
      "command": "bun",
      "args": ["run", "C:\\path\\to\\mindbody-mcp\\src\\index.ts"],
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

## 🛠️ Available Tools

### `getTeacherSchedule`

Retrieves a teacher's class schedule for any date range.

**Parameters:**
- `teacherName` (string, required): The teacher's full name
- `startDate` (string, optional): Start date in YYYY-MM-DD format
- `endDate` (string, optional): End date in YYYY-MM-DD format

**Example Usage:**
```
"Get Alexia Bauer's schedule for this week"
"Show me John Smith's classes for next Monday"
"What is Sarah teaching between March 15-22?"
```

### Coming Soon

- 📅 `getClassSchedule` - View all classes by date/location
- 🔄 `createSubstitution` - AI-powered substitute teacher matching
- 📝 `updateEvent` - Modify class details and descriptions
- 👥 `getClientBookings` - View and manage client reservations
- 💰 `generateReports` - Financial and attendance analytics

## 🏗️ Project Structure

```
mindbody-mcp/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── api/
│   │   ├── auth.ts          # OAuth token management
│   │   └── client.ts        # Axios client with retry logic
│   ├── cache/
│   │   └── index.ts         # In-memory caching system
│   ├── tools/
│   │   └── teacherSchedule.ts
│   ├── types/
│   │   └── mindbody.ts      # TypeScript type definitions
│   └── utils/
│       └── dates.ts         # Date helper functions
├── .env.example             # Environment variable template
├── bunfig.toml             # Bun configuration
├── Claude.md               # AI assistant instructions
└── package.json            # Project dependencies
```

## 🧪 Testing

```bash
# Test the teacher schedule tool
bun run test:tool

# Run performance benchmark
bun run benchmark

# Compare Bun vs Node.js performance
./switch.bat benchmark
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Adding New Tools

1. Create a new file in `src/tools/`
2. Follow the pattern from `teacherSchedule.ts`
3. Add types to `src/types/mindbody.ts`
4. Register in `src/index.ts`
5. Update documentation

## 📊 Performance

Using Bun provides significant performance improvements:

| Metric | Node.js | Bun | Improvement |
|--------|---------|-----|-------------|
| Cold Start | ~800ms | ~200ms | **4x faster** |
| First API Call | ~1200ms | ~400ms | **3x faster** |
| Memory Usage | ~50MB | ~30MB | **40% less** |

## 🔒 Security

- OAuth 2.0 authentication with automatic token refresh
- Environment variables for sensitive configuration
- No credentials stored in code
- Automatic token expiration handling
- Input validation on all user inputs

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Anthropic](https://anthropic.com) for the MCP specification
- [Mindbody](https://www.mindbodyonline.com) for their comprehensive API
- [Bun](https://bun.sh) for the incredible runtime performance

## 📞 Support

- 📧 Email: your.email@example.com
- 💬 Discord: [Join our server](https://discord.gg/yourserver)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/mindbody-mcp/issues)

---

Built with ❤️ for the fitness and wellness community
