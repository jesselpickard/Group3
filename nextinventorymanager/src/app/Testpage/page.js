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
          </>
        )}
      </div>

      <div className="content">
        <p>Hello world! 2</p>
      </div>
    </div>
  );
}
