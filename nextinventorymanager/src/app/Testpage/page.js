"use client"

import { useState } from "react";
import "./MenuTest.css";

export default function Home() {
  //this page exists to test pieces without implementing it into another page
  return (
    <div>
      <CollapsibleMenu/>
    </div>
  );
}
//to improve upon this, I should make components for the rows and stack them within
function CollapsibleMenu(){
  const [open, setOpen] = useState(true);

  return (
    <div className="container">
      <div className={`menu ${open ? "open" : "closed"}`}>
        <button onClick={() => setOpen(!open)}>
          {open ? "-" : "+"}
        </button>

        {open && (
          <>
            <div className = "searchContainer">
              <input type="text" placeholder="Filter:..."></input>
            </div>
            <CardTypeBox/>
          </>
        )}
      </div>

      <div className="content">
        <p>Hello world! 2</p>
      </div>
    </div>
  );
}
function CardTypeBox(){
  return(
    <select>
      <option></option>
      <option value="artifact">Artifact</option>
      <option value="battle">Battle</option>
      <option value="creature">Creature</option>
      <option value="enchantment">Enchantment</option>
      <option value="instant">Instant</option>
      <option value="kindred">Kindred</option>
      <option value="planeswalker">Planeswalker</option>
      <option value="sorcery">Sorcery</option>
    </select>
  )
}
