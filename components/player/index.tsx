'use client';

import { enimeApi } from '@/lib/constant';
import React, { useEffect, useRef, useState } from 'react';
import { AniSkip, Episode } from '@/lib/types';
import { sourceUrlToName } from '@/lib/helper';
import { skipOpEd } from '@/lib/player/plugin/skip-op-ed';
import { Highlight } from '@oplayer/ui';
import { Player } from '@oplayer/core';
import hls from '@oplayer/hls';
import ui from '@oplayer/ui';

export default function EnimePlayer(props) {
    const { sources, number, image, anime } = props.episode as Episode;
    const setting = props.setting;

    const [sourceIndex, setSourceIndex] = useState(0);

    const playerContainerRef = useRef<HTMLDivElement>();
    const playerRef = useRef<Player>();

    const [source, setSource] = useState(undefined);
    // const { data: source, error } = useSWR<Source>(enimeApi + `/source/${sources[sourceIndex].id}`, url => fetch(url, { cache: "no-store" }).then(res => res.json()));
    const poster = !image ? undefined : `https://images.weserv.nl/?url=${image}`;

    useEffect(() => {
        if (playerRef.current) return;
        // @ts-ignore
        playerRef.current = Player.make(playerContainerRef.current, {
            volume: setting?.volume * 0.01 || 1
        })
            .use([
                skipOpEd(),
                ui({
                    pictureInPicture: true,
                    miniProgressBar: false,
                    subtitle: { fontSize: 30 },
                    menu: [
                        {
                            name: 'Source',
                            children: sources.map((source) => {
                                return {
                                    name: sourceUrlToName(source.url),
                                    default: source.url.includes('gogoanime'),
                                    value: source.id
                                }
                            }),
                            onChange({ value }) {
                                setSourceIndex(sources.findIndex((source) => source.id === value));
                            },
                        }
                    ]
                }),
                hls()
            ])
            .create()
            .on('error', ({ payload }) => {
                if (payload?.fatal) {
                    setSourceIndex(sourceIndex + 1);
                }
            })
            .on('videosourcechanged', () => {
                // @ts-ignore
                playerRef.current.loader?.on('hlsManifestParsed', (data) => {
                    console.log(data);
                });
            });
    }, []);

    useEffect(() => {
        fetch("http://localhost:3000/api/generate-cdn", {
            method: "POST",
            body: sources[sourceIndex].id
        })
            .then(r => r.text())
            .then(r => {
                setSource({
                    ...sources[sourceIndex],
                    // @ts-ignore
                    url: r,
                });
            })
    }, [sourceIndex]);

    useEffect(() => {
        if (source) {
            // @ts-ignore
            playerRef.current.changeSource({
                // @ts-ignore
                src: source.url,
                ...(poster && {
                    poster: poster,
                }),
            }).then(() => {
                if (anime.mappings.mal) {
                    fetch(`https://api.aniskip.com/v2/skip-times/${anime.mappings.mal}/${number}?types=op&types=recap&types=mixed-op&types=ed&types=mixed-ed&episodeLength=0`)
                        .then(res => res.json())
                        .then(res => {
                            res = res as AniSkip;

                            const highlights: Highlight[] = []
                            let opDuration = [], edDuration = [];

                            if (res.statusCode === 200) {
                                for (let result of res.results) {
                                    if (result.skipType === "op" || result.skipType === "ed") {
                                        const { startTime, endTime } = result.interval;

                                        if (startTime) {
                                            highlights.push({
                                                time: startTime,
                                                text: result.skipType === "op" ? "OP" : "ED"
                                            });
                                            // @ts-ignore
                                            if (result.skipType === "op") opDuration.push(startTime);
                                            // @ts-ignore
                                            else edDuration.push(startTime);
                                        }

                                        if (endTime) {
                                            highlights.push({
                                                time: endTime,
                                                text: result.skipType === "op" ? "OP" : "ED"
                                            });
                                            // @ts-ignore
                                            if (result.skipType === "op") opDuration.push(endTime);
                                            // @ts-ignore
                                            else edDuration.push(endTime);
                                        }
                                    }
                                }
                            }

                            // @ts-ignore
                            playerRef.current.emit("opedchange", [opDuration, edDuration]);
                            // @ts-ignore
                            playerRef.current.plugins.ui.highlight(highlights)
                        });
                }
                // @ts-ignore
                if (source.subtitle) {
                    // @ts-ignore
                    playerRef.current.plugins.ui.subtitle.updateSource([
                        {
                            default: true,
                            // @ts-ignore
                            src: source.subtitle,
                            name: 'English',
                        },
                    ]);
                }
            });
        }
    }, [source]);

    return (
        <div className={props.className}>
            <div className="w-full h-full p-0 m-0" ref={playerContainerRef as React.RefObject<HTMLDivElement>} />
        </div>
    )
}
