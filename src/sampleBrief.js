import { analyzeExcerpt } from './rules/analyzeExcerpt'

export const sampleExcerpt =
  'Renovation works include structural adaptation, facade repairs, fire-safety coordination, and site access constraints. Additional drawings and technical documentation may be requested during the clarification phase.'

export const sampleBrief = {
  ...analyzeExcerpt(sampleExcerpt),
  projectTitle: 'Municipal Building Renovation Tender',
  subtitle: 'Bundled sample tender excerpt',
  reviewerRole: 'Technical review support',
}
