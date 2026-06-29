/**
 * Cognitience WP — Document Templates
 * Editable templates with clear placeholder fields the user fills in.
 * All content is contenteditable so the user just clicks and types.
 *
 * Templates included:
 *   - arXiv Research Paper (two-column academic format)
 *   - Outline (hierarchical numbered sections)
 *   - Email (formal email format)
 *   - Book (chapter-based manuscript format)
 */

const TEMPLATES = {
  // ═══════════════════════════════════════════════════════════
  // arXiv-STYLE RESEARCH PAPER
  // ═══════════════════════════════════════════════════════════
  arxiv: {
    name: 'arXiv Research Paper',
    description: 'Academic research paper in arXiv two-column format with abstract, sections, and references.',
    icon: 'paper',
    insert: function() {
      return `
<div class="cog-template arxiv-paper">
  <div class="paper-title-block">
    <h1 class="paper-title" contenteditable="true">[Paper Title]</h1>
    <div class="paper-authors">
      <span class="paper-author" contenteditable="true">Author One<sup>1</sup></span>,
      <span class="paper-author" contenteditable="true">Author Two<sup>2</sup></span>
    </div>
    <div class="paper-affiliations">
      <div contenteditable="true"><sup>1</sup>[Affiliation One]</div>
      <div contenteditable="true"><sup>2</sup>[Affiliation Two]</div>
    </div>
    <div class="paper-email" contenteditable="true">[corresponding-author@email]</div>
    <div class="paper-date" contenteditable="true">[Month Year]</div>
  </div>

  <div class="paper-abstract-block">
    <h2 class="paper-abstract-heading">Abstract</h2>
    <p class="paper-abstract" contenteditable="true">[Write your abstract here. Summarize the problem, approach, key results, and conclusions in 150-250 words.]</p>
    <div class="paper-subjects">
      <strong>Subject Categories:</strong> <span contenteditable="true">[e.g., cs.CL]</span><br>
      <strong>Keywords:</strong> <span contenteditable="true">[keyword1, keyword2, keyword3]</span>
    </div>
  </div>

  <div class="paper-columns">
    <div class="paper-column paper-column-left">
      <h2 class="paper-section-heading">1. Introduction</h2>
      <p contenteditable="true">[Introduce the problem, motivate why it matters, and state your contributions.]</p>
      <h2 class="paper-section-heading">2. Related Work</h2>
      <p contenteditable="true">[Discuss prior work and how yours differs or builds upon it.]</p>
    </div>
    <div class="paper-column paper-column-right">
      <h2 class="paper-section-heading">3. Methodology</h2>
      <p contenteditable="true">[Describe your approach in reproducible detail.]</p>
      <h2 class="paper-section-heading">4. Experiments</h2>
      <p contenteditable="true">[Describe datasets, baselines, metrics, and present results.]</p>
      <h2 class="paper-section-heading">5. Conclusion</h2>
      <p contenteditable="true">[Summarize findings, implications, and future directions.]</p>
    </div>
  </div>

  <div class="paper-references-block">
    <h2 class="paper-references-heading">References</h2>
    <ol class="paper-references" contenteditable="true">
      <li>[Author, A. (Year). Title. Venue, pages.]</li>
      <li>[Author, B. (Year). Title. Journal, volume(issue), pages.]</li>
    </ol>
  </div>
</div>
<style>
.arxiv-paper { font-family: 'Times New Roman', Georgia, serif; font-size: 11pt; line-height: 1.4; color: #000; }
.paper-title-block { text-align: center; margin-bottom: 24px; }
.paper-title { font-size: 18pt; font-weight: bold; margin: 0 0 12px; line-height: 1.2; }
.paper-authors { font-size: 12pt; margin-bottom: 4px; }
.paper-affiliations { font-size: 9pt; color: #555; line-height: 1.5; margin-bottom: 4px; }
.paper-email { font-size: 9pt; color: #555; font-style: italic; }
.paper-date { font-size: 9pt; color: #888; margin-top: 4px; }
.paper-abstract-block { border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; padding: 12px 0; margin-bottom: 16px; text-align: justify; }
.paper-abstract-heading { font-size: 11pt; font-weight: bold; text-align: center; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px; }
.paper-abstract { font-size: 10pt; margin: 0 0 8px; }
.paper-subjects { font-size: 9pt; color: #555; line-height: 1.6; }
.paper-columns { display: flex; gap: 24px; }
.paper-column { flex: 1; }
.paper-section-heading { font-size: 11pt; font-weight: bold; margin: 16px 0 6px; }
.paper-equation { text-align: center; margin: 12px 0; font-style: italic; font-size: 11pt; }
.paper-references-block { border-top: 1px solid #ccc; margin-top: 20px; padding-top: 12px; }
.paper-references-heading { font-size: 11pt; font-weight: bold; margin: 0 0 8px; }
.paper-references { font-size: 9pt; line-height: 1.4; padding-left: 24px; margin: 0; }
.paper-references li { margin-bottom: 4px; }
</style>
`;
    }
  },

  // ═══════════════════════════════════════════════════════════
  // OUTLINE
  // ═══════════════════════════════════════════════════════════
  outline: {
    name: 'Outline',
    description: 'Hierarchical document outline with numbered sections and subsections.',
    icon: 'list',
    insert: function() {
      return `
<div class="cog-template document-outline">
  <h1 contenteditable="true">[Document Title]</h1>
  <p class="outline-meta" contenteditable="true">[Author | Date | Category]</p>
  
  <h2 class="outline-level-1" contenteditable="true">I. [First Section]</h2>
  <h3 class="outline-level-2" contenteditable="true">A. [First Subsection]</h3>
  <ul class="outline-bullets">
    <li contenteditable="true">[Key point]</li>
    <li contenteditable="true">[Supporting detail]</li>
  </ul>
  
  <h3 class="outline-level-2" contenteditable="true">B. [Second Subsection]</h3>
  <ul class="outline-bullets">
    <li contenteditable="true">[Key point]</li>
  </ul>
  
  <h2 class="outline-level-1" contenteditable="true">II. [Second Section]</h2>
  <h3 class="outline-level-2" contenteditable="true">A. [Subsection]</h3>
  <ul class="outline-bullets">
    <li contenteditable="true">[Point]</li>
  </ul>
  
  <h2 class="outline-level-1" contenteditable="true">III. [Third Section]</h2>
  <ul class="outline-bullets">
    <li contenteditable="true">[Point]</li>
  </ul>
  
  <h2 class="outline-level-1" contenteditable="true">IV. Conclusion</h2>
  <ul class="outline-bullets">
    <li contenteditable="true">[Summary point]</li>
    <li contenteditable="true">[Final thought or call to action]</li>
  </ul>
</div>
<style>
.document-outline { font-family: 'Segoe UI', sans-serif; }
.document-outline h1 { font-size: 24px; margin-bottom: 4px; }
.outline-meta { font-size: 13px; color: #888; margin-bottom: 20px; }
.outline-level-1 { font-size: 18px; font-weight: bold; margin: 20px 0 8px; }
.outline-level-2 { font-size: 15px; font-weight: 600; margin: 14px 0 6px; padding-left: 20px; }
.outline-bullets { margin: 4px 0 8px; padding-left: 40px; }
.outline-bullets li { margin-bottom: 4px; font-size: 14px; }
</style>
`;
    }
  },

  // ═══════════════════════════════════════════════════════════
  // EMAIL
  // ═══════════════════════════════════════════════════════════
  email: {
    name: 'Email',
    description: 'Formal email template with subject line, greeting, body, and signature block.',
    icon: 'envelope',
    insert: function() {
      return `
<div class="cog-template email-template">
  <table class="email-header">
    <tr>
      <td class="email-label"><strong>To:</strong></td>
      <td contenteditable="true">[recipient@email.com]</td>
    </tr>
    <tr>
      <td class="email-label"><strong>From:</strong></td>
      <td contenteditable="true">[your.name@email.com]</td>
    </tr>
    <tr>
      <td class="email-label"><strong>Subject:</strong></td>
      <td contenteditable="true">[Email Subject]</td>
    </tr>
  </table>
  
  <hr class="email-divider">
  
  <p class="email-greeting" contenteditable="true">Dear [Recipient Name],</p>
  
  <p class="email-body" contenteditable="true">[State the purpose of your email in one or two sentences.]</p>
  
  <p class="email-body" contenteditable="true">[Provide context or details. Keep paragraphs short.]</p>
  
  <p class="email-body" contenteditable="true">[State what you need or what happens next.]</p>
  
  <p class="email-body" contenteditable="true">Thank you for your time. I look forward to hearing from you.</p>
  
  <p class="email-closing">Best regards,<br>
  <span contenteditable="true">[Your Name]</span><br>
  <span class="email-signature" contenteditable="true">[Your Title]<br>
[Your Organization]<br>
[Phone] | [Email]</span>
  </p>
</div>
<style>
.email-template { font-family: 'Segoe UI', Calibri, Arial, sans-serif; font-size: 14px; line-height: 1.6; }
.email-header { width: 100%; border-collapse: collapse; margin-bottom: 0; }
.email-header td { padding: 2px 8px 2px 0; font-size: 13px; }
.email-label { white-space: nowrap; width: 80px; color: #666; }
.email-divider { border: none; border-top: 1px solid #ddd; margin: 12px 0; }
.email-greeting { margin: 16px 0 12px; }
.email-body { margin: 0 0 12px; }
.email-closing { margin-top: 16px; }
.email-signature { font-size: 12px; color: #666; line-height: 1.5; }
</style>
`;
    }
  },

  // ═══════════════════════════════════════════════════════════
  // BOOK / MANUSCRIPT
  // ═══════════════════════════════════════════════════════════
  book: {
    name: 'Book Manuscript',
    description: 'Novel or nonfiction book format with title page, chapter headings, and scene breaks.',
    icon: 'book',
    insert: function() {
      return `
<div class="cog-template book-manuscript">
  <div class="book-title-page">
    <div class="book-title-spacer-top"></div>
    <h1 class="book-title" contenteditable="true">[Book Title]</h1>
    <h2 class="book-subtitle" contenteditable="true">[Subtitle]</h2>
    <div class="book-author" contenteditable="true">by [Author Name]</div>
    <div class="book-title-spacer-bottom"></div>
  </div>

  <div class="book-chapter">
    <div class="book-chapter-number" contenteditable="true">Chapter One</div>
    <h2 class="book-chapter-title" contenteditable="true">[Chapter Title]</h2>
    <p class="book-body-text" contenteditable="true">[Start writing your first paragraph here.]</p>
    <p class="book-body-text" contenteditable="true">[Continue the narrative.]</p>
  </div>

  <div class="book-chapter">
    <div class="book-chapter-number" contenteditable="true">Chapter Two</div>
    <h2 class="book-chapter-title" contenteditable="true">[Chapter Title]</h2>
    <p class="book-body-text" contenteditable="true">[Start the next chapter.]</p>
  </div>

  <div class="book-chapter">
    <div class="book-chapter-number" contenteditable="true">Chapter Three</div>
    <h2 class="book-chapter-title" contenteditable="true">[Chapter Title]</h2>
    <p class="book-body-text" contenteditable="true">[Continue writing.]</p>
  </div>
</div>
<style>
.book-manuscript { font-family: 'Georgia', 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; color: #1a1a1a; }
.book-title-page { text-align: center; min-height: 400px; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }
.book-title-spacer-top { flex: 2; }
.book-title { font-size: 28pt; font-weight: bold; margin: 0 0 8px; }
.book-subtitle { font-size: 16pt; font-weight: normal; font-style: italic; margin: 0 0 24px; color: #555; }
.book-author { font-size: 14pt; margin-top: 12px; }
.book-title-spacer-bottom { flex: 1; }
.book-chapter { margin-top: 32px; page-break-before: always; }
.book-chapter-number { font-size: 12pt; text-align: center; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 8px; color: #888; }
.book-chapter-title { font-size: 20pt; font-weight: bold; text-align: center; margin: 0 0 24px; }
.book-body-text { text-indent: 2em; margin: 0 0 12px; text-align: justify; }
</style>
`;
    }
  },

  // ═══════════════════════════════════════════════════════════
  // BLANK DOCUMENT
  // ═══════════════════════════════════════════════════════════
  blank: {
    name: 'Blank Document',
    description: 'Start from a clean slate.',
    icon: 'file',
    insert: function() {
      return '<h1>Untitled Document</h1><p></p>';
    }
  },
};

// Export for use in renderer
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TEMPLATES;
}
if (typeof window !== 'undefined') {
  window.COGNITIENCE_TEMPLATES = TEMPLATES;
}
