import { Fade, Tooltip, TooltipProps } from '@mui/material';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface IProps extends Omit<TooltipProps, 'children'> {
  children?: React.ReactElement<any, any>;
}

const defaultProps: Partial<TooltipProps> = {
  TransitionComponent: Fade,
  placement: 'right',
  PopperProps: {
    sx: {
      '& .MuiTooltip-tooltip': {
        backgroundColor: '#ffffff',
        maxWidth: 220,
        color: 'inherit',
        border: '1px solid #dadde9',
      },
    },
  },
};

const CustomTooltip = (props: IProps) => (
  <Tooltip {...{ ...defaultProps, ...props }}>
    {props.children ?? (
      <span>
        <FontAwesomeIcon
          icon={faInfoCircle}
          size="lg"
          color="#069"
          style={{ cursor: 'pointer' }}
        />
      </span>
    )}
  </Tooltip>
);

export default CustomTooltip;
