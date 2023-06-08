import React, { useEffect, useState } from 'react';
import { Slider, SliderProps } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import Cookie from 'universal-cookie';

interface StyleProps {
  size: 'small' | 'medium';
}

const useStylesRangeSlider = styled(({ size, ...props }: SliderProps & StyleProps) => <Slider {...props} />)(({ theme, size }) => ({
  color: theme.palette.primary.main,
  height: 2,
  padding: '15px 0',
  '& .MuiSlider-thumb': {
    height: size === 'small' ? 12 : 16,
    width: size === 'small' ? 12 : 16,
    backgroundColor: theme.palette.primary.main,
    boxShadow: 'none',
    '&::after': {
      content: '""',
      position: 'absolute',
      width: size === 'small' ? 44 : 64,
      height: size === 'small' ? 44 : 64,
      borderRadius: '50%',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: alpha(theme.palette.primary.main, 0.3),
      transition: 'background-color 0.3s ease',
    },
    '&:hover': {
      '&::after': {
        backgroundColor: alpha(theme.palette.primary.main, 0.15),
      },
    },
    '&.Mui-focusVisible, &:hover, &.Mui-active': {
      boxShadow: 'none',
    }
  },
  '& .MuiSlider-valueLabel': {
    left: 'auto',
    top: size === 'small' ? -15 : -25,
    background: 'transparent',
    '& *': {
      background: 'transparent',
      color: theme.palette.primary.main,
      fontWeight: 700,
      fontSize: size === 'small' ? 16 : 22,
    },
  },
  '& .MuiSlider-track': {
    height: 2,
  },
  '& .MuiSlider-rail': {
    height: 2,
    opacity: 0.5,
    color: theme.palette.grey[500],
  },
  '& .MuiSlider-mark': {
    height: 8,
    width: 1,
    marginTop: -3,
  },
  '& .MuiSlider-markActive': {
    opacity: 1,
    backgroundColor: 'currentColor',
  },
}));

interface IProps extends SliderProps {
  min: number,
  max: number,
  marks: boolean | SliderProps['marks'],
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
  const StyledSlider = useStylesRangeSlider;
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
    <StyledSlider
      size={size}
      value={innerValue}
      onChange={handleChange}
      onChangeCommitted={handleChangeCommited}
      min={min}
      max={max}
      valueLabelDisplay={valueLabelDisplay}
    />
  );
}
