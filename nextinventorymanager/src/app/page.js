"use client";
import './App.css';
import Link from 'next/link';
//import {useState} from 'react';
import Navbar from './components/Navbar';
import CardGrid from './components/CardGrid';
import Menu from './components/CollapsibleMenu';


export default function Home() {
  return (
    <div>
      <CardGrid />
      <p>Link to test page [TestPage](<Link href="/Testpage">/Testpage</Link>)(<Link href="/CardInfo">/CardInfo</Link>).</p>
    </div>
  );
}

//      <CardGrid />
  //    <Menu />