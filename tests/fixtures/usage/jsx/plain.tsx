// expect: none
export const view = (styles: { card: string }) => (
  <>
    <div className="deck-list wide">Decks</div>
    <article className={styles.card} data-odd-card="">Ember Aggro</article>
    <p title="odd-hint">Shown on your profile.</p>
  </>
);
