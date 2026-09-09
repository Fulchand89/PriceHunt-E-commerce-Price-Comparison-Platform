'use strict';

const { normalizeTitle } = require('../utils/helpers');
const ProductMatchQueue = require('../models/ProductMatchQueue');

const AUTO_MATCH_THRESHOLD = 70;
const ADMIN_REVIEW_THRESHOLD = 50;

// ── Feature extractors ────────────────────────────────────────────────────────
const STORAGE_RE = /(\d+)\s*(tb|gb|mb)(?!\s*ram)\b/i;
const RAM_RE     = /(\d+)\s*(gb|mb)\s*(ram|memory)/i;
const SIZE_RE    = /(\d+(?:\.\d+)?)\s*(inch|in|"|cm|mm)/i;
const COLOURS    = ['natural titanium','black titanium','black','white','silver','titanium','gold','rose gold','midnight','starlight','blue','red','green','purple','pink','yellow','grey','gray','coral','cream','graphite','navy'];

const exStorage = s => { const m = String(s).match(STORAGE_RE); return m ? `${m[1]}${m[2].toLowerCase()}` : ''; };
const exRam     = s => { const m = String(s).match(RAM_RE);     return m ? `${m[1]}${m[2].toLowerCase()}` : ''; };
const exColour  = s => COLOURS.find(c => String(s).toLowerCase().includes(c)) || '';
const exSize    = s => { const m = String(s).match(SIZE_RE);    return m ? `${m[1]}${m[2].toLowerCase()}` : ''; };
const exBrand   = (text, hint = '') => {
  if (hint) return hint.toLowerCase().trim();
  const words = String(text).split(/\s+/);
  for (const w of words) if (w.length >= 3 && /^[A-Z]/.test(w)) return w.toLowerCase();
  return '';
};

const BRAND_ALIASES = {
  apple: ['apple', 'iphone', 'ipad', 'macbook', 'airpods'],
  samsung: ['samsung', 'galaxy'],
  sony: ['sony', 'playstation', 'bravia']
};

const isBrandMatchOrAlias = (b1, b2, t1 = '', t2 = '') => {
  if (!b1 || !b2) return true;
  const b1Clean = String(b1).toLowerCase().trim();
  const b2Clean = String(b2).toLowerCase().trim();

  if (b1Clean === b2Clean || b1Clean.includes(b2Clean) || b2Clean.includes(b1Clean)) return true;

  if (String(t1).toLowerCase().includes(b2Clean) || String(t2).toLowerCase().includes(b1Clean)) return true;

  for (const group of Object.values(BRAND_ALIASES)) {
    const in1 = group.some(alias => b1Clean.includes(alias) || String(t1).toLowerCase().includes(alias));
    const in2 = group.some(alias => b2Clean.includes(alias) || String(t2).toLowerCase().includes(alias));
    if (in1 && in2) return true;
  }

  return false;
};

// Token-based Dice coefficient similarity (0–1)
const tokenSim = (a, b) => {
  const ta = new Set(normalizeTitle(a).split(/\s+/).filter(Boolean));
  const tb = new Set(normalizeTitle(b).split(/\s+/).filter(Boolean));
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return (2 * inter) / (ta.size + tb.size);
};

// ── Main matching function ────────────────────────────────────────────────────
const matchProducts = (a, b) => {
  const ta = String(a.title || '');
  const tb = String(b.title || '');

  // 1. Check exact ASIN / barcode / product identifiers (100% Match)
  if (a.asin && b.asin && String(a.asin).trim().toUpperCase() === String(b.asin).trim().toUpperCase()) {
    return { matched: true, confidence: 100, status: 'auto_match', breakdown: { asin: 100 } };
  }
  if (a.gtin && b.gtin && a.gtin === b.gtin) return { matched: true, confidence: 100, status: 'auto_match', breakdown: { gtin: 100 } };
  if (a.ean  && b.ean  && a.ean  === b.ean)  return { matched: true, confidence: 100, status: 'auto_match', breakdown: { ean: 100 } };
  if (a.upc  && b.upc  && a.upc  === b.upc)  return { matched: true, confidence: 100, status: 'auto_match', breakdown: { upc: 100 } };
  if (a.mpn  && b.mpn  && a.brand && b.brand && a.mpn === b.mpn && a.brand.toLowerCase() === b.brand.toLowerCase()) {
    return { matched: true, confidence: 100, status: 'auto_match', breakdown: { mpn: 100 } };
  }

  const brandA = exBrand(ta, a.brand);
  const brandB = exBrand(tb, b.brand);
  const storA  = exStorage(ta || a.description);
  const storB  = exStorage(tb || b.description);
  const ramA   = exRam(ta || a.description);
  const ramB   = exRam(tb || b.description);
  const colA   = exColour(ta);
  const colB   = exColour(tb);

  // 2. HARD SPECIFICATION CONFLICT CHECKS
  // Never automatically merge products when critical specifications conflict
  if (storA && storB && storA !== storB) {
    return { matched: false, confidence: 0, status: 'no_match', conflict: 'storage', breakdown: { storage: 0 } };
  }
  if (ramA && ramB && ramA !== ramB) {
    return { matched: false, confidence: 0, status: 'no_match', conflict: 'ram', breakdown: { ram: 0 } };
  }
  if (colA && colB && colA !== colB) {
    return { matched: false, confidence: 0, status: 'no_match', conflict: 'color', breakdown: { color: 0 } };
  }
  if (a.modelNumber && b.modelNumber && String(a.modelNumber).toLowerCase() !== String(b.modelNumber).toLowerCase()) {
    return { matched: false, confidence: 0, status: 'no_match', conflict: 'modelNumber', breakdown: { modelNumber: 0 } };
  }
  if (!isBrandMatchOrAlias(brandA, brandB, ta, tb)) {
    return { matched: false, confidence: 0, status: 'no_match', conflict: 'brand', breakdown: { brand: 0 } };
  }

  let score = 0;
  const breakdown = {};

  // Brand (30 pts)
  if (brandA && brandB) {
    const s = (brandA === brandB) ? 30 : 15;
    score += s;
    breakdown.brand = s;
  } else {
    score += 15;
    breakdown.brand = 15;
  }

  // Text title similarity (35 pts)
  const ts = Math.round(tokenSim(ta, tb) * 35);
  score += ts;
  breakdown.text = ts;

  // Storage (15 pts)
  if (storA && storB && storA === storB) {
    score += 15;
    breakdown.storage = 15;
  } else if (!storA || !storB) {
    score += 8;
    breakdown.storage = 8;
  }

  // RAM (10 pts)
  if (ramA && ramB && ramA === ramB) {
    score += 10;
    breakdown.ram = 10;
  } else if (!ramA || !ramB) {
    score += 5;
    breakdown.ram = 5;
  }

  // Colour (10 pts)
  if (colA && colB && colA === colB) {
    score += 10;
    breakdown.colour = 10;
  } else if (!colA || !colB) {
    score += 5;
    breakdown.colour = 5;
  }

  const confidence = Math.min(100, Math.round(score));
  let status = 'no_match';
  let matched = false;

  if (confidence >= AUTO_MATCH_THRESHOLD) {
    status = 'auto_match';
    matched = true;
  } else if (confidence >= ADMIN_REVIEW_THRESHOLD) {
    status = 'admin_review';
    matched = false;
  }

  return { matched, confidence, status, breakdown };
};

// ── Grouping & Queueing ───────────────────────────────────────────────────────
const groupListings = (listings) => {
  const groups = [];

  for (const listing of listings) {
    let bestGroup = null;
    let bestScore = 0;

    for (const g of groups) {
      const matchRes = matchProducts(g.rep, listing);

      if (matchRes.status === 'auto_match' && matchRes.confidence > bestScore) {
        bestScore = matchRes.confidence;
        bestGroup = g;
      } else if (matchRes.status === 'admin_review') {
        // Queue candidate match for admin review asynchronously
        ProductMatchQueue.create({
          productA: { title: g.rep.title, price: g.rep.price, store: g.rep.providerName || g.rep.provider },
          productB: { title: listing.title, price: listing.price, store: listing.providerName || listing.provider },
          confidenceScore: matchRes.confidence,
          breakdown: matchRes.breakdown,
          status: 'pending',
        }).catch(() => {});
      }
    }

    if (bestGroup) {
      bestGroup.members.push({ listing, confidence: bestScore });
    } else {
      groups.push({ rep: listing, members: [{ listing, confidence: 100 }] });
    }
  }

  return groups.map(g => ({
    representative: g.rep,
    listings:       g.members.map(m => m.listing),
    avgConfidence:  Math.round(g.members.reduce((s, m) => s + m.confidence, 0) / g.members.length),
    count:          g.members.length,
  }));
};

module.exports = { matchProducts, groupListings, AUTO_MATCH_THRESHOLD, ADMIN_REVIEW_THRESHOLD };
