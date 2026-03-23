const officialBrandSitesByOrganization: Record<string, string> = {
  "蚂蚁集团": "https://www.antgroup.com",
  "平安科技": "https://www.pingan.com",
  "长桥证券": "https://longbridge.com",
  "同花顺": "https://www.10jqka.com.cn",
  "万得": "https://www.wind.com.cn",
  "京东": "https://www.jd.com",
  "华为": "https://www.huawei.com",
  "清华 KEG / Zhipu": "https://www.bigmodel.cn",
  "京东数科": "https://www.jd.com",
  "腾讯 AI Lab": "https://www.tencent.com",
  "度小满": "https://www.duxiaoman.com",
  "恒生电子": "https://www.hundsun.com",
  "网商银行": "https://www.mybank.cn",
};

const logoUrlByOrganization: Record<string, string> = {
  "蚂蚁集团": "https://www.antgroup.com/favicon.ico",
  "平安科技": "https://www.pingan.com/favicon.ico",
  "长桥证券": "https://longbridge.com/favicon.ico",
  "同花顺": "https://www.10jqka.com.cn/favicon.ico",
  "万得": "https://www.wind.com.cn/favicon.ico",
  "京东": "https://www.jd.com/favicon.ico",
  "华为": "https://www.huawei.com/favicon.ico",
  "清华 KEG / Zhipu": "https://www.bigmodel.cn/favicon.ico",
  "京东数科": "https://www.jd.com/favicon.ico",
  "腾讯 AI Lab": "https://www.tencent.com/favicon.ico",
  "度小满": "https://www.duxiaoman.com/favicon.ico",
  "恒生电子": "https://www.hundsun.com/favicon.ico",
  "网商银行": "https://www.mybank.cn/favicon.ico",
};

function buildGoogleFallback(siteUrl: string) {
  return `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(siteUrl)}`;
}

export function getProductLogoSources(organization?: string, productId?: string) {
  if (organization) {
    const sources: string[] = [];
    const directLogo = logoUrlByOrganization[organization];
    const brandSite = officialBrandSitesByOrganization[organization];

    if (directLogo) sources.push(directLogo);
    if (brandSite) sources.push(buildGoogleFallback(brandSite));

    if (sources.length > 0) return sources;
  }

  if (productId) {
    return [];
  }

  return [];
}

export function getOrganizationBrandSite(organization: string) {
  return officialBrandSitesByOrganization[organization];
}
