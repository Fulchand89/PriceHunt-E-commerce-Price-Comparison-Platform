'use strict';

const crypto = require('crypto');
const axios  = require('axios');

class AmazonApiError extends Error {
  constructor(message, status = 500, code = 'AMAZON_API_ERROR', details = null) {
    super(message);
    this.name = 'AmazonApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * AWS Signature Version 4 Helper for Amazon PA-API v5
 */
class AwsSigV4Signer {
  static sha256(str) {
    return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
  }

  static hmac(key, str, encoding) {
    return crypto.createHmac('sha256', key).update(str, 'utf8').digest(encoding);
  }

  static getSignatureKey(key, dateStamp, regionName, serviceName) {
    const kDate    = AwsSigV4Signer.hmac('AWS4' + key, dateStamp);
    const kRegion  = AwsSigV4Signer.hmac(kDate, regionName);
    const kService = AwsSigV4Signer.hmac(kRegion, serviceName);
    const kSigning = AwsSigV4Signer.hmac(kService, 'aws4_request');
    return kSigning;
  }

  static signRequest({
    method = 'POST',
    host,
    region,
    service = 'ProductAdvertisingAPI',
    path = '/paapi5/searchitems',
    target,
    payload = '',
    accessKey,
    secretKey
  }) {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substring(0, 8);

    const canonicalUri = path;
    const canonicalQuerystring = '';
    const contentType = 'application/json; charset=utf-8';

    const canonicalHeaders =
      `content-encoding:amz-1.0\n` +
      `content-type:${contentType}\n` +
      `host:${host}\n` +
      `x-amz-date:${amzDate}\n` +
      `x-amz-target:${target}\n`;

    const signedHeaders = 'content-encoding;content-type;host;x-amz-date;x-amz-target';
    const payloadHash = AwsSigV4Signer.sha256(payload);

    const canonicalRequest =
      `${method}\n` +
      `${canonicalUri}\n` +
      `${canonicalQuerystring}\n` +
      `${canonicalHeaders}\n` +
      `${signedHeaders}\n` +
      `${payloadHash}`;

    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign =
      `${algorithm}\n` +
      `${amzDate}\n` +
      `${credentialScope}\n` +
      `${AwsSigV4Signer.sha256(canonicalRequest)}`;

    const signingKey = AwsSigV4Signer.getSignatureKey(secretKey, dateStamp, region, service);
    const signature = AwsSigV4Signer.hmac(signingKey, stringToSign, 'hex');

    const authorizationHeader =
      `${algorithm} ` +
      `Credential=${accessKey}/${credentialScope}, ` +
      `SignedHeaders=${signedHeaders}, ` +
      `Signature=${signature}`;

    return {
      'host': host,
      'content-type': contentType,
      'content-encoding': 'amz-1.0',
      'x-amz-date': amzDate,
      'x-amz-target': target,
      'Authorization': authorizationHeader
    };
  }
}

/**
 * Official Amazon PA-API v5 Client
 */
class AmazonApi {
  constructor() {
    this.apiKey       = process.env.AMAZON_API_KEY || '';
    this.secret       = process.env.AMAZON_SECRET || process.env.AMAZON_API_SECRET || '';
    this.partnerTag   = process.env.AMAZON_PARTNER_TAG || process.env.AMAZON_ASSOCIATE_TAG || 'pricehunt-21';
    this.region       = process.env.AMAZON_REGION || 'eu-west-1';
    this.marketplace  = process.env.AMAZON_MARKETPLACE || 'www.amazon.in';
    this.host         = process.env.AMAZON_HOST || 'webservices.amazon.in';
    this.timeoutMs    = parseInt(process.env.PROVIDER_TIMEOUT_MS, 10) || 12000;
  }

  isConfigured() {
    return Boolean(this.apiKey && this.secret && this.partnerTag);
  }

  /**
   * Search Items on Amazon
   * @param {string} query
   * @param {Object} options
   * @returns {Promise<Array>} Array of raw items
   */
  async searchItems(query, options = {}) {
    const q = String(query || '').trim();
    if (!q) {
      throw new AmazonApiError('Search query cannot be empty', 400, 'INVALID_QUERY');
    }

    if (!this.isConfigured()) {
      throw new AmazonApiError(
        'Amazon API credentials are not configured. Please set AMAZON_API_KEY, AMAZON_SECRET, and AMAZON_PARTNER_TAG in .env',
        401,
        'UNAUTHORIZED_CREDENTIALS'
      );
    }

    const payloadObj = {
      Keywords: q,
      SearchIndex: options.searchIndex || 'All',
      ItemCount: Math.min(options.limit || 10, 10),
      PartnerTag: this.partnerTag,
      PartnerType: 'Associates',
      Marketplace: this.marketplace,
      Resources: [
        'ItemInfo.Title',
        'ItemInfo.Classifications',
        'ItemInfo.Features',
        'Images.Primary.Large',
        'Offers.Listings.Price',
        'Offers.Listings.SavingBasis',
        'Offers.Listings.Availability.Message',
        'CustomerReviews.Count',
        'CustomerReviews.StarRating'
      ]
    };

    if (options.minPrice) payloadObj.MinPrice = Math.round(Number(options.minPrice) * 100);
    if (options.maxPrice) payloadObj.MaxPrice = Math.round(Number(options.maxPrice) * 100);

    const payload = JSON.stringify(payloadObj);
    const path = '/paapi5/searchitems';
    const target = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv5.SearchItems';

    const headers = AwsSigV4Signer.signRequest({
      method: 'POST',
      host: this.host,
      region: this.region,
      service: 'ProductAdvertisingAPI',
      path,
      target,
      payload,
      accessKey: this.apiKey,
      secretKey: this.secret
    });

    try {
      const response = await axios.post(`https://${this.host}${path}`, payload, {
        headers,
        timeout: this.timeoutMs
      });

      const items = response.data?.SearchResult?.Items || [];
      return items;
    } catch (err) {
      this._handleAxiosError(err, 'SearchItems');
    }
  }

  /**
   * Get Product by ASIN from Amazon
   * @param {string} asin
   * @returns {Promise<Object|null>} Raw item
   */
  async getItemByAsin(asin) {
    const cleanAsin = String(asin || '').trim().toUpperCase();
    if (!cleanAsin || !/^[A-Z0-9]{10}$/.test(cleanAsin)) {
      throw new AmazonApiError(`Invalid ASIN format: "${asin}". Must be 10 alphanumeric characters.`, 400, 'INVALID_ASIN');
    }

    if (!this.isConfigured()) {
      throw new AmazonApiError(
        'Amazon API credentials are not configured. Please set AMAZON_API_KEY, AMAZON_SECRET, and AMAZON_PARTNER_TAG in .env',
        401,
        'UNAUTHORIZED_CREDENTIALS'
      );
    }

    const payloadObj = {
      ItemIds: [cleanAsin],
      ItemIdType: 'ASIN',
      PartnerTag: this.partnerTag,
      PartnerType: 'Associates',
      Marketplace: this.marketplace,
      Resources: [
        'ItemInfo.Title',
        'ItemInfo.Classifications',
        'ItemInfo.Features',
        'Images.Primary.Large',
        'Offers.Listings.Price',
        'Offers.Listings.SavingBasis',
        'Offers.Listings.Availability.Message',
        'CustomerReviews.Count',
        'CustomerReviews.StarRating'
      ]
    };

    const payload = JSON.stringify(payloadObj);
    const path = '/paapi5/getitems';
    const target = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv5.GetItems';

    const headers = AwsSigV4Signer.signRequest({
      method: 'POST',
      host: this.host,
      region: this.region,
      service: 'ProductAdvertisingAPI',
      path,
      target,
      payload,
      accessKey: this.apiKey,
      secretKey: this.secret
    });

    try {
      const response = await axios.post(`https://${this.host}${path}`, payload, {
        headers,
        timeout: this.timeoutMs
      });

      const items = response.data?.ItemsResult?.Items || [];
      return items.length > 0 ? items[0] : null;
    } catch (err) {
      this._handleAxiosError(err, 'GetItems');
    }
  }

  /**
   * Central error translator for Axios / Amazon PA-API
   */
  _handleAxiosError(err, operation) {
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      throw new AmazonApiError(`Amazon API request timed out (${this.timeoutMs}ms)`, 504, 'API_TIMEOUT');
    }

    if (err.response) {
      const status = err.response.status;
      const data = err.response.data;
      const errorType = data?.Errors?.[0]?.Code || data?.code || `HTTP_${status}`;
      const errorMsg = data?.Errors?.[0]?.Message || data?.message || err.message;

      if (status === 401 || status === 403 || errorType === 'UnrecognizedClientException') {
        throw new AmazonApiError(
          `Unauthorized Amazon API credentials: ${errorMsg}`,
          401,
          'UNAUTHORIZED_CREDENTIALS',
          data
        );
      }

      if (status === 429 || errorType === 'RequestThrottled') {
        throw new AmazonApiError(
          'Amazon API rate limit reached. Please retry in a few moments.',
          429,
          'RATE_LIMITED',
          data
        );
      }

      if (status === 404 || errorType === 'ItemNotFound') {
        throw new AmazonApiError(
          `Amazon product not found (${errorMsg})`,
          404,
          'NOT_FOUND',
          data
        );
      }

      throw new AmazonApiError(
        `Amazon PA-API ${operation} error [${status}]: ${errorMsg}`,
        status >= 500 ? 503 : status,
        errorType,
        data
      );
    }

    throw new AmazonApiError(
      `Network error connecting to Amazon API: ${err.message}`,
      503,
      'NETWORK_ERROR'
    );
  }
}

module.exports = {
  AmazonApi,
  AmazonApiError,
  AwsSigV4Signer
};
