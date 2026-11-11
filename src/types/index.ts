export type SummaryMode = 'Short' | 'Medium' | 'Detailed' | 'Very Detailed';

export interface StructuredSummary {
  executive_summary: string;
  document_introduction: string;
  section_wise_summary: string[];
  chapter_wise_explanation: string[];
  detailed_concept_explanations: string[];
  key_concepts: string[];
  important_definitions: Array<{ term: string; definition: string }>;
  important_points: string[];
  keywords: string[];
  examples_and_applications: string[];
  important_findings: string[];
  conclusion: string;
  exam_preparation_notes: string[];
  important_questions_and_answers: Array<{ question: string; answer: string }>;
}

export interface DocumentRecord {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  extractedText: string;
  pagesData: Array<{ pageNum: number; text: string }>;
  storagePath: string;
  createdAt: string;
}

export interface SummaryRecord {
  id: string;
  documentId: string;
  userId: string;
  summaryType: SummaryMode;
  summaryContent: StructuredSummary;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  documentId: string;
  userId: string;
  sender: 'user' | 'assistant';
  content: string;
  pageReferences?: number[];
  timestamp: string;
}

export interface UserAccount {
  id: string;
  email: string;
  role: string;
}

export interface ProjectFile {
  path: string;
  name: string;
  content: string;
  category: string;
}
