'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react';

import NextLink from 'next/link';
import styles from './index.module.scss';
import classNames from 'classnames';
import useSWR from 'swr';
import { enimeApi } from '@/lib/constant';
import { title } from '@/lib/helper';
import { useDebounce, useOnClickOutside } from '@/lib/hook';
import { useHotkeys } from 'react-hotkeys-hook';
import { SearchResult } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function TopNavigation() {
    const optsRef = useRef<HTMLDivElement>();

    const [searching, setSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const debouncedSearchQuery = useDebounce<string>(searchQuery, 500);

    const router = useRouter();

    const searchbarRef = useRef<HTMLDivElement>();
    useOnClickOutside(searchbarRef, () => {
        if (searching) setSearching(false);
    });

    useHotkeys("ctrl+k, escape, enter", (e, handler) => {
        e.preventDefault();
        switch (handler.key) {
            case "ctrl+k":
                if (!searching) setSearching(true);
                break;
            case "escape":
                if (searching) setSearching(false);
                break;
            case "enter":
                setSearching(false);
                if (debouncedSearchQuery?.length)
                    router.push(`/search/${debouncedSearchQuery}`);
            default:
                break;
        }
    }, { enableOnTags: ["INPUT"] }, [searching]);

    const { data: searchResult, error: searchError } = useSWR<SearchResult>(debouncedSearchQuery ? enimeApi + `/search/${encodeURIComponent(debouncedSearchQuery)}` : null, url => fetch(url).then(r => r.json()));

    return (
        <div className={classNames(styles["nav-cont"], "no-ads")}>
            <div className={classNames(searching ? "hidden" : null, styles.opts, "flex items-center gap-8 h-full mx-auto relative")} ref={optsRef as React.RefObject<HTMLDivElement>}>
                <NextLink href="/" className={classNames(styles["navbar-opt"], "text-4xl")}>Explore</NextLink>
                <div className="grid w-40">
                    <div className={classNames(styles.urmom, styles["navbar-opt"], "text-4xl flex flex-row flex-nowrap items-center px-2")}>
                        <svg width="1.5rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <span onClick={(e) => {
                            e.preventDefault();
                            if (!searching) {
                                setSearching(true);
                            }
                        }} className={classNames(styles.searchtext, "pl-1")}>Search</span>
                    </div>
                </div>
            </div>
            {searching && (
                <div ref={searchbarRef as React.RefObject<HTMLDivElement>} className={classNames(styles.bruh, "m-auto")}>
                    <div>
                        <input autoFocus onChange={(e) => setSearchQuery(e.target.value)}
                               placeholder="Search"
                               onFocus={(e) => e.persist()}
                               className="p-2 px-4 text-4xl w-full"/>
                        <div></div>
                    </div>
                    {searchResult && searchResult.data?.length && (
                        <>
                            <div className={styles.divider}></div>
                            {searchResult.data.map(result => {
                                return (
                                    <NextLink href={`/anime/${result.slug}`} tabIndex={0} className={classNames(styles.searchresultlink, styles.anime)}>
                                        <div className={classNames(styles.searchresultimg, "h-10 aspect-video bg-cover bg-center")} style={{ backgroundImage: `url(${result.coverImage})` }}></div>
                                        <div className="flex flex-col">
                                            <p className={classNames(styles.searchresulttitle, "text-xl")}>
                                                { title(result.title) }
                                            </p>
                                            <p className={classNames(styles.searchresultdesc, "text-sm text-tertiary")}>
                                                <>{ result.currentEpisode } Episodes</>
                                            </p>
                                        </div>
                                    </NextLink>
                                )
                            })}
                        </>
                    )}
                    {!searchResult && (
                        <div>No Result</div>
                    )}
                </div>
            )}
        </div>
    )
}