import React from "react";

export default function CheckSpread({ children }) {
  const items = React.Children.toArray(children);

  return (
    <div
      style={{
        display: "inline-flex",
        borderRadius: 999,
        overflow: "hidden",
        border: "1px solid #ccc"
      }}
    >
      {items.map((child, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1;

        const bgColor = child.props.color || "white";

        return (
          <div
            key={index}
            style={{
              background: bgColor,
              display: "flex",
              alignItems: "center",
              borderRight: !isLast ? "1px solid #45144a" : "none"
            }}
          >
            {React.cloneElement(child, {
              style: {
                borderRadius: isFirst
                  ? "999px 0 0 999px"
                  : isLast
                  ? "0 999px 999px 0"
                  : "0",
                ...(child.props.style || {})
              }
            })}
          </div>
        );
      })}
    </div>
  );
}