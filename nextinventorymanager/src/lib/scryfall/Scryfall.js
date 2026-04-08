let queue = Promise.resolve();
let lastRequestTime = 0;

const MAX_CARDS = 500; // caps any search

function rateLimitedFetch(url) {
  // ensures we do not exceed the rate limit requested by scryfall
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
  async search(query) {
    let allCards = [];
    let url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`;

    while (url && allCards.length < MAX_CARDS) {
      const res = await rateLimitedFetch(url);
      const data = await res.json();

      allCards = [...allCards, ...(data.data || [])];
      url = data.has_more ? data.next_page : null;
    }

    return { data: allCards };
  },

  async autocomplete(query) {
    if (!query || query.length < 2) return { data: [] };

    const res = await rateLimitedFetch(
      `https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    return { data: data.data || [] }; // array of card names
  },

  // fetch an exact card by name
  async namedExact(name) {
    const res = await rateLimitedFetch(
      `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`
    );
    return res.json();
  },

  // fetch a card by scryfall id
  async getCardById(id) {
    const res = await rateLimitedFetch(
      `https://api.scryfall.com/cards/${encodeURIComponent(id)}`
    );
    return res.json();
  },

  getSymbols() {
    return rateLimitedFetch("https://api.scryfall.com/symbology").then((res) =>
      res.json()
    );
  },

  getPrints(url) {
    return rateLimitedFetch(url).then((res) => res.json());
  },

  getSet(url) {
    return fetch(url).then((res) => res.json());
  },
};