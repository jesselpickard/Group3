"use client";
import './App.css';
import Link from 'next/link';
import {useState} from 'react';
import Navbar from './components/Navbar';
import CardGrid from './components/CardGrid';


export default function Home() {
  return (
    <div>
      <Navbar />
      <CardGrid />
      <p>Testing the link to [TestPage](<Link href="/Testpage">/Testpage</Link>).</p>
    </div>
  );
}
