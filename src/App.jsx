import './App.css'
import { BriefHeader } from './components/BriefHeader'
import { DisclaimerFooter } from './components/DisclaimerFooter'
import { EvidenceSnippets } from './components/EvidenceSnippets'
import { SummaryCard } from './components/SummaryCard'
import { TagList } from './components/TagList'
import { TextList } from './components/TextList'
import { sampleBrief } from './sampleBrief'

export default function App() {
  return (
    <main className="app-shell">
      <BriefHeader brief={sampleBrief} />

      <div className="brief-grid">
        <SummaryCard summary={sampleBrief.summary} />

        <TagList
          id="technical-scopes"
          title="Detected technical scopes"
          items={sampleBrief.technicalScopes}
        />

        <TagList
          id="review-focus-areas"
          title="Potential review focus areas"
          items={sampleBrief.reviewDomains}
        />

        <TextList
          id="follow-up-checks"
          title="Potential follow-up checks"
          items={sampleBrief.followUpChecks}
        />

        <TextList
          id="reviewer-questions"
          title="Suggested reviewer questions"
          items={sampleBrief.reviewerQuestions}
        />

        <EvidenceSnippets snippets={sampleBrief.evidenceSnippets} />
      </div>

      <DisclaimerFooter />
    </main>
  )
}
