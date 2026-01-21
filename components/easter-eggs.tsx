'use client'

import { useEffect, useState } from 'react'

interface PaperAirplaneProps {
  trigger: boolean
}

export function PaperAirplane({ trigger }: PaperAirplaneProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (trigger) {
      setShow(true)
      const timer = setTimeout(() => setShow(false), 2500)
      return () => clearTimeout(timer)
    }
  }, [trigger])

  if (!show) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      <div className="paper-airplane">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        >
          <path d="M22 2L11 13" />
          <path d="M22 2L15 22L11 13L2 9L22 2Z" />
        </svg>
      </div>
      <style jsx>{`
        .paper-airplane {
          position: absolute;
          left: -60px;
          top: 30%;
          animation: fly-across 2.5s ease-in-out forwards;
        }

        @keyframes fly-across {
          0% {
            left: -60px;
            top: 30%;
            transform: rotate(-15deg);
            opacity: 1;
          }
          25% {
            top: 20%;
            transform: rotate(-25deg);
          }
          50% {
            top: 35%;
            transform: rotate(-10deg);
          }
          75% {
            top: 25%;
            transform: rotate(-20deg);
          }
          100% {
            left: calc(100% + 60px);
            top: 30%;
            transform: rotate(-15deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

interface PaperCrumpleProps {
  trigger: number // Increment to trigger new animation
}

export function PaperCrumple({ trigger }: PaperCrumpleProps) {
  const [animations, setAnimations] = useState<{ id: number; x: number }[]>([])

  useEffect(() => {
    if (trigger > 0) {
      // 20% chance of showing animation
      if (Math.random() < 0.2) {
        const id = Date.now()
        const x = Math.random() * 60 + 20 // Random position between 20% and 80%
        setAnimations((prev) => [...prev, { id, x }])

        setTimeout(() => {
          setAnimations((prev) => prev.filter((a) => a.id !== id))
        }, 1500)
      }
    }
  }, [trigger])

  if (animations.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {animations.map((anim) => (
        <div
          key={anim.id}
          className="paper-crumple"
          style={{ left: `${anim.x}%` }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-muted-foreground"
          >
            <path d="M4 6l3.5 1.5L12 4l4.5 3.5L20 6l-2 5 2 7-4-2-4 4-4-4-4 2 2-7-2-5z" />
            <path d="M12 4v4M7.5 7.5l2.5 2M16.5 7.5l-2.5 2" />
          </svg>
        </div>
      ))}
      <style jsx>{`
        .paper-crumple {
          position: absolute;
          top: 40%;
          animation: crumple-fall 1.5s ease-in forwards;
        }

        @keyframes crumple-fall {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          30% {
            transform: translateY(100px) rotate(180deg) scale(0.9);
          }
          60% {
            transform: translateY(200px) rotate(360deg) scale(0.8);
          }
          100% {
            transform: translateY(400px) rotate(540deg) scale(0.6);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
