FROM node:18-alpine

WORKDIR /app

RUN npm install express

COPY server.js .
COPY index.html .

EXPOSE 3000

ENV NODE_ENV=production VIDEO_DIR=/videos PORT=3000

CMD ["node", "server.js"]
