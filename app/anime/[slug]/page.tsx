import { enimeApi } from '@/lib/constant';
import styles from './page.module.scss';
import { Anime } from '@/lib/types';
import classNames from 'classnames';
import { title } from '@/lib/helper';
import NextLink from 'next/link';
import EpisodeListItem from '@/components/episode-list-item';
import Arrow from '@/components/arrow';

export default async function AnimeInfo({ params }) {
    const response = await (await fetch(enimeApi + `/anime/${params.slug}`, { next: { revalidate: 60 }})).json();

    if (response?.statusCode === 404) return <p>Anime not found</p>

    const anime: Anime = response as Anime;

    const { bannerImage, coverImage, slug, title: animeTitle, status, currentEpisode, description, episodes } = anime;

    return (
        <>
            <div className={classNames(styles.banner, "w-full block h-[25rem] bg-center bg-cover")}
                 style={{ backgroundImage: `url(${bannerImage || `/images/default-banner.png`})` }}></div>
            <div className={classNames(styles.cover, "absolute w-[12.5rem] h-[18.75rem] bg-center bg-cover rounded-md")}
                 style={{ backgroundImage: `url(${coverImage})`}}></div>
            <div className={classNames(styles.desc, "mb-[5rem]")}>
                <p className="text-white text-4xl">{ title(animeTitle) }</p>
                <p className="text-tertiary text-2xl">{ status } • { currentEpisode } Episodes</p>
                <p className={classNames(styles["desc-text"], "pt-2")}><div dangerouslySetInnerHTML={{ __html: description?.replace(/(?:<br>\s*)+/g, `<br>`) || "" }}/></p>
            </div>
            <Arrow>
                <div className={classNames(styles.eparrows, "flex flex-row flex-nowrap items-center m-0 overflow-x-scroll w-full pr-5 pl-5")}>
                    {episodes.map(episode => {
                        return (
                            <NextLink key={episode.id} href={`/watch/${slug}/${episode.number}`}>
                                <div className={classNames(styles.eps, "px-2")}>
                                    <EpisodeListItem episode={episode}/>
                                </div>
                            </NextLink>
                        )
                    })}
                </div>
            </Arrow>
        </>
    )
}