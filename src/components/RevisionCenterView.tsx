import React, { useState, useRef } from 'react';
import {
  Brain,
  Flame,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Lightbulb,
  Shield,
  Layers,
  Code2,
  ArrowRight,
  Star,
  Target,
  Sparkles,
  Trophy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MISSIONS } from '../data/missions';
import { SECTIONS } from '../data/sections';
import { DAILY_CHALLENGES, getTodayChallenge } from '../data/dailyChallenges';
import { RECOVERY_MISSIONS } from '../data/recoveryMissions';
import { CODE_MEMORY_CHALLENGES } from '../data/codeMemory';
import {
  UserProfile,
  Mission,
  DailyChallenge,
  RecoveryMission,
  CodeMemoryChallenge,
  MissionDOMContext,
} from '../types';
import { sound } from '../utils/sound';

interface RevisionCenterViewProps {
  profile: UserProfile;
  onSelectMission: (missionId: string, buildWithoutHelp?: boolean) => void;
  onStartRecoveryMission: (recovery: RecoveryMission) => void;
  onStartCodeMemory: (memoryId: string) => void;
  onDailyChallengePassed: (challengeKey: string, xpReward: number) => void;
}

export const RevisionCenterView: React.FC<RevisionCenterViewProps> = ({
  profile,
  onSelectMission,
  onStartRecoveryMission,
  onStartCodeMemory,
  onDailyChallengePassed,
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'replay' | 'weaknesses' | 'memory'>('daily');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(new Date().getDay());
  const [dailyHtml, setDailyHtml] = useState<string>('');
  const [dailyCss, setDailyCss] = useState<string>('');
  const [dailyJs, setDailyJs] = useState<string>('');
  const [dailyFeedback, setDailyFeedback] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);
  const [dailyTab, setDailyTab] = useState<'html' | 'css' | 'js'>('html');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');
  const dailyIframeRef = useRef<HTMLIFrameElement>(null);

  const activeDaily = DAILY_CHALLENGES.find((c) => c.dayIndex === selectedDayIndex) || getTodayChallenge();
  const isDailyCompleted = (profile.dailyChallengesCompleted || []).includes(activeDaily.dateKey);

  // Initialize daily code when day changes
  React.useEffect(() => {
    setDailyHtml(activeDaily.starterCode.html);
    setDailyCss(activeDaily.starterCode.css);
    setDailyJs(activeDaily.starterCode.js);
    setDailyFeedback(null);
  }, [selectedDayIndex]);

  const runDailyChallenge = () => {
    sound.playClick();
    if (!dailyIframeRef.current) return;

    const iframe = dailyIframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    const fullSrc = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${dailyCss}</style></head><body>${dailyHtml}<script>${dailyJs}<\/script></body></html>`;
    iframeDoc.open();
    iframeDoc.write(fullSrc);
    iframeDoc.close();

    setTimeout(async () => {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      const domContext: MissionDOMContext = {
        doc,
        html: dailyHtml,
        css: dailyCss,
        js: dailyJs,
        combined: fullSrc,
        getElement: (sel) => doc.querySelector(sel),
        getComputedStyle: (sel) => {
          const el = doc.querySelector(sel);
          return el ? (iframe.contentWindow?.getComputedStyle(el) || null) : null;
        },
        simulateClick: (sel) => {
          const el = doc.querySelector(sel) as HTMLElement | null;
          if (el) el.click();
          return true;
        },
      };

      const result = await activeDaily.validate(
        { html: dailyHtml, css: dailyCss, js: dailyJs },
        domContext
      );

      if (result.isCorrect) {
        sound.playFanfare();
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        setDailyFeedback({ success: true, message: result.message });
        onDailyChallengePassed(activeDaily.dateKey, activeDaily.xpReward);
      } else {
        sound.playError();
        setDailyFeedback({
          success: false,
          message: `${result.message} — ${result.hint || result.friendlyExplanation}`,
        });
      }
    }, 150);
  };

  // Completed missions list
  const completedMissions = MISSIONS.filter((m) =>
    profile.completedMissionIds.includes(m.id)
  );

  const filteredReplayMissions = completedMissions.filter((m) => {
    if (selectedSectionFilter === 'all') return true;
    return m.sectionId === selectedSectionFilter;
  });

  // Calculate weak areas from mistake counts
  const weakConcepts: Array<{
    key: string;
    label: string;
    mistakes: number;
    recommendedRecovery?: RecoveryMission;
  }> = [];

  const mistakeMap: Record<string, string> = {
    missing_closing_tag: 'closing_tag',
    misspelled_tag: 'heading',
    missing_attribute: 'image',
    missing_quotes: 'html_syntax',
    wrong_css_property: 'css_color',
    wrong_js_syntax: 'js_variables',
    incorrect_event_handling: 'event_listener',
    missing_element: 'heading',
  };

  if (profile.commonMistakes) {
    Object.entries(profile.commonMistakes).forEach(([cat, count]) => {
      if (count > 0) {
        const conceptKey = mistakeMap[cat] || 'heading';
        const rec =
          RECOVERY_MISSIONS[conceptKey] ||
          Object.values(RECOVERY_MISSIONS).find((r) => r.conceptKey === conceptKey) ||
          RECOVERY_MISSIONS.heading;

        weakConcepts.push({
          key: cat,
          label: cat.replace(/_/g, ' ').toUpperCase(),
          mistakes: count,
          recommendedRecovery: rec,
        });
      }
    });
  }

  // Fallback defaults if no mistakes yet
  if (weakConcepts.length === 0) {
    weakConcepts.push(
      {
        key: 'heading',
        label: 'HTML TAGS & CLOSING SYNTAX',
        mistakes: 0,
        recommendedRecovery: RECOVERY_MISSIONS.heading,
      },
      {
        key: 'css_padding',
        label: 'CSS PADDING & MARGIN',
        mistakes: 0,
        recommendedRecovery: RECOVERY_MISSIONS.css_color || RECOVERY_MISSIONS.heading,
      },
      {
        key: 'event_listener',
        label: 'JAVASCRIPT CLICK EVENTS',
        mistakes: 0,
        recommendedRecovery: RECOVERY_MISSIONS.event_listener || RECOVERY_MISSIONS.heading,
      }
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 space-y-5">
      {/* Revision Hub Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border border-indigo-900/60 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 border border-indigo-700 text-indigo-300 uppercase tracking-wider">
              🧠 REVISION CENTER & WEAK AREAS
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Skill Retention Grid</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            Daily Challenge & Memory Practice
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Replay completed missions without losing progress, tackle today's bonus challenge, eliminate weak areas, or test pure recall in <strong>🔥 Build Without Help</strong> mode.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs flex items-center gap-4 shrink-0">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Replayable</span>
            <span className="text-sm font-display font-black text-cyan-400">
              {completedMissions.length} Missions
            </span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Daily Solved</span>
            <span className="text-sm font-display font-black text-amber-400">
              {(profile.dailyChallengesCompleted || []).length} Days
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('daily');
          }}
          className={`py-2 px-3.5 rounded-xl font-display font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'daily'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-800'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-400" />
          <span>🔥 Daily Challenge</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('replay');
          }}
          className={`py-2 px-3.5 rounded-xl font-display font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'replay'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-800'
          }`}
        >
          <RotateCcw className="w-4 h-4 text-cyan-400" />
          <span>🔄 Replay Missions ({completedMissions.length})</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('weaknesses');
          }}
          className={`py-2 px-3.5 rounded-xl font-display font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'weaknesses'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>📊 My Weak Areas</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('memory');
          }}
          className={`py-2 px-3.5 rounded-xl font-display font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'memory'
              ? 'bg-indigo-500 text-slate-950 shadow-md shadow-indigo-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-800'
          }`}
        >
          <Brain className="w-4 h-4 text-indigo-400" />
          <span>🧠 Memory Drills</span>
        </button>
      </div>

      {/* TAB 1: DAILY CHALLENGE */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          {/* Day of Week Selector Bar */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 shrink-0">
              Select Day:
            </span>
            <div className="flex items-center gap-1.5">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, idx) => {
                const isSelected = selectedDayIndex === idx;
                const isToday = new Date().getDay() === idx;
                const ch = DAILY_CHALLENGES.find((c) => c.dayIndex === idx);
                const isDone = ch && (profile.dailyChallengesCompleted || []).includes(ch.dateKey);

                return (
                  <button
                    key={dayName}
                    onClick={() => {
                      sound.playClick();
                      setSelectedDayIndex(idx);
                    }}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 shadow-md'
                        : isToday
                        ? 'bg-amber-950/80 border border-amber-600 text-amber-300'
                        : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    <span>{dayName}</span>
                    {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Challenge Card */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-amber-900/50 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 uppercase tracking-wider">
                    {activeDaily.category} PROTOCOL
                  </span>
                  <span className="text-xs text-amber-400 font-semibold">
                    +{activeDaily.xpReward} Bonus XP
                  </span>
                </div>
                <h2 className="font-display font-black text-xl text-white">
                  {activeDaily.title}
                </h2>
                <p className="text-xs text-slate-300">{activeDaily.instructions}</p>
              </div>

              {isDailyCompleted ? (
                <div className="px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>COMPLETED TODAY (+{activeDaily.xpReward} XP)</span>
                </div>
              ) : (
                <button
                  onClick={runDailyChallenge}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/30 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>RUN CHALLENGE</span>
                </button>
              )}
            </div>

            {/* Feedback alert */}
            {dailyFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs font-medium ${
                  dailyFeedback.success
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                    : 'bg-rose-950/80 border-rose-500 text-rose-200'
                }`}
              >
                {dailyFeedback.message}
              </div>
            )}

            {/* Split Editor and Preview for Daily Challenge */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex flex-col rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
                <div className="flex items-center gap-1 p-2 bg-slate-900 border-b border-slate-800 text-xs">
                  <button
                    onClick={() => setDailyTab('html')}
                    className={`px-3 py-1 rounded-lg font-mono text-xs font-bold ${
                      dailyTab === 'html'
                        ? 'bg-cyan-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    HTML
                  </button>
                  <button
                    onClick={() => setDailyTab('css')}
                    className={`px-3 py-1 rounded-lg font-mono text-xs font-bold ${
                      dailyTab === 'css'
                        ? 'bg-blue-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    CSS
                  </button>
                  <button
                    onClick={() => setDailyTab('js')}
                    className={`px-3 py-1 rounded-lg font-mono text-xs font-bold ${
                      dailyTab === 'js'
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    JS
                  </button>
                </div>

                <div className="p-2 flex-1">
                  <textarea
                    value={dailyTab === 'html' ? dailyHtml : dailyTab === 'css' ? dailyCss : dailyJs}
                    onChange={(e) => {
                      if (dailyTab === 'html') setDailyHtml(e.target.value);
                      else if (dailyTab === 'css') setDailyCss(e.target.value);
                      else setDailyJs(e.target.value);
                    }}
                    className="w-full h-56 p-3 bg-transparent text-slate-200 font-mono text-xs leading-relaxed resize-none focus:outline-none"
                    placeholder="Enter challenge solution..."
                  />
                </div>
              </div>

              <div className="flex flex-col rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
                <div className="p-2 bg-slate-900 border-b border-slate-800 text-xs font-bold text-slate-300">
                  Live Challenge Preview
                </div>
                <div className="flex-1 bg-white min-h-[220px]">
                  <iframe
                    ref={dailyIframeRef}
                    title="Daily Preview"
                    sandbox="allow-scripts allow-modals allow-same-origin"
                    className="w-full h-full min-h-[220px] border-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REPLAY MISSIONS (Requirement 2) */}
      {activeTab === 'replay' && (
        <div className="space-y-4">
          {/* Section filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Filter Section:</span>
            <button
              onClick={() => setSelectedSectionFilter('all')}
              className={`py-1.5 px-3 rounded-xl font-bold transition-colors cursor-pointer ${
                selectedSectionFilter === 'all'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All Sections ({completedMissions.length})
            </button>
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setSelectedSectionFilter(sec.id)}
                className={`py-1.5 px-3 rounded-xl font-bold transition-colors cursor-pointer ${
                  selectedSectionFilter === sec.id
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {sec.title}
              </button>
            ))}
          </div>

          {filteredReplayMissions.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-cyan-400 mx-auto" />
              <h3 className="font-display font-bold text-white text-base">
                No Completed Missions in this Filter
              </h3>
              <p className="text-xs text-slate-400">
                Complete missions on the Tactical Mission Grid to unlock them here for endless practice without penalty!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredReplayMissions.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-cyan-400 uppercase tracking-wider">
                        Mission {m.missionIndexInSection}/10
                      </span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-white text-sm">{m.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1">{m.objective}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onSelectMission(m.id, false)}
                      className="py-1.5 px-3 rounded-lg bg-slate-950 hover:bg-slate-800 border border-cyan-800/80 text-cyan-300 font-display font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Replay Practice</span>
                    </button>

                    <button
                      onClick={() => onSelectMission(m.id, true)}
                      className="py-1.5 px-3 rounded-lg bg-amber-950/70 hover:bg-amber-900 border border-amber-600 text-amber-300 font-display font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      title="Test pure memory with AI mentor & hints locked (+50 XP bonus)"
                    >
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>No-Help Mode</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY WEAK AREAS & RECOVERY (Requirement 3) */}
      {activeTab === 'weaknesses' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-900/50 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h4 className="font-display font-bold text-white uppercase tracking-wider">
                Automated Mistake Analysis
              </h4>
              <p className="text-slate-300 leading-relaxed">
                The learning engine tracks syntax errors, missing tags, and styling mistakes to generate targeted drills. Complete a recovery mission to master that specific concept!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {weakConcepts.map((item, idx) => (
              <div
                key={item.key + idx}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-display font-bold text-white uppercase tracking-wider">
                      {item.label}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-rose-300">
                      {item.mistakes} Mistakes Detected
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Recommended: Practice {item.recommendedRecovery?.conceptName || item.label} drill to cement opening/closing syntax and avoid repetition penalties.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-cyan-400 font-semibold">
                    +{item.recommendedRecovery?.xpReward || 50} XP Recovery
                  </span>

                  {item.recommendedRecovery && (
                    <button
                      onClick={() => onStartRecoveryMission(item.recommendedRecovery!)}
                      className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-rose-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span>Start Recovery Drill</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MEMORY DRILLS */}
      {activeTab === 'memory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {CODE_MEMORY_CHALLENGES.map((mem) => {
            const isDone = (profile.completedCodeMemoryIds || []).includes(mem.id);

            return (
              <div
                key={mem.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-indigo-400 uppercase tracking-wider">
                      Drill #{mem.number} • {mem.difficulty}
                    </span>
                    {isDone && (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Mastered</span>
                      </span>
                    )}
                  </div>

                  <h4 className="font-display font-bold text-white text-sm">{mem.title}</h4>
                  <p className="text-xs text-slate-400">{mem.targetDescription}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-cyan-400 font-semibold">
                    +{mem.xpReward} XP Pure Recall
                  </span>

                  <button
                    onClick={() => onStartCodeMemory(mem.id)}
                    className="py-1.5 px-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Brain className="w-3.5 h-3.5" />
                    <span>Launch Recall Drill</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
