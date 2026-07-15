FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm run dev

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]