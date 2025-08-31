FROM node:20-alpine

WORKDIR /app

# Build-time API URL for the browser bundle
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Install deps
COPY package.json package-lock.json ./
RUN npm ci

# Copy Next.js app
COPY . .

# Build Next (bakes NEXT_PUBLIC_API_URL into the client)
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start", "--", "-p", "3000"]
