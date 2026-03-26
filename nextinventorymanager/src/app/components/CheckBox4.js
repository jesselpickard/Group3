"use client";
import { useState, useEffect } from "react";

/**
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
 *  ☐ ☒ id ☑ -> placeholder icons //'id' needs an icon of some sort
 *  (W|U|B|R|G) -> Should become the final row in the menu itself
 */

const STATES = {
    UNMARKED: 'Unmarked',
    INCLUDE: 'Included',
    ID: 'ID',
    EXCLUDE: 'Excluded',
    DISABLED: 'Disabled'
}

export default function box(){
    const [state, setState] = usestate(UNMARKED);

    const handleClick = (e) => {
        if(e.type==='click'){//left click
            switch(state){
                case state.UNMARKED:
                    state.setState.INCLUDE;
                    break;
                case state.INCLUDE:
                    state.setState.ID;
                    break;
                case state.ID:
                    state.setState.EXCLUDE;
                    break;
                case state.EXCLUDE:
                    state.setState.UNMARKED;
                    break;
                default: 
                    state.setState.UNMARKED;
            }
        } else if(e.type==='contextmenu'){//right click - must make sure to prevent system default
            switch(state){
                case state.UNMARKED:
                    state.setState.EXCLUDE;
                    break;
                case state.INCLUDE:
                    state.setState.UNMARKED;
                    break;
                case state.ID:
                    state.setState.INCLUDE;
                    break;
                case state.EXCLUDE:
                    state.setState.ID;
                    break;
                default:
                    state.setState.UNMARKED;
            }
        }
    }
}

function getState() {
    
}