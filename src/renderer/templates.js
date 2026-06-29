/**
 * Cognition WP — Document Templates
 * Built-in templates that users can insert into their document.
 * Templates are stored as HTML (since the editor uses contenteditable).
 * 
 * Templates included:
 *   - arXiv Research Paper (two-column academic format with abstract, sections, references)
 *   - Outline (hierarchical outline with numbered sections)
 *   - Email (formal email format with subject, greeting, body, signature)
 *   - Book (chapter-based manuscript format with title page)
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
  <!-- Title block -->
  <div class="paper-title-block">
    <h1 class="paper-title" contenteditable="true">Your Paper Title Here</h1>
    <div class="paper-authors">
      <span class="paper-author">Author One<sup>1</sup></span>,
      <span class="paper-author">Author Two<sup>2</sup></span>,
      <span class="paper-author">Author Three<sup>1</sup></span>
    </div>
    <div class="paper-affiliations">
      <div><sup>1</sup>Department of Computer Science, University One, City, Country</div>
      <div><sup>2</sup>Institute of Research, City, Country</div>
    </div>
    <div class="paper-email">corresponding-author@example.edu</div>
    <div class="paper-date">June 2026</div>
  </div>

  <!-- Abstract -->
  <div class="paper-abstract-block">
    <h2 class="paper-abstract-heading">Abstract</h2>
    <p class="paper-abstract" contenteditable="true">Write your abstract here. The abstract should be a concise summary of your paper, typically 150-250 words. It should cover the problem, approach, key results, and main conclusions. Avoid citations and detailed math in the abstract.</p>
    <!-- Keywords / Subject categories (arXiv style) -->
    <div class="paper-subjects">
      <strong>Subject Categories:</strong> [Primary subject — e.g., cs.CL]<br>
      <strong>Keywords:</strong> keyword one, keyword two, keyword three
    </div>
  </div>

  <!-- Two-column body -->
  <div class="paper-columns">
    <div class="paper-column paper-column-left">
      <h2 class="paper-section-heading">1. Introduction</h2>
      <p contenteditable="true">The introduction should motivate the problem and summarize the contributions. Start with a broad context, then narrow down to the specific gap your work addresses. State your contributions explicitly, ideally as a bulleted list:</p>
      <ul contenteditable="true">
        <li>We propose a novel method for ...</li>
        <li>We introduce a dataset of ...</li>
        <li>We demonstrate improvements of X% over ...</li>
      </ul>
      <p contenteditable="true">The remainder of this paper is organized as follows. Section 2 reviews related work. Section 3 describes our methodology. Section 4 presents experimental results. Section 5 concludes.</p>

      <h2 class="paper-section-heading">2. Related Work</h2>
      <p contenteditable="true">Discuss prior work relevant to your contribution. Group by theme rather than listing chronologically. Clearly articulate how your work differs from or builds upon each thread.</p>
    </div>
    <div class="paper-column paper-column-right">
      <h2 class="paper-section-heading">3. Methodology</h2>
      <p contenteditable="true">Describe your approach in sufficient detail for reproducibility. Use mathematical notation where appropriate:</p>
      <div class="paper-equation" contenteditable="true">
        L = -&sum;<sub>i</sub> y<sub>i</sub> log(&#375;<sub>i</sub>) &nbsp; &nbsp; (1)
      </div>
      <p contenteditable="true">Explain each component of your method. Reference figures and tables as Figure 1, Table 1, etc.</p>

      <h2 class="paper-section-heading">4. Experiments</h2>
      <h3 class="paper-subsection-heading">4.1 Experimental Setup</h3>
      <p contenteditable="true">Describe datasets, baselines, metrics, and hardware. Example results table:</p>
      <table class="paper-table">
        <thead>
          <tr><th>Method</th><th>Accuracy</th><th>F1</th><th>Latency (ms)</th></tr>
        </thead>
        <tbody>
          <tr><td>Baseline</td><td>82.3</td><td>80.1</td><td>12</td></tr>
          <tr><td>Ours</td><td><strong>89.7</strong></td><td><strong>88.2</strong></td><td>15</td></tr>
        </tbody>
      </table>

      <h2 class="paper-section-heading">5. Conclusion</h2>
      <p contenteditable="true">Summarize your findings and their implications. Discuss limitations and future directions. Keep this section focused — typically one paragraph.</p>
    </div>
  </div>

  <!-- References (single column, below body) -->
  <div class="paper-references-block">
    <h2 class="paper-references-heading">References</h2>
    <ol class="paper-references" contenteditable="true">
      <li>Smith, J. &amp; Doe, A. (2025). <em>Title of the paper</em>. In Proceedings of the Conference, pp. 1-10.</li>
      <li>Lee, B. et al. (2024). <em>Another relevant work</em>. Journal Name, 15(3), 200-215.</li>
      <li>Wang, C. &amp; Garcia, M. (2026). <em>Recent advance in the field</em>. arXiv preprint arXiv:2601.00001.</li>
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
.paper-subsection-heading { font-size: 10pt; font-weight: bold; margin: 12px 0 4px; }
.paper-equation { text-align: center; margin: 12px 0; font-style: italic; font-size: 11pt; }
.paper-table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 9pt; }
.paper-table th { border: 1px solid #000; padding: 4px 8px; background: #f0f0f0; font-weight: bold; text-align: center; }
.paper-table td { border: 1px solid #000; padding: 4px 8px; text-align: center; }
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
  <h1 contenteditable="true">Document Title</h1>
  <p class="outline-meta" contenteditable="true">Author Name | Date | Category</p>
  
  <h2 class="outline-level-1">I. First Major Section</h2>
  <h3 class="outline-level-2">A. First Subsection</h3>
  <ul class="outline-bullets">
    <li contenteditable="true">Key point or argument</li>
    <li contenteditable="true">Supporting detail or evidence</li>
    <li contenteditable="true">Transition to next point</li>
  </ul>
  
  <h3 class="outline-level-2">B. Second Subsection</h3>
  <ul class="outline-bullets">
    <li contenteditable="true">Key point</li>
    <li contenteditable="true">Supporting detail</li>
  </ul>
  
  <h2 class="outline-level-1">II. Second Major Section</h2>
  <h3 class="outline-level-2">A. Subsection</h3>
  <ul class="outline-bullets">
    <li contenteditable="true">Point one</li>
    <li contenteditable="true">Point two</li>
    <ol class="outline-sub-bullets">
      <li contenteditable="true">Sub-detail a</li>
      <li contenteditable="true">Sub-detail b</li>
    </ol>
  </ul>
  
  <h3 class="outline-level-2">B. Another Subsection</h3>
  <ul class="outline-bullets">
    <li contenteditable="true">Key argument</li>
    <li contenteditable="true">Evidence or example</li>
  </ul>
  
  <h2 class="outline-level-1">III. Third Major Section</h2>
  <h3 class="outline-level-2">A. Subsection</h3>
  <ul class="outline-bullets">
    <li contenteditable="true">Point</li>
  </ul>
  
  <h2 class="outline-level-1">IV. Conclusion</h2>
  <ul class="outline-bullets">
    <li contenteditable="true">Summary of main points</li>
    <li contenteditable="true">Call to action or final thought</li>
  </ul>
</div>
<style>
.document-outline { font-family: 'Segoe UI', sans-serif; }
.document-outline h1 { font-size: 24px; margin-bottom: 4px; }
.outline-meta { font-size: 13px; color: #888; margin-bottom: 20px; }
.outline-level-1 { font-size: 18px; font-weight: bold; margin: 20px 0 8px; }
.outline-level-2 { font-size: 15px; font-weight: 600; margin: 14px 0 6px; padding-left: 20px; }
.outline-bullets { margin: 4px 0 8px; padding-left: 40px; }
.outline-sub-bullets { margin: 4px 0 8px; padding-left: 20px; }
.outline-bullets li, .outline-sub-bullets li { margin-bottom: 4px; font-size: 14px; }
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
      <td contenteditable="true">recipient@example.com</td>
    </tr>
    <tr>
      <td class="email-label"><strong>From:</strong></td>
      <td contenteditable="true">your.name@example.com</td>
    </tr>
    <tr>
      <td class="email-label"><strong>Subject:</strong></td>
      <td contenteditable="true">Email Subject Line Here</td>
    </tr>
    <tr>
      <td class="email-label"><strong>Date:</strong></td>
      <td contenteditable="true">June 28, 2026</td>
    </tr>
  </table>
  
  <hr class="email-divider">
  
  <p class="email-greeting" contenteditable="true">Dear [Recipient Name],</p>
  
  <p class="email-body" contenteditable="true">I hope this email finds you well. I am writing to [state the purpose of your email — be direct and specific in the opening sentence].</p>
  
  <p class="email-body" contenteditable="true">[Provide context, details, or explanation in 1-2 paragraphs. Keep paragraphs short — 2-3 sentences each. Use bullet points if listing multiple items:]</p>
  
  <ul class="email-bullets" contenteditable="true">
    <li>First point or item</li>
    <li>Second point or item</li>
    <li>Third point or item</li>
  </ul>
  
  <p class="email-body" contenteditable="true">[If requesting action, be specific about what you need and by when. If no action is needed, close with a summary statement.]</p>
  
  <p class="email-body" contenteditable="true">Thank you for your time and consideration. I look forward to hearing from you.</p>
  
  <p class="email-closing">Best regards,<br>
  <span contenteditable="true">Your Name</span><br>
  <span class="email-signature" contenteditable="true">Your Title<br>
Your Organization<br>
Phone: (555) 123-4567<br>
Email: your.name@example.com</span>
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
.email-bullets { margin: 0 0 12px; padding-left: 24px; }
.email-bullets li { margin-bottom: 4px; }
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
  <!-- Title Page -->
  <div class="book-title-page">
    <div class="book-title-spacer-top"></div>
    <h1 class="book-title" contenteditable="true">Book Title</h1>
    <h2 class="book-subtitle" contenteditable="true">A Compelling Subtitle</h2>
    <div class="book-author" contenteditable="true">by Author Name</div>
    <div class="book-title-spacer-bottom"></div>
  </div>

  <!-- Copyright Page -->
  <div class="book-copyright-page">
    <p class="book-copyright" contenteditable="true">Copyright &copy; 2026 Author Name</p>
    <p class="book-copyright" contenteditable="true">All rights reserved. No part of this book may be reproduced or transmitted in any form or by any means, electronic or mechanical, including photocopying, recording, or by any information storage and retrieval system, without permission in writing from the publisher.</p>
    <p class="book-copyright" contenteditable="true">First Edition, 2026</p>
    <p class="book-copyright" contenteditable="true">ISBN: 978-0-000000-00-0</p>
    <p class="book-copyright" contenteditable="true">Published by Publisher Name</p>
  </div>

  <!-- Chapter 1 -->
  <div class="book-chapter">
    <div class="book-chapter-number" contenteditable="true">Chapter One</div>
    <h2 class="book-chapter-title" contenteditable="true">Chapter Title Here</h2>
    <p class="book-body-text" contenteditable="true">Begin the first paragraph of your chapter here. In fiction, this is where you hook the reader — start with action, dialogue, or a striking image. In nonfiction, state the chapter's thesis or main idea.</p>
    <p class="book-body-text" contenteditable="true">Continue the narrative. Each paragraph should advance the story or argument. Aim for natural transitions between paragraphs and scenes.</p>
    <p class="book-body-text" contenteditable="true">Use dialogue to bring characters to life:</p>
    <p class="book-dialogue" contenteditable="true">"Dialogue goes here," said the character.</p>
    <p class="book-dialogue-tag" contenteditable="true">"And the response follows," replied the other.</p>
    
    <!-- Scene break -->
    <p class="book-scene-break">* * *</p>
    
    <p class="book-body-text" contenteditable="true">After a scene break, continue with the next scene. Scene breaks indicate a shift in time, location, or point of view.</p>
  </div>

  <!-- Chapter 2 -->
  <div class="book-chapter">
    <div class="book-chapter-number" contenteditable="true">Chapter Two</div>
    <h2 class="book-chapter-title" contenteditable="true">Next Chapter Title</h2>
    <p class="book-body-text" contenteditable="true">Start the next chapter. Each chapter should build on the previous one and advance the overall arc of the book.</p>
    <p class="book-body-text" contenteditable="true">Continue writing. The typical chapter length for a novel is 2,000-5,000 words, though this varies widely by genre and style.</p>
  </div>

  <!-- Chapter 3 -->
  <div class="book-chapter">
    <div class="book-chapter-number" contenteditable="true">Chapter Three</div>
    <h2 class="book-chapter-title" contenteditable="true">Another Chapter</h2>
    <p class="book-body-text" contenteditable="true">Keep going. A typical novel has 20-40 chapters, running 60,000-100,000 words total.</p>
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
.book-copyright-page { font-size: 9pt; color: #666; line-height: 1.5; page-break-after: always; }
.book-copyright { margin: 0 0 8px; }
.book-chapter { margin-top: 32px; page-break-before: always; }
.book-chapter-number { font-size: 12pt; text-align: center; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 8px; color: #888; }
.book-chapter-title { font-size: 20pt; font-weight: bold; text-align: center; margin: 0 0 24px; }
.book-body-text { text-indent: 2em; margin: 0 0 12px; text-align: justify; }
.book-dialogue { text-indent: 2em; margin: 0 0 12px; }
.book-dialogue-tag { text-indent: 2em; margin: 0 0 12px; }
.book-scene-break { text-align: center; margin: 24px 0; font-size: 14pt; letter-spacing: 8px; color: #aaa; }
</style>
`;
    }
  },

  // ═══════════════════════════════════════════════════════════
  // BLANK DOCUMENT (already exists but include for completeness)
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
  window.COGNITION_TEMPLATES = TEMPLATES;
}
