document.addEventListener('DOMContentLoaded', () => {
  const faqItems = document.querySelectorAll('.faq-accordion-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question-btn');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Close all other accordion items for clean single-expanded UX
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        const otherAns = otherItem.querySelector('.faq-answer');
        if (otherAns) {
          otherAns.style.maxHeight = null;
        }
      });

      // Toggle clicked item
      if (!isOpen) {
        item.classList.add('active');
        const answer = item.querySelector('.faq-answer');
        if (answer) {
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      }
    });
  });
});
