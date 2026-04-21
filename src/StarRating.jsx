import { useState } from "react";

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);

  const handleClick = (rating) => {
    // reset if clicking same rating
    if (rating === value) {
      onChange(0);
    } else {
      onChange(rating);
    }
  };

  return (
    <div>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => handleClick(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          style={{
            cursor: "pointer",
            fontSize: "20px",
            color:
              star <= (hover || value) ? "gold" : "lightgray",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default StarRating;