import React from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';
import {FontsDefault} from '../styles/fonts';

interface ButtonWithBorderProps {
  text: string;
  onPress: () => void;
}

const ButtonWithBorder: React.FC<ButtonWithBorderProps> = ({text, onPress}) => {
  return (
    <Container onPress={onPress}>
      <BtnText>{text}</BtnText>
    </Container>
  );
};

const Container = styled.TouchableOpacity`
  width: 100%;
  height: 60px;
  border-radius: 33px;
  background-color: ${({theme}) =>
    theme.cardBackGround == '#fff' ? theme.background : theme.cardBackGround};
  justify-content: center;
  align-items: center;
  border: 1px solid ${({theme}) => theme.gray};
`;

const BtnText = styled.Text`
  font-size: ${FontsDefault.large};
  color: ${({theme}) => theme.gray};
  font-family: ${({theme}) => theme.fontPrimary};
  text-transform: uppercase;
`;

export {ButtonWithBorder};
