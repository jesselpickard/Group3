"use client";
import { useState, useEffect } from "react";

/**
 *  FourBox({{ value, onChange, color='White' }})
 *      -> The color prop is not utilized within this file, but instead within CheckSpread.js
 *  
 *  This component is intended for use with the color filter block in collapsible menu.
 *  I intend to utilize four primary states, as well as a fifth for disabling.
 *      1: unmarked
 *      2: included
 *      3: id
 *      4: excluded
 *      5: disabled //This is excluded from the cycle and is not likely to be used
 * 
 *  The default is unmarked and the states shall be cycled by passing travelling up the list
 *  of states by left clicking or down the list by right clicking. If an attempt is made to 
 *  pass at the edge of the states it will loop. Mobile users will not be able to go down the
 *  list and must instead cycle.
 * 
 *  ☐ ☒ 🆔 ☑ -> placeholder icons //'id' needs an icon of some sort that isnt this emoji
 *  (W|U|B|R|G) -> Should become the final row in the menu itself
 * 
 *  
 */

export const STATES = {
    UNMARKED: 'Unmarked',
    INCLUDE: 'Included',
    ID: 'ID',
    EXCLUDE: 'Excluded',
    DISABLED: 'Disabled'
};
const ORDER = [
  STATES.UNMARKED,
  STATES.INCLUDE,
  STATES.ID,
  STATES.EXCLUDE,
];

export default function FourBox({ value, onChange, color='White' }){
    const [state, setState] = useState(STATES.UNMARKED);

    const cycleForward = () => {
        const index = ORDER.indexOf(state);
        const nextIndex = (index + 1) % ORDER.length;
        const newState = ORDER[nextIndex];
        setState(newState);
        onChange?.(newState);//notifies the parent of the change
    };

    const cycleBackward = () => {
        const index = ORDER.indexOf(state);
        const prevIndex = (index - 1 + ORDER.length) % ORDER.length;
        const newState = ORDER[prevIndex];
        setState(newState);
        onChange?.(newState);
    };

    const handleClick = (e) => {
        if (e.type === "click") {
            cycleForward();
        } else if (e.type === "contextmenu") {
            e.preventDefault();
            cycleBackward();
        }
    };

    const renderIcon = () => {
    switch (state) {
      case STATES.UNMARKED:
        return "☐";
      case STATES.INCLUDE:
        return "☑";
      case STATES.ID:
        return "Id"; // placeholder
      case STATES.EXCLUDE:
        return "☒";
      default:
        return "☐";
    }
  };

  return (
    <div
      onClick={handleClick}
      onContextMenu={handleClick}
      style={{
        cursor: "pointer",
        fontSize: "20px",
        userSelect: "none",
      }}
    >
      {renderIcon()}
    </div>
  );

}

