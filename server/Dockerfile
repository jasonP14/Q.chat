FROM node:18-alpine AS builder

ARG CLIENT_URL 
ENV CLIENT_URL=$CLIENT_URL

WORKDIR /app/server
COPY package*.json ./
RUN npm install
COPY . .
CMD [ "npm", "run", "start" ]
