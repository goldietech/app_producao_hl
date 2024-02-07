import React, {useState, useRef} from 'react';
import {View, Dimensions, ActivityIndicator} from 'react-native';
import {ModalDefault} from './ModalDefault';
import styled from 'styled-components/native';
import {ButtonDefault} from './ButtonDefault';
import {ButtonWithBorder} from './ButtonWithBorder';
import assets from '../services/imagesExports';
import {FontsDefault} from '../styles/fonts';

interface ModalConferenceTabletProps {
  visible: boolean;
  text: string;
  change: () => void;
  confirm: () => void;
  loading: boolean;
}

const ModalInitProcess: React.FC<ModalConferenceTabletProps> = ({
  visible,
  change,
  confirm,
  text,
  loading,
}) => {
  return (
    <ModalDefault
      visible={visible}
      change={change}
      children={
        <Container>
          <Ilustration resizeMode="contain" source={assets.ilustraProduction} />
          <Content>
            <Text>{text}</Text>
            {!loading ? (
              <RowBtns>
                <BtnWrapper>
                  <ButtonWithBorder text="Não" onPress={() => change(false)} />
                </BtnWrapper>

                <BtnWrapper>
                  <ButtonDefault text="Sim" onPress={() => confirm()} />
                </BtnWrapper>
              </RowBtns>
            ) : (
              <ModalIndicator />
            )}
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
  ${Dimensions.get('screen').width < 520 && `text-align: center`};
`;

const RowBtns = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const BtnWrapper = styled.View`
  width: ${Dimensions.get('screen').width < 520 ? '50%' : '30%'};
  margin: 0 16px;
`;

const ModalIndicator = styled(ActivityIndicator).attrs((props) => ({
  color: props.theme.primary,
  size: 30,
}))`
  align-self: center;
`;

export {ModalInitProcess};
