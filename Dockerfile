FROM node:20-alpine
ENV NODE_ENV=production
RUN apk add --no-cache git ffmpeg
RUN git clone https://github.com/AstroX11/Xstro /Xstro
WORKDIR /Xstro
RUN yarn global add typescript @babel/core @babel/cli && \
    yarn install && \
    yarn build
EXPOSE 8000
CMD ["npm", "start"]