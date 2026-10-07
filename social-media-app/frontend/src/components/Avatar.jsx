const palette = ["#5B4CFF", "#DC4B3E", "#16A34A", "#D97706", "#0891B2", "#C026D3"];

const colorFor = (name = "") => {
  const code = name.charCodeAt(0) || 0;
  return palette[code % palette.length];
};

const Avatar = ({ src, name, size = 40 }) => {
  const initial = name?.[0]?.toUpperCase() || "?";

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: colorFor(name),
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        fontSize: size * 0.42,
        fontFamily: "var(--font-display)",
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
};

export default Avatar;
