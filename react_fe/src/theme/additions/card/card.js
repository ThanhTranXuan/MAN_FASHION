import { mode } from '@chakra-ui/theme-tools';
const Card = {
  baseStyle: (props) => ({
    p: { base: '16px', md: '20px' },
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    position: 'relative',
    borderRadius: '16px',
    minWidth: '0px',
    wordWrap: 'break-word',
    bg: mode('#ffffff', 'navy.800')(props),
    boxShadow: mode(
      '0 8px 24px rgba(15, 23, 42, 0.06)',
      'unset',
    )(props),
    backgroundClip: 'border-box',
  }),
};

export const CardComponent = {
  components: {
    Card,
  },
};
