import React, { useEffect, useState } from 'react';
import { alpha, makeStyles } from '@material-ui/core/styles';
import Slider, { Mark } from '@material-ui/core/Slider';
import Cookie from 'universal-cookie';

const useStylesRangeSlider = makeStyles((theme) => ({
  root: {
    color: theme.palette.primary.main,
    height: 2,
    padding: '15px 0',
  },
  thumb: {
    height: ({ size } : Pick<IProps, 'size'>) => size === 'small' ? 12 : 16,
    width: ({ size } : Pick<IProps, 'size'>) => size === 'small' ? 12: 16,
    backgroundColor: theme.palette.primary.main,
    marginTop: ({ size } : Pick<IProps, 'size'>) => size === 'small' ? -6 : -8,
    marginLeft: ({ size } : Pick<IProps, 'size'>) => size === 'small' ? -6 : -8,
    boxShadow: `none`,

    '&::after': {
      content: '',
      position: 'absolute',
      width: ({ size } : Pick<IProps, 'size'>) => size === 'small' ? 44 : 64,
      height: ({ size } : Pick<IProps, 'size'>) => size === 'small' ? 44 : 64,
      borderRadius: '50%',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: `${alpha(theme.palette.primary.main, 0.3)}`,
      transition: 'background-color 0.3s ease',
    },
    '&.MuiSlider-thumb:hover': {
      '&::after': {
        backgroundColor: `${alpha(theme.palette.primary.main, 0.15)}`,
      },
    },
    '&.MuiSlider-thumb.Mui-focusVisible, &.MuiSlider-thumb:hover, &.MuiSlider-active': {
      boxShadow: `none`,
    }
  },
  valueLabel: {
    left: 'auto',
    top: ({ size } : Pick<IProps, 'size'>) => size === 'small' ? -35 : -50,
    '& *': {
      background: 'transparent',
      color: theme.palette.primary.main,
      fontWeight: 700,
      fontSize: ({ size } : Pick<IProps, 'size'>) => size === 'small' ? 16 : 22,
    },
  },
  track: {
    height: 2,
  },
  rail: {
    height: 2,
    opacity: 0.5,
    color: theme.palette.grey[500],
  },
  mark: {
    height: 8,
    width: 1,
    marginTop: -3,
  },
  markActive: {
    opacity: 1,
    backgroundColor: 'currentColor',
  },
}));

interface IProps {
  min: number,
  max: number,
  marks: boolean | Mark[],
  value: number[],
  setValue: (a: number[]) => void,
  valueLabelDisplay?: 'on' | 'auto' | 'off';
  size?: 'small' | 'medium';
}

const defaultProps = {
  valueLabelDisplay: 'on',
  size: 'medium',
};

export default function RangeSlider(props: IProps & typeof defaultProps) {
  const { min, max, value, setValue, valueLabelDisplay, size } = props;
  const classes = useStylesRangeSlider({ size});
  const [innerValue, setInnerValue] = useState<number[]>(value)
  const cookie = new Cookie();

  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  const handleChange = (event: any, newValue: number | number[]) => {
    setInnerValue(newValue as number[]);
  };

  const handleChangeCommited = (event: any, newValue: number | number[]) => {
    setValue(newValue as number[]);
    cookie.set('timelineRange', newValue, {
      secure: true,
      sameSite: 'strict'
    });
  };

  return (
    <Slider
      classes={classes}
      value={innerValue}
      onChange={handleChange}
      onChangeCommitted={handleChangeCommited}
      min={min}
      max={max}
      valueLabelDisplay={valueLabelDisplay}
    />
  );
}

