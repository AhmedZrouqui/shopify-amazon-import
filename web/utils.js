export function getImageXPath(product_type){
    switch(product_type){
        case 'standard_product': return '//*[@id="landingImage"]'
        case 'kindle_ebook': return '//*[@id="ebooksImgBlkFront"]'
        case 'laptop': return '//*[@id="landingImage"]'
        case 'clothing/apparel': return '//html[1]/body[1]/div[1]/div[2]/div[1]/div[9]/div[1]/div[2]/div[1]/div/div[1]/div/div/div[2]/div/div[3]/ul/li[1]/span/span/div/div/div/img'

        default: return '//*[@id="landingImage"]'
    }
}

export function getDescriptionXPath(product_type){
    switch(product_type){
        case 'standard_product': return '//*[@id="feature-bullets"]'
        case 'kindle_ebook': return '//*[@id="bookDescription_feature_div"]'
        case 'laptop': return '//*[@id="feature-bullets"]'
        case 'clothing/apparel': return '//*[@id="feature-bullets"]'

        default: return '//*[@id="feature-bullets"]'
    }
}