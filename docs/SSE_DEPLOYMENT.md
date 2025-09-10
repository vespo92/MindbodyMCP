# SSE (Server-Sent Events) Deployment Guide

This guide covers deploying the Mindbody MCP Server with SSE transport for production environments.

## Overview

The Mindbody MCP Server supports two transport mechanisms:
- **STDIO** (default): For local development and CLI integration
- **SSE**: For production deployment and web-based clients

## Quick Start

### Local Development with SSE

```bash
# Using Bun (recommended)
bun run start:sse

# Using Node.js
npm run node:start:sse

# With custom port
bun run src/index.ts --transport sse --port 8080

# Using environment variables
MCP_TRANSPORT=sse MCP_PORT=3000 bun run start
```

### Docker Deployment

```bash
# Build the image
docker build -t mindbody-mcp:latest .

# Run with SSE transport
docker run -d \
  --name mindbody-mcp-sse \
  -p 3000:3000 \
  -e MCP_TRANSPORT=sse \
  -e MINDBODY_API_KEY=your_key \
  -e MINDBODY_SITE_ID=your_site_id \
  -e MINDBODY_SOURCE_NAME=your_source \
  -e MINDBODY_SOURCE_PASSWORD=your_password \
  mindbody-mcp:latest

# Using docker-compose
docker-compose up -d
```

## Configuration Options

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MCP_TRANSPORT` | Transport type (`stdio` or `sse`) | `stdio` | No |
| `MCP_PORT` | SSE server port | `3000` | No |
| `MCP_HOST` | SSE server host | `0.0.0.0` | No |
| `MCP_CORS_ORIGIN` | CORS allowed origins | `*` | No |
| `MCP_SSL_CERT` | Path to SSL certificate | - | No |
| `MCP_SSL_KEY` | Path to SSL private key | - | No |

### Command-Line Arguments

```bash
# Basic SSE server
bun run src/index.ts --transport sse

# With custom port and host
bun run src/index.ts --transport sse --port 8080 --host 127.0.0.1

# With SSL/TLS
bun run src/index.ts \
  --transport sse \
  --ssl-cert /path/to/cert.pem \
  --ssl-key /path/to/key.pem
```

## Production Deployment

### 1. Systemd Service (Linux)

```bash
# Copy service file
sudo cp deploy/mindbody-mcp-sse.service /etc/systemd/system/

# Create service user
sudo useradd -r -s /bin/false mcp-service

# Install application
sudo mkdir -p /opt/mindbody-mcp
sudo cp -r dist package.json node_modules /opt/mindbody-mcp/
sudo chown -R mcp-service:mcp-service /opt/mindbody-mcp

# Configure environment
sudo cp .env /opt/mindbody-mcp/.env
sudo chmod 600 /opt/mindbody-mcp/.env

# Start service
sudo systemctl daemon-reload
sudo systemctl enable mindbody-mcp-sse
sudo systemctl start mindbody-mcp-sse

# Check status
sudo systemctl status mindbody-mcp-sse
sudo journalctl -u mindbody-mcp-sse -f
```

### 2. Nginx Reverse Proxy

```bash
# Copy nginx configuration
sudo cp deploy/nginx.conf /etc/nginx/sites-available/mindbody-mcp
sudo ln -s /etc/nginx/sites-available/mindbody-mcp /etc/nginx/sites-enabled/

# Update server_name and SSL paths in the config
sudo nano /etc/nginx/sites-available/mindbody-mcp

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 3. Kubernetes Deployment

```bash
# Create namespace and deploy
kubectl apply -f deploy/k8s-deployment.yaml

# Update secrets with your credentials
kubectl edit secret mindbody-mcp-secrets -n mindbody-mcp

# Check deployment
kubectl get pods -n mindbody-mcp
kubectl get svc -n mindbody-mcp
kubectl get ingress -n mindbody-mcp

# View logs
kubectl logs -f deployment/mindbody-mcp-sse -n mindbody-mcp
```

### 4. Docker Compose

```bash
# Create .env file with your credentials
cp .env.example .env
nano .env

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Scale horizontally
docker-compose up -d --scale mindbody-mcp-sse=3
```

## SSE Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/sse` | GET/POST | SSE event stream for MCP communication |
| `/health` | GET | Health check endpoint |
| `/info` | GET | Server information and capabilities |
| `/metrics` | GET | Prometheus metrics (optional) |

## Client Connection

### JavaScript/TypeScript Client

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

// Create SSE transport
const transport = new SSEClientTransport(
  new URL('https://mcp.yourdomain.com/sse')
);

// Create MCP client
const client = new Client({
  name: 'my-client',
  version: '1.0.0',
}, {
  capabilities: {}
});

// Connect to server
await client.connect(transport);

// Use the client
const result = await client.callTool(
  'getClasses',
  { startDate: '2024-01-01', endDate: '2024-01-07' }
);
```

### Testing SSE Connection

```bash
# Health check
curl https://mcp.yourdomain.com/health

# Server info
curl https://mcp.yourdomain.com/info

# Test SSE stream (will keep connection open)
curl -N -H "Accept: text/event-stream" https://mcp.yourdomain.com/sse
```

## Security Considerations

### SSL/TLS Configuration

1. **Generate SSL certificates**:
```bash
# Self-signed (development)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Let's Encrypt (production)
certbot certonly --standalone -d mcp.yourdomain.com
```

2. **Configure server**:
```bash
MCP_SSL_CERT=/path/to/cert.pem
MCP_SSL_KEY=/path/to/key.pem
```

### CORS Configuration

```bash
# Development (allow all origins)
MCP_CORS_ORIGIN=*

# Production (restrict to specific domains)
MCP_CORS_ORIGIN=https://app.yourdomain.com,https://admin.yourdomain.com
```

### Network Security

1. **Firewall rules**:
```bash
# Allow only HTTPS traffic
sudo ufw allow 443/tcp
sudo ufw deny 3000/tcp  # Block direct access to SSE port
```

2. **Rate limiting** (configured in nginx.conf):
- 10 requests per second per IP
- Maximum 10 concurrent connections per IP

## Monitoring

### Health Checks

```bash
# Simple health check
while true; do
  curl -s https://mcp.yourdomain.com/health | jq .
  sleep 30
done
```

### Logging

```bash
# View systemd logs
journalctl -u mindbody-mcp-sse -f

# View Docker logs
docker logs -f mindbody-mcp-sse

# View Kubernetes logs
kubectl logs -f deployment/mindbody-mcp-sse -n mindbody-mcp
```

### Metrics

The server exposes Prometheus-compatible metrics at `/metrics` endpoint (when enabled).

## Troubleshooting

### Common Issues

1. **Connection refused**:
   - Check if server is running: `systemctl status mindbody-mcp-sse`
   - Verify port is not blocked: `sudo netstat -tlnp | grep 3000`
   - Check firewall rules: `sudo ufw status`

2. **CORS errors**:
   - Update `MCP_CORS_ORIGIN` to include client domain
   - Ensure nginx is properly forwarding headers

3. **SSL certificate errors**:
   - Verify certificate paths are correct
   - Check certificate validity: `openssl x509 -in cert.pem -text -noout`
   - Ensure certificate matches domain name

4. **SSE connection drops**:
   - Check nginx timeout settings
   - Verify keep-alive is properly configured
   - Monitor server resources (CPU, memory)

### Debug Mode

```bash
# Enable verbose logging
NODE_ENV=development MCP_LOG_LEVEL=debug bun run start:sse
```

## Performance Tuning

### Server Configuration

```bash
# Increase file descriptor limits
ulimit -n 65536

# Optimize TCP settings (Linux)
sudo sysctl -w net.core.somaxconn=1024
sudo sysctl -w net.ipv4.tcp_tw_reuse=1
```

### Horizontal Scaling

```yaml
# Kubernetes HPA will auto-scale based on CPU/memory
kubectl autoscale deployment mindbody-mcp-sse \
  --min=2 --max=10 --cpu-percent=70
```

### Load Balancing

The nginx configuration includes upstream load balancing with health checks and automatic failover.

## Backup and Recovery

### Configuration Backup

```bash
# Backup configuration
tar -czf mcp-config-backup.tar.gz \
  .env \
  deploy/ \
  docker-compose.yml

# Backup Kubernetes configs
kubectl get all -n mindbody-mcp -o yaml > k8s-backup.yaml
```

### Disaster Recovery

1. Keep configuration in version control
2. Use Kubernetes ConfigMaps/Secrets for configuration
3. Implement automated backups of environment files
4. Document all customizations and deployments

## Support

For issues or questions:
1. Check server logs for error messages
2. Verify all environment variables are set correctly
3. Test with `curl` to isolate client vs server issues
4. Review the [main documentation](../README.md)
5. Open an issue on GitHub with debug logs