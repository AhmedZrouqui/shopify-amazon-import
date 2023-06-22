import {
  Page,
  Layout,
  Text,
  Form,
  TextField,
  Button,
  Select,
  VerticalStack,
  Checkbox,
  LegacyCard
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
  const [link, setLink] = useState('');
  const [price, setPrice] = useState(0.00);
  const [selected, setSelected] = useState('standard_product');
  const [loading, setLoading] = useState(false)

  //Handlers
  const handleLinkChange = useCallback((value) => setLink(value), [])
  const handleSelectChange = useCallback((value) => setSelected(value), [])
  const handlePriceChange = useCallback((value) => setPrice(value), [])

  const toastMarkup = toastProps.content && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  );

  const selectOptions = [
    {label: 'Standard product', value: 'standard_product'},
    {label: 'Kindle eBook', value: 'kindle_ebook'},
    {label: 'Laptop', value: 'laptop'},
    {label: 'Clothing/Apparel', value: 'clothing/apparel'},
  ]

  const handleSubmit = async () => {
    setLoading(true);
    const response = await _fetch('/api/products/amazon/import', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        link,
        price,
        product_type: selected,
      })
    })
    setLoading(false);

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
          <LegacyCard sectioned>
              <Form onSubmit={handleSubmit}>
              <VerticalStack gap="4">
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
                <Select
                  label="Product type"
                  options={selectOptions}
                  onChange={handleSelectChange}
                  value={selected}
                  requiredIndicator
                  helpText={
                    <span>
                      Product type will be used to optimize the product import.
                    </span>
                  }
                />
                <TextField
                    value={price}
                    onChange={handlePriceChange}
                    placeholder="0.00"
                    label="Custom price"
                    type="number"
                    requiredIndicator
                    helpText={
                      <span>
                        This will be the default price for your product.
                      </span>
                    }
                  />
                <Button submit primary disabled={loading}>
                  {
                    loading ? "Importing product..." : "Import product"
                  }
                </Button>
              </VerticalStack>
            </Form>
          </LegacyCard>
          
        </Layout.Section>
      </Layout>
      {toastMarkup}
    </Page>
  );
}
