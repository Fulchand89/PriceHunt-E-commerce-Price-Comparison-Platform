'use strict';

const providerManager = require('./ProviderManager');

const AmazonScraper = require('./scrapers/amazon.scraper');
const FlipkartScraper = require('./scrapers/flipkart.scraper');
const CromaScraper = require('./scrapers/croma.scraper');
const RelianceDigitalScraper = require('./scrapers/relianceDigital.scraper');
const VijaySalesScraper = require('./scrapers/vijaySales.scraper');
const MyntraScraper = require('./scrapers/myntra.scraper');
const AjioScraper = require('./scrapers/ajio.scraper');
const MeeshoScraper = require('./scrapers/meesho.scraper');

// Instantiate and register scrapers - Enable ONLY Amazon scraper for live data searches
const scrapers = {
  amazon: new AmazonScraper(),
  flipkart: new FlipkartScraper(),
  croma: new CromaScraper(),
  reliancedigital: new RelianceDigitalScraper(),
  vijaysales: new VijaySalesScraper(),
  myntra: new MyntraScraper(),
  ajio: new AjioScraper(),
  meesho: new MeeshoScraper(),
};

for (const [key, scraper] of Object.entries(scrapers)) {
  scraper.enabled = (key === 'amazon' || key === 'flipkart' || key === 'meesho');
  providerManager.register(key, scraper);
}

module.exports = {
  providerManager,
  scrapers,
  AmazonScraper,
  FlipkartScraper,
  CromaScraper,
  RelianceDigitalScraper,
  VijaySalesScraper,
  MyntraScraper,
  AjioScraper,
  MeeshoScraper
};
