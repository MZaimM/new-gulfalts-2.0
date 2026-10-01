/*
 * H13: hovering or focusing a destination row highlights its marker on the map (which opens
 * its card) and swaps the preview still. Touch devices simply follow the links.
 */

/** Open a marker card upwards when there is no room for it below the marker. */
const placeCard = (marker: HTMLElement) => {
  const panel = marker.querySelector<HTMLElement>('.marker_card-panel');
  if (!panel) return;
  const rect = marker.getBoundingClientRect();
  const middle = rect.top + rect.height / 2;
  const below = middle - 22 + panel.offsetHeight;
  const above = middle + 22 - panel.offsetHeight;
  marker.classList.toggle('is-up', below > window.innerHeight - 16 && above > 16);
};

export const initDirectory = (section: HTMLElement) => {
  const rows = [...section.querySelectorAll<HTMLElement>('.destination_row[data-destination]')];
  const markers = [...section.querySelectorAll<HTMLElement>('.chapter_marker[data-destination]')];
  const previews = [...section.querySelectorAll<HTMLElement>('[data-preview]')];

  const highlight = (id: string | null) => {
    markers.forEach(marker => {
      const on = marker.dataset.destination === id;
      if (on) placeCard(marker);
      marker.classList.toggle('is-highlight', on);
    });
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
    marker.addEventListener('mouseleave', () => highlight(null));
  });
  section.querySelector('.destination_directory')?.addEventListener('mouseleave', () => highlight(null));
  previews[0]?.classList.add('is-shown');
};
