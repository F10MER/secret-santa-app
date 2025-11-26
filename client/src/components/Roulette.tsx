import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLanguage } from '../contexts/LanguageContext';
import { PlusIcon } from './Icons';

export function Roulette() {
  const { t } = useLanguage();
  const [participants, setParticipants] = useState<string[]>(['Участник 1', 'Участник 2', 'Участник 3']);
  const [newParticipant, setNewParticipant] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
  ];

  const addParticipant = () => {
    if (newParticipant.trim() && participants.length < 100) {
      setParticipants([...participants, newParticipant.trim()]);
      setNewParticipant('');
    }
  };

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingValue(participants[index]);
  };

  const saveEdit = (index: number) => {
    if (editingValue.trim()) {
      const newParticipants = [...participants];
      newParticipants[index] = editingValue.trim();
      setParticipants(newParticipants);
    }
    setEditingIndex(null);
    setEditingValue('');
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingValue('');
  };

  const drawWheel = (currentRotation: number = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((currentRotation * Math.PI) / 180);

    const sliceAngle = (2 * Math.PI) / participants.length;

    participants.forEach((participant, index) => {
      const startAngle = index * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const color = colors[index % colors.length];

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 3;
      
      const text = participant.length > 12 ? participant.substring(0, 12) + '...' : participant;
      ctx.fillText(text, radius * 0.65, 5);
      ctx.restore();
    });

    ctx.restore();

    // Draw pointer
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.moveTo(centerX, 10);
    ctx.lineTo(centerX - 15, 40);
    ctx.lineTo(centerX + 15, 40);
    ctx.closePath();
    ctx.fill();
  };

  React.useEffect(() => {
    drawWheel(rotation);
  }, [participants, rotation]);

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setWinner(null);

    const spinDuration = 3000;
    const minSpins = 5;
    const extraRotation = Math.random() * 360;
    const totalRotation = minSpins * 360 + extraRotation;

    const startTime = Date.now();
    const startRotation = rotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      
      // Easing function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + totalRotation * easeOut;
      
      setRotation(currentRotation % 360);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Calculate winner
        const finalRotation = currentRotation % 360;
        const sliceAngle = 360 / participants.length;
        // Pointer is at top (0 degrees), so we need to adjust
        const adjustedRotation = (360 - finalRotation) % 360;
        const winnerIndex = Math.floor(adjustedRotation / sliceAngle) % participants.length;
        
        setWinner(participants[winnerIndex]);
        setIsSpinning(false);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4 text-center">{t.randomizers.roulette}</h3>

      {/* Participants Input */}
      <div className="mb-4">
        <div className="flex gap-2 mb-3">
          <Input
            placeholder={t.randomizers.enterParticipant}
            value={newParticipant}
            onChange={(e) => setNewParticipant(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
            disabled={participants.length >= 100}
          />
          <Button
            onClick={addParticipant}
            disabled={!newParticipant.trim() || participants.length >= 100}
            size="icon"
          >
            <PlusIcon size={20} />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {participants.map((participant, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm flex items-center gap-2"
            >
              {editingIndex === index ? (
                <input
                  type="text"
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') saveEdit(index);
                    if (e.key === 'Escape') cancelEdit();
                  }}
                  onBlur={() => saveEdit(index)}
                  className="bg-background text-foreground px-2 py-0 rounded w-24 text-sm"
                  autoFocus
                />
              ) : (
                <span
                  onClick={() => startEditing(index)}
                  className="cursor-pointer hover:opacity-80"
                  title="Кликните чтобы редактировать"
                >
                  {participant}
                </span>
              )}
              {participants.length > 3 && (
                <button
                  onClick={() => removeParticipant(index)}
                  className="text-destructive hover:text-destructive/80"
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          {t.randomizers.participantCount}: {participants.length} / 100
        </p>
      </div>

      {/* Roulette Wheel */}
      <div className="flex justify-center mb-6">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="max-w-full"
        />
      </div>

      {/* Winner Display */}
      {winner && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg text-center mb-4 animate-scale-in">
          <p className="text-sm mb-1">{t.randomizers.winner}:</p>
          <p className="text-2xl font-bold">{winner}</p>
        </div>
      )}

      {/* Spin Button */}
      <Button
        onClick={spinWheel}
        disabled={isSpinning}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        size="lg"
      >
        {isSpinning ? t.randomizers.spinning : t.randomizers.spinRoulette}
      </Button>
    </Card>
  );
}
