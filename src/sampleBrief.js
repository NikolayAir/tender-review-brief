export const sampleBrief = {
  projectTitle: 'Municipal Building Renovation Tender',
  subtitle: 'Public tender notice → technical review brief',
  reviewerRole: 'Technical inspection reviewer',
  summary:
    'This tender describes renovation works for a public building. The review should consider structural scope, access constraints, fire-safety interfaces, documentation requirements, and coordination between trades.',
  technicalScopes: [
    'Structural works',
    'Fire safety',
    'Building envelope',
    'Site access and phasing',
    'Technical documentation',
  ],
  reviewDomains: [
    'Technical risk',
    'Requirement verification',
    'Coordination',
    'Document review',
  ],
  followUpChecks: [
    'Confirm whether structural drawings and calculation notes are available for review.',
    'Check whether fire-safety interfaces are described in sufficient detail.',
    'Confirm whether facade, roof, window, and external-wall interfaces are defined.',
    'Verify whether site access, occupation, and phasing constraints are defined.',
    'Confirm which technical documents and acceptance criteria govern the review.',
  ],
  reviewerQuestions: [
    'Which structural drawings and calculation notes should be reviewed?',
    'Which fire-safety elements require inspection or third-party coordination?',
    'Which facade, roof, or envelope interfaces require inspection follow-up?',
    'Are the works phased around continued building occupation or restricted site access?',
    'Which documents define the applicable acceptance criteria?',
  ],
  evidenceSnippets: [
    {
      id: 'sample-structural',
      source: 'Tender excerpt, scope section',
      text: 'Renovation works include structural adaptation, facade repairs, fire-safety coordination, and site access constraints.',
    },
    {
      id: 'sample-documentation',
      source: 'Tender excerpt, documentation section',
      text: 'Additional drawings and technical documentation may be requested during the clarification phase.',
    },
  ],
}
