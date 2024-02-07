import React from 'react';
import {ModalDefault} from './ModalDefault';
import styled from 'styled-components/native';
import assets from '../services/imagesExports';
import {Dimensions} from 'react-native';
import {FontsDefault} from '../styles/fonts';

interface ModalPrintProps {
  visible: boolean;
  change: () => void;
}

const ModalPrint: React.FC<ModalPrintProps> = ({visible, change}) => {
  return (
    <ModalDefault
      visible={visible}
      change={change}
      children={
        <Container>
          <Ilustration
            resizeMode={
              Dimensions.get('screen').width < 520 ? 'contain' : 'center'
            }
            source={assets.ilustraPrint}
          />
          <Content>
            <Text>Imprimindo Etiqueta</Text>
          </Content>
        </Container>
      }
    />
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.cardBackGround};
  border-radius: 20px;
  align-items: center;
  padding: 26px;

  ${Dimensions.get('screen').width > 520 &&
  `
 margin: 50px 180px;
    padding: 46px;
  `};
`;

const Content = styled.View`
  align-items: center;
  margin-top: auto;
  margin-bottom: 16px;
`;

const Ilustration = styled.Image`
  position: absolute;
  top: ${Dimensions.get('screen').width < 520 ? '70px' : '-45px'};
  ${Dimensions.get('screen').width < 520 &&
  `
    width: 300px;
  height: 300px;
  `}
`;

const Text = styled.Text`
  font-size: ${Dimensions.get('screen').width < 520
    ? FontsDefault.large
    : '32px'};
  font-weight: bold;
  text-transform: uppercase;
  color: ${({theme}) => theme.color};
  font-family: ${({theme}) => theme.fontPrimary};
  margin: 36px 0;
`;

export {ModalPrint};
