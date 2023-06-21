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
import { Toast } from "@shopify/app-bridge-react";

export default function HomePage() {
  const { t } = useTranslation();
  const _fetch = useAuthenticatedFetch();
  const emptyToastProps = { content: null };
  const [toastProps, setToastProps] = useState(emptyToastProps);
  const [link, setLink] = useState('')
  const handleLinkChange = useCallback((value) => setLink(value), [])

  const toastMarkup = toastProps.content && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  );

  const handleSubmit = async () => {
    const response = await _fetch('/api/products/amazon/import', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uri: link
      })
    })

    if(response.ok){
      setToastProps({
        content: 'Product imported successfully.'
      })
    }
    else {
      setToastProps({
        content: 'An error has occurred while importing the product.',
        error: true
      })
    }

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
      {toastMarkup}
    </Page>
  );
}
