/*
 * H13: hovering or focusing a destination row highlights its marker on the aerial and swaps
 * the preview still. Touch devices simply follow the links.
 */
export const initDirectory = (section: HTMLElement) => {
  const rows = [...section.querySelectorAll<HTMLElement>('.destination_row[data-destination]')];
  const markers = [...section.querySelectorAll<HTMLElement>('.chapter_marker[data-destination]')];
  const previews = [...section.querySelectorAll<HTMLElement>('[data-preview]')];

  const highlight = (id: string | null) => {
    markers.forEach(marker => marker.classList.toggle('is-highlight', marker.dataset.destination === id));
    if (!id || !previews.some(preview => preview.dataset.preview === id)) return;
    previews.forEach(preview => preview.classList.toggle('is-shown', preview.dataset.preview === id));
  };

  rows.forEach(row => {
    const id = row.dataset.destination ?? null;
    row.addEventListener('mouseenter', () => highlight(id));
    row.addEventListener('focus', () => highlight(id));
  });
  markers.forEach(marker => {
    const id = marker.dataset.destination ?? null;
    marker.addEventListener('mouseenter', () => highlight(id));
    marker.addEventListener('focusin', () => highlight(id));
  });
  section.querySelector('.destination_directory')?.addEventListener('mouseleave', () => highlight(null));
  previews[0]?.classList.add('is-shown');
};
