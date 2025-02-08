FROM node:alpine3.19
ENV NODE_ENV=production
RUN apk add --no-cache git ffmpeg
RUN git clone https://github.com/AstroX11/Xstro /Xstro
WORKDIR /Xstro
RUN yarn install --production
RUN npm run install:resources
RUN npm run build
EXPOSE 8000
CMD ["npm", "start"]