'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { tmdbPosterUrl } from '@/lib/tmdb';
import type { PlannerEntry } from '@/lib/types';

interface Props {
  initialEntries: PlannerEntry[];
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const UNSCHEDULED_ZONE = 'unscheduled';

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function buildCalendarDays(year: number, month: number): { date: number; dateKey: string; inMonth: boolean }[] {
  const firstOfMonth = new Date(year, month, 1);
  const start = new Date(firstOfMonth);
  start.setDate(start.getDate() - firstOfMonth.getDay());

  const days: { date: number; dateKey: string; inMonth: boolean }[] = [];
  const cursor = new Date(start);
  for (let i = 0; i < 42; i++) {
    days.push({
      date: cursor.getDate(),
      dateKey: `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(
        cursor.getDate()
      ).padStart(2, '0')}`,
      inMonth: cursor.getMonth() === month,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export default function PlannerCalendar({ initialEntries }: Props) {
  const [entries, setEntries] = useState(initialEntries);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const todayKey = useMemo(() => {
    const now = new Date();
    return toDateKey(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const days = useMemo(() => buildCalendarDays(cursor.year, cursor.month), [cursor]);

  const unscheduled = entries.filter((e) => !e.scheduledDate);
  const byDate = useMemo(() => {
    const map = new Map<string, PlannerEntry[]>();
    for (const e of entries) {
      if (!e.scheduledDate) continue;
      const list = map.get(e.scheduledDate) ?? [];
      list.push(e);
      map.set(e.scheduledDate, list);
    }
    return map;
  }, [entries]);

  function handleDragStart(e: React.DragEvent, titleId: string) {
    e.dataTransfer.setData('text/plain', titleId);
    e.dataTransfer.effectAllowed = 'move';
  }

  async function scheduleTitle(titleId: string, dateKey: string) {
    setError(null);
    setEntries((prev) =>
      prev.map((entry) =>
        entry.title.id === titleId ? { ...entry, scheduledDate: dateKey } : entry
      )
    );
    const res = await fetch('/api/planner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title_id: titleId, scheduled_date: dateKey }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Failed to schedule');
    }
  }

  async function unscheduleTitle(titleId: string) {
    setError(null);
    setEntries((prev) =>
      prev.map((entry) => (entry.title.id === titleId ? { ...entry, scheduledDate: null } : entry))
    );
    const res = await fetch(`/api/planner/${titleId}`, { method: 'DELETE' });
    if (!res.ok) {
      setError('Failed to unschedule');
    }
  }

  function handleDrop(e: React.DragEvent, zone: string) {
    e.preventDefault();
    setDragOverZone(null);
    const titleId = e.dataTransfer.getData('text/plain');
    if (!titleId) return;

    if (zone === UNSCHEDULED_ZONE) {
      unscheduleTitle(titleId);
    } else {
      scheduleTitle(titleId, zone);
    }
  }

  function monthLabel(year: number, month: number) {
    return new Date(year, month, 1).toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    });
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() =>
              setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }))
            }
            className="btn-ghost px-3 py-1.5 text-sm"
          >
            ← Prev
          </button>
          <h2 className="text-lg font-semibold">{monthLabel(cursor.year, cursor.month)}</h2>
          <button
            onClick={() =>
              setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }))
            }
            className="btn-ghost px-3 py-1.5 text-sm"
          >
            Next →
          </button>
        </div>

        {error && (
          <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-line bg-line">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="bg-surface-2 px-2 py-1.5 text-center text-xs uppercase text-zinc-500">
              {label}
            </div>
          ))}
          {days.map((day) => {
            const dayEntries = byDate.get(day.dateKey) ?? [];
            const isToday = day.dateKey === todayKey;
            const isDragOver = dragOverZone === day.dateKey;
            return (
              <div
                key={day.dateKey}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverZone(day.dateKey);
                }}
                onDragLeave={() => setDragOverZone((z) => (z === day.dateKey ? null : z))}
                onDrop={(e) => handleDrop(e, day.dateKey)}
                className={`min-h-[92px] bg-surface p-1.5 transition-colors ${
                  day.inMonth ? '' : 'opacity-40'
                } ${isDragOver ? 'bg-accent/10 ring-1 ring-inset ring-accent' : ''}`}
              >
                <p className={`mb-1 text-xs ${isToday ? 'font-bold text-accent' : 'text-zinc-500'}`}>
                  {day.date}
                </p>
                <div className="flex flex-col gap-1">
                  {dayEntries.map((entry) => (
                    <div
                      key={entry.title.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, entry.title.id)}
                      className="cursor-grab truncate rounded bg-accent/15 px-1.5 py-0.5 text-[11px] font-medium text-accent active:cursor-grabbing"
                      title={entry.title.name}
                    >
                      {entry.title.name}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOverZone(UNSCHEDULED_ZONE);
        }}
        onDragLeave={() => setDragOverZone((z) => (z === UNSCHEDULED_ZONE ? null : z))}
        onDrop={(e) => handleDrop(e, UNSCHEDULED_ZONE)}
        className={`card w-full shrink-0 p-4 transition-colors lg:w-64 ${
          dragOverZone === UNSCHEDULED_ZONE ? 'bg-accent/10 ring-1 ring-inset ring-accent' : ''
        }`}
      >
        <h3 className="mb-1 text-sm font-semibold">To schedule</h3>
        <p className="mb-3 text-xs text-zinc-500">
          Drag a title onto a date. Drag it back here to unschedule.
        </p>
        {unscheduled.length === 0 ? (
          <p className="text-xs text-zinc-500">Nothing left to schedule.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {unscheduled.map((entry) => {
              const poster = tmdbPosterUrl(entry.title.poster_path);
              return (
                <div
                  key={entry.title.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, entry.title.id)}
                  className="flex cursor-grab items-center gap-2 rounded-lg bg-surface-2 p-2 active:cursor-grabbing"
                >
                  {poster ? (
                    <Image src={poster} alt={entry.title.name} width={28} height={42} className="rounded" />
                  ) : (
                    <div className="h-[42px] w-7 rounded bg-zinc-800" />
                  )}
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/title/${entry.title.media_type}/${entry.title.tmdb_id}`}
                      className="block truncate text-xs font-medium hover:text-accent"
                    >
                      {entry.title.name}
                    </Link>
                    <p className="text-[10px] uppercase text-zinc-500">{entry.title.media_type}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
