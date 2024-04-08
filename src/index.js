/**
 * Welcome to Cloudflare Workers!
 *
 * This is a template for a Scheduled Worker: a Worker that can run on a
 * configurable interval:
 * https://developers.cloudflare.com/workers/platform/triggers/cron-triggers/
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async scheduled(event, env, ctx) {
		try {
			const magentoEndpoint = env.MAGENTO_ENDPOINT;
			//Using the Magento REST API to fetch 20 products (defined in the Endpoint URL as query params)
			let magentoProductsResponse = await fetch(magentoEndpoint, {
				method: 'GET',
				headers: {
					Authorization: 'Bearer z8nnln30fd5bipe6iuu0au5otfb6osst',
				},
			});

			const body = await magentoProductsResponse.json();
			const magentoProducts = body.items;

			let products = [];
			let productContents = [];
			let variants = [];
			let variantContents = [];

			for (const product in magentoProducts) {
				const productId = magentoProducts[product].sku;
				const title = magentoProducts[product].name;
				const price = magentoProducts[product].price;
				const handle = magentoProducts[product].custom_attributes[3].value;
				const sku = magentoProducts[product].sku;
				const description = magentoProducts[product].custom_attributes[7].value;
				const imageFile = magentoProducts[product].custom_attributes[0].value;
				const imageSource = `https://3da1c38415.nxcli.io/media/catalog/product${imageFile}`;

				// Build Product
				products.push({
					sourceEntryId: productId,
					availableForSale: true,
				});
				// Build Product Content
				productContents.push({
					sourceEntryId: productId,
					sourceProductId: productId,
					locale: 'en-US',
					handle: handle,
					title: title,
					description: description,
					featuredMedia: {
						type: 'IMAGE',
						src: imageSource,
						thumbnailSrc: imageSource,
						altText: '',
					},
				});

				// Build Variant
				variants.push({
					sourceEntryId: productId,
					sourceProductId: productId,
					sku: sku,
					price: price,
					availableForSale: true,
				});

				// Build Variant Content
				variantContents.push({
					sourceEntryId: productId,
					locale: 'en-US',
					sourceProductId: productId,
					sourceVariantId: productId,
					title: title,
					description: description,
				});
			}

			const productResponse = await nacelleIngestProducts(products);
			console.log('productResponse', productResponse);
			const productContentResponse = await nacelleIngestProductContent(productContents);
			console.log('productContentResponse', productContentResponse);
			const variantResponse = await nacelleIngestVariants(variants);
			console.log('variantResponse', variantResponse);
			const variantContentResponse = await nacelleIngestVariantContent(variantContents);
			console.log('variantContentResponse', variantContentResponse);
		} catch (err) {
			console.log(err.message);
		}
		//Function to reuse the Nacelle API/different endpoints to ingest data
		async function nacelleFetch(payload, endpoint) {
			const options = {
				method: 'PUT',
				body: JSON.stringify({
					entries: payload,
				}),
				headers: {
					'Content-Type': 'application/json',
					'x-nacelle-space-id': env.NACELLE_SPACE_ID,
					'x-nacelle-source-id': env.NACELLE_CUSTOM_SOURCE_ID,
					'x-nacelle-ingest-token': env.NACELLE_INGEST_TOKEN,
				},
			};

			return fetch(endpoint, options);
		}

		async function nacelleIngestProducts(products) {
			const endpoint = 'https://ingest.api.nacelle.com/v1/product';
			return nacelleFetch(products, endpoint);
		}

		async function nacelleIngestProductContent(productContents) {
			const endpoint = 'https://ingest.api.nacelle.com/v1/product-content';
			return nacelleFetch(productContents, endpoint);
		}

		async function nacelleIngestVariants(variants) {
			const endpoint = 'https://ingest.api.nacelle.com/v1/variant';
			return nacelleFetch(variants, endpoint);
		}

		async function nacelleIngestVariantContent(variantContents) {
			const endpoint = 'https://ingest.api.nacelle.com/v1/variant-content';
			return nacelleFetch(variantContents, endpoint);
		}
	},
};
