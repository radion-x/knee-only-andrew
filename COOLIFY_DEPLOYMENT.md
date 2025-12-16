# Knee IQ Coolify Deployment Guide

## Architecture

### Local Development
- **Frontend**: `http://localhost:5173` (Vite dev server with proxy)
- **Backend**: `http://localhost:3000` (Express server)
- Uses Vite proxy to forward `/api` requests to backend

### Production (Coolify)
- **Frontend**: `https://kneeiq.com.au` (Static React app served by nginx)
- **Backend**: `https://api.kneeiq.com.au` (Express API server)
- **Direct API calls** from frontend to backend via CORS
- **Traefik** handles SSL and routing based on domains

## Coolify Configuration

### 1. Create New Project in Coolify
1. Go to Coolify dashboard
2. Create a new project named "Knee IQ"
3. Connect your Git repository: `radion-x/knee-only-andrew`

### 2. Configure Services

#### Frontend Service (client)
**Service Name**: `knee-client`

**Build Configuration**:
- Build Pack: Docker Compose
- Docker Compose File: `docker-compose.yaml`
- Service: `client`

**Environment Variables**:
```
VITE_SERVER_BASE_URL=https://api.kneeiq.com.au
```

**Domain Configuration**:
- Primary Domain: `kneeiq.com.au`
- Additional Domains (optional): `www.kneeiq.com.au`
- Enable HTTPS: ✓
- Auto SSL (Let's Encrypt): ✓

#### Backend Service (server)
**Service Name**: `knee-server`

**Build Configuration**:
- Build Pack: Docker Compose
- Docker Compose File: `docker-compose.yaml`
- Service: `server`

**Environment Variables**:
```
SERVER_PORT=3000
SERVER_BASE_URL=https://api.kneeiq.com.au
NODE_ENV=production

MONGODB_URI=mongodb://your-mongodb-host:27017/andrew_knee

CLAUDE_API_KEY=your-claude-api-key-here

MAILGUN_API_KEY=your-mailgun-api-key-here
MAILGUN_DOMAIN=mg.websited.org
EMAIL_SENDER_ADDRESS=pain-map@mg.websited.org
EMAIL_RECIPIENT_ADDRESS=recipient@example.com
BCC_EMAIL_RECIPIENT_ADDRESS=bcc@example.com

DASHBOARD_PASSWORD=your-secure-password-here
SESSION_SECRET=your-secure-session-secret-here

ALLOWED_ORIGINS=https://kneeiq.com.au,https://www.kneeiq.com.au
COOKIE_DOMAIN=.kneeiq.com.au
TRUST_PROXY=true
```

**Domain Configuration**:
- Primary Domain: `api.kneeiq.com.au`
- Enable HTTPS: ✓
- Auto SSL (Let's Encrypt): ✓

**Persistent Storage**:
- Mount Point: `/app/public/uploads`
- This ensures uploaded files survive container restarts

### 3. Deploy
1. Commit and push your changes to the main branch
2. Coolify will automatically detect changes and rebuild
3. Monitor deployment logs in Coolify dashboard

## Testing After Deployment

### 1. Frontend Access
Visit `https://kneeiq.com.au` - should load the React app

### 2. Backend API Test
```bash
curl https://api.kneeiq.com.au/api/doctor/check-auth
# Should return: {"isAuthenticated":false}
```

### 3. CORS Test
Open browser console on `https://kneeiq.com.au` and run:
```javascript
fetch('https://api.kneeiq.com.au/api/doctor/check-auth', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```
Should return authentication status without CORS errors.

### 4. Dashboard Login Test
1. Navigate to the dashboard at `https://kneeiq.com.au/doctor`
2. Login with password: `Gumtr33s22!`
3. Should successfully authenticate and set secure cookies

### 5. File Upload Test
1. Fill out the assessment form
2. Try uploading an imaging file
3. File should upload successfully and be accessible

## Troubleshooting

### CORS Errors
**Symptom**: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solutions**:
1. Verify `ALLOWED_ORIGINS` includes exact frontend domain (with or without www)
2. Check browser console for the actual `Origin` header being sent
3. Ensure `TRUST_PROXY=true` in backend environment variables
4. Check backend logs for CORS debugging output

### Cookies Not Working
**Symptom**: Dashboard login doesn't persist, repeated login prompts

**Solutions**:
1. Verify `COOKIE_DOMAIN=.kneeiq.com.au` (note the leading dot)
2. Ensure `TRUST_PROXY=true` is set
3. Check that frontend uses `credentials: 'include'` in fetch calls
4. Verify both frontend and backend are using HTTPS (not mixed HTTP/HTTPS)

### File Upload 404 Errors
**Symptom**: Uploaded files return 404 when accessed

**Solutions**:
1. Check `SERVER_BASE_URL=https://api.kneeiq.com.au` is correct
2. Verify persistent volume is mounted at `/app/public/uploads` in Coolify
3. Check file permissions in the uploads directory
4. Verify upload endpoint is working: check backend logs

### Port Mismatch Errors
**Symptom**: Backend not responding, connection refused

**Solutions**:
1. Ensure `SERVER_PORT=3000` in all environments
2. Verify Dockerfile exposes port 3000
3. Check docker-compose.yaml exposes port 3000

## Key Differences from nginx Proxy Setup

### Before (nginx proxy)
- Single domain for frontend + backend
- nginx proxied `/api/*` → `http://server:3000/api/*`
- No CORS needed (same origin)
- Simple cookie configuration

### After (Traefik direct)
- Separate domains: `kneeiq.com.au` + `api.kneeiq.com.au`
- Frontend makes direct API calls to backend domain
- CORS required for cross-origin requests
- Advanced cookie configuration for cross-domain sessions
- Trust proxy headers from Traefik

## Security Considerations

1. **API Keys**: Never commit `.env` files. All sensitive values should be set in Coolify's environment variables
2. **CORS**: Only allow specific domains in `ALLOWED_ORIGINS` - never use `*` in production
3. **Cookies**: Use `secure: true` and `sameSite: 'none'` only in production with HTTPS
4. **Trust Proxy**: Only enable when behind a trusted reverse proxy (Traefik/Coolify)
5. **Session Secret**: Generate a strong random secret: `openssl rand -base64 32`

## Support Resources

- **Coolify Documentation**: https://coolify.io/docs
- **Traefik Documentation**: https://doc.traefik.io/traefik/
- **Express Behind Proxies**: https://expressjs.com/en/guide/behind-proxies.html
