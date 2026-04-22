import CommanderSelector from "./commander/commanderSelect";
import CommanderDisplay from "./commander/commanderDisplay";

/**
 * This file takes the deck's summary data and creates a visual representation of it.
 * The purpose of this is to clean up the page.js file to reduce clutter. I have yet to decide
 * whether I want the summary above or below the card stacks so this component will make it easy
 * to maneuver.
 */

export default function Display({deckId, currentCommander}){
    return(
        <div>
            <CommanderSelector deckId={deckId} currentCommander={currentCommander}/>
            <CommanderDisplay deckId={deckId}/>
        </div>
    )
}