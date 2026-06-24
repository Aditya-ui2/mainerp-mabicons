import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiChevronLeft, FiChevronRight, FiCheckCircle, FiClock, FiSun } from 'react-icons/fi';
import { getCalendarEvents } from '../../../service/api';

const CalendarTab = () => {
  const [events, setEvents] = useState({ tasks: [], leaves: [], attendance: [] });
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCalendarEvents(month, year);
      setEvents(res.events || { tasks: [], leaves: [], attendance: [] });
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const changeMonth = (dir) => {
    let m = month + dir, y = year;
    if (m > 12) { m = 1; y += 1; }
    if (m < 1) { m = 12; y -= 1; }
    setMonth(m); setYear(y);
  };

  const monthName = new Date(year, month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  // Build calendar grid
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  // Compute events per day
  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const items = [];
    (events.tasks || []).forEach(t => {
      if (t.dueDate?.startsWith(dateStr)) items.push({ type: 'task', title: t.title, status: t.status });
    });
    (events.leaves || []).forEach(l => {
      const start = new Date(l.startDate);
      const end = new Date(l.endDate);
      const check = new Date(dateStr);
      if (check >= start && check <= end) items.push({ type: 'leave', title: `${l.leaveType} Leave`, status: l.status });
    });
    (events.attendance || []).forEach(a => {
      if (a.date === dateStr) items.push({ type: 'attendance', status: a.status });
    });
    return items;
  };

  const today = new Date();
  const isToday = (day) => day && today.getDate() === day && today.getMonth() + 1 === month && today.getFullYear() === year;

  const dotColors = { task: '#3b82f6', leave: '#f59e0b', attendance: '#10b981' };

  const selectedEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
        <p className="text-gray-500 text-sm mt-1">Your tasks, leaves & attendance at a glance</p>
      </div>

      {/* Month Nav */}
      <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-lg hover:bg-gray-100">
          <FiChevronLeft style={{ width: '20px', height: '20px', color: '#6b7280' }} />
        </button>
        <span className="font-semibold text-gray-800">{monthName}</span>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-lg hover:bg-gray-100">
          <FiChevronRight style={{ width: '20px', height: '20px', color: '#6b7280' }} />
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse h-64 rounded-2xl bg-gray-200" />
      ) : (
        <>
          {/* Calendar Grid */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                const dayEvents = getEventsForDay(day);
                const isSel = day === selectedDate;
                return (
                  <button
                    key={idx}
                    onClick={() => day && setSelectedDate(day === selectedDate ? null : day)}
                    disabled={!day}
                    className={`relative p-2 rounded-xl text-sm font-medium transition-all min-h-[48px] flex flex-col items-center justify-start gap-1
                      ${!day ? '' : 'hover:bg-gray-50 cursor-pointer'}
                      ${isToday(day) ? 'ring-2 ring-indigo-500' : ''}
                    `}
                    style={isSel ? { background: '#6366f1', color: '#fff' } : {}}
                  >
                    {day && (
                      <>
                        <span>{day}</span>
                        {dayEvents.length > 0 && (
                          <div className="flex gap-0.5">
                            {[...new Set(dayEvents.map(e => e.type))].map(t => (
                              <span
                                key={t}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ background: isSel ? '#fff' : dotColors[t] }}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 px-1">
            {[
              { color: '#3b82f6', label: 'Task' },
              { color: '#f59e0b', label: 'Leave' },
              { color: '#10b981', label: 'Attendance' },
            ].map(l => (
              <span key={l.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                {l.label}
              </span>
            ))}
          </div>

          {/* Selected Date Events */}
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
            >
              <h3 className="font-semibold text-gray-900 mb-3">
                {new Date(year, month - 1, selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long' })}
              </h3>
              {selectedEvents.length === 0 ? (
                <p className="text-gray-400 text-sm">No events on this day</p>
              ) : (
                <div className="space-y-2">
                  {selectedEvents.map((ev, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50">
                      <span className="w-2 h-8 rounded-full" style={{ background: dotColors[ev.type] }} />
                      <div>
                        <p className="text-sm font-medium text-gray-800 capitalize">
                          {ev.type === 'attendance' ? `Attendance: ${ev.status}` : ev.title}
                        </p>
                        {ev.status && ev.type !== 'attendance' && (
                          <p className="text-xs text-gray-500 capitalize">{ev.status}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default CalendarTab;
