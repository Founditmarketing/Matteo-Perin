import React from 'react';
import { motion } from 'framer-motion';

interface SpinningLogoProps {
    size?: number; // width/height in px
    duration?: number; // seconds for full rotation
    className?: string;
    white?: boolean; // if true, maybe apply a filter (optional, depends on image)
}

export const SpinningLogo: React.FC<SpinningLogoProps> = ({
    size = 100,
    duration = 20,
    className = "",
    white = false
}) => {
    return (
        <div className={`relative flex items-center justify-center overflow-hidden rounded-full ${className}`} style={{ width: size, height: size }}>
            <motion.img
                src="/assets/logo-seal.png"
                alt="Matteo Perin Seal"
                className={`w-full h-full object-contain ${white ? 'brightness-0 invert' : ''}`}
                animate={{ rotate: 360 }}
                transition={{
                    repeat: Infinity,
                    duration: duration,
                    ease: "linear"
                }}
            />
        </div>
    );
};
