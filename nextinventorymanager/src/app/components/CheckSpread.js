import React from "react";

/**
 *  This component takes any number of other items and arranges them as a horizontal
 *  pill shaped object. Each item is separate from the others and if a given item has a color
 *  prop CheckSpread makes the background of its space said color.
 * 
 *  The original intent is to take FourBox items but it will work for any sort.
 * 
 */

export default function CheckSpread({children}) {
  const items = React.Children.toArray(children);

  return (
    <div
      style={{
        display: "inline-flex",
        borderRadius: 999,
        height: 32,
        overflow: "hidden",
        border: "3px solid #45144a"
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
              width: 30,
              alignItems: "center",
              borderRight: !isLast ? "2px solid #45144a" : "none"
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