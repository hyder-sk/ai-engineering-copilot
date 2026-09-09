FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/api ./apps/api
COPY packages ./packages
RUN npm install
WORKDIR /app/apps/api
CMD ["npm", "run", "start:dev"]
