# Gun Relay for Railway

A robust and versatile GunDB relay server ready for deployment on [Railway](https://railway.app/).

## Features
- **Express-based**: Clean health check endpoint.
- **Peer Support**: Easily connect to other Gun relays via environment variables.
- **Persistence Ready**: Configured for `radisk` storage.
- **Railway Compatible**: Automatically uses the `$PORT` assigned by Railway.

## Deployment to Railway

1. **Connect Repository**: Push this code to a GitHub repository and link it to a new project on Railway.
2. **Environment Variables**:
   - `PORT`: (Managed by Railway)
   - `PEERS`: (Optional) A comma-separated list of peer URLs if you want this relay to sync with others (e.g., `https://gun-manhattan.herokuapp.com/gun`).
3. **Persistence (Volumes)**:
   By default, Railway's file system is ephemeral. If you want your database to persist across deployments/restarts:
   - Go to your Railway service settings.
   - Click on **Volumes**.
   - Create a new volume.
   - Set the mount path to `/app/data`.
   - Railway will now keep the `data` folder persistent.

## Local Development

```bash
# Install dependencies
npm install

# Start the relay
npm start
```

Your relay will be available at `http://localhost:8765/gun`.

## Usage in Client

To use this relay in your frontend application:

```javascript
const Gun = require('gun');
const gun = Gun(['https://your-app-name.up.railway.app/gun']);
```
