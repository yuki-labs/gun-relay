FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

# Create data directory for volume mounting
RUN mkdir -p data

EXPOSE 8765

CMD ["npm", "start"]
