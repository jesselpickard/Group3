let queue = Promise.resolve();
let lastRequestTime = 0;

function rateLimitedFetch(url) {//ensures we do not exceed the rate limit requested by scryfall, should be universal
  queue = queue.then(async () => {
    const now = Date.now();
    const elapsed = now - lastRequestTime;

    const delay = Math.max(0, 50 - elapsed);
    if (delay > 0) {
      await new Promise((res) => setTimeout(res, delay));
    }

    lastRequestTime = Date.now();
    return fetch(url);
  });

  return queue;
}

export const scryfallApi = {
  search(query) {//use this from other pages to query scryfall
    return rateLimitedFetch(
      `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`
    ).then((res) => res.json());
  },
 getCardById(id) {
    return rateLimitedFetch(
      `https://api.scryfall.com/cards/${id}`
    ).then((res) => res.json());
  },
  getSymbols() {
  return rateLimitedFetch(
    "https://api.scryfall.com/symbology"
  ).then(res => res.json());
},
getPrints(url) {
  return rateLimitedFetch(url).then(res => res.json());
}

};