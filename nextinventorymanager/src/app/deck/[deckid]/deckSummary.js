import { createClient } from "@/lib/supabase/server";

/**
 * This file takes all the items within the deck in order to summarize its data. 
 * This includes the quantity of cards, format legality, as well as insights into the mana spread
 * of the deck.
 * 
 * I need to grab the info of the cards within the deck_cards table, from the cards table 
 */

export async function getDeckCards(deckId){//attempts to access the contents of the deck and return 
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('deck_cards')
    .select('quantity, cards(card_id,name,colors,cost,type,cmc)')
    .eq('deck_id', deckId)
  if (error) throw new Error(error.message)
  return data;
}

export async function summary(deckId){
    let cards = []

    if (deckId) {
        cards = await getDeckCards(deckId);
    }
    const flat = cards.map(entry => ({//flattens the raw data into a simpler format
        ...entry.cards,
        quantity: entry.quantity
    }));
    const mana = flat.reduce((acc, card) => {//summarizes the mana in the deck
        const { cost, quantity } = card;

        const symbols = cost?.match(/\{(.*?)\}/g) || [];

        symbols.forEach(symbol => {
            const value = symbol.replace(/[{}]/g, '');

            if (!isNaN(value)) {//gathers generic costs
                acc.totalMana += Number(value) * quantity;
                return;
            }

            if (value.includes('/')) {//considers hybrid pips as 1 mana total and includes it in both pip colors
                acc.totalMana += 1 * quantity;

                const parts = value.split('/');

                parts.forEach(part => {
                if (acc.colorPips[part] !== undefined) {
                    acc.colorPips[part] += quantity;
                }
                });

                return;
            }
            acc.totalMana += 1 * quantity;//counts the regular color pip
            if (acc.colorPips[value] !== undefined) acc.colorPips[value] += quantity;
        });

        return acc;
    }, {
        totalMana: 0,
        colorPips: {
        W: 0,
        U: 0,
        B: 0,
        R: 0,
        G: 0,
        C: 0
        }
    });

    return{
        totalCards: flat.reduce((sum, card) => sum + card.quantity, 0),
        totalMana: mana.totalMana,
        totalPips: mana.colorPips,
        manaCurve: manaCurve(flat),
        cards: flat
    }
}

function manaCurve(flat) {//gathers the mana curve of the deck
  const curve = {};

  flat.forEach(card => {
    const { cmc, quantity } = card;
    const key = cmc == null ? "0" : cmc >= 7 ? "7+" : cmc;//caps it at 7 mana before doing +
    curve[key] = (curve[key] || 0) + quantity;
  });

  return curve;
}
export default async function SummaryDisplay({ deckId }) {//crude display for testing
  if (!deckId) {
    return <p>Invalid DeckId, cannot summarize data</p>;
  }

  let data;
  try {//attempts to collect data from the summary
    data = await summary(deckId);
  } catch (error) {
    return <p>Error fetching deck summary: {error.message}</p>;
  }

  return (
    <div>
      <p><strong>Total Cards:</strong> {data.totalCards}</p>
      <p><strong>Total Mana:</strong> {data.totalMana}</p>
    </div>
  );
}