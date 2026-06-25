/**
 * Word Count Pro — Sample Extension for Cognition WP
 * Demonstrates the extension API: commands, status bar, configuration, notifications.
 */

exports.activate = function (ctx) {
  const logger = ctx.logger;
  logger.info('Word Count Pro activating...');

  // Create a status bar item
  const statusItem = ctx.statusBar.createItem('right', 100);
  statusItem.setTooltip('Word Count Pro — Click for details');
  statusItem.setText('Words: 0');

  // Update word count whenever the editor changes
  let updateTimer = null;
  ctx.documents.onDidChange(() => {
    clearTimeout(updateTimer);
    updateTimer = setTimeout(async () => {
      const content = await ctx.editor.getContent();
      const words = content.trim().split(/\s+/).filter(w => w.length > 0);
      const count = words.length;
      const goal = ctx.config.get('wordcount.goal') || 500;
      const percent = Math.min(100, Math.round((count / goal) * 100));
      statusItem.setText(`Words: ${count} / ${goal} (${percent}%)`);

      if (count >= goal) {
        ctx.notifications.info(`Writing goal reached! ${count} words 🎉`);
      }
    }, 500);
  });

  // Register commands
  ctx.commands.registerCommand('wordcount.show', async () => {
    const content = await ctx.editor.getContent();
    const words = content.trim().split(/\s+/).filter(w => w.length > 0);
    const chars = content.length;
    const charsNoSpaces = content.replace(/\s/g, '').length;
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0).length;
    const readingTime = Math.max(1, Math.ceil(words.length / 200));
    const goal = ctx.config.get('wordcount.goal') || 500;

    ctx.notifications.info(
      'Word Count Details',
      `${words.length} words · ${chars} chars · ${charsNoSpaces} chars (no spaces) · ` +
      `${paragraphs} paragraphs · ${sentences} sentences · ${readingTime} min read · ` +
      `Goal: ${Math.round((words.length / goal) * 100)}%`
    );
  });

  ctx.commands.registerCommand('wordcount.setGoal', () => {
    const current = ctx.config.get('wordcount.goal') || 500;
    const input = prompt('Set daily writing goal (words):', String(current));
    if (input) {
      const goal = parseInt(input);
      if (goal > 0) {
        // Note: in the real API this would use ctx.config.set
        ctx.notifications.info(`Writing goal set to ${goal} words/day`);
      }
    }
  });

  statusItem.show();
  logger.info('Word Count Pro activated');
};

exports.deactivate = function () {
  console.log('[word-count-pro] Deactivated');
};
