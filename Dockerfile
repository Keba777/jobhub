FROM node:20.18.3

WORKDIR /app
COPY . /app
RUN npm install
RUN npm run build
EXPOSE 8000

ENTRYPOINT ["sh", "-c", "npm run migrate && npm run start"]