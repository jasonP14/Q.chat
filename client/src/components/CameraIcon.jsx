import * as React from "react";
const CameraIcon = (props) => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect width={200} height={200} fill="transparent" />
    <rect
      x={40}
      y={60}
      width={120}
      height={80}
      fill="#8A2BE2"
      stroke="#000000"
      strokeWidth={4}
      strokeLinejoin="miter"
    />
    <path
      d="M60,60 v-15 h80 v15"
      fill="#8A2BE2"
      stroke="#000000"
      strokeWidth={4}
      strokeLinejoin="miter"
    />
    <rect
      x={70}
      y={50}
      width={20}
      height={10}
      fill="#FFFFFF"
      stroke="#000000"
      strokeWidth={2}
    />
    <rect
      x={80}
      y={80}
      width={40}
      height={40}
      fill="#6B238E"
      stroke="#000000"
      strokeWidth={4}
      strokeLinejoin="miter"
    />
    <rect
      x={90}
      y={90}
      width={20}
      height={20}
      fill="#D896FF"
      stroke="#000000"
      strokeWidth={2}
      strokeLinejoin="miter"
    />
    <rect
      x={135}
      y={70}
      width={15}
      height={10}
      fill="#FF69B4"
      stroke="#000000"
      strokeWidth={2}
      strokeLinejoin="miter"
    />
    <rect
      x={50}
      y={70}
      width={15}
      height={15}
      fill="#000000"
      stroke="#000000"
      strokeWidth={2}
    />
    <rect x={53} y={73} width={9} height={9} fill="#D896FF" />
    <rect x={45} y={65} width={5} height={5} fill="#D896FF" />
    <rect x={150} y={95} width={5} height={5} fill="#D896FF" />
    <rect x={125} y={130} width={10} height={5} fill="#D896FF" />
    <path
      d="M40,80 h120 M40,100 h120 M40,120 h120 M60,60 v80 M80,60 v80 M100,60 v80 M120,60 v80 M140,60 v80"
      stroke="#6B238E"
      strokeWidth={1}
      strokeOpacity={0.3}
    />
  </svg>
);
export default CameraIcon;
