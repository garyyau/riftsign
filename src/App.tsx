import { useCallback, useEffect, useMemo, useState } from 'react'
import { Landing } from '@/components/landing'
import { Quiz } from '@/components/quiz/quiz'
import { ResultView, type ResultSource } from '@/components/result/result-view'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { CHAMPIONS, LEGENDS, QUESTION_SET } from '@/data'
import { decodeProfile, encodeProfile } from '@/lib/profile-code'
import { computeProfile } from '@/lib/scoring'
import { buildShareUrl, profileFromHash } from '@/lib/share'
import { clearSession, emptySession, loadSession, saveSession, type Session } from '@/lib/storage'
import type { Profile } from '@/lib/types'

type View =
  | { kind: 'landing' }
  | { kind: 'quiz'; step: number }
  | { kind: 'result'; profile: Profile; source: ResultSource; questionSetVersion: string }

const questions = QUESTION_SET.questions
const currentVersion = QUESTION_SET.version

function initialView(session: Session | null): View {
  const shared = profileFromHash(window.location.hash)
  if (shared) return { kind: 'result', profile: shared.profile, source: 'shared', questionSetVersion: shared.questionSetVersion }
  if (session?.lastProfileCode) return { kind: 'landing' }
  return { kind: 'landing' }
}

export default function App() {
  const [session, setSession] = useState<Session>(() => loadSession() ?? emptySession(currentVersion))
  const [view, setView] = useState<View>(() => initialView(loadSession()))

  const updateSession = useCallback((patch: Partial<Session>) => {
    setSession((prev) => {
      const next = { ...prev, ...patch }
      saveSession(next)
      return next
    })
  }, [])

  // Following a share link after the app has loaded (e.g. pasted into the same tab).
  useEffect(() => {
    const onHash = () => {
      const shared = profileFromHash(window.location.hash)
      if (shared) setView({ kind: 'result', profile: shared.profile, source: 'shared', questionSetVersion: shared.questionSetVersion })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const goHome = () => {
    history.replaceState(null, '', window.location.pathname)
    setView({ kind: 'landing' })
    window.scrollTo({ top: 0 })
  }

  const startFresh = () => {
    clearSession()
    setSession(emptySession(currentVersion))
    history.replaceState(null, '', window.location.pathname)
    setView({ kind: 'quiz', step: 0 })
    window.scrollTo({ top: 0 })
  }

  const continueRun = () => {
    const firstUnanswered = questions.findIndex((q) => !(q.id in session.answers))
    setView({ kind: 'quiz', step: firstUnanswered === -1 ? questions.length : firstUnanswered })
  }

  const showStored = () => {
    const decoded = session.lastProfileCode ? decodeProfile(session.lastProfileCode) : null
    if (!decoded) return startFresh()
    setView({ kind: 'result', profile: decoded.profile, source: 'stored', questionSetVersion: session.questionSetVersion })
  }

  const finish = (skipChampions: boolean) => {
    const favourites = skipChampions ? [] : session.favouriteChampions
    const profile = computeProfile(QUESTION_SET, session.answers)
    updateSession({ favouriteChampions: favourites, questionSetVersion: currentVersion, lastProfileCode: encodeProfile(profile, currentVersion) })
    setView({ kind: 'result', profile, source: 'fresh', questionSetVersion: currentVersion })
    window.scrollTo({ top: 0 })
  }

  const storedIsComplete = session.lastProfileCode !== null
  const storedHasProgress = !storedIsComplete && Object.keys(session.answers).length > 0

  const shareUrl = useMemo(
    () => (profile: Profile, version: string) => (topLegendId: string | null) =>
      buildShareUrl(window.location.origin, import.meta.env.BASE_URL, profile, version, topLegendId),
    [],
  )

  return (
    <div className="mx-auto min-h-screen max-w-[1200px] md:border-x">
      <SiteHeader onHome={goHome} />
      <main>
        {view.kind === 'landing' && (
          <Landing
            hasResult={storedIsComplete}
            hasProgress={storedHasProgress}
            onStart={startFresh}
            onContinue={continueRun}
            onSeeResult={showStored}
          />
        )}
        {view.kind === 'quiz' && (
          <Quiz
            questions={questions}
            champions={CHAMPIONS}
            answers={session.answers}
            favouriteChampions={session.favouriteChampions}
            step={view.step}
            onAnswer={(questionId, answerId) => {
              updateSession({ answers: { ...session.answers, [questionId]: answerId }, lastProfileCode: null })
              setView({ kind: 'quiz', step: Math.min(view.step + 1, questions.length) })
              window.scrollTo({ top: 0 })
            }}
            onToggleChampion={(champion) =>
              updateSession({
                favouriteChampions: session.favouriteChampions.includes(champion)
                  ? session.favouriteChampions.filter((c) => c !== champion)
                  : [...session.favouriteChampions, champion],
              })
            }
            onBack={() => (view.step === 0 ? goHome() : setView({ kind: 'quiz', step: view.step - 1 }))}
            onFinish={finish}
          />
        )}
        {view.kind === 'result' && (
          <ResultView
            profile={view.profile}
            pool={LEGENDS}
            favouriteChampions={view.source === 'shared' ? [] : session.favouriteChampions}
            source={view.source}
            versionChanged={view.questionSetVersion !== currentVersion}
            shareUrl={shareUrl(view.profile, view.questionSetVersion)}
            onRetake={startFresh}
          />
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
