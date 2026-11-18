---
name: interactive-dashboard
description: "Generuje interaktivní ROI dashboard jako React artifact — vyladěný dashboard ve space designu, který vizualizuje návratnost investice, ekonomické metriky, grafy a strategický plán. Vezme čísla z cenové nabídky a udělá z nich živý interaktivní dashboard. Použij, když uživatel řekne 'udělej ROI dashboard', 'ukaž klientovi návratnost', 'vizualizuj úsporu', 'interaktivní dashboard k nabídce', nebo chce prezentovat ROI analýzu vizuálně a interaktivně místo statického PDF."
---

# Generátor interaktivního dashboardu

Skill na stavbu interaktivních React dashboardů s ROI analýzou ve vyladěném space designu.

## K čemu to je

Vyrábí **živé dashboardy**, které:
- **Vizualizují ROI** – payback křivky, break-even body, projekce až na 10 let
- **Ukazují metriky** – porovnání před/po, úspory, kapacita
- **Generují strategii** – akční plán, timeline, CTA
- **Jsou interaktivní** – živé výpočty, nastavitelný horizont, animace

> **Častý workflow — cenotvorba & time-tracking → klientský dashboard.** Tenhle skill je
> motor, který ze syrových čísel udělá vyladěný dashboard připravený pro klienta. Ke kitu
> patří i **browser extension na time-tracking**: naměř si hodiny, vyexportuj CSV a předhoď
> ho tomuhle skillu (spolu se svými sazbami), ať z toho vznikne ten krásný dashboard, který
> pošleš klientovi. Postup konkrétně pro CSV najdeš ve skillu `time-tracking-dashboard`.
> Dobře se doplňuje i s `pricing-proposal`, odkud vezmeš čísla pod tím.

## Kdy to použít

✅ **Použij, když:**
- máš z konverzace kompletní data o projektu/klientovi
- potřebuješ vizuální prezentaci ROI (ne jen PDF)
- chceš u klienta wow efekt
- data přicházejí z konverzace (ne z formuláře)

❌ **Nepoužívej, když:**
- ještě nemáš kompletní data
- stačí statický dokument
- klient interaktivní dashboard nepotřebuje

## Workflow

### 1. Vytáhni data z konverzace

Dashboard potřebuje tahle data (posbírej je z konverzace):

**O klientovi:**
- `companyName` – název firmy
- `companySize` – velikost (např. „50-100 zaměstnanců“)
- `industry` – obor / odvětví

**O procesu:**
- `processName` – název problematického procesu
- `currentTools` – nástroje, které se dneska používají
- `mainFrustration` – hlavní bolest

**Současný stav (PŘED):**
- `timePerTask` – čas na jeden úkon v hodinách (např. 2.5)
- `frequency` – frekvence: DAILY / WEEKLY / MONTHLY
- `peopleCount` – počet zapojených lidí
- `hourlyRate` – hodinová sazba zaměstnance

**Budoucí stav (PO nasazení):**
- `futureTimePerTask` – zbytková ruční práce v hodinách (může být 0)
- `futureFrequency` – frekvence: DAILY / WEEKLY / MONTHLY

**Řešení a cena:**
- `proposedSolution` – co nabízíš
- `solutionPrice` – cena nasazení (jednorázově)
- `solutionMonthlyCost` – měsíční náklad (licence/podpora)
- `hasInternalIT` – má klient vlastní IT? (true/false)

### 2. Spočítej ROI metriky

Použij přesně tenhle algoritmus:

```javascript
// 1. Násobitel podle frekvence
const getMultiplier = (freq) => {
  switch(freq) {
    case 'DAILY': return 250;   // pracovní dny
    case 'WEEKLY': return 52;   // týdnů v roce
    case 'MONTHLY': return 12;  // měsíců
  }
}

// 2. Současný stav (ručně)
const multiplier = getMultiplier(frequency);
const totalHoursPerYear = timePerTask * multiplier * peopleCount;
const annualCostManual = totalHoursPerYear * hourlyRate;
const hoursPerPerson = totalHoursPerYear / peopleCount;
const fte = totalHoursPerYear / 1800; // přepočtený úvazek (Full-Time Equivalent)

// 3. Budoucí stav (automatizovaně)
const futureMultiplier = getMultiplier(futureFrequency);
const totalHoursFuture = futureTimePerTask * futureMultiplier * peopleCount;
const manualWorkRemainingCost = totalHoursFuture * hourlyRate;

// Volitelný poplatek za managed service (přidej, když klient nemá vlastní IT).
// Do MANAGED_SERVICE_FEE dej svou měsíční částku, nebo 0, když to nechceš.
const MANAGED_SERVICE_FEE = 0;
let monthlyServiceFee = solutionMonthlyCost;
if (!hasInternalIT) {
  monthlyServiceFee += MANAGED_SERVICE_FEE;
}
const annualSoftwareCost = monthlyServiceFee * 12;

const annualCostAutomated = annualSoftwareCost + manualWorkRemainingCost;

// 4. Úspory a cash flow
const grossAnnualSavings = annualCostManual - annualCostAutomated;

// Rok 1: úspora - nasazení
const netBenefitYear1 = grossAnnualSavings - solutionPrice;

// Rok 2 a 3: čistá úspora
const netBenefitYear2 = netBenefitYear1 + grossAnnualSavings;
const netBenefitYear3 = netBenefitYear2 + grossAnnualSavings;

// 5. Doba návratnosti (měsíce)
const monthlyManualCost = annualCostManual / 12;
const monthlyAutomatedCost = annualCostAutomated / 12;
const monthlyNetCashflow = monthlyManualCost - monthlyAutomatedCost;
const paybackPeriodMonths = monthlyNetCashflow > 0
  ? (solutionPrice / monthlyNetCashflow)
  : 999;
```

### 3. Vygeneruj pitch

Z dat postav kvalitní pitch:

```javascript
const generatedPitch = {
  headline: `Strategická analýza: ${companyName}`,
  subheadline: `Automatizace procesu „${processName}" přinese roční úsporu ${formatCurrency(grossAnnualSavings)} s návratností ${paybackPeriodMonths.toFixed(1)} měsíce.`,
  reallocationStrategy: `${peopleCount} zaměstnanců ušetří dohromady ${Math.round(totalHoursPerYear)} hodin ročně (${Math.round(hoursPerPerson)} hodin na osobu), které můžou přesunout na strategičtější práci, třeba ${getSuggestedTasks(industry)}.`,
  roiStatement: `Návratnost ${paybackPeriodMonths.toFixed(1)} měsíce. Přínos za 3 roky ${formatCurrency(netBenefitYear3)}.`,
  callToAction: "Domluvit call"
};
```

### 4. Postav React artifact

## Kompletní struktura artifactu

```jsx
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceDot, ReferenceLine } from 'recharts';

// ============================================================
// KOMPONENTA POZADÍ (space téma)
// ============================================================
const Background = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    {/* Gradient hlubokého vesmíru */}
    <div className="absolute inset-0 bg-[#0B0B15] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1C1C3F] via-[#0B0B15] to-black"></div>

    {/* Hvězdy */}
    <div className="absolute top-10 left-20 w-1 h-1 bg-white rounded-full opacity-70 animate-pulse"></div>
    <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-[#D8B4FE] rounded-full opacity-60" style={{animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite'}}></div>
    <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-[#22D3EE] rounded-full opacity-50 animate-pulse"></div>

    {/* Zářící koule */}
    <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#7E22CE]/30 rounded-full blur-3xl filter mix-blend-screen" style={{animation: 'float 6s ease-in-out infinite'}}></div>
    <div className="absolute top-1/2 -right-20 w-80 h-80 bg-[#22D3EE]/20 rounded-full blur-3xl filter mix-blend-screen" style={{animation: 'float 6s ease-in-out infinite', animationDelay: '2s'}}></div>
    <div className="absolute -bottom-32 left-1/2 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-3xl filter mix-blend-screen"></div>

    {/* Zrnitý overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
  </div>
);

// ============================================================
// HLAVNÍ KOMPONENTA APLIKACE
// ============================================================
export default function App() {
  const [projectionYears, setProjectionYears] = useState(3);

  // DATA (doplň z konverzace)
  const formData = {
    companyName: "[COMPANY_NAME]",
    companySize: "[COMPANY_SIZE]",
    industry: "[INDUSTRY]",
    processName: "[PROCESS_NAME]",
    currentTools: "[CURRENT_TOOLS]",
    mainFrustration: "[MAIN_FRUSTRATION]",
    timePerTask: [TIME_PER_TASK],
    peopleCount: [PEOPLE_COUNT],
    frequency: "[FREQUENCY]", // DAILY/WEEKLY/MONTHLY
    hourlyRate: [HOURLY_RATE],
    proposedSolution: "[PROPOSED_SOLUTION]",
    solutionPrice: [SOLUTION_PRICE],
    solutionMonthlyCost: [SOLUTION_MONTHLY_COST],
    futureTimePerTask: [FUTURE_TIME_PER_TASK],
    futureFrequency: "[FUTURE_FREQUENCY]", // DAILY/WEEKLY/MONTHLY
    hasInternalIT: [HAS_INTERNAL_IT] // true/false
  };

  const roiMetrics = {
    annualCostManual: [CALCULATED],
    annualCostAutomated: [CALCULATED],
    potentialSavingsYear1: [CALCULATED],
    hoursWastedTotal: [CALCULATED],
    hoursWastedPerPerson: [CALCULATED],
    fullTimeEquivalent: [CALCULATED],
    solutionPrice: [CALCULATED],
    solutionMonthlyCost: [CALCULATED], // zahrnuje poplatek za managed service, když !hasInternalIT
    netBenefitYear1: [CALCULATED],
    netBenefitYear2: [CALCULATED],
    netBenefitYear3: [CALCULATED],
    cumulativeBenefit3Years: [CALCULATED],
    paybackPeriodMonths: [CALCULATED]
  };

  const generatedPitch = {
    headline: "[GENERATED_HEADLINE]",
    subheadline: "[GENERATED_SUBHEADLINE]",
    reallocationStrategy: "[GENERATED_STRATEGY]",
    roiStatement: "[GENERATED_ROI_STATEMENT]",
    callToAction: "Domluvit call"
  };

  // Data projekce pro graf
  const projectionData = useMemo(() => {
    const months = projectionYears * 12;
    const monthlyNetSavings = (roiMetrics.annualCostManual - roiMetrics.annualCostAutomated) / 12;
    const dataPoints = [];
    let breakEvenFound = false;

    for (let m = 0; m <= months; m++) {
      const balance = -roiMetrics.solutionPrice + (monthlyNetSavings * m);
      const isBreakEven = !breakEvenFound && balance >= 0;
      if (isBreakEven) breakEvenFound = true;

      dataPoints.push({
        monthIndex: m,
        label: m === 0 ? 'Start' : (m % 12 === 0 ? `Rok ${m/12}` : `Měsíc ${m}`),
        balance: Math.round(balance),
        isBreakEven: isBreakEven
      });
    }
    return dataPoints;
  }, [roiMetrics, projectionYears]);

  const breakEvenPoint = projectionData.find(d => d.isBreakEven);

  // Tady si nastav vlastní locale a kód měny.
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const monthlyBurn = Math.round(roiMetrics.annualCostManual / 12);
  const monthlyFee = Math.round(roiMetrics.solutionMonthlyCost);
  const monthlyHoursManual = Math.round(roiMetrics.hoursWastedTotal / 12);

  return (
    <div className="min-h-screen w-full relative text-white selection:bg-[#22D3EE] selection:text-black">
      <Background />

      <main className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        {/* HLAVIČKA */}
        <header className="flex justify-center mb-12">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#7E22CE] to-[#22D3EE] rounded-lg flex items-center justify-center shadow-lg shadow-[#7E22CE]/40">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              [YOUR_BRAND]
            </h1>
          </div>
        </header>

        {/* DASHBOARD */}
        <div className="relative z-10 w-full max-w-[1400px] mx-auto p-4 md:p-8">

          {/* Řádek hlavičky */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 opacity-0" style={{animation: 'fade-in-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'}}>
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">Přehled: {formData.companyName}</h2>
              <p className="text-gray-400 font-light">Návrh investice a analýza návratnosti</p>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <div className="bg-white/10 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full inline-block mr-2 animate-pulse"></span>
                <span className="text-xs font-mono uppercase tracking-widest text-gray-300">Živý výpočet</span>
              </div>
            </div>
          </div>

          {/* BENTO GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* LEVÝ SLOUPEC (8/12) */}
            <div className="lg:col-span-8 flex flex-col gap-6">

              {/* HORNÍ ŘADA - 3 KARTY */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* KARTA 1: REALITA NÁKLADŮ (Před/Po) */}
                <div className="bg-gradient-to-br from-[#A5F3FC] to-[#67E8F9] rounded-[32px] p-6 text-[#0B0B15] flex flex-col min-h-[240px] shadow-lg relative overflow-hidden opacity-0" style={{animation: 'fade-in-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards', animationDelay: '0s'}}>
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-4">
                      <p className="font-bold text-[#0B0B15]/60 uppercase tracking-wider text-xs">Realita nákladů</p>
                      <div className="bg-white/30 backdrop-blur-sm p-2 rounded-full">
                        <svg className="w-4 h-4 text-[#0B0B15]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Před */}
                      <div className="bg-white/30 rounded-xl p-3 backdrop-blur-sm">
                        <div className="flex justify-between text-xs font-bold opacity-60 uppercase mb-1">
                          <span>DNES (ručně)</span>
                          <span>{monthlyHoursManual}h / měs</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="font-bold text-xl text-red-700/80 line-through decoration-2">{formatCurrency(monthlyBurn)}</span>
                          <span className="text-xs font-semibold opacity-70">/měs</span>
                        </div>
                      </div>

                      {/* Šipka */}
                      <div className="flex justify-center -my-2 relative z-20">
                        <div className="bg-white rounded-full p-1 shadow-sm">
                          <svg className="w-3 h-3 text-[#0B0B15]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                      </div>

                      {/* Po */}
                      <div className="bg-white/70 rounded-xl p-3 backdrop-blur-md shadow-sm border border-white/40">
                        <div className="flex justify-between text-xs font-bold opacity-60 uppercase mb-1">
                          <span>S NÁMI (automatizovaně)</span>
                          <span className="text-green-800">{formData.futureTimePerTask > 0 ? `< ${Math.ceil(formData.futureTimePerTask * 20)}` : 0}h / měs</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="font-bold text-2xl text-[#0B0B15]">{formatCurrency(monthlyFee)}</span>
                          <span className="text-xs font-semibold opacity-70">/měs</span>
                          {!formData.hasInternalIT && (
                            <span className="ml-1 text-[10px] bg-[#0B0B15]/10 px-1 rounded">+ Managed</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KARTA 2: ANALYZOVANÝ PROCES */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 flex flex-col justify-between min-h-[240px] opacity-0" style={{animation: 'fade-in-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards', animationDelay: '0.2s'}}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-400 font-medium mb-1">Analyzovaný proces</p>
                      <h3 className="text-lg font-bold text-white leading-tight">{formData.processName}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/5">
                      <span className="text-xl">⚡️</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex -space-x-2">
                        {[...Array(Math.min(3, formData.peopleCount))].map((_, i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-gray-700 border-2 border-[#0B0B15] flex items-center justify-center text-xs">👤</div>
                        ))}
                        {formData.peopleCount > 3 && (
                          <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-[#0B0B15] flex items-center justify-center text-xs text-white">+{formData.peopleCount - 3}</div>
                        )}
                      </div>
                      <span className="text-sm text-gray-400">zapojených lidí</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
                      <div className="bg-[#F472B6] h-full rounded-full" style={{width: '95%'}}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-right">Potenciál automatizace: extrémní</p>
                  </div>
                </div>

                {/* KARTA 3: ROI METRIKY */}
                <div className="bg-gradient-to-br from-[#FFD1A9] to-[#FCA5A5] rounded-[32px] p-6 text-[#0B0B15] flex flex-col justify-between min-h-[240px] shadow-lg relative overflow-hidden opacity-0" style={{animation: 'fade-in-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards', animationDelay: '0.8s'}}>
                  <div className="absolute top-0 right-0 p-6 opacity-20">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-bold text-[#0B0B15]/60 uppercase tracking-wider text-xs">Návratnost investice</p>
                      <div className="bg-white/30 backdrop-blur-sm p-2 rounded-full">
                        <svg className="w-4 h-4 text-[#0B0B15]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-5xl font-bold tracking-tight mb-1">
                      {roiMetrics.paybackPeriodMonths > 99 ? '>12' : roiMetrics.paybackPeriodMonths.toFixed(1)}
                      <span className="text-lg ml-1 opacity-70">měs</span>
                    </h3>
                    <p className="text-sm font-semibold opacity-80">Doba návratnosti (break-even)</p>
                  </div>

                  <div className="relative z-10 mt-4">
                    <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm border border-white/20">
                      <p className="text-xs font-bold opacity-60 uppercase mb-1">Cena nasazení (setup)</p>
                      <p className="font-bold text-lg">{formatCurrency(roiMetrics.solutionPrice)}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* SEKCE S GRAFEM */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 min-h-[400px] opacity-0" style={{animation: 'fade-in-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards', animationDelay: '2.4s'}}>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">Projekce cash-flow a zisku</h3>
                    <p className="text-sm text-gray-400">Kumulativní zisk v čase (interaktivní)</p>
                  </div>
                  <select
                    value={projectionYears}
                    onChange={(e) => setProjectionYears(Number(e.target.value))}
                    className="bg-white/5 border border-white/10 rounded-lg text-sm px-4 py-2 text-gray-300 outline-none hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <option value={1}>Horizont: 1 rok</option>
                    <option value={3}>Horizont: 3 roky</option>
                    <option value={5}>Horizont: 5 let</option>
                    <option value={10}>Horizont: 10 let</option>
                  </select>
                </div>

                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} vertical={false} />

                      <XAxis
                        dataKey="monthIndex"
                        stroke="#6B7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                        tickFormatter={(val) => {
                          if (val === 0) return 'Start';
                          if (projectionYears <= 1) return `M${val}`;
                          if (val % 12 === 0) return `R${val/12}`;
                          return '';
                        }}
                      />

                      <YAxis
                        stroke="#6B7280"
                        fontSize={12}
                        tickFormatter={(val) => `${val/1000}k`}
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                      />

                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-[#0B0B15] border border-white/10 rounded-xl p-4 shadow-xl">
                                <p className="text-gray-400 text-xs mb-1 font-bold uppercase tracking-wider">{data.label}</p>
                                <p className={`text-xl font-bold ${data.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {formatCurrency(data.balance)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {data.balance < 0 ? 'Investice se pořád splácí' : 'Čistý zisk v kapse'}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />

                      <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="3 3" opacity={0.5} />

                      {breakEvenPoint && (
                        <>
                          <ReferenceDot
                            x={breakEvenPoint.monthIndex}
                            y={0}
                            r={6}
                            fill="#FCA5A5"
                            stroke="#fff"
                            strokeWidth={2}
                          />
                          <ReferenceLine
                            x={breakEvenPoint.monthIndex}
                            stroke="#FCA5A5"
                            strokeDasharray="3 3"
                            label={{ position: 'top', value: 'Break-even', fill: '#FCA5A5', fontSize: 10 }}
                          />
                        </>
                      )}

                      <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="#22D3EE"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorBalance)"
                        activeDot={{ r: 8, strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* PRAVÝ SLOUPEC (4/12) */}
            <div className="lg:col-span-4 flex flex-col h-full gap-6">

              {/* VAROVÁNÍ - cena nečinnosti */}
              <div className="bg-gray-800/80 backdrop-blur-xl border border-red-500/20 rounded-[32px] p-6 shadow-inner shadow-red-500/5 opacity-0" style={{animation: 'fade-in-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards', animationDelay: '1.6s'}}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                    <span className="animate-pulse text-red-400">●</span>
                  </div>
                  <div>
                    <p className="text-xs text-red-400 uppercase tracking-widest font-bold">Varování</p>
                    <p className="text-sm text-gray-300">Cena nečinnosti</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white mb-1">{formatCurrency(monthlyBurn)}</p>
                <p className="text-xs text-gray-500">vyhozeno <span className="text-gray-300">každý měsíc</span></p>
              </div>

              {/* STRATEGICKÁ NABÍDKA */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 flex-1 flex flex-col opacity-0" style={{animation: 'fade-in-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards', animationDelay: '3.2s'}}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white">Strategická nabídka</h3>
                  <div className="bg-white/10 p-2 rounded-full cursor-pointer hover:bg-white/20 transition-all">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                <div className="space-y-6 overflow-y-auto pr-2 max-h-[600px]">

                  {/* Bod 1: Diagnóza */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-red-400 rounded-full mt-1.5"></div>
                      <div className="w-0.5 bg-white/10 h-full mt-1"></div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">Diagnóza</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">{formData.mainFrustration}</p>
                      <div className="mt-2 text-xs bg-red-500/10 text-red-300 inline-block px-2 py-1 rounded border border-red-500/20">
                        Ztráta {formData.timePerTask}h / úkon
                      </div>
                    </div>
                  </div>

                  {/* Bod 2: Nasazení */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-[#22D3EE] rounded-full mt-1.5"></div>
                      <div className="w-0.5 bg-white/10 h-full mt-1"></div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">Nasazení: {formData.proposedSolution}</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">{generatedPitch.subheadline}</p>
                      <div className="mt-3 bg-white/5 rounded-lg p-3 border border-white/5">
                        <div className="flex justify-between items-center text-xs mb-2 pb-2 border-b border-white/5">
                          <span className="text-gray-400">Nasazení (setup)</span>
                          <span className="text-white font-bold">{formatCurrency(roiMetrics.solutionPrice)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">Provoz (licence/podpora)</span>
                          <span className="text-[#22D3EE] font-bold">{formatCurrency(roiMetrics.solutionMonthlyCost)} / měs</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bod 3: Uvolněná kapacita */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-purple-400 rounded-full mt-1.5"></div>
                      <div className="w-0.5 bg-white/10 h-full mt-1"></div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">Uvolněná kapacita</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">{generatedPitch.reallocationStrategy}</p>
                    </div>
                  </div>

                  {/* Bod 4: Další kroky */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-white rounded-full mt-1.5 shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                    </div>
                    <div className="w-full">
                      <h4 className="text-sm font-bold text-white mb-3">Další kroky</h4>
                      <a
                        href="[YOUR_BOOKING_LINK]"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-white text-[#0B0B15] font-bold text-center py-3 rounded-xl hover:bg-gray-200 transition-colors shadow-lg text-sm"
                      >
                        {generatedPitch.callToAction} ➔
                      </a>
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>
      </main>

      {/* Animace */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
```

## Důležitá pravidla

### 1. Konzistence designu

**Barvy (přesné hex kódy):**
- Space Dark: `#0B0B15`
- Space Gray: `#1C1C3F`
- Nebula Purple: `#7E22CE`, `#A855F7`, `#D8B4FE`
- Accent Cyan: `#22D3EE`
- Accent Pink: `#F472B6`
- Accent Orange: `#FB923C`

**Gradientové karty:**
- Cyan (Realita nákladů): `from-[#A5F3FC] to-[#67E8F9]`
- Orange (ROI): `from-[#FFD1A9] to-[#FCA5A5]`
- Pink (akcent): `from-[#F9A8D4] to-[#FDA4AF]`

**Glass Morphism:**
```
bg-white/5 backdrop-blur-xl border border-white/10
```

**Border Radius:**
- Karty: `rounded-[32px]`
- Malé prvky: `rounded-xl`, `rounded-lg`, `rounded-full`

### 2. Časování animací

```
Hlavička: 0s
Karta 1 (Realita nákladů): 0s
Karta 2 (Proces): 0.2s
Karta 3 (ROI): 0.8s
Varování: 1.6s
Graf: 2.4s
Strategická nabídka: 3.2s
```

### 3. Struktura layoutu

- **Bento Grid**: `grid-cols-1 lg:grid-cols-12`
- **Levý sloupec**: `lg:col-span-8` (metriky + graf)
- **Pravý sloupec**: `lg:col-span-4` (varování + nabídka)
- **Horní řada**: 3 karty v `grid-cols-1 md:grid-cols-3`

### 4. Konfigurace Recharts

- **ID gradientu**: `colorBalance`
- **Barvy**: stroke `#22D3EE`, grid `#374151`
- **Break-even**: červený bod + čárkovaná čára `#FCA5A5`
- **Tooltip**: tmavé pozadí `#0B0B15` s okrajem

### 5. Responzivní breakpointy

```jsx
// Text
text-2xl md:text-3xl

// Směr flexu
flex-col md:flex-row

// Grid
grid-cols-1 md:grid-cols-3

// Rozpětí sloupců
lg:col-span-8
lg:col-span-4
```

## Checklist před generováním

- [ ] Jsou z konverzace vytažená všechna data?
- [ ] Sedí výpočet ROI?
- [ ] Obsahuje pitch konkrétní čísla (ne placeholdery)?
- [ ] Je zahrnutá komponenta Background?
- [ ] Jsou hotové všechny 3 karty v horní řadě?
- [ ] Má graf správná data projekce?
- [ ] Jsou správně nastavené delaye animací?
- [ ] Sedí barvy přesně s tématem (hex kódy)?
- [ ] Má timeline v pravém sloupci 4 kroky?
- [ ] Je naimportovaný Recharts (v artifact prostředí z CDN)?
- [ ] Je artifact jeden JSX soubor?
- [ ] Jsou název značky, odkaz na rezervaci, locale a měna nastavené na tvoje hodnoty?

## Výstup

Vygeneruj **jednosouborový .jsx artifact**, který má:
- ✅ kompletní komponentu Background
- ✅ všechna data inline (z konverzace)
- ✅ plnou logiku dashboardu
- ✅ interaktivní graf (Recharts)
- ✅ design ve space tématu
- ✅ všechny animace a styly
- ✅ žádné externí závislosti (kromě CDN)

**Artifact musí být:**
- samostatný JSX soubor
- hned plně funkční
- bez volání externích API
- s natvrdo zapsanými daty z konverzace
