'use strict';

const configs = {
  amazon:          { name:'Amazon',          logo:'https://logo.clearbit.com/amazon.in',         homepage:'https://www.amazon.in',         currency:'INR', timeout:15000, maxRetries:2 },
  flipkart:        { name:'Flipkart',         logo:'https://logo.clearbit.com/flipkart.com',       homepage:'https://www.flipkart.com',       currency:'INR', timeout:15000, maxRetries:2 },
  myntra:          { name:'Myntra',           logo:'https://logo.clearbit.com/myntra.com',         homepage:'https://www.myntra.com',         currency:'INR', timeout:15000, maxRetries:2 },
  ajio:            { name:'AJIO',             logo:'https://logo.clearbit.com/ajio.com',           homepage:'https://www.ajio.com',           currency:'INR', timeout:15000, maxRetries:2 },
  meesho:          { name:'Meesho',           logo:'https://logo.clearbit.com/meesho.com',         homepage:'https://www.meesho.com',         currency:'INR', timeout:15000, maxRetries:2 },
  croma:           { name:'Croma',            logo:'https://logo.clearbit.com/croma.com',          homepage:'https://www.croma.com',          currency:'INR', timeout:15000, maxRetries:2 },
  relianceDigital: { name:'Reliance Digital', logo:'https://logo.clearbit.com/reliancedigital.in', homepage:'https://www.reliancedigital.in', currency:'INR', timeout:15000, maxRetries:2 },
  vijaySales:      { name:'Vijay Sales',      logo:'https://logo.clearbit.com/vijaysales.com',     homepage:'https://www.vijaysales.com',     currency:'INR', timeout:15000, maxRetries:2 },
};

const isProviderEnabled    = (key) => {
  const envVal = process.env[`${key.replace(/([A-Z])/g,'_$1').toUpperCase()}_ENABLED`];
  if (envVal !== undefined) return envVal === 'true';
  const k = key.toLowerCase();
  return k === 'amazon' || k === 'flipkart' || k === 'meesho';
};
const isProviderConfigured = (key) => Boolean(configs[key]);
const getMissingKeys       = ()    => [];
const getProviderConfig    = (key) => configs[key] || null;
const getAllProviderKeys    = ()    => Object.keys(configs);

module.exports = { configs, isProviderEnabled, isProviderConfigured, getMissingKeys, getProviderConfig, getAllProviderKeys };
