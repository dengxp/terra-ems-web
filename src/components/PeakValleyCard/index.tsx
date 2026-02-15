import React from 'react';
import styles from './index.less';
import { PeakValleyCardProps } from './types';

const PeakValleyCard: React.FC<PeakValleyCardProps> = ({
    title,
    sharp = 0,
    peak = 0,
    flat = 0,
    valley = 0,
    sharpDiff,
    peakDiff,
    flatDiff,
    valleyDiff,
}) => (
    <div className={styles.card}>
        <div className={styles.title}>{title}</div>
        <div className={styles.grid}>
            <div>
                尖: {sharp?.toLocaleString()}
                {sharpDiff !== undefined && (
                    <span className={styles.diff}>
                        ({sharpDiff > 0 ? '+' : ''}
                        {sharpDiff})
                    </span>
                )}
            </div>
            <div>
                峰: {peak?.toLocaleString()}
                {peakDiff !== undefined && (
                    <span className={styles.diff}>
                        ({peakDiff > 0 ? '+' : ''}
                        {peakDiff})
                    </span>
                )}
            </div>
            <div>
                平: {flat?.toLocaleString()}
                {flatDiff !== undefined && (
                    <span className={styles.diff}>
                        ({flatDiff > 0 ? '+' : ''}
                        {flatDiff})
                    </span>
                )}
            </div>
            <div>
                谷: {valley?.toLocaleString()}
                {valleyDiff !== undefined && (
                    <span className={styles.diff}>
                        ({valleyDiff > 0 ? '+' : ''}
                        {valleyDiff})
                    </span>
                )}
            </div>
        </div>
    </div>
);

export default PeakValleyCard;
