/*
 * Copyright (c) 2024-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2024-2026 泰若科技（广州）有限公司.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

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
