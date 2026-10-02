export const FAQ_TOPICS = ['GettingStarted', 'BackgroundChecks', 'Insurance', 'Training'];

export function faqText(item, language) {
  const french = (language || '').startsWith('fr');
  return {
    question: (french && item.questionFr) || item.questionEn,
    answer: (french && item.answerFr) || item.answerEn,
  };
}
