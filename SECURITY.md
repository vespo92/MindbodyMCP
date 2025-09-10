# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within Mindbody MCP, please send an email to vinnie@vespo92.com. All security vulnerabilities will be promptly addressed.

Please do not report security vulnerabilities through public GitHub issues.

### What to Include

Please include the following information in your report:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 5 business days
- **Resolution Timeline**: Varies based on severity
  - Critical: Within 7 days
  - High: Within 14 days
  - Medium: Within 30 days
  - Low: Within 60 days

## Security Best Practices

When using Mindbody MCP:

1. **Never commit credentials**: Always use environment variables for API keys and passwords
2. **Use HTTPS in production**: When deploying with SSE, always use SSL/TLS certificates
3. **Restrict CORS origins**: In production, set specific allowed origins instead of wildcards
4. **Keep dependencies updated**: Regularly update the MCP SDK and other dependencies
5. **Monitor for vulnerabilities**: Use `npm audit` or `bun audit` regularly
6. **Rotate credentials**: Regularly rotate your Mindbody API credentials
7. **Limit permissions**: Use the principle of least privilege for API access

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine the affected versions
2. Audit code to find any similar problems
3. Prepare fixes for all supported versions
4. Release new security fix versions

## Comments on this Policy

If you have suggestions on how this process could be improved, please submit a pull request.