FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DATABASE_FILE=/app/data/salary-management.sqlite

RUN mkdir -p /app/data

EXPOSE 3000

CMD ["sh", "-c", "if [ ! -f \"$DATABASE_FILE\" ]; then npm run seed; fi && npm run start"]
