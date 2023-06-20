import {
  Page,
  Layout,
  Text,
  Form,
  TextField,
  Button
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation, Trans } from "react-i18next"
import { useCallback, useState } from "react";
import { useAuthenticatedFetch } from "../hooks";

export default function HomePage() {
  const { t } = useTranslation();
  const _fetch = useAuthenticatedFetch();
  const [link, setLink] = useState('')
  const handleLinkChange = useCallback((value) => setLink(value), [])
  const handleSubmit = async () => {
    await _fetch('/api/products/amazon/import', {
      method: "POST",
      body: {
        uri: link
      },
      data: JSON.stringify({
        zbila: "zbiksla"
      })
    })
  }
  return (
    <Page narrowWidth>
      <TitleBar title={t("HomePage.title")} primaryAction={null} />
      <Layout>
        <Layout.Section>
          <Form onSubmit={handleSubmit}>
            <TextField
              value={link}
              onChange={handleLinkChange}
              label="Product link"
              type="url"
              requiredIndicator
              helpText={
                <span>
                  We’ll use this link in order to retrieve the product and add to your products list.
                </span>
              }
            />
            <Button submit>Import</Button>
          </Form>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
