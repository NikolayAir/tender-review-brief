export function TagList({ id, title, items }) {
  return (
    <section className="brief-section" aria-labelledby={id}>
      <h3 id={id}>{title}</h3>
      <ul className="tag-list">
        {items.map((item) => (
          <li className="tag" key={item}>
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}
