// @ts-nocheck
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import { getImageXPath, getDescriptionXPath } from './utils.js'

import shopify from "./shopify.js";
import productCreator, {createAmazonImportedProduct} from "./product-creator.js";
import GDPRWebhookHandlers from "./gdpr.js";
import puppeteer from 'puppeteer'

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});

app.get("/api/products/create", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.post("/api/products/amazon/import", async(_req, res) => {
  let status = 200;
  let error = null;
  let data;
  let imageUrlText;
  const body = _req.body
  
  try {
    const browser = await puppeteer.launch({
      headless: true,
  });


  const page = await browser.newPage();

  await page.goto(
    body.link,
      {
          waitUntil: 'domcontentloaded',
      }
  );

  if(body.product_type === "clothing/apparel"){
    const imageUrl = await page.$('div#unrolledImgNo0 > div > img');
    imageUrlText = (
      await (await imageUrl.getProperty('src')).jsonValue()
    ).toString() || null;
  } else {
    const [_imageUrl] = await page.$x(getImageXPath(body.product_type));
    imageUrlText = (
      await (await _imageUrl.getProperty('src')).jsonValue()
    ).toString() || null;
  }

  const [title] = await page.$x('//*[@id="productTitle"]');
  const [description] = await page.$x(getDescriptionXPath(body.product_type));

  const titleText = (
      await (await title.getProperty('innerText')).jsonValue()
  ).toString() || null;

  const descriptionHTML = (
    await (await description.getProperty('innerHTML')).jsonValue()
  ).toString() || null;

  data = {
    title: titleText,
    price: body.price,
    imageUrl: imageUrlText,
    description: descriptionHTML
  }

  await browser.close();

  await createAmazonImportedProduct(res.locals.shopify.session, data)
  } catch(e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  } 

  res.status(status).send({ success: status === 200, error, data });
})

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
