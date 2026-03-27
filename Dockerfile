FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json backend/
COPY frontend/package*.json frontend/

RUN npm ci \
  && npm ci --prefix backend \
  && npm ci --prefix frontend

COPY . .

ARG REACT_APP_API_BASE=
ARG REACT_APP_V2_ENABLED=true

ENV REACT_APP_API_BASE=${REACT_APP_API_BASE}
ENV REACT_APP_V2_ENABLED=${REACT_APP_V2_ENABLED}

RUN npx --prefix backend prisma generate --schema backend/prisma/schema.prisma
RUN npm --prefix backend run build:full
RUN npm --prefix frontend run build

FROM node:20-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000
ENV FRONTEND_URL=http://localhost:4000
ENV PERSIST_DIR=/persist

COPY --from=build /app/backend backend
COPY --from=build /app/frontend/build frontend/build
COPY --from=build /app/scripts/docker-entrypoint.sh scripts/docker-entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["bash", "/app/scripts/docker-entrypoint.sh"]
