import React, { useState, useEffect } from 'react';
import { Header, AppView } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { MissionMap } from './components/MissionMap';
import { CodeMemoryView } from './components/CodeMemoryView';
import { Dashboard } from './components/Dashboard';
import { MissionView } from './components/MissionView';
import { SectionAssessmentView } from './components/SectionAssessmentView';
import { RecoveryMissionModal } from './components/RecoveryMissionModal';
import { AITutorModal } from './components/AITutorModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { LoginScreen } from './components/LoginScreen';
import { SplashScreen } from './components/SplashScreen';
import { OfflineBanner } from './components/OfflineBanner';
import { PWAInstallModal } from './components/PWAInstallModal';
import { SettingsModal } from './components/SettingsModal';
import { ProjectModeView } from './components/ProjectModeView';
import { CodePlayground } from './components/CodePlayground';
import { RevisionCenterView } from './components/RevisionCenterView';
import { FloatingCommunityChat } from './components/FloatingCommunityChat';
import { usePWA } from './utils/usePWA';
import { MISSIONS } from './data/missions';
import { SECTIONS } from './data/sections';
import { RECOVERY_MISSIONS } from './data/recoveryMissions';
import { getLevelInfo } from './data/levels';
import {
  UserProfile,
  SectionId,
  MistakeCategory,
  AssessmentResult,
  RecoveryMission,
  CompletedProject,
} from './types';
import {
  getActiveProfile,
  saveProfile,
  logoutProfile,
  resetProfileProgress,
  restartSectionForProfile,
  recordCompletedProject,
  recordDailyChallengeCompleted,
  recordCodeRun,
} from './utils/storage';
import { sound } from './utils/sound';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(() => getActiveProfile());
  const [currentView, setCurrentView] = useState<AppView>(() => {
    try {
      const saved = sessionStorage.getItem('im_current_view') as AppView | null;
      if (
        saved &&
        [
          'home',
          'map',
          'projects',
          'playground',
          'revision',
          'memory',
          'dashboard',
          'mission',
          'assessment',
        ].includes(saved)
      ) {
        return saved;
      }
    } catch {}
    return 'home';
  });
  const [selectedMissionId, setSelectedMissionId] = useState<string>(() => {
    try {
      const saved = sessionStorage.getItem('im_selected_mission');
      if (saved && MISSIONS.some((m) => m.id === saved)) {
        return saved;
      }
    } catch {}
    return MISSIONS[0].id;
  });
  const [assessmentSectionId, setAssessmentSectionId] = useState<SectionId>('section-1');
  const [activeRecoveryMission, setActiveRecoveryMission] = useState<RecoveryMission | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isGlobalTutorOpen, setIsGlobalTutorOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'settings' | 'community' | null>(null);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);

  const handleOpenSettings = (initialTab: 'settings' | 'community' = 'settings') => {
    setSettingsInitialTab(initialTab);
    setIsSettingsModalOpen(true);
  };

  // Sync currentView and selectedMissionId to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('im_current_view', currentView);
    } catch {}
  }, [currentView]);

  useEffect(() => {
    try {
      sessionStorage.setItem('im_selected_mission', selectedMissionId);
    } catch {}
  }, [selectedMissionId]);

  // Startup splash experience (shown once per session)
  const [showSplash, setShowSplash] = useState(() => {
    try {
      return sessionStorage.getItem('im_splash_viewed') !== 'true';
    } catch {
      return false;
    }
  });

  // PWA lifecycle hook
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isOnline,
    shouldShowPopup,
    diagnostics,
    triggerInstall,
    dismissPopup,
  } = usePWA();

  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const toggleMusic = () => {
    const newState = sound.toggleMusic();
    setIsMusicPlaying(newState);
    if (profile) {
      const updated = { ...profile, musicEnabled: newState };
      saveProfile(updated);
      setProfile(updated);
    }
  };

  // Sync sound setting
  useEffect(() => {
    if (profile) {
      sound.enabled = profile.soundEnabled;
      if (profile.musicEnabled && !isMusicPlaying) {
        sound.startMusic();
        setIsMusicPlaying(true);
      }
    }
  }, [profile?.soundEnabled]);

  // If splash is showing, render startup experience
  if (showSplash) {
    return (
      <SplashScreen
        onFinish={() => {
          try {
            sessionStorage.setItem('im_splash_viewed', 'true');
          } catch {}
          setShowSplash(false);
        }}
      />
    );
  }

  // If not logged in, render the Login Screen with OfflineBanner and floating community chat
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col relative">
        <OfflineBanner isOnline={isOnline} />
        <div className="flex-1">
          <LoginScreen
            onLoginSuccess={(newProfile) => {
              setProfile(newProfile);
              if (newProfile.currentMissionId) {
                setSelectedMissionId(newProfile.currentMissionId);
              }
              setCurrentView('home');
            }}
          />
        </div>
        {/* Floating 💬 Live Community also visible on Login Screen */}
        <FloatingCommunityChat
          profile={null}
          isOpen={isCommunityOpen}
          onOpenChange={setIsCommunityOpen}
        />
      </div>
    );
  }

  const toggleSound = () => {
    setProfile((prev) => {
      if (!prev) return null;
      const updated = { ...prev, soundEnabled: !prev.soundEnabled };
      saveProfile(updated);
      return updated;
    });
  };

  const handleLogout = () => {
    logoutProfile();
    setProfile(null);
    setCurrentView('home');
  };

  // Helper to audit and unlock badges based on current state
  const evaluateBadges = (
    completedMissionIds: string[],
    completedCodeMemoryIds: string[],
    fixedMistakesCount: number,
    existingBadges: string[],
    completedSectionIds: SectionId[]
  ): string[] => {
    const unlocked = new Set<string>(existingBadges);

    // 1. First Mission
    if (completedMissionIds.length >= 1) {
      unlocked.add('first-mission');
    }

    // 2. HTML Foundation Master (Section 1 complete)
    if (completedSectionIds.includes('section-1')) {
      unlocked.add('html-foundation-master');
    }

    // 3. CSS Foundation Master (Section 2 complete)
    if (completedSectionIds.includes('section-2')) {
      unlocked.add('css-foundation-master');
    }

    // 4. JS Foundation Master (Section 3 complete)
    if (completedSectionIds.includes('section-3')) {
      unlocked.add('js-foundation-master');
    }

    // 5. Memory Master (At least 2 memory missions or drills)
    const memoryMissionsDone = completedMissionIds.filter((id) => {
      const m = MISSIONS.find((item) => item.id === id);
      return m?.isMemoryMission;
    }).length;
    if (memoryMissionsDone + completedCodeMemoryIds.length >= 2) {
      unlocked.add('memory-master');
    }

    // 6. Capstone Builder (Section completed or mini project build)
    const hasMiniProject = completedMissionIds.some((id) => {
      const m = MISSIONS.find((item) => item.id === id);
      return m?.isMiniProject;
    });
    if (hasMiniProject || completedSectionIds.length > 0) {
      unlocked.add('mini-project-builder');
    }

    // 7. Bug Crusher (Fixed 3 mistakes)
    if (fixedMistakesCount >= 3) {
      unlocked.add('bug-crusher');
    }

    return Array.from(unlocked);
  };

  const handleStartMission = () => {
    const targetMissionId =
      profile.currentMissionId ||
      MISSIONS.find((m) => !profile.completedMissionIds.includes(m.id))?.id ||
      MISSIONS[0].id;
    setSelectedMissionId(targetMissionId);
    setCurrentView('mission');
  };

  const handleSelectMission = (missionId: string) => {
    setSelectedMissionId(missionId);
    setProfile((prev) => {
      if (!prev) return null;
      const updated = { ...prev, currentMissionId: missionId };
      saveProfile(updated);
      return updated;
    });
    setCurrentView('mission');
  };

  const handleCompleteMission = (
    missionId: string,
    earnedXp: number,
    nextMissionId?: string,
    wasMistakeFixed: boolean = false
  ) => {
    setProfile((prev) => {
      if (!prev) return null;
      const alreadyCompleted = prev.completedMissionIds.includes(missionId);
      const newCompleted = alreadyCompleted
        ? prev.completedMissionIds
        : [...prev.completedMissionIds, missionId];
      const newXp = alreadyCompleted ? prev.xp : prev.xp + earnedXp;
      const newFixedCount = wasMistakeFixed
        ? prev.fixedMistakesCount + 1
        : prev.fixedMistakesCount;

      const newBadges = evaluateBadges(
        newCompleted,
        prev.completedCodeMemoryIds,
        newFixedCount,
        prev.unlockedBadgeIds,
        prev.completedSectionIds
      );

      // Check level up sound
      const prevLevel = getLevelInfo(prev.xp).currentLevel.level;
      const nextLevel = getLevelInfo(newXp).currentLevel.level;
      if (nextLevel > prevLevel) {
        sound.playLevelUp();
      }

      // Check if next mission enters a locked section
      let targetNextMissionId = nextMissionId;
      if (nextMissionId) {
        const nextM = MISSIONS.find((m) => m.id === nextMissionId);
        if (
          nextM &&
          nextM.sectionId !== prev.currentSectionId &&
          !prev.completedSectionIds.includes(nextM.sectionId)
        ) {
          targetNextMissionId = missionId;
        }
      }

      const updated: UserProfile = {
        ...prev,
        xp: newXp,
        completedMissionIds: newCompleted,
        currentMissionId: targetNextMissionId || prev.currentMissionId,
        fixedMistakesCount: newFixedCount,
        unlockedBadgeIds: newBadges,
      };

      saveProfile(updated);
      return updated;
    });

    if (nextMissionId) {
      const nextM = MISSIONS.find((m) => m.id === nextMissionId);
      if (!nextM || nextM.sectionId === profile?.currentSectionId || profile?.completedSectionIds.includes(nextM.sectionId)) {
        setSelectedMissionId(nextMissionId);
      }
    }
  };

  const handleStartAssessment = (sectionId: any) => {
    setAssessmentSectionId(sectionId as SectionId);
    setCurrentView('assessment');
  };

  const handleAssessmentPassed = (result: AssessmentResult, xpBonus: number) => {
    setProfile((prev) => {
      if (!prev) return null;
      const alreadyPassed = prev.completedSectionIds.includes(result.sectionId);
      const newCompletedSections = alreadyPassed
        ? prev.completedSectionIds
        : [...prev.completedSectionIds, result.sectionId];

      const newXp = alreadyPassed ? prev.xp : prev.xp + xpBonus;

      // Mark the capstone assessment mission of this section as completed
      const secMissions = MISSIONS.filter((m) => m.sectionId === result.sectionId);
      const capstoneMission = secMissions[secMissions.length - 1];
      const newCompletedMissions =
        capstoneMission && !prev.completedMissionIds.includes(capstoneMission.id)
          ? [...prev.completedMissionIds, capstoneMission.id]
          : prev.completedMissionIds;

      // Find next section
      const currentSecIndex = SECTIONS.findIndex((s) => s.id === result.sectionId);
      const nextSec = SECTIONS[currentSecIndex + 1];
      let nextMissionId = prev.currentMissionId;
      let nextSectionId = prev.currentSectionId;

      if (nextSec) {
        nextSectionId = nextSec.id;
        const nextSecMissions = MISSIONS.filter((m) => m.sectionId === nextSec.id);
        if (nextSecMissions[0]) {
          nextMissionId = nextSecMissions[0].id;
          setSelectedMissionId(nextSecMissions[0].id);
        }
      }

      const newBadges = evaluateBadges(
        newCompletedMissions,
        prev.completedCodeMemoryIds,
        prev.fixedMistakesCount,
        prev.unlockedBadgeIds,
        newCompletedSections
      );

      const updated: UserProfile = {
        ...prev,
        xp: newXp,
        completedMissionIds: newCompletedMissions,
        completedSectionIds: newCompletedSections,
        currentSectionId: nextSectionId,
        currentMissionId: nextMissionId,
        unlockedBadgeIds: newBadges,
        assessmentHistory: [result, ...prev.assessmentHistory],
        failedSectionRestartNotice: null,
      };

      saveProfile(updated);
      return updated;
    });

    sound.playLevelUp();
    // Return to map so user sees the newly unlocked section
    setCurrentView('map');
  };

  const handleAssessmentFailed = (
    result: AssessmentResult,
    missedObjectives: string[]
  ) => {
    if (!profile) return;
    const updated = restartSectionForProfile(
      profile,
      result.sectionId,
      missedObjectives
    );
    updated.assessmentHistory = [result, ...updated.assessmentHistory];
    saveProfile(updated);
    setProfile(updated);

    // Return to map with failed notice alert
    setCurrentView('map');
  };

  const handleCompleteDrill = (drillId: string, earnedXp: number) => {
    setProfile((prev) => {
      if (!prev) return null;
      const alreadyDone = prev.completedCodeMemoryIds.includes(drillId);
      const newDone = alreadyDone
        ? prev.completedCodeMemoryIds
        : [...prev.completedCodeMemoryIds, drillId];
      const newXp = alreadyDone ? prev.xp : prev.xp + earnedXp;

      const newBadges = evaluateBadges(
        prev.completedMissionIds,
        newDone,
        prev.fixedMistakesCount,
        prev.unlockedBadgeIds,
        prev.completedSectionIds
      );

      const prevLevel = getLevelInfo(prev.xp).currentLevel.level;
      const nextLevel = getLevelInfo(newXp).currentLevel.level;
      if (nextLevel > prevLevel) {
        sound.playLevelUp();
      }

      const updated: UserProfile = {
        ...prev,
        xp: newXp,
        completedCodeMemoryIds: newDone,
        unlockedBadgeIds: newBadges,
      };

      saveProfile(updated);
      return updated;
    });
  };

  const handleRecordMistake = (category: MistakeCategory) => {
    setProfile((prev) => {
      if (!prev) return null;
      const updated: UserProfile = {
        ...prev,
        mistakesCount: prev.mistakesCount + 1,
        commonMistakes: {
          ...prev.commonMistakes,
          [category]: (prev.commonMistakes[category] || 0) + 1,
        },
      };
      saveProfile(updated);
      return updated;
    });
  };

  const handleDeductXp = (amount: number) => {
    setProfile((prev) => {
      if (!prev) return null;
      const updated: UserProfile = {
        ...prev,
        xp: Math.max(0, prev.xp - amount),
        mistakesCount: prev.mistakesCount + 1,
      };
      saveProfile(updated);
      return updated;
    });
  };

  const handleSaveCodeSnippet = (missionId: string, code: string) => {
    setProfile((prev) => {
      if (!prev) return null;
      const updated: UserProfile = {
        ...prev,
        codeSnippets: {
          ...prev.codeSnippets,
          [missionId]: code,
        },
      };
      saveProfile(updated);
      return updated;
    });
  };

  const handleConfirmReset = () => {
    if (!profile) return;
    const fresh = resetProfileProgress(profile);
    setProfile(fresh);
    setSelectedMissionId(MISSIONS[0].id);
    setCurrentView('home');
  };

  const activeMission =
    MISSIONS.find((m) => m.id === selectedMissionId) || MISSIONS[0];

  const currentAssessmentSection =
    SECTIONS.find((s) => s.id === assessmentSectionId) || SECTIONS[0];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-white">
      {/* Offline Status Alert Banner (Requirement 7) */}
      <OfflineBanner isOnline={isOnline} />

      {/* Navigation Header with Profile, Map, Memory & Dashboard tabs */}
      <Header
        profile={profile}
        onToggleSound={toggleSound}
        onToggleMusic={toggleMusic}
        isMusicPlaying={isMusicPlaying}
        onNavigateHome={() => setCurrentView('home')}
        onNavigateMap={() => setCurrentView('map')}
        onNavigateProjects={() => setCurrentView('projects')}
        onNavigatePlayground={() => setCurrentView('playground')}
        onNavigateRevision={() => setCurrentView('revision')}
        onNavigateMemory={() => setCurrentView('memory')}
        onNavigateDashboard={() => setCurrentView('dashboard')}
        onResetProgress={() => setIsResetModalOpen(true)}
        onLogout={handleLogout}
        onOpenSettings={() => handleOpenSettings('settings')}
        onOpenCommunity={() => setIsCommunityOpen(true)}
        onTriggerInstall={triggerInstall}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        currentView={currentView}
      />

      {/* Main Content Router */}
      <main className="flex-1 w-full pb-8">
        {currentView === 'home' && (
          <HomeScreen
            profile={profile}
            onStartMission={handleStartMission}
            onOpenMissionMap={() => setCurrentView('map')}
            onOpenDashboard={() => setCurrentView('dashboard')}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onOpenCommunity={() => setIsCommunityOpen(true)}
            onTriggerInstall={triggerInstall}
            isInstallable={isInstallable}
            isInstalled={isInstalled}
          />
        )}

        {currentView === 'map' && (
          <MissionMap
            profile={profile}
            onSelectMission={handleSelectMission}
            onOpenCodeMemory={() => setCurrentView('memory')}
            onOpenAssessment={handleStartAssessment}
          />
        )}

        {currentView === 'projects' && (
          <ProjectModeView
            profile={profile}
            onSaveCompletedProject={(proj: CompletedProject) => {
              setProfile((prev) => {
                if (!prev) return null;
                return recordCompletedProject(prev, proj);
              });
            }}
            onOpenTutor={() => setIsGlobalTutorOpen(true)}
          />
        )}

        {currentView === 'playground' && (
          <CodePlayground
            onCodeRun={() => {
              setProfile((prev) => {
                if (!prev) return null;
                return recordCodeRun(prev);
              });
            }}
          />
        )}

        {currentView === 'revision' && (
          <RevisionCenterView
            profile={profile}
            onSelectMission={(mid: string) => {
              setSelectedMissionId(mid);
              setCurrentView('mission');
            }}
            onStartRecoveryMission={(rec: RecoveryMission) => {
              setActiveRecoveryMission(rec);
            }}
            onStartCodeMemory={() => {
              setCurrentView('memory');
            }}
            onDailyChallengePassed={(key: string, xpBonus: number) => {
              setProfile((prev) => {
                if (!prev) return null;
                return recordDailyChallengeCompleted(prev, key, xpBonus);
              });
            }}
          />
        )}

        {currentView === 'memory' && (
          <CodeMemoryView
            progress={profile}
            onBackToMap={() => setCurrentView('map')}
            onCompleteDrill={handleCompleteDrill}
            onDeductXp={handleDeductXp}
          />
        )}

        {currentView === 'dashboard' && (
          <Dashboard
            profile={profile}
            onSelectMission={handleSelectMission}
            onOpenMissionMap={() => setCurrentView('map')}
            onOpenCodeMemory={() => setCurrentView('memory')}
            onOpenAssessment={handleStartAssessment}
            onOpenRecoveryMission={(conceptKey) => {
              const rec = RECOVERY_MISSIONS[conceptKey] || RECOVERY_MISSIONS['heading'];
              setActiveRecoveryMission(rec);
            }}
            onOpenAITutor={() => setIsGlobalTutorOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onTriggerInstall={triggerInstall}
            isInstallable={isInstallable}
            isInstalled={isInstalled}
            onLogout={handleLogout}
            onNavigateProjects={() => setCurrentView('projects')}
            onNavigatePlayground={() => setCurrentView('playground')}
            onNavigateRevision={() => setCurrentView('revision')}
            onImportProfile={(imported) => {
              setProfile(imported);
            }}
          />
        )}

        {currentView === 'mission' && (
          <MissionView
            mission={activeMission}
            progress={profile}
            onBackToDashboard={() => setCurrentView('map')}
            onCompleteMission={handleCompleteMission}
            onDeductXp={handleDeductXp}
            onRecordMistake={handleRecordMistake}
            onSaveCodeSnippet={handleSaveCodeSnippet}
            onTakeAssessment={handleStartAssessment}
            allMissions={MISSIONS}
          />
        )}

        {currentView === 'assessment' && (
          <SectionAssessmentView
            section={currentAssessmentSection}
            profile={profile}
            onAssessmentPassed={handleAssessmentPassed}
            onAssessmentFailed={handleAssessmentFailed}
            onCancel={() => setCurrentView('map')}
          />
        )}
      </main>

      {/* Reset Confirmation Dialog */}
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirmReset={handleConfirmReset}
      />

      {/* Recovery Mission Modal */}
      {activeRecoveryMission && (
        <RecoveryMissionModal
          isOpen={!!activeRecoveryMission}
          onClose={() => setActiveRecoveryMission(null)}
          recoveryMission={activeRecoveryMission}
          onCompleteRecovery={(conceptKey, xpBonus) => {
            setProfile((prev) => {
              if (!prev) return null;
              const updated = {
                ...prev,
                xp: prev.xp + xpBonus,
                weakAreas: {
                  ...prev.weakAreas,
                  [conceptKey]: Math.max(0, (prev.weakAreas[conceptKey] || 1) - 1),
                },
              };
              saveProfile(updated);
              return updated;
            });
            setActiveRecoveryMission(null);
          }}
        />
      )}

      {/* Global AI Tutor Modal if opened from Dashboard */}
      {isGlobalTutorOpen && (
        <AITutorModal
          isOpen={isGlobalTutorOpen}
          onClose={() => setIsGlobalTutorOpen(false)}
          mission={activeMission}
          userCode={
            profile.codeSnippets[activeMission.id] ||
            (typeof activeMission.starterCode === 'string'
              ? activeMission.starterCode
              : activeMission.starterCode.html || '')
          }
        />
      )}

      {/* PWA In-Game Install Popup (Requirement 2) */}
      <PWAInstallModal
        isOpen={shouldShowPopup}
        onInstall={triggerInstall}
        onDismiss={() => dismissPopup(true)}
      />

      {/* Settings & Installation Modal (Requirement 3) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => {
          setIsSettingsModalOpen(false);
          setSettingsInitialTab(null);
        }}
        profile={profile}
        onToggleSound={toggleSound}
        onToggleMusic={toggleMusic}
        isMusicPlaying={isMusicPlaying}
        onResetProgress={() => setIsResetModalOpen(true)}
        onLogout={handleLogout}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        isIOS={isIOS}
        isOnline={isOnline}
        diagnostics={diagnostics}
        onTriggerInstall={triggerInstall}
        initialSection={settingsInitialTab}
      />

      {/* Floating Real-Time Community Chat & Active Learners Squad */}
      <FloatingCommunityChat
        profile={profile}
        isOpen={isCommunityOpen}
        onOpenChange={setIsCommunityOpen}
      />
    </div>
  );
}
