"use client"

import { useState } from "react";
import { scryfallApi } from '../API/Scryfall';
import "./Menu.css";





export default function CollapsibleMenu({setCards}) {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState("");

  const CardSearch = async () => {
    const data = await scryfallApi.search(query);
    setCards(data.data || []);
  };

  return (
    <div className="menu" style={{width: open ? "300px" : "50px", transition: "width 0.3s",}}>
      {/* Toggle button */}
      <button onClick={() => setOpen(!open)}>
        {open ? "-" : "+"}
      </button>
      {/* Menu content*/}
      {open && (
        <div className="content">
          <div className="searchContainer">
            <input type="text" placeholder="Filter:..." value={query} 
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {if (e.key === "Enter") {CardSearch();}}}
              />
          </div>
          <CardTypeBox />
          <SubtypeSearch />
          <Row itemA={<CardTypeBox />} itemB={<SubtypeSearch />} />
        </div>
      )}
    </div>
  );
}
function CardTypeBox(){
  return(
    <select>
      <option>Card type</option>
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
function SubtypeSearch(){
  return(
    <div className="subtypeSearch">
      <input type="text" className="subtypeSearch.input" placeHolder="Subtype..."></input>
    </div>
  )
}

export function Row({itemA,itemB}){
  return(
    <div className="row">
      <div className="itemA">
        {itemA}
      </div>
      <div className="itemB">
        {itemB}
      </div>
    </div>
  )
}
