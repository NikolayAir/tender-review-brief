export function TextList({ id, title, items }) {
  return (
    <section className="brief-section" aria-labelledby={id}>
      <h3 id={id}>{title}</h3>
      <ul className="text-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}
