import { useCallback, useEffect, useState } from 'react'
import { Landing } from '@/components/landing'
import { Quiz } from '@/components/quiz/quiz'
import { ResultView, type ResultSource } from '@/components/result/result-view'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { CHAMPIONS, LEGENDS, QUESTION_SET } from '@/data'
import { decodeProfile, encodeProfile, type DecodedProfile } from '@/lib/profile-code'
import { computeProfile } from '@/lib/scoring'
import { buildShareUrl, profileFromHash } from '@/lib/share'
import { clearSession, emptySession, loadSession, saveSession, type Session } from '@/lib/storage'

type View = { kind: 'landing' } | { kind: 'quiz'; step: number } | { kind: 'result'; result: DecodedProfile; source: ResultSource }

const questions = QUESTION_SET.questions
const currentVersion = QUESTION_SET.version

function initialView(): View {
  const shared = profileFromHash(window.location.hash)
  return shared ? { kind: 'result', result: shared, source: 'shared' } : { kind: 'landing' }
}

export default function App() {
  const [session, setSession] = useState<Session>(() => loadSession() ?? emptySession(currentVersion))
  const [view, setView] = useState<View>(initialView)

  // Patches derive from the previous state so two quick taps never drop an Answer.
  const updateSession = useCallback((patch: (prev: Session) => Partial<Session>) => {
    setSession((prev) => {
      const next = { ...prev, ...patch(prev) }
      saveSession(next)
      return next
    })
  }, [])

  // Following a share link after the app has loaded (e.g. pasted into the same tab).
  useEffect(() => {
    const onHash = () => {
      const shared = profileFromHash(window.location.hash)
      if (shared) setView({ kind: 'result', result: shared, source: 'shared' })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const show = (next: View) => {
    setView(next)
    window.scrollTo({ top: 0 })
  }

  const goHome = () => {
    history.replaceState(null, '', window.location.pathname)
    show({ kind: 'landing' })
  }

  const startFresh = () => {
    clearSession()
    setSession(emptySession(currentVersion))
    history.replaceState(null, '', window.location.pathname)
    show({ kind: 'quiz', step: 0 })
  }

  const continueRun = () => {
    // Answers given against an older Question set may not line up with today's Questions.
    if (session.questionSetVersion !== currentVersion) return startFresh()
    const firstUnanswered = questions.findIndex((q) => !(q.id in session.answers))
    show({ kind: 'quiz', step: firstUnanswered === -1 ? questions.length : firstUnanswered })
  }

  const showStored = () => {
    const decoded = session.lastProfileCode ? decodeProfile(session.lastProfileCode) : null
    if (!decoded) return startFresh()
    show({ kind: 'result', result: decoded, source: 'stored' })
  }

  const finish = (skipChampions: boolean) => {
    const profile = computeProfile(QUESTION_SET, session.answers)
    // The version stays the one the Answers were given against, so the retake notice can fire later.
    const code = encodeProfile(profile, session.questionSetVersion)
    updateSession((prev) => ({ favouriteChampions: skipChampions ? [] : prev.favouriteChampions, lastProfileCode: code }))
    show({ kind: 'result', result: { profile, questionSetVersion: session.questionSetVersion }, source: 'fresh' })
  }

  const storedIsComplete = session.lastProfileCode !== null
  const storedHasProgress = !storedIsComplete && Object.keys(session.answers).length > 0

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
              updateSession((prev) => ({ answers: { ...prev.answers, [questionId]: answerId }, lastProfileCode: null }))
              show({ kind: 'quiz', step: Math.min(view.step + 1, questions.length) })
            }}
            onToggleChampion={(champion) =>
              updateSession((prev) => ({
                favouriteChampions: prev.favouriteChampions.includes(champion)
                  ? prev.favouriteChampions.filter((c) => c !== champion)
                  : [...prev.favouriteChampions, champion],
              }))
            }
            onBack={() => (view.step === 0 ? goHome() : setView({ kind: 'quiz', step: view.step - 1 }))}
            onFinish={finish}
          />
        )}
        {view.kind === 'result' && (
          <ResultView
            profile={view.result.profile}
            pool={LEGENDS}
            favouriteChampions={view.source === 'shared' ? [] : session.favouriteChampions}
            source={view.source}
            versionChanged={view.result.questionSetVersion !== currentVersion}
            shareUrl={(topLegendId) =>
              buildShareUrl(window.location.origin, import.meta.env.BASE_URL, view.result.profile, view.result.questionSetVersion, topLegendId)
            }
            onRetake={startFresh}
          />
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
