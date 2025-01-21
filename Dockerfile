FROM node:18.17.1-alpine3.18 AS building

RUN apk update && apk upgrade && apk add --no-cache --virtual build-dependencies build-base=~0.5 gcc=~12 git=~2 make=~4 python3=~3.11 wget=~1

WORKDIR /app

COPY package.json yarn.lock ./
COPY ./tsconfig*.json ./
COPY ./src ./src

RUN yarn install --frozen-lockfile --non-interactive && yarn cache clean
RUN yarn build

FROM node:18.17.1-alpine3.18

WORKDIR /app

COPY --from=building /app/dist ./dist
COPY --from=building /app/node_modules ./node_modules
COPY ./package.json ./

USER node

HEALTHCHECK --interval=60s --timeout=10s --retries=3 \
  CMD sh -c "wget -nv -t1 --spider http://localhost:$PORT/health" || exit 1

CMD ["yarn", "start:prod"]
