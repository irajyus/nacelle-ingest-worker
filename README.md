# Nacelle Ingest Worker Example

This repo is an example cloudflare worker showcasing how to fetch product data from one source and push it into Nacelle's index.

## Installation

Run npm run dev to start a development server.

Run npm run deploy to publish worker to Cloudflare.


## Variables
- MAGENTO_ENDPOINT = REST API Endpoint (Product Source)
- NACELLE_SPACE_ID = Nacelle Space ID 
- NACELLE_CUSTOM_SOURCE_ID = The Source ID of a Custom Source added in the Nacelle Dashboard.
- NACELLE_INGEST_TOKEN = This is the private token generated in the Nacelle Dashboard.
