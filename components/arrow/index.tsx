'use client'

import React, { useCallback, useRef } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

function ArrowIcon({ className, color }) {
    return (
        <svg className={className} width="48pt" height="48pt" version="1.1" viewBox="0 0 48 48" fill="none">
            <path d="m18.75 36-2.15-2.15 9.9-9.9-9.9-9.9 2.15-2.15L30.8 23.95Z" fill={color} />
        </svg>
    )
}

export default function Arrow({ children }) {
    const childRef = useRef<HTMLDivElement>();

    const scroll = (e: Element, n: number) => {
        e.scrollTo({
            left: e.scrollLeft + n * window.innerWidth,
            behavior: "smooth"
        });
        return e.scrollLeft + n * window.innerWidth;
    }

    return (
        <div className="flex flex-row items-center mt-6 left-0 right-0 m-0 p-0 w-full mb-20">
            { /*@ts-ignore*/ }
            <div onClick={_ => scroll(childRef.current, -1)} className={classNames(styles.button, styles.left, "p-0 w-10 h-10")}>
                <ArrowIcon className={styles.arrow} color="#FFF" />
            </div>
            {React.cloneElement(children, {
                ref: childRef
            })}
            { /*@ts-ignore*/ }
            <div onClick={_ => scroll(childRef.current, 1)} className={classNames(styles.button, styles.right, "p-0 w-10 h-10")}>
                <ArrowIcon className={styles.arrow} color="#FFF" />
            </div>
        </div>
    )
}