const faqSection = document.querySelector(".faq-reference-section");

if (faqSection) {
  const tabs = Array.from(faqSection.querySelectorAll(".faq-reference-tab"));
  const panels = Array.from(faqSection.querySelectorAll(".faq-reference-panel"));

  const activateTab = (selectedTab, moveFocus = false) => {
    tabs.forEach((tab) => {
      const isSelected = tab === selectedTab;
      tab.classList.toggle("active", isSelected);
      tab.setAttribute("aria-selected", String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;
    });

    panels.forEach((panel) => {
      const isSelected = panel.id === selectedTab.getAttribute("aria-controls");
      panel.hidden = !isSelected;
      panel.classList.toggle("active", isSelected);
    });

    if (moveFocus) selectedTab.focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (event) => {
      let nextIndex;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      if (nextIndex === undefined) return;

      event.preventDefault();
      activateTab(tabs[nextIndex], true);
    });
  });

  faqSection.querySelectorAll(".faq-reference-item").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;

      item.closest(".faq-reference-list")
        ?.querySelectorAll(".faq-reference-item[open]")
        .forEach((openItem) => {
          if (openItem !== item) openItem.open = false;
        });
    });
  });
}
