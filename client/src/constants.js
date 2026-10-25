export const SUBJECTS = [
  'Data Structures and Algorithms',
  'Operating Systems',
  'Computer Networks',
  'Database Management Systems',
  'Artificial Intelligence and Machine Learning',
  'Computer Architecture',
  'Software Engineering',
  'Mathematics',
  'Physics',
  'Electronics and Digital Logic',
  'Programming Languages',
  'Other',
];

export const SUBJECT_META = {
  'Data Structures and Algorithms': { label: 'Data Structures & Algorithms', code: 'DSA' },
  'Operating Systems': { label: 'Operating Systems', code: 'OS' },
  'Computer Networks': { label: 'Computer Networks', code: 'NET' },
  'Database Management Systems': { label: 'Database Management Systems', code: 'DBMS' },
  'Artificial Intelligence and Machine Learning': { label: 'AI & Machine Learning', code: 'ML' },
  'Computer Architecture': { label: 'Computer Architecture', code: 'ARCH' },
  'Software Engineering': { label: 'Software Engineering', code: 'SE' },
  Mathematics: { label: 'Mathematics', code: 'MATH' },
  Physics: { label: 'Physics', code: 'PHY' },
  'Electronics and Digital Logic': { label: 'Electronics & Digital Logic', code: 'ELEC' },
  'Programming Languages': { label: 'Programming Languages', code: 'PL' },
  Other: { label: 'Other', code: 'OTHER' },
};

export function subjectLabel(value) {
  return SUBJECT_META[value]?.label || value;
}

export function subjectCode(value) {
  return SUBJECT_META[value]?.code || 'OTHER';
}

export const MODES = [
  {
    id: 'analogy',
    label: 'Everyday Analogy',
    hint: 'Relatable story, then tie back to the mechanism',
  },
  {
    id: 'meme',
    label: 'Meme Mode',
    hint: 'Dry humor — still technically correct',
  },
  {
    id: 'visual',
    label: 'Visual Thinking',
    hint: 'Mermaid diagram when it helps',
  },
  {
    id: 'exam',
    label: 'Exam Mode',
    hint: 'Structured exam-style answer',
  },
];

export const LEARNING_DEPTHS = [
  { id: 'quick-refresher', label: 'Quick Refresher' },
  { id: 'foundational', label: 'Foundational' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'in-depth', label: 'In-Depth / Research-Oriented' },
];

export function learningDepthLabel(id) {
  return LEARNING_DEPTHS.find((d) => d.id === id)?.label || id;
}

export const ANSWER_LENGTHS = [
  { id: '2-mark', label: '2-mark answer' },
  { id: '5-mark', label: '5-mark answer' },
  { id: '10-mark', label: '10-mark answer' },
];

export function answerLengthLabel(id) {
  return ANSWER_LENGTHS.find((a) => a.id === id)?.label || id;
}

export const SAMPLE_TOPICS = [
  { topic: 'Deadlock and resource allocation', subject: 'Operating Systems' },
  { topic: 'TCP vs UDP', subject: 'Computer Networks' },
  { topic: 'Database normalization', subject: 'Database Management Systems' },
  { topic: 'Binary search and time complexity', subject: 'Data Structures and Algorithms' },
  { topic: 'Overfitting vs underfitting', subject: 'Artificial Intelligence and Machine Learning' },
  { topic: 'Paging and segmentation', subject: 'Operating Systems' },
  { topic: 'ACID properties', subject: 'Database Management Systems' },
  { topic: "Dijkstra's algorithm", subject: 'Data Structures and Algorithms' },
  { topic: 'Recursion and dynamic programming', subject: 'Data Structures and Algorithms' },
  { topic: 'Process scheduling', subject: 'Operating Systems' },
  { topic: 'SQL joins', subject: 'Database Management Systems' },
  { topic: 'Digital logic and Boolean algebra', subject: 'Electronics and Digital Logic' },
];
