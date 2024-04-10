import React from 'react';
import styled from 'styled-components/native';
import {FontsDefault} from '../styles/fonts';

interface ButtonDefaultProps {
  text: string;
  disabled?: boolean;
  onPress: () => void;
  styleB: any;
  styleT: any;
}

const ButtonDefault: React.FC<ButtonDefaultProps> = ({
  text,
  disabled,
  onPress,
  styleB,
  styleT,
}) => {
  return (
    <Container
      disabled={disabled}
      style={styleB ? styleB : {}}
      onPress={onPress}>
      <BtnText style={styleT ? styleT : {}}>{text}</BtnText>
    </Container>
  );
};

const Container = styled.TouchableOpacity`
  opacity: ${props => (props.disabled ? 0.5 : 1)};
  width: 100%;
  height: 60px;
  border-radius: 33px;
  background-color: ${({theme}) => theme.primary};
  justify-content: center;
  align-items: center;
`;

const BtnText = styled.Text`
  font-size: ${FontsDefault.large};
  color: ${({theme}) => theme.white};
  font-family: ${({theme}) => theme.fontPrimary};
  text-transform: uppercase;
`;

export {ButtonDefault};
