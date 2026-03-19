import Navbar from '../components/Navbar';
import CardGrid from '../components/CardGrid';

export default function Inventory() {
  return (
    <div>
      <Navbar />
      <CardGrid /> {/* same component, different data later */}
    </div>
  )
}