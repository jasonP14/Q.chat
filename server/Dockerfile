FROM node:18-alpine AS builder
WORKDIR /app/server
COPY package*.json ./
RUN npm install
COPY . .
CMD [ "npm", "run", "start" ]
