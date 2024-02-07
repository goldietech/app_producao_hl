import React from 'react';
import {Dimensions} from 'react-native';
import styled from 'styled-components/native';
import assets from '../services/imagesExports';
// import { Container } from './styles';

const BackGroundComponent: React.FC = ({children}) => {
  return (
    <Container>
      <ImageTop resizeMode="cover" source={assets.topo} />
      <ImageCenter resizeMode="contain" source={assets.meio} />
      {children}
      <ImageFooter resizeMode="contain" source={assets.footer} />
    </Container>
  );
};

export const Container = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.background};
  position: relative;
`;

export const ImageTop = styled.Image`
  width: 100%;
  position: absolute;
  top: 0px;
`;

export const ImageCenter = styled.Image`
  width: 100%;
  position: absolute;
  top: 30%;
`;

export const ImageFooter = styled.Image`
  position: absolute;
  bottom: -10px;
  left: 0px;
  z-index: -1000;
`;

export {BackGroundComponent};
