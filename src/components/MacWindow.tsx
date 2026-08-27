import { ReactNode, CSSProperties } from "react";

type MacWindowProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  trafficLight?: boolean;
  style?: CSSProperties;
};

export default function MacWindow({ title, children, className = "", trafficLight = true, style }: MacWindowProps) {
  return (
    <div className={`mac-window ${className}`} style={style}>
      <div className="mac-titlebar">
        {trafficLight && (
          <div className="traffic-lights" aria-hidden="true">
            <span className="tl-red" />
            <span className="tl-yellow" />
            <span className="tl-green" />
          </div>
        )}
        {title && (
          <span className="flex-1 text-center text-xs font-medium text-meet-700/60 truncate">{title}</span>
        )}
        {trafficLight && <div className="w-12" aria-hidden="true" />}
      </div>
      {children}
    </div>
  );
}