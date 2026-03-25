FROM node:22-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_BACKEND_API_BASE_URL=http://localhost:4100

ENV NEXT_PUBLIC_BACKEND_API_BASE_URL=${NEXT_PUBLIC_BACKEND_API_BASE_URL}

COPY package.json package-lock.json ./
RUN npm ci

COPY app ./app
COPY components ./components
COPY data ./data
COPY public ./public
COPY types ./types
COPY eslint.config.mjs ./eslint.config.mjs
COPY next-env.d.ts ./next-env.d.ts
COPY next.config.mjs ./next.config.mjs
COPY tsconfig.json ./tsconfig.json

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs

EXPOSE 3000

CMD ["npm", "run", "start"]
