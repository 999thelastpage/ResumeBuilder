# Build stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

# Pass in the build-time variable
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_KOFI_URL
ARG NEXT_PUBLIC_UPI_ID
ARG NEXT_PUBLIC_UPI_NAME

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_KOFI_URL=$NEXT_PUBLIC_KOFI_URL
ENV NEXT_PUBLIC_UPI_ID=$NEXT_PUBLIC_UPI_ID
ENV NEXT_PUBLIC_UPI_NAME=$NEXT_PUBLIC_UPI_NAME

RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
