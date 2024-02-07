import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

type FontsProps = {
  small: string;
  medium: string;
  large: string;
};

const FontsDefault: FontsProps = {
  small: `14px`,
  medium: `16px`,
  large: `21px`,
};

export {FontsDefault};
