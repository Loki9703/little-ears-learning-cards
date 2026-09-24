"use client";

import { useId, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { BOOM_LENGTH, EXCAVATOR_ACTION_SECONDS, excavatorPose, SHOULDER, STICK_LENGTH } from "./excavatorMotion";

gsap.registerPlugin(useGSAP);
const bucketPath = "M 8 52 Q -2 58 2 72 Q 8 82 22 78 Q 28 72 26 62 Q 24 52 14 50 Z";
const rest = excavatorPose(0);

export default function ExcavatorIllustration({ isActive, playKey }: { isActive: boolean; playKey: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const boomRef = useRef<SVGGElement>(null);
  const stickRef = useRef<SVGGElement>(null);
  const bucketRef = useRef<SVGGElement>(null);
  const pistonRef = useRef<SVGGElement>(null);
  const barrelRef = useRef<SVGGElement>(null);
  const rodRef = useRef<SVGGElement>(null);
  const loadRef = useRef<SVGPathElement>(null);
  const soilRef = useRef<SVGGElement>(null);
  const id = useId();
  const gradientIds = { body: `${id}-body`, arm: `${id}-arm`, glass: `${id}-glass` };

  useGSAP(() => {
    if (!isActive) return;
    const soil = Array.from(soilRef.current?.querySelectorAll("circle") ?? []);
    const paint = (time: number) => {
      const pose = excavatorPose(time);
      boomRef.current?.setAttribute("transform", `translate(${SHOULDER.x} ${SHOULDER.y}) rotate(${pose.boom})`);
      stickRef.current?.setAttribute("transform", `rotate(${pose.stick})`);
      bucketRef.current?.setAttribute("transform", `rotate(${pose.bucket})`);
      pistonRef.current?.setAttribute("transform", `translate(104 87) rotate(${pose.pistonAngle})`);
      barrelRef.current?.setAttribute("transform", `scale(1 ${pose.pistonLength * .58 / 28})`);
      rodRef.current?.setAttribute("transform", `translate(0 ${pose.pistonLength * .4}) scale(1 ${pose.pistonLength * .6 / 22})`);
      loadRef.current?.setAttribute("opacity", String(pose.load));
      soil.forEach((particle, index) => {
        particle.setAttribute("cx", String(pose.soil[index].x));
        particle.setAttribute("cy", String(pose.soil[index].y));
        particle.setAttribute("opacity", String(pose.soil[index].opacity));
      });
    };
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const clock = { time: 0 };
      const animation = gsap.to(clock, {
        time: EXCAVATOR_ACTION_SECONDS,
        duration: EXCAVATOR_ACTION_SECONDS,
        ease: "none",
        onUpdate: () => paint(clock.time),
      });
      return () => { animation.kill(); paint(0); };
    });
    return () => media.revert();
  }, { scope: svgRef, dependencies: [isActive, playKey], revertOnUpdate: true });

  return (
    <svg ref={svgRef} className="flat-illustration excavator-illustration" viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradientIds.body} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD600"/>
          <stop offset="100%" stopColor="#FFB300"/>
        </linearGradient>
        <linearGradient id={gradientIds.arm} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFCA28"/>
          <stop offset="100%" stopColor="#FF9800"/>
        </linearGradient>
        <linearGradient id={gradientIds.glass} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B3E5FC"/>
          <stop offset="100%" stopColor="#81D4FA"/>
        </linearGradient>
      </defs>

      <ellipse cx="120" cy="148" rx="95" ry="8" fill="#C8B898" opacity="0.5"/>

      <rect x="35" y="118" width="75" height="28" rx="6" fill="#37474F"/>
      <rect x="38" y="121" width="69" height="22" rx="4" fill="#263238"/>

      <circle cx="48" cy="132" r="7" fill="#455A64"/>
      <circle cx="65" cy="132" r="7" fill="#455A64"/>
      <circle cx="82" cy="132" r="7" fill="#455A64"/>
      <circle cx="99" cy="132" r="7" fill="#455A64"/>

      <rect x="130" y="118" width="75" height="28" rx="6" fill="#37474F"/>
      <rect x="133" y="121" width="69" height="22" rx="4" fill="#263238"/>

      <circle cx="143" cy="132" r="7" fill="#455A64"/>
      <circle cx="160" cy="132" r="7" fill="#455A64"/>
      <circle cx="177" cy="132" r="7" fill="#455A64"/>
      <circle cx="194" cy="132" r="7" fill="#455A64"/>

      <rect x="55" y="72" width="130" height="50" rx="10" fill={`url(#${gradientIds.body})`}/>

      <rect x="60" y="76" width="120" height="18" rx="6" fill="#FFE082" opacity="0.6"/>

      <rect x="115" y="28" width="62" height="48" rx="8" fill={`url(#${gradientIds.body})`}/>
      <rect x="118" y="31" width="56" height="20" rx="5" fill={`url(#${gradientIds.glass})`}/>

      <rect x="120" y="33" width="30" height="8" rx="3" fill="#E1F5FE" opacity="0.7"/>

      <circle cx="155" cy="50" r="5" fill="#FFCC80"/>
      <rect x="150" y="55" width="10" height="8" rx="2" fill="#FF7043"/>

      <rect x="130" y="22" width="12" height="8" rx="3" fill="#FFEB3B"/>
      <ellipse cx="136" cy="22" rx="6" ry="2" fill="#FFF59D"/>

      <rect x="168" y="52" width="6" height="24" rx="2" fill="#78909C"/>
      <ellipse cx="171" cy="50" rx="5" ry="3" fill="#546E7A"/>

      <rect x="125" y="82" width="32" height="32" rx="4" fill="#FF8F00" opacity="0.3"/>
      <rect x="128" y="85" width="26" height="20" rx="3" fill="#FFCA28" opacity="0.4"/>

      <rect x="130" y="92" width="8" height="3" rx="1" fill="#F57C00"/>

      <rect x="55" y="100" width="130" height="4" fill="#FF8F00" opacity="0.5"/>

      <ellipse cx="60" cy="88" rx="5" ry="7" fill="#FFF9C4"/>
      <ellipse cx="60" cy="88" rx="3" ry="4" fill="#FFFFFF"/>

      <rect x="100" y="86" width="16" height="8" rx="2" fill="#E65100" opacity="0.4"/>

      <rect x="160" y="82" width="12" height="12" rx="2" fill="#424242"/>
      <text x="166" y="91" fontSize="8" fill="#FFD600" textAnchor="middle" fontWeight="bold">!</text>
      <g ref={boomRef} transform={`translate(${SHOULDER.x} ${SHOULDER.y}) rotate(${rest.boom})`}>
        <rect x="40" y="58" width="80" height="18" rx="6" fill={`url(#${gradientIds.arm})`} transform={`scale(${BOOM_LENGTH / 80} 1) translate(-40 -67)`} />
        <g transform={`translate(${BOOM_LENGTH} 0)`}>
          <g ref={stickRef} transform={`rotate(${rest.stick})`}>
            <rect x="15" y="42" width="65" height="14" rx="5" fill={`url(#${gradientIds.arm})`} transform={`scale(${STICK_LENGTH / 65} 1) translate(-15 -49)`} />
            <g transform={`translate(${STICK_LENGTH} 0)`}>
              <g ref={bucketRef} transform={`rotate(${rest.bucket})`}>
                <g transform="translate(-14 -52)">
                  <path d={bucketPath} fill="#546E7A" />
                  <path ref={loadRef} d={bucketPath} fill="#b98046" transform="translate(5.6 26.4) scale(.6)" opacity="0" />
                  <path d="M 6 55 Q 0 60 4 70 Q 10 76 18 74" fill="none" stroke="#78909C" strokeWidth="2" strokeLinecap="round" />
                  <path d="M 4 72 L 0 78 M 10 76 L 8 82 M 16 74 L 16 80" stroke="#37474F" strokeWidth="2.5" strokeLinecap="round" />
                </g>
              </g>
              <g transform="scale(.5) translate(-48 -49)">
                <circle cx="48" cy="49" r="8" fill="#F57C00" />
                <circle cx="48" cy="49" r="4" fill="#FFD54F" />
              </g>
            </g>
          </g>
          <g transform="translate(-48 -49)">
            <circle cx="48" cy="49" r="8" fill="#F57C00" />
            <circle cx="48" cy="49" r="4" fill="#FFD54F" />
          </g>
        </g>
      </g>
      <g ref={pistonRef} transform={`translate(104 87) rotate(${rest.pistonAngle})`}>
        <g ref={rodRef} transform={`translate(0 ${rest.pistonLength * .4}) scale(1 ${rest.pistonLength * .6 / 22})`}>
          <rect x="64" y="50" width="4" height="22" rx="1" fill="#ECEFF1" transform="translate(-66 -50)" />
        </g>
        <g ref={barrelRef} transform={`scale(1 ${rest.pistonLength * .58 / 28})`}>
          <rect x="60" y="48" width="8" height="28" rx="3" fill="#B0BEC5" transform="translate(-64 -48)" />
        </g>
      </g>
      <g transform={`translate(${SHOULDER.x - 80} ${SHOULDER.y - 67})`}>
        <circle cx="80" cy="67" r="10" fill="#F57C00" />
        <circle cx="80" cy="67" r="5" fill="#FFD54F" />
      </g>
      <g ref={soilRef} fill="#b98046">
        {rest.soil.map((particle, index) => <circle key={index} cx={particle.x} cy={particle.y} r={index % 2 ? 2 : 2.8} opacity="0" />)}
      </g>
    </svg>
  );
}
