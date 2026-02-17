import { useEffect, useMemo, useState } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui';

const readinessScore = 72;
const readinessMax = 100;

const skillData = [
  { skill: 'DSA', score: 75 },
  { skill: 'System Design', score: 60 },
  { skill: 'Communication', score: 80 },
  { skill: 'Resume', score: 85 },
  { skill: 'Aptitude', score: 70 },
];

const assessments = [
  { title: 'DSA Mock Test', time: 'Tomorrow, 10:00 AM' },
  { title: 'System Design Review', time: 'Wed, 2:00 PM' },
  { title: 'HR Interview Prep', time: 'Friday, 11:00 AM' },
];

const weeklyActivity = [
  { day: 'Mon', active: true },
  { day: 'Tue', active: true },
  { day: 'Wed', active: false },
  { day: 'Thu', active: true },
  { day: 'Fri', active: true },
  { day: 'Sat', active: false },
  { day: 'Sun', active: true },
];

export function DashboardPage() {
  const radius = 86;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = useMemo(
    () => circumference - (readinessScore / readinessMax) * circumference,
    [circumference],
  );
  const [dashOffset, setDashOffset] = useState(circumference);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setDashOffset(targetOffset);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [targetOffset]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Overall Readiness</CardTitle>
          <CardDescription>Your current placement preparedness snapshot.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center pb-8">
          <div className="relative h-56 w-56">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 220 220" role="img" aria-label="Readiness score gauge">
              <circle cx="110" cy="110" r={radius} stroke="rgb(226 232 240)" strokeWidth="16" fill="none" />
              <circle
                cx="110"
                cy="110"
                r={radius}
                stroke="hsl(245 58% 51%)"
                strokeWidth="16"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 900ms ease-in-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="text-4xl font-bold text-slate-900">
                {readinessScore}
                <span className="text-xl text-slate-500">/100</span>
              </p>
              <p className="mt-1 text-sm font-medium text-slate-600">Readiness Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skill Breakdown</CardTitle>
          <CardDescription>Performance overview across key placement dimensions.</CardDescription>
        </CardHeader>
        <CardContent className="h-72 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={skillData} outerRadius="70%">
              <PolarGrid stroke="rgb(203 213 225)" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: 'rgb(71 85 105)', fontSize: 12 }} />
              <Tooltip />
              <Radar
                dataKey="score"
                stroke="hsl(245 58% 51%)"
                fill="hsl(245 58% 51%)"
                fillOpacity={0.25}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Continue Practice</CardTitle>
          <CardDescription>Resume your most recent session.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-slate-500">Last Topic</p>
            <p className="text-lg font-semibold text-slate-900">Dynamic Programming</p>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
              <span>3/10 completed</span>
              <span>30%</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-200">
              <div className="h-2.5 w-[30%] rounded-full bg-primary" />
            </div>
          </div>
          <button
            type="button"
            className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Continue
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Goals</CardTitle>
          <CardDescription>Track consistency and weekly target completion.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <p className="text-sm font-medium text-slate-700">Problems Solved: 12/20 this week</p>
            <div className="mt-2 h-2.5 rounded-full bg-slate-200">
              <div className="h-2.5 w-[60%] rounded-full bg-primary" />
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {weeklyActivity.map((item) => (
              <div key={item.day} className="flex flex-col items-center gap-2">
                <div
                  className={
                    item.active
                      ? 'h-8 w-8 rounded-full bg-primary/90 ring-2 ring-primary/20'
                      : 'h-8 w-8 rounded-full bg-slate-200'
                  }
                />
                <span className="text-xs text-slate-500">{item.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Upcoming Assessments</CardTitle>
          <CardDescription>Stay prepared for your next critical evaluation milestones.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {assessments.map((item) => (
              <li key={item.title} className="rounded-xl border border-slate-200 px-4 py-3">
                <p className="font-medium text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-600">{item.time}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
