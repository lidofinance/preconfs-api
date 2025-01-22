# Preconf API

### Overview

The Preconf API checks whether a validator is part of Lido and has opted into preconfirmations via
the [CCCP](https://github.com/lidofinance/crediblecommitments) contract.  
This service primarily acts as a wrapper around the [KAPI](https://github.com/lidofinance/lido-keys-api) and
the [CCCP contract](https://github.com/lidofinance/crediblecommitments).

### Requirements

- **KAPI**: For setup instructions, please refer to the [documentation](https://docs.lido.fi/guides/kapi-guide/).
- **Execution Layer client**: Required to access the `CCCP` contract.
- **Node.js/Yarn** or **Docker**: To run the service.

### How to Run

1. Copy `sample.env` to `.env` and fill it with actual values. The most important variables are the `KAPI` URI and the
   `CCCP` contract address.
2. Run the service via `yarn` or `docker`.

#### Watch Mode

```bash
$ yarn install
$ yarn start:dev
```

#### Production Mode

```bash
$ yarn install
$ yarn build
$ yarn start
```

#### Production Mode with Docker Compose

```bash
$ docker compose up -d
```

The service will start listening on the `PORT` specified in the `.env` file (default is `3000`).

### API

Currently, the service supports a single method described below.

#### Endpoint: `/v1/preconfs/lido-bolt/validators`

#### Example Request

```http
POST http://api:3000/v1/preconfs/lido-bolt/validators
Accept: application/json
Content-Type: application/json

{
  "pubKeys": [
    "0x5ff0d5508850142615b6766ace748cad0f11b725b0a4c1f9609f4e37b1989ae17b8f0e5e1af7cc60e2a7cfd380828589"
  ]
}
```

#### Example Response

```json
{
  "data": [
    {
      "pubKey": "0x5ff0d5508850142615b6766ace748cad0f11b725b0a4c1f9609f4e37b1989ae17b8f0e5e1af7cc60e2a7cfd380828589",
      "rpcUrl": "https://example.domain:8017/"
    }
  ]
}
```

### Environment Variables

The following environment variables are **required**:

| Name              | Description                                    |
|-------------------|------------------------------------------------|
| `KEYS_API_HOST`   | URI of the Keys API                            |
| `CURATOR_ADDRESS` | Address of the CCCP contract                   |
| `EL_API_URLS`     | URIs of the Execution Layer clients            |
| `CHAIN_ID`        | Chain ID: `1` for mainnet, `17000` for Holesky |
