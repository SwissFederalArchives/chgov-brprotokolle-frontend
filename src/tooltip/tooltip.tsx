import { Fade } from '@material-ui/core';
import { withStyles, Theme } from '@material-ui/core/styles';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

interface IProps extends Omit<TooltipProps, 'children'> {
    children?: React.ReactElement<any, any>;
}

const styles = (theme: Theme) => ({
    tooltip: {
        backgroundColor: '#ffffff',
        maxWidth: 220,
        color: 'inherit',
        border: '1px solid #dadde9',
    },
});

const defaultProps: Partial<TooltipProps> = {
    TransitionComponent: Fade,
    placement: 'right',
};

export default withStyles(styles)((props: IProps) => <Tooltip {...{ ...defaultProps, ...props }}>{props.children || <span><FontAwesomeIcon icon={faInfoCircle} size="lg" color="#069" style={{cursor: 'pointer'}} /></span>}</Tooltip>);
