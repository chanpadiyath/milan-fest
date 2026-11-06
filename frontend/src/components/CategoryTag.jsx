import { CATEGORY_COLORS } from '../lib/constants.js';

export default function CategoryTag({ category }) {
  return (
    <span className="tag" style={{ '--tag': CATEGORY_COLORS[category] ?? 'var(--plum)' }}>
      {category}
    </span>
  );
}
