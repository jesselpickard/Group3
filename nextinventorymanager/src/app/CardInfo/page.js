"use client";

import Navbar from '../components/Navbar.js';
import './cardStyle.css';
import { scryfallApi } from '../API/Scryfall';
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";


export default function CardInfo() {

  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [card, setCard] = useState(null);

  useEffect(() => {
    if (!id) return;

    scryfallApi.getCardById(id).then(setCard);
  }, [id]);

  if (!card) return <div>Loading...</div>;

  // const [card] = useState({
  //   id: "test",
  //   name: "Apprentice Wizard",
  //   type_line: "Creature — Debug Wizard",
  //   oracle_text: "This is a fake card used for testing.",
  //   artist: "Dan Frazier",
  //   legal:"legal",
  //   image_uris: {
  //     large: "https://cards.scryfall.io/large/front/f/e/fe75a1c1-e55e-4c49-9419-43bf5962142d.jpg"
  //   }
  // });


  return (
    <div>
      <Navbar />
      <div className="info-area">
     <div className="box image-box"> 
     <img src={card?.image_uris?.large} />
    
     </div>
     <div className="box card-info">
     <div className="card-name">
      {card.name} 
     </div>
     <div className="card-type">
      {card.type_line}
     </div>
     <div className="card-text">
      {card.oracle_text}
     </div>
     <div className="card-artist">
      <p>Illustrated by {card.artist}</p>
     </div>
     <div className="card-legal">
      {card.legal}
     </div>

     </div>
     </div>
    </div>
    
  );
}