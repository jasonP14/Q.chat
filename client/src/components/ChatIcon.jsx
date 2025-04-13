import React from 'react';

const ChatIcon = (props) => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect width={200} height={200} fill="transparent" />
    <g>
      <path
        d="M40,40 h100 v80 h-60 l-20,30 v-30 h-20 z"
        fill="#8A2BE2"
        stroke="#000000"
        strokeWidth={4}
        strokeLinejoin="miter"
      />
      <rect x={60} y={70} width={15} height={15} fill="#FFFFFF" />
      <rect x={85} y={70} width={15} height={15} fill="#FFFFFF" />
      <rect x={110} y={70} width={15} height={15} fill="#FFFFFF" />
      <rect x={45} y={45} width={10} height={10} fill="#D896FF" />
      <rect x={130} y={50} width={5} height={5} fill="#D896FF" />
      <rect x={55} y={110} width={8} height={8} fill="#D896FF" />
      <path
        d="M40,60 h100 M40,80 h100 M40,100 h80 M60,40 v80 M80,40 v80 M100,40 v80 M120,40 v80"
        stroke="#6B238E"
        strokeWidth={1}
        strokeOpacity={0.3}
      />
    </g>
  </svg>
);

export default ChatIcon;