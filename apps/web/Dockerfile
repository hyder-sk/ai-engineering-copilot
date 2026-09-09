FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/web ./apps/web
COPY packages ./packages
RUN npm install
WORKDIR /app/apps/web
CMD ["npm", "run", "dev"]
