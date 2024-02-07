import React from 'react';
import styled from 'styled-components/native';
import {ImageSourcePropType, Dimensions} from 'react-native';
import {FontsDefault} from '../styles/fonts';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

interface CardSelectionProps {
  onClick: () => void;
  link: ImageSourcePropType;
  title: string;
}

const CardSelectionWithIlustration: React.FC<CardSelectionProps> = ({
  onClick,
  link,
  title,
}) => {
  return (
    <Container style={{elevation: 2}} onPress={onClick}>
      <ImageIlustration resizeMode="contain" source={link} />
      <Title>{title}</Title>
    </Container>
  );
};

const Container = styled.TouchableOpacity`
  background-color: ${({theme}) => theme.primary};
  box-shadow: 2px 2px 2px #dedede;
  border-radius: 25px;
  margin: ${Dimensions.get('screen').width > 520 ? '0px 10px' : '10px'};
  width: ${Dimensions.get('screen').width > 520
    ? `${wp(100) / 3.4}px`
    : `${wp(100) / 1.1}px`};
  height: ${wp(100) / 2.5}px;
  padding: ${Dimensions.get('screen').width > 520 ? '26px' : '6px'};
`;

const ImageIlustration = styled.Image`
  align-self: center;
  height: ${wp(20)}px;
  width: ${wp(20)}px;
  margin-bottom: 10px;
`;
const Title = styled.Text`
  font-size: ${Dimensions.get('screen').width > 520
    ? `32px`
    : `${FontsDefault.medium}`};
  color: ${({theme}) => theme.white};
  font-family: ${({theme}) => theme.fontPrimary};
  text-align: center;
`;

export {CardSelectionWithIlustration};
