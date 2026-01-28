import Image, {type ImageProps} from 'next/image'


import {Border} from '@/components/Border'

type ImagePropsWithOptionalAlt = Omit<ImageProps, 'alt'> & { alt?: string }

function BlockquoteWithImage({
                                 author,
                                 children,
                                 className,
                                 image,
                             }: {
    author: { name: string; role: string }
    children: React.ReactNode
    className?: string
    image: ImagePropsWithOptionalAlt
}) {
    return (
        <figure
        >
            <blockquote>
                {typeof children === 'string' ? <p>{children}</p> : children}
            </blockquote>
            <div>
                <Image
                    alt=""
                    {...image}
                    sizes="(min-width: 1024px) 17.625rem, (min-width: 768px) 16rem, (min-width: 640px) 40vw, 3rem"
                />
            </div>
            <figcaption>
                <span>{author.name}</span>
                <span>, </span>
                <br/>
                <span>{author.role}</span>
            </figcaption>
        </figure>
    )
}

function BlockquoteWithoutImage({
                                    author,
                                    children,
                                    className,
                                }: {
    author: { name: string; role: string }
    children: React.ReactNode
    className?: string
}) {
    return (
        <Border position="left">
            <figure>
                <blockquote>
                    {typeof children === 'string' ? <p>{children}</p> : children}
                </blockquote>
                <figcaption>
                    {author.name}, {author.role}
                </figcaption>
            </figure>
        </Border>
    )
}

export function Blockquote(
    props:
        | React.ComponentPropsWithoutRef<typeof BlockquoteWithImage>
        | (React.ComponentPropsWithoutRef<typeof BlockquoteWithoutImage> & {
        image?: undefined
    }),
) {
    if (props.image) {
        return <BlockquoteWithImage {...props} />
    }

    return <BlockquoteWithoutImage {...props} />
}
