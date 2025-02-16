FROM node:20-alpine
ENV NODE_ENV=production
RUN apk add --no-cache git ffmpeg
RUN git clone https://github.com/AstroX11/Xstro /Xstro
WORKDIR /Xstro
RUN yarn install && yarn build
EXPOSE 8000
CMD ["npm", "start"]
