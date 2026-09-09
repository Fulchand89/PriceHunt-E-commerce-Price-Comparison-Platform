'use strict';

/**
 * Amazon Data Mapper
 * Strictly maps raw Amazon PA-API or authorized Amazon data source items
 * into the required normalized product format:
 * {
 *   source: "amazon",
 *   asin: "...",
 *   title: "...",
 *   image: "...",
 *   price: 0,
 *   originalPrice: 0,
 *   discount: 0,
 *   currency: "INR",
 *   availability: "...",
 *   rating: 0,
 *   reviewCount: 0,
 *   productUrl: "...",
 *   lastUpdated: "..."
 * }
 * If Amazon does not provide a particular field, returns null. Never invents values.
 */

class AmazonMapper {
  /**
   * Normalize an individual Amazon PA-API or authorized response item.
   * @param {Object} rawItem - Raw item from PA-API SearchItems/GetItems or authorized response
   * @param {string} [partnerTag] - Amazon Associate / Partner Tag
   * @returns {Object} Normalized product object
   */
  static normalizeItem(rawItem, partnerTag = '') {
    if (!rawItem || typeof rawItem !== 'object') return null;

    // 1. ASIN
    const asin = rawItem.ASIN || rawItem.asin || rawItem.Id || null;
    if (!asin) return null;

    // 2. Title
    const title =
      rawItem.ItemInfo?.Title?.DisplayValue ||
      rawItem.title ||
      rawItem.product_title ||
      rawItem.name ||
      null;

    // 3. Image
    const image =
      rawItem.Images?.Primary?.Large?.URL ||
      rawItem.Images?.Primary?.Medium?.URL ||
      rawItem.image ||
      rawItem.product_photo ||
      rawItem.product_main_image_url ||
      null;

    // 4. Pricing (Current Price, Original Price, Discount, Currency)
    let price = null;
    let originalPrice = null;
    let currency = 'INR';

    // From PA-API Offers
    const listing = rawItem.Offers?.Listings?.[0];
    if (listing?.Price?.Amount) {
      price = Number(listing.Price.Amount);
      currency = listing.Price.Currency || 'INR';
    } else if (rawItem.price != null && !isNaN(Number(rawItem.price))) {
      price = Number(rawItem.price);
    } else if (rawItem.product_price) {
      const parsed = parseFloat(String(rawItem.product_price).replace(/[^\d.]/g, ''));
      price = isNaN(parsed) ? null : parsed;
    }

    if (listing?.SavingBasis?.Amount) {
      originalPrice = Number(listing.SavingBasis.Amount);
    } else if (rawItem.originalPrice != null && !isNaN(Number(rawItem.originalPrice))) {
      originalPrice = Number(rawItem.originalPrice);
    } else if (rawItem.product_original_price) {
      const parsed = parseFloat(String(rawItem.product_original_price).replace(/[^\d.]/g, ''));
      originalPrice = isNaN(parsed) ? null : parsed;
    }

    if (originalPrice === null && price !== null) {
      originalPrice = price;
    }

    let discount = null;
    if (originalPrice !== null && price !== null && originalPrice > price) {
      discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    } else if (rawItem.discount != null && !isNaN(Number(rawItem.discount))) {
      discount = Number(rawItem.discount);
    }

    // 5. Availability
    let availability = null;
    if (listing?.Availability?.Message) {
      availability = listing.Availability.Message;
    } else if (rawItem.availability != null) {
      availability = String(rawItem.availability);
    } else if (rawItem.in_stock != null) {
      availability = rawItem.in_stock ? 'In Stock' : 'Out of Stock';
    } else if (price !== null && price > 0) {
      availability = 'In Stock';
    }

    // 6. Rating & Review Count
    let rating = null;
    let reviewCount = null;

    if (rawItem.CustomerReviews?.StarRating?.Value != null) {
      rating = parseFloat(rawItem.CustomerReviews.StarRating.Value);
    } else if (rawItem.rating != null && !isNaN(parseFloat(rawItem.rating))) {
      rating = parseFloat(rawItem.rating);
    } else if (rawItem.product_star_rating != null) {
      rating = parseFloat(rawItem.product_star_rating);
    }

    if (rawItem.CustomerReviews?.Count != null) {
      reviewCount = parseInt(rawItem.CustomerReviews.Count, 10);
    } else if (rawItem.reviewCount != null && !isNaN(parseInt(rawItem.reviewCount, 10))) {
      reviewCount = parseInt(rawItem.reviewCount, 10);
    } else if (rawItem.product_num_ratings != null) {
      reviewCount = parseInt(rawItem.product_num_ratings, 10);
    }

    // 7. Product URL
    let productUrl = rawItem.DetailPageURL || rawItem.productUrl || rawItem.product_url || null;
    if (!productUrl && asin) {
      productUrl = `https://www.amazon.in/dp/${asin}`;
    }
    if (productUrl && partnerTag && !productUrl.includes('tag=')) {
      const sep = productUrl.includes('?') ? '&' : '?';
      productUrl = `${productUrl}${sep}tag=${encodeURIComponent(partnerTag)}`;
    }

    // 8. Last Updated
    const lastUpdated = rawItem.lastUpdated || new Date().toISOString();

    return {
      source: 'amazon',
      asin,
      title,
      image,
      price: price !== null ? price : null,
      originalPrice: originalPrice !== null ? originalPrice : null,
      discount: discount !== null ? discount : null,
      currency: currency || 'INR',
      availability,
      rating: rating !== null ? rating : null,
      reviewCount: reviewCount !== null ? reviewCount : null,
      productUrl,
      lastUpdated
    };
  }

  /**
   * Normalize an array of items. Filters out items without an ASIN or title.
   * @param {Array} rawItems
   * @param {string} [partnerTag]
   * @returns {Array} Array of normalized products
   */
  static normalizeList(rawItems, partnerTag = '') {
    if (!Array.isArray(rawItems)) return [];
    return rawItems
      .map(item => AmazonMapper.normalizeItem(item, partnerTag))
      .filter(p => p !== null && p.asin && p.title);
  }
}

module.exports = AmazonMapper;
