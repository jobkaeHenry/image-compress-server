# Import Node 18 images
FROM node:18-alpine as base

FROM base as deps
# Declare root directory
WORKDIR /app

COPY package.json .

# Install dependencies
RUN yarn

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules 
COPY . .
RUN yarn build

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/dist .
COPY --from=builder /app/node_modules ./node_modules

ENV PORT ${PORT}
ENV BASE_URL ${BASE_URL}
EXPOSE ${PORT}

# Run production server 
CMD ["node", "/app/main.js"]