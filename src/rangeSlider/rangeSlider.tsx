import React, { useEffect, useState } from 'react';
import { Slider, SliderProps } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import Cookie from 'universal-cookie';

interface StyleProps {
  size: 'small' | 'medium';
}

const useStylesRangeSlider = styled(({ size, ...props }: SliderProps & StyleProps) => <Slider {...props} />)(
  ({ theme, size }) => ({
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
      },
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
  })
);

interface IProps extends SliderProps {
  min: number;
  max: number;
  minSelectable?: number;
  maxSelectable?: number;
  marks: boolean | SliderProps['marks'];
  value: number[];
  setValue: (a: number[]) => void;
  valueLabelDisplay?: 'on' | 'auto' | 'off';
  size?: 'small' | 'medium';
}

const defaultProps = {
  valueLabelDisplay: 'on',
  size: 'medium',
};

export default function RangeSlider(props: IProps & typeof defaultProps) {
  const {
    value,
    setValue,
    min,
    max,
    minSelectable = min,
    maxSelectable = max,
    valueLabelDisplay,
    size,
  } = props;
  const realValue = [Math.max(minSelectable, value[0]), Math.min(maxSelectable, value[1])];
  const StyledSlider = useStylesRangeSlider;
  const [innerValue, setInnerValue] = useState<number[]>(realValue);
  const cookie = new Cookie();

  useEffect(() => {
    const valueToSet = [Math.max(minSelectable, value[0]), Math.min(maxSelectable, value[1])];
    setInnerValue(valueToSet);
    if (valueToSet[0] !== value[0] || valueToSet[1] !== value[1]) {
      setValue(valueToSet);
    }
  }, [value]);

  const handleChange = (event: any, newValue: number | number[]) => {
    const valueToSet = [Math.max(minSelectable, newValue[0]), Math.min(maxSelectable, newValue[1])];
    setInnerValue(valueToSet);
  };

  const handleChangeCommited = (event: any, newValue: number | number[]) => {
    const valueToSet = [Math.max(minSelectable, newValue[0]), Math.min(maxSelectable, newValue[1])];
    setValue(valueToSet);
    cookie.set('timelineRange', valueToSet, {
      secure: true,
      sameSite: 'strict',
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
