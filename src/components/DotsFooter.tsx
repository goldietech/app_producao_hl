import React from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';

// import { Container } from './styles';

const Dots: React.FC = () => {
  return <Container></Container>;
};

export const Container = styled.View`
  height: 22px;
  width: 22px;
  border-radius: 20px;
  background-color: ${({theme}) => theme.background};
  margin: 0 5px;
`;

export {Dots};
