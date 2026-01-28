import {Blockquote} from '@/components/Blockquote'
import {Border} from '@/components/Border'
import {GrayscaleTransitionImage} from '@/components/GrayscaleTransitionImage'
import {StatList, StatListItem} from '@/components/StatList'
import {TagList, TagListItem} from '@/components/TagList'

export const MDXComponents = {
    Blockquote({
                   className,
                   ...props
               }: React.ComponentPropsWithoutRef<typeof Blockquote>) {
        return <Blockquote {...props} />
    },
    img: function Img({
                          className,
                          ...props
                      }: React.ComponentPropsWithoutRef<typeof GrayscaleTransitionImage>) {
        return (
            <div
            >
                <GrayscaleTransitionImage
                    {...props}
                    sizes="(min-width: 768px) 42rem, 100vw"
                />
            </div>
        )
    },
    StatList({
                 className,
                 ...props
             }: React.ComponentPropsWithoutRef<typeof StatList>) {
        return (
            <StatList {...props} />
        )
    },
    StatListItem,
    table: function Table({
                              className,
                              ...props
                          }: React.ComponentPropsWithoutRef<'table'>) {
        return (
            <div
            >
                <div>
                    <table {...props} />
                </div>
            </div>
        )
    },
    TagList({
                className,
                ...props
            }: React.ComponentPropsWithoutRef<typeof TagList>) {
        return <TagList {...props} />
    },
    TagListItem,
    TopTip({
               children,
               className,
           }: {
        children: React.ReactNode
        className?: string
    }) {
        return (
            <Border position="left">
                <p>
                    Top tip
                </p>
                <div>{children}</div>
            </Border>
        )
    },
    Typography({className, ...props}: React.ComponentPropsWithoutRef<'div'>) {
        return <div {...props} />
    },
    wrapper({className, ...props}: React.ComponentPropsWithoutRef<'div'>) {
        return (
            <div
                {...props}
            />
        )
    },
}
