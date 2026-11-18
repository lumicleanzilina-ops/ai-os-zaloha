import React, { useState } from 'react';
import { Calendar, Clock, Briefcase, TrendingUp, Banknote } from 'lucide-react';

const TimeTrackingDashboard = () => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  // TODO: Naplň timeData z CSV — jen projekty, které uživatel vybral v kroku 0.
  const timeData = {
    // Formát: 'YYYY-MM-DD': { hours: X.XX, amount: X, projects: [{ project, session, hours, amount }] }
  };

  // TODO: Spočítej projectHours a projectAmounts z timeData.
  const projectHours = {
    // Formát: 'Project Name': celkem hodin
  };
  const projectAmounts = {
    // Formát: 'Project Name': celková částka
  };

  // Měna + formátování všech částek na dashboardu.
  // TODO: nastav podle CSV, nebo se zeptej uživatele (např. 'Kč', '€', '$').
  const currency = 'Kč';
  const formatAmount = (n) => `${Math.round(n).toLocaleString()} ${currency}`;

  // TODO: Doplň správné hodnoty.
  const totalHours = 0;
  const totalAmount = 0; // součet všech částek z CSV
  const totalPD = totalHours / 8;
  const workingDays = Object.keys(timeData).length;
  const avgHoursPerDay = workingDays > 0 ? totalHours / workingDays : 0;

  const getFilteredHours = (dateStr) => {
    const dayData = timeData[dateStr];
    if (!dayData) return 0;

    if (!selectedProject) return dayData.hours;

    return dayData.projects
      .filter(p => p.project === selectedProject)
      .reduce((sum, p) => sum + p.hours, 0);
  };

  const getFilteredAmount = (dateStr) => {
    const dayData = timeData[dateStr];
    if (!dayData) return 0;

    if (!selectedProject) return dayData.amount || 0;

    return dayData.projects
      .filter(p => p.project === selectedProject)
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  };

  const filteredTotalHours = selectedProject
    ? projectHours[selectedProject] || 0
    : totalHours;

  const filteredTotalAmount = selectedProject
    ? projectAmounts[selectedProject] || 0
    : totalAmount;

  const filteredTotalPD = filteredTotalHours / 8;

  const filteredWorkingDays = selectedProject
    ? Object.entries(timeData).filter(([_, data]) =>
        data.projects.some(p => p.project === selectedProject)
      ).length
    : workingDays;

  const filteredAvgHours = filteredWorkingDays > 0
    ? filteredTotalHours / filteredWorkingDays
    : 0;

  const getColorForHours = (hours) => {
    if (!hours) return 'bg-gray-800 border-gray-700';
    if (hours < 4) return 'bg-blue-900/40 border-blue-600/30 hover:bg-blue-800/50';
    if (hours < 7) return 'bg-emerald-900/40 border-emerald-600/30 hover:bg-emerald-800/50';
    if (hours < 9) return 'bg-green-900/40 border-green-600/30 hover:bg-green-800/50';
    if (hours < 11) return 'bg-amber-900/40 border-amber-600/30 hover:bg-amber-800/50';
    return 'bg-red-900/40 border-red-600/30 hover:bg-red-800/50';
  };

  const getIntensityText = (hours) => {
    if (!hours) return 'Volno';
    if (hours < 4) return 'Lehký den';
    if (hours < 7) return 'Střední';
    if (hours < 9) return 'Standard';
    if (hours < 11) return 'Náročný';
    return 'Maximum';
  };

  // TODO: Doplň správný měsíc, rok, počet dnů a den v týdnu, kterým měsíc začíná.
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const firstDayOfWeek = 3; // Den v týdnu, kterým měsíc začíná (0=Po, 1=Út, ...)
  const monthName = 'leden';
  const monthNumber = 1; // Číslo měsíce od 1, musí sedět s monthName
  const year = 2026;

  // TODO: Přizpůsob barvy reálným projektům v CSV.
  const projectColors = {
    'Project A': 'bg-purple-500/20 border-purple-500/40',
    'Project B': 'bg-blue-500/20 border-blue-500/40',
    'Project C': 'bg-green-500/20 border-green-500/40',
    'Project D': 'bg-orange-500/20 border-orange-500/40',
    'Project E': 'bg-pink-500/20 border-pink-500/40',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hlavička */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Calendar className="w-10 h-10 text-blue-400" />
            Přehled odpracovaného času
          </h1>
          <p className="text-gray-400">{monthName} {year} - Hours worked overview</p>
        </div>

        {/* Horní sekce — statistiky a projekty vedle sebe */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Statistické karty */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-2">Souhrn</h3>
            <div className="space-y-3">
              <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 rounded-lg p-4 border border-blue-500/30 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span className="text-blue-300 text-sm font-medium">
                      {selectedProject ? `${selectedProject}` : 'Celkem hodin'}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-white">{filteredTotalHours.toFixed(2)}h</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 rounded-lg p-4 border border-emerald-500/30 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-300 text-sm font-medium">Člověkodny (8 h/den)</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{filteredTotalPD.toFixed(2)} PD</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 rounded-lg p-4 border border-purple-500/30 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-300 text-sm font-medium">Average / working day</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{filteredAvgHours.toFixed(2)}h</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-900/40 to-amber-800/20 rounded-lg p-4 border border-amber-500/30 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-amber-400" />
                    <span className="text-amber-300 text-sm font-medium">
                      {selectedProject ? `${selectedProject} — amount` : 'Total amount'}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-white">{formatAmount(filteredTotalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filtr projektů */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Projekty</h3>
              {selectedProject && (
                <button
                  onClick={() => {
                    setSelectedProject(null);
                    setSelectedDay(null);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-xs"
                >
                  Zobrazit vše
                </button>
              )}
            </div>
            <div className="space-y-2">
              {Object.entries(projectColors).map(([project, color]) => {
                const hours = projectHours[project] || 0;
                const pd = (hours / 8).toFixed(2);
                const isSelected = selectedProject === project;

                return (
                  <button
                    key={project}
                    onClick={() => {
                      setSelectedProject(isSelected ? null : project);
                      setSelectedDay(null);
                    }}
                    className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${color} ${
                      isSelected
                        ? 'ring-2 ring-blue-400/50 scale-[1.02] shadow-xl'
                        : 'hover:scale-[1.02] hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="text-white font-bold text-sm">{project}</div>
                        <div className="text-gray-300 text-xs mt-0.5">{pd} PD</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold text-lg">{hours.toFixed(1)}h</div>
                        <div className="text-amber-300 text-xs font-semibold mt-0.5">{formatAmount(projectAmounts[project] || 0)}</div>
                        {isSelected && <div className="text-blue-300 text-xs">✓ Active</div>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Indikátor aktivního filtru */}
            {selectedProject && (
              <div className="p-2 bg-blue-900/30 border-2 border-blue-500/40 rounded-lg">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                    <span className="text-white font-medium">
                      Filter: <span className="font-bold text-blue-300">{selectedProject}</span>
                    </span>
                  </div>
                  <div className="text-gray-300">
                    {filteredWorkingDays} {filteredWorkingDays === 1 ? 'day' : 'days'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Kalendář */}
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 shadow-2xl mb-6">
          <div className="mb-3">
            <h2 className="text-xl font-bold text-white mb-2">Calendar - {monthName} {year}</h2>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded bg-gray-800 border border-gray-700"></div>
                <span>Volno</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded bg-blue-900/40 border border-blue-600/30"></div>
                <span>&lt;4h</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded bg-emerald-900/40 border border-emerald-600/30"></div>
                <span>4-7h</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded bg-green-900/40 border border-green-600/30"></div>
                <span>7-9h</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded bg-amber-900/40 border border-amber-600/30"></div>
                <span>9-11h</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded bg-red-900/40 border border-red-600/30"></div>
                <span>&gt;11h</span>
              </div>
            </div>
          </div>

          {/* Hlavičky dnů v týdnu */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-400 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Mřížka kalendáře */}
          <div className="grid grid-cols-7 gap-2">
            {/* Prázdné buňky za dny před začátkem měsíce */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}

            {/* Dny */}
            {daysInMonth.map(day => {
              const dateStr = `${year}-${String(monthNumber).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const hours = getFilteredHours(dateStr);
              const hasData = hours > 0;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(hasData ? dateStr : null)}
                  disabled={!hasData}
                  className={`aspect-square rounded-lg border-2 transition-all duration-200 ${getColorForHours(hours)} ${
                    selectedDay === dateStr ? 'ring-4 ring-blue-400/50 scale-105' : ''
                  } ${!hasData ? 'opacity-30 cursor-not-allowed' : ''}`}
                >
                  <div className="h-full flex flex-col items-center justify-center p-1">
                    <div className="text-xl font-bold text-white mb-0.5">{day}</div>
                    {hours > 0 && (
                      <div className="text-xs font-semibold text-gray-300 bg-black/30 px-1.5 py-0.5 rounded">
                        {hours.toFixed(1)}h
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail vybraného dne */}
        {selectedDay && timeData[selectedDay] && (
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-6 border border-gray-600/50 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {new Date(selectedDay).toLocaleDateString('cs-CZ', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </h3>
                <div className="flex items-center gap-3 text-gray-400">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {selectedProject
                      ? `${getFilteredHours(selectedDay).toFixed(1)}h on ${selectedProject}`
                      : `${timeData[selectedDay].hours}h total`
                    }
                  </span>
                  <span className="flex items-center gap-2 text-amber-300 font-semibold">
                    <Banknote className="w-4 h-4" />
                    {formatAmount(getFilteredAmount(selectedDay))}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {getIntensityText(getFilteredHours(selectedDay))}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {timeData[selectedDay].projects
                .filter(proj => !selectedProject || proj.project === selectedProject)
                .map((proj, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 ${projectColors[proj.project] || 'bg-gray-700/30 border-gray-600/30'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-white text-lg">{proj.project}</h4>
                      <div className="text-right">
                        <span className="text-xl font-bold text-white">{proj.hours}h</span>
                        <div className="text-amber-300 text-sm font-semibold">{formatAmount(proj.amount || 0)}</div>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm">{proj.session}</p>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeTrackingDashboard;
