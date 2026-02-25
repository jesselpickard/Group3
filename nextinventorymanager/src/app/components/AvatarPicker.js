import {useState} from 'react';
import './AvatarPicker.css';

const avatarOptions = ["🎮", "🧙", "⚔️", "🐉", "🃏", "🏆"];

export default function AvatarPicker({ selected, onSelect }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="avatar-picker">
      {avatarOptions.map((emoji) => (
        <div
          key={emoji}
          className={`avatar-option ${selected === emoji ? 'selected' : ''} ${hovered === emoji ? 'hovered' : ''}`}
          onClick={() => onSelect(emoji)}
          onMouseEnter={() => setHovered(emoji)}
          onMouseLeave={() => setHovered(null)}
        >
          {emoji}
        </div>
      ))}
    </div>
  )
}