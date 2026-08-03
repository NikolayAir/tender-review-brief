import { analyzeExcerpt } from './rules/analyzeExcerpt'

export const sampleExcerpt =
  'Renovation works include structural adaptation, facade repairs, fire-safety coordination, and site access constraints. Additional drawings and technical documentation may be requested during the clarification phase.'

export const sampleBrief = {
  ...analyzeExcerpt(sampleExcerpt),
  projectTitle: 'Municipal Building Renovation Tender',
  subtitle: 'Public tender notice → technical review brief',
  reviewerRole: 'Technical inspection reviewer',
}
