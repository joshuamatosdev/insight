import {IconProps} from '../Icon.types';
import {Icon} from '../Icon';

export function MenuIcon(props: IconProps) {
    return (
        <Icon
            {...props}
            paths={[
                'M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z',
            ]}
        />
    );
}

export function HamburgerIcon(props: IconProps) {
    return <MenuIcon {...props} />;
}
