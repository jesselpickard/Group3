"use client"

import { useState } from "react";
import "./MenuTest.css";

export default function Home() {
  //this page exists to test pieces without implementing it into another page
  return (
    <div>
      <collapsibleMenu open={open} toggle={() => setOpen(!open)} />
    </div>
 
  );
}
function collapsibleMenu(){
  const [open, setOpen] = useState(true);

  return (
    <div className="container">
      <div className={`menu ${open ? "open" : "closed"}`}>
        <button onClick={() => setOpen(!open)}>
          {open ? "←" : "→"}
        </button>

        {open && (
          <>
            <textarea>Test: filter</textarea>
          </>
        )}
      </div>

      <div className="content">
        Main Content
      </div>
    </div>
  );
}
