import Navbar from '../components/Navbar';
import CardGrid from '../components/CardGrid';

/**
 * This page will function like the normal search page but limits the search to the user's
 * Inventory. This will require a slightly modified version of the CardGrid component.
 * 
 * The process for this is as follows:
 *   -CollapsableMenu performs a normal search and returns the matching card data from scryfall.
 *   -A new function will take the data and search the inventory table for any card_id that matches
 *   an id returned by the search.
 *   -The cards intersecting cards are then displayed to the user.
 * 
 * 
 */

export default function Inventory() {
  return (
    <div>
      <Navbar />
      <CardGrid /> {/* same component, different data later */}
    </div>
  )
}