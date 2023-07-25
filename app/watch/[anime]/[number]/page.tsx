import { enimeApi } from '@/lib/constant';
import styles from './page.module.scss';

import EnimePlayer from '@/components/player';
import classNames from 'classnames';
import NextLink from 'next/link';
import { title } from '@/lib/helper';
import EpisodeListItem from '@/components/episode-list-item';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Watch({ params }) {
    if (!params.anime || !params.number) return <></>

    const episode = await (await fetch(enimeApi + `/view/${params.anime}/${params.number}`, { next: { revalidate: 600 }})).json();

    if (!episode.anime) return <></>

    const session = await getSession();

    return (
        <div
            className={classNames(
                styles.cont,
                'my-4 lg:my-20 items-stretch flex-col px-3.5 lg:px-[10vw] lg:py-0 lg:flex-row 1',
                'no-ads'
            )}
        >
            <div className={classNames(styles.episode)}>
                <EnimePlayer className="relative w-full aspect-video mb-8" episode={episode} setting={session?.setting}/>
                <div className="m-2">
                    <NextLink href={`/anime/${episode.anime.slug}`} prefetch={false}>
                        <span className="text-3xl">{title(episode.anime.title)}</span>
                    </NextLink>
                    <p className="text-xl text-tertiary">
                        Episode {episode.number}
                        {episode.title && <span>: {episode.title}</span>}
                    </p>
                </div>
            </div>
            <div
                className={classNames(
                    styles['next-eps'],
                    'lg:pl-10 flex flex-col items-start justify-start mt-2 lg:mt-0 lg:w-[17.5rem] lg:h-full max-lg:(w-0 hidden) w-full'
                )}
            >
                <span className="text-3xl mb-4 pl-3 m-0">Episodes</span>
                <div className={styles.line} />
                <div
                    className={classNames(
                        styles.nextEps,
                        'flex flex-row lg:flex-col py-3 p-0 m-0 justify-start overflow-x-auto lg:overflow-y-auto w-full'
                    )}
                >
                    {episode.anime.episodes.map((ep) => {
                        return (
                            <NextLink
                                key={ep.id}
                                href={`/watch/[anime]/[number]/`}
                                as={`/watch/${episode.anime.slug}/${ep.number}`}
                                prefetch={false}
                            >
                                <div
                                    className={classNames(
                                        styles['next-ep'],
                                        'w-full px-1 py-2 relative w-[8.5rem] md:w-[16.5rem] lg:w-full'
                                    )}
                                >
                                    <EpisodeListItem episode={ep} />
                                    {ep.number === episode.number && (
                                        <div
                                            className={classNames(
                                                styles.currenttext,
                                                'absolute top-0 right-0 left-0 bottom-0 bg-[#000000b0] font-bold text-3xl'
                                            )}
                                        >
                                            Current
                                            <br />
                                            <br />
                                        </div>
                                    )}
                                </div>
                            </NextLink>
                        )
                    })}
                </div>
                <div className={styles.line} />
            </div>
        </div>
    )
}
