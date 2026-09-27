import React, { useState, useRef, useEffect } from 'react';
import {
  FolderCode,
  CheckCircle2,
  Circle,
  Play,
  Download,
  Share2,
  ExternalLink,
  Flame,
  Bot,
  Lightbulb,
  Maximize2,
  ArrowLeft,
  Sparkles,
  Layers,
  Code2,
  FileCode,
  X,
  Smartphone,
  Eye,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PROJECTS } from '../data/projects';
import { ProjectDefinition, UserProfile, CompletedProject, MissionDOMContext } from '../types';
import { sound } from '../utils/sound';
import { downloadProjectZip, shareProject } from '../utils/projectDownloader';

interface ProjectModeViewProps {
  profile: UserProfile;
  onSaveCompletedProject: (project: CompletedProject) => void;
  onOpenTutor?: (context: {
    userCode: any;
    missionTitle: string;
    missionGoal: string;
    missionConcept: string;
  }) => void;
}

export const ProjectModeView: React.FC<ProjectModeViewProps> = ({
  profile,
  onSaveCompletedProject,
  onOpenTutor,
}) => {
  const [selectedProject, setSelectedProject] = useState<ProjectDefinition | null>(null);
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const [html, setHtml] = useState<string>('');
  const [css, setCss] = useState<string>('');
  const [js, setJs] = useState<string>('');
  const [buildWithoutHelp, setBuildWithoutHelp] = useState<boolean>(false);
  const [requirementsStatus, setRequirementsStatus] = useState<Record<string, boolean>>({});
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [showSharingCard, setShowSharingCard] = useState<boolean>(false);
  const [showLivePreviewModal, setShowLivePreviewModal] = useState<boolean>(false);
  const [activeHintIndex, setActiveHintIndex] = useState<number>(-1);
  const [downloadedFile, setDownloadedFile] = useState<File | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const modalIframeRef = useRef<HTMLIFrameElement>(null);

  const startProject = (proj: ProjectDefinition) => {
    sound.playClick();
    setSelectedProject(proj);
    // Check if previously completed
    const existing = (profile.completedProjects || []).find((p) => p.projectId === proj.id);
    if (existing) {
      setHtml(existing.html);
      setCss(existing.css);
      setJs(existing.js);
    } else {
      setHtml(proj.starterCode.html);
      setCss(proj.starterCode.css);
      setJs(proj.starterCode.js);
    }
    setRequirementsStatus({});
    setShowCompletionModal(false);
    setShowSharingCard(false);
    setActiveHintIndex(-1);
    setDownloadedFile(null);
  };

  const executeAndValidate = () => {
    if (!selectedProject || !iframeRef.current) return;
    sound.playClick();

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    const fullSrc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    try {
      ${js}
    } catch(e) {
      console.warn('Project runtime notice:', e);
    }
  </script>
</body>
</html>`;

    iframeDoc.open();
    iframeDoc.write(fullSrc);
    iframeDoc.close();

    // Give DOM 100ms to paint
    setTimeout(() => {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      const domContext: MissionDOMContext = {
        doc,
        html,
        css,
        js,
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

      const newStatus: Record<string, boolean> = {};
      let allMet = true;

      for (const req of selectedProject.requirements) {
        try {
          const passed = req.check(domContext);
          newStatus[req.id] = passed;
          if (!passed) allMet = false;
        } catch {
          newStatus[req.id] = false;
          allMet = false;
        }
      }

      setRequirementsStatus(newStatus);

      if (allMet) {
        sound.playFanfare();
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });

        const totalXp =
          selectedProject.xpReward + (buildWithoutHelp ? selectedProject.buildWithoutHelpBonusXp : 0);

        const record: CompletedProject = {
          id: 'proj_' + Date.now(),
          projectId: selectedProject.id,
          title: selectedProject.title,
          completedAt: new Date().toISOString(),
          xpEarned: totalXp,
          html,
          css,
          js,
          buildWithoutHelp,
        };

        onSaveCompletedProject(record);
        setShowCompletionModal(true);
      } else {
        sound.playError();
      }
    }, 150);
  };

  const handleDownload = async () => {
    if (!selectedProject) return;
    try {
      sound.playClick();
      setIsDownloading(true);
      const file = await downloadProjectZip({
        projectName: selectedProject.title,
        learnerName: profile.name,
        html,
        css,
        js,
      });
      setDownloadedFile(file);
      setIsDownloading(false);
      sound.playSuccess();
      setShowSharingCard(true);
    } catch (err) {
      console.error('Download error:', err);
      setIsDownloading(false);
    }
  };

  const handleShareToCommunity = async () => {
    if (!selectedProject) return;
    sound.playClick();
    const result = await shareProject(downloadedFile, selectedProject.title, profile.name);
    if (result === 'unsupported') {
      window.open('https://chat.whatsapp.com/EVCWh9Vxfk2KLzOdpQMzYJ', '_blank', 'noopener,noreferrer');
    }
  };

  const allReqsMet =
    selectedProject &&
    selectedProject.requirements.length > 0 &&
    selectedProject.requirements.every((r) => requirementsStatus[r.id]);

  // Project Catalog View
  if (!selectedProject) {
    return (
      <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 space-y-6">
        {/* Banner */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 border border-cyan-800/60 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 border border-cyan-700 text-cyan-300 uppercase tracking-wider">
                🏗️ PROJECT MODE
              </span>
              <span className="text-xs text-slate-400 font-semibold">• Real Website Engineering</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
              Build Real Websites & Download Them
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Synthesize HTML structure, CSS aesthetics, and JavaScript interactions into full projects.
              Complete requirements, download your actual code as a ZIP file, and share it with the Internet Mission community!
            </p>
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROJECTS.map((proj, idx) => {
            const isCompleted = (profile.completedProjects || []).some(
              (p) => p.projectId === proj.id
            );

            return (
              <div
                key={proj.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-4 shadow-xl group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-950 border border-slate-800 text-cyan-400">
                      PROJECT {idx + 1} • {proj.difficulty}
                    </span>
                    {isCompleted && (
                      <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Completed</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-display font-bold text-lg text-white group-hover:text-cyan-300 transition-colors">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-cyan-400 font-medium">{proj.subtitle}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{proj.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-xs text-slate-300 font-semibold">
                    <span className="text-cyan-400">+{proj.xpReward} XP</span>
                    <span className="text-amber-400 ml-2">
                      (+{proj.buildWithoutHelpBonusXp} No-Help Bonus)
                    </span>
                  </div>

                  <button
                    onClick={() => startProject(proj)}
                    className="py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    {isCompleted ? 'Edit / Rebuild' : 'Start Project'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Active Project Workspace View
  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 flex flex-col gap-4">
      {/* Workspace Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-cyan-900/50 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              setSelectedProject(null);
            }}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Return to Projects list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                PROJECT MODE
              </span>
              <span>•</span>
              <span className="text-xs text-slate-300 font-semibold">{selectedProject.title}</span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Complete all checklist requirements, test live, then download your real website files!
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* BUILD WITHOUT HELP TOGGLE */}
          <button
            onClick={() => {
              sound.playClick();
              setBuildWithoutHelp(!buildWithoutHelp);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-display font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              buildWithoutHelp
                ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-md shadow-amber-500/20 animate-pulse'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-amber-300 hover:border-amber-700'
            }`}
            title="Disable hints & AI tutor to test raw memory for +bonus XP!"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>🔥 BUILD WITHOUT HELP {buildWithoutHelp ? 'ON' : 'OFF'}</span>
          </button>

          {/* AI Mentor Button (Disabled in Build Without Help mode) */}
          <button
            onClick={() => {
              if (buildWithoutHelp) {
                alert('🔥 Build Without Help mode is active: Mentorship is disabled to test pure recall!');
                return;
              }
              if (onOpenTutor) {
                onOpenTutor({
                  userCode: { html, css, js },
                  missionTitle: selectedProject.title,
                  missionGoal: selectedProject.description,
                  missionConcept: selectedProject.subtitle,
                });
              }
            }}
            disabled={buildWithoutHelp}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              buildWithoutHelp
                ? 'opacity-40 cursor-not-allowed bg-slate-950 border-slate-800 text-slate-600'
                : 'bg-cyan-950/80 hover:bg-cyan-900 border-cyan-700/60 text-cyan-300 cursor-pointer'
            }`}
            title="Ask AI Tutor for guidance"
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">AI Tutor</span>
          </button>

          {/* Run & Validate Project Button */}
          <button
            onClick={executeAndValidate}
            className="py-1.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-cyan-500/30 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>RUN & TEST</span>
          </button>
        </div>
      </div>

      {/* Requirements Checklist Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-display font-bold">
          <span className="text-white uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Project Requirements Checklist</span>
          </span>
          <span className="text-slate-400 text-[11px]">
            {selectedProject.requirements.filter((r) => requirementsStatus[r.id]).length} /{' '}
            {selectedProject.requirements.length} Passed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          {selectedProject.requirements.map((req) => {
            const passed = !!requirementsStatus[req.id];
            return (
              <div
                key={req.id}
                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                  passed
                    ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                )}
                <span className="font-semibold truncate">{req.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Editor & Preview Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editor Area */}
        <div className="flex flex-col rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl min-h-[460px]">
          {/* Tabs */}
          <div className="flex items-center justify-between px-3 pt-2.5 pb-2 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('html');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'html'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>index.html</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('css');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'css'
                    ? 'bg-blue-500 text-slate-950'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>style.css</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('js');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'js'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>script.js</span>
              </button>
            </div>

            {/* Hint Reveal (if not in build without help) */}
            {!buildWithoutHelp && (
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveHintIndex((prev) =>
                    prev < selectedProject.hints.length - 1 ? prev + 1 : 0
                  );
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-semibold"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{activeHintIndex >= 0 ? `Hint ${activeHintIndex + 1}/3` : 'Need a hint?'}</span>
              </button>
            )}
          </div>

          {/* Active Hint Notice */}
          {!buildWithoutHelp && activeHintIndex >= 0 && (
            <div className="p-2.5 bg-cyan-950/70 border-b border-cyan-800 text-xs text-cyan-200 flex items-center justify-between">
              <span>💡 {selectedProject.hints[activeHintIndex]}</span>
              <button
                onClick={() => setActiveHintIndex(-1)}
                className="text-cyan-400 hover:text-white ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Text Editor */}
          <div className="relative flex-1 p-2 bg-[#050b18]">
            <textarea
              value={activeTab === 'html' ? html : activeTab === 'css' ? css : js}
              onChange={(e) => {
                if (activeTab === 'html') setHtml(e.target.value);
                else if (activeTab === 'css') setCss(e.target.value);
                else setJs(e.target.value);
              }}
              spellCheck={false}
              className="w-full h-full min-h-[380px] p-3 rounded-xl bg-transparent text-slate-200 font-mono text-xs sm:text-sm leading-relaxed resize-none focus:outline-none"
            />
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="flex flex-col rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl min-h-[460px]">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-display font-bold text-white uppercase tracking-wider text-[11px]">
                Live Website Preview
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLivePreviewModal(true)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Fullscreen Preview</span>
              </button>
            </div>
          </div>

          <div className="flex-1 bg-white relative">
            <iframe
              ref={iframeRef}
              title="Project Output"
              sandbox="allow-scripts allow-modals allow-same-origin"
              className="w-full h-full min-h-[400px] border-none"
            />
          </div>
        </div>
      </div>

      {/* PROJECT COMPLETE MODAL (Requirement 10) */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-950 border-2 border-cyan-500/60 p-6 sm:p-7 text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-950 border border-cyan-500 flex items-center justify-center text-cyan-400 text-3xl shadow-lg shadow-cyan-500/30">
              🎉
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 border border-cyan-700 text-cyan-300 uppercase tracking-wider">
                ✓ ALL REQUIREMENTS PASSED
              </span>
              <h2 className="font-display font-black text-2xl text-white mt-1">
                PROJECT COMPLETE!
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                You successfully engineered <strong>{selectedProject.title}</strong>!
                {buildWithoutHelp && (
                  <span className="text-amber-400 block font-semibold mt-1">
                    🔥 Build Without Help Mode Bonus Awarded! (+{selectedProject.buildWithoutHelpBonusXp} XP)
                  </span>
                )}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => setShowLivePreviewModal(true)}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-800 text-cyan-300 font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>LIVE PREVIEW</span>
              </button>

              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isDownloading ? 'Packaging ZIP...' : '📦 DOWNLOAD WEBSITE'}</span>
              </button>
            </div>

            {/* Close / Dismiss */}
            <button
              onClick={() => setShowCompletionModal(false)}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors pt-2 block mx-auto cursor-pointer"
            >
              Continue Editing
            </button>
          </div>
        </div>
      )}

      {/* PROJECT SHARING CARD & COMMUNITY NOTICE (Requirements 11 & 12) */}
      {showSharingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-950 border-2 border-emerald-500/60 p-6 sm:p-7 text-center shadow-2xl space-y-4">
            <button
              onClick={() => setShowSharingCard(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Sharing Card Visual Banner (Requirement 12) */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-950 border border-cyan-800/80 text-left space-y-1.5 shadow-md">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <span>🎉 MY FIRST WEB DESIGN</span>
                <span className="text-emerald-400">✓ Completed</span>
              </div>
              <div className="text-xs text-slate-300">
                Created by: <strong className="text-white">{profile.name}</strong>
              </div>
              <div className="text-xs text-slate-300">
                Project: <strong className="text-cyan-300">{selectedProject.title}</strong>
              </div>
            </div>

            {/* Community Instructions (Requirement 11) */}
            <div className="space-y-1.5 text-left">
              <h3 className="font-display font-black text-sm text-white flex items-center gap-1.5">
                <span>🚀 SHARE YOUR FIRST WEBSITE</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                “Your website is ready! Share it with the Internet Mission community.”
              </p>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                <strong className="text-cyan-400 block mb-1">📢 MY FIRST WEB DESIGN</strong>
                “Share your completed website in the ‘My First Web Design’ community group and let other learners see what you built.”
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleShareToCommunity}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>💬 SHARE TO COMMUNITY</span>
              </button>

              <p className="text-[10px] text-slate-500 text-center">
                Your ZIP file has been downloaded. Open WhatsApp → Internet Mission Community → My First Web Design and attach your downloaded ZIP file.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN LIVE PREVIEW MODAL */}
      {showLivePreviewModal && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 p-3 sm:p-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="font-display font-bold text-sm text-white">
                Fullscreen Live Preview: {selectedProject.title}
              </span>
            </div>

            <button
              onClick={() => setShowLivePreviewModal(false)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 bg-white rounded-2xl overflow-hidden shadow-2xl">
            <iframe
              ref={modalIframeRef}
              srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`}
              title="Fullscreen Preview"
              sandbox="allow-scripts allow-modals allow-same-origin"
              className="w-full h-full border-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};
