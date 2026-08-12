/** Mock "known partner" directory — stands in for the publisher DB behind the
 *  Assign a partner slideout. */

export type Partner = {
  partnerId: string;
  handle: string;
  company: string;
  website: string;
  network: string;
};

export const NETWORKS = [
  "CJ Affiliate",
  "Rakuten Advertising",
  "Awin",
  "Impact",
  "Partnerize",
  "ShareASale",
];

export const PARTNERS: Partner[] = [
  { partnerId: "1011I138782", handle: "refermate", company: "Refermate, LLC", website: "www.refermate.com", network: "CJ Affiliate" },
  { partnerId: "1011I149461", handle: "forshopafford", company: "Shopafford", website: "shopafford.com", network: "CJ Affiliate" },
  { partnerId: "1011I187022", handle: "gotyourdeal", company: "GotYourDeal", website: "www.gotyourdeal.com", network: "Rakuten Advertising" },
  { partnerId: "1011I197151", handle: "yourwisedeal2", company: "YourWiseDeal", website: "www.yourwisedeal.com", network: "Awin" },
  { partnerId: "1011I204955", handle: "jackjoseph", company: "FeelTheTop", website: "feelthetop.com", network: "CJ Affiliate" },
  { partnerId: "1011I222081", handle: "smarttfix", company: "SmartFix Media", website: "smarttfix.com", network: "Impact" },
  { partnerId: "1011I231774", handle: "couponcactus", company: "Coupon Cactus", website: "couponcactus.com", network: "Rakuten Advertising" },
  { partnerId: "1011I240318", handle: "dealspotr", company: "Dealspotr Inc", website: "dealspotr.com", network: "ShareASale" },
  { partnerId: "1011I255903", handle: "slickdealsuk", company: "Slickdeals UK", website: "slickdeals.co.uk", network: "Awin" },
  { partnerId: "1011I261440", handle: "honeyext", company: "Honey Science", website: "joinhoney.com", network: "Partnerize" },
  { partnerId: "1011I274611", handle: "savvysaver", company: "Savvy Saver Ltd", website: "savvysaver.co.uk", network: "Awin" },
  { partnerId: "1011I281209", handle: "vouchercloud", company: "Vouchercloud", website: "vouchercloud.com", network: "Awin" },
  { partnerId: "1011I290877", handle: "topcashbackus", company: "TopCashback US", website: "topcashback.com", network: "Rakuten Advertising" },
  { partnerId: "1011I302145", handle: "flyerdrop", company: "FlyerDrop Media", website: "flyerdrop.net", network: "Impact" },
  { partnerId: "1011I311067", handle: "travelperks", company: "TravelPerks Group", website: "travelperks.io", network: "Partnerize" },
  { partnerId: "1011I318992", handle: "milesmore", company: "MilesMore Blog", website: "milesandmore.blog", network: "CJ Affiliate" },
  { partnerId: "1011I327410", handle: "farecatcher", company: "FareCatcher", website: "farecatcher.com", network: "Impact" },
  { partnerId: "1011I335188", handle: "skyscout", company: "SkyScout Deals", website: "skyscoutdeals.com", network: "Partnerize" },
  { partnerId: "1011I344027", handle: "promoheaven", company: "Promo Heaven", website: "promoheaven.co", network: "ShareASale" },
  { partnerId: "1011I350963", handle: "clickyfied", company: "Clickyfied", website: "clickyfied.com", network: "CJ Affiliate" },
  { partnerId: "1011I362815", handle: "bargainbeacon", company: "Bargain Beacon", website: "bargainbeacon.com", network: "Rakuten Advertising" },
  { partnerId: "1011I371204", handle: "dealsnapper", company: "DealSnapper", website: "dealsnapper.io", network: "ShareASale" },
  { partnerId: "1011I380556", handle: "thriftywings", company: "Thrifty Wings", website: "thriftywings.com", network: "Partnerize" },
  { partnerId: "1011I391128", handle: "couponkiwi", company: "Coupon Kiwi", website: "couponkiwi.co.nz", network: "Awin" },
  { partnerId: "1011I402349", handle: "rewardorbit", company: "Reward Orbit", website: "rewardorbit.com", network: "Impact" },
  { partnerId: "1011I413870", handle: "pennywise", company: "PennyWise Media", website: "pennywisemedia.com", network: "CJ Affiliate" },
  { partnerId: "1011I421996", handle: "flightfrugal", company: "Flight Frugal", website: "flightfrugal.com", network: "Partnerize" },
  { partnerId: "1011I433512", handle: "dealdrift", company: "DealDrift", website: "dealdrift.net", network: "ShareASale" },
];

export function matchPartners(query: string): Partner[] {
  const q = query.trim().toLowerCase();
  if (!q) return PARTNERS;
  return PARTNERS.filter(
    (p) =>
      p.company.toLowerCase().includes(q) ||
      p.handle.includes(q) ||
      p.website.includes(q) ||
      p.partnerId.toLowerCase().includes(q) ||
      p.network.toLowerCase().includes(q),
  );
}

/** A partner ID pasted straight into a free-text field, e.g. 1011I138782 or 4419023. */
export function looksLikePartnerId(value: string): boolean {
  return /^[0-9]{3,}[a-z]?[0-9]*$/i.test(value.trim()) && /[0-9]{3}/.test(value);
}
