# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Class schedule display tool
- Substitution management system
- Event update capabilities
- Bulk operations support

### Changed
- Improved error messages for better debugging
- Enhanced caching strategy for better performance

## [1.0.0] - 2024-12-19

### Added
- Initial release of Mindbody MCP Server
- `getTeacherSchedule` tool for querying teacher schedules
- OAuth 2.0 authentication with automatic token refresh
- Intelligent caching system (5-min for classes, 60-min for teachers)
- Automatic retry logic with exponential backoff
- Support for both Bun and Node.js runtimes
- Comprehensive TypeScript types for Mindbody API
- Environment-based configuration
- Performance benchmarking tools
- Developer documentation and setup guides

### Security
- Secure credential management via environment variables
- Token caching to minimize authentication requests
- Input validation on all user inputs

### Performance
- 4x faster startup with Bun runtime
- Efficient caching to respect API rate limits
- Optimized API client with connection pooling

[Unreleased]: https://github.com/yourusername/mindbody-mcp/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/yourusername/mindbody-mcp/releases/tag/v1.0.0
