import React, {useState, useRef, useEffect} from 'react';
import {View, Dimensions, ActivityIndicator} from 'react-native';
import {ModalDefault} from './ModalDefault';
import styled from 'styled-components/native';
import {FontsDefault} from '../styles/fonts';
import {ButtonDefault} from './ButtonDefault';
import {ButtonWithBorder} from './ButtonWithBorder';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faWeightHanging} from '@fortawesome/free-solid-svg-icons';
import assets from '../services/imagesExports';
const Sound = require('react-native-sound');

interface ModalBoxFloorProps {
  loading: boolean;
  visible: boolean;
  weightActual: number;
  weightTarget: number;
  unitWeight: number;
  balanceWeight: number;
  max: number;
  min: number;
  confirm: () => void;
  change: () => void;
}

const ModalBoxFloor: React.FC<ModalBoxFloorProps> = ({
  weightActual,
  weightTarget,
  balanceWeight,
  unitWeight,
  max,
  min,
  loading,
  visible,
  confirm,
  change,
}) => {
  useEffect(() => {
    if (visible) {
      Sound.setCategory('Playback');
      let whoosh = new Sound('assobio.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.log('failed to load the sound', error);
          return;
        }
        whoosh.play((success) => {
          if (success) {
            console.log('successfully finished playing');
          } else {
            console.log('playback failed due to audio decoding errors');
          }
        });
      });
    }
  }, [visible]);

  return (
    <ModalDefault
      visible={visible}
      change={change}
      children={
        <Container>
          <IlustrationWrapper>
            <Ilustration
              resizeMode="contain"
              source={{
                uri:
                  'https://files.itgoldie.com.br//hlplast/images/logo_dark.png',
              }}
            />
          </IlustrationWrapper>
          <Content>
            <Text>Andar Preenchido!</Text>
            <Text>Peso alvo: {weightTarget}</Text>
            <Text>Peso atingido: {Number(weightActual).toFixed(3)}</Text>

            {!(weightActual >= min && weightActual <= max) && (
              <View>
                {Number(weightActual) > max ? (
                  <Text>
                    Peso em excesso{' '}
                    {Number(
                      Number(weightActual) - Number(weightTarget),
                    ).toFixed(3)}
                  </Text>
                ) : (
                  <Text>
                    Peso faltante{' '}
                    {Number(
                      Number(weightTarget) - Number(weightActual),
                    ).toFixed(3)}
                  </Text>
                )}

                {Number(weightActual) > max ? (
                  <Text>
                    Retirar:{' '}
                    {(
                      (Number(weightActual) - Number(weightTarget)) /
                      unitWeight
                    ).toFixed(1)}{' '}
                    und(s)
                  </Text>
                ) : (
                  <Text>
                    Colocar:{' '}
                    {(
                      (Number(weightTarget) - Number(weightActual)) /
                      unitWeight
                    ).toFixed(1)}{' '}
                    und(s)
                  </Text>
                )}
              </View>
            )}

            <RowBtns>
              <BtnWrapper>
                {loading ? (
                  <ModalIndicator />
                ) : (
                  <ButtonDefault
                    disabled={!(weightActual >= min && weightActual <= max)}
                    text="Continuar"
                    onPress={() => confirm()}
                  />
                )}
              </BtnWrapper>
            </RowBtns>
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

const IlustrationWrapper = styled.View`
  height: 220px;
  width: 300px;

  justify-content: center;
  align-items: center;
  background-color: ${({theme}) => theme.cardBackGround};
  padding: 2px;
`;

const Ilustration = styled.Image`
  height: 220px;
  width: 300px;
`;

const Text = styled.Text`
  font-size: ${Dimensions.get('screen').width < 520
    ? FontsDefault.large
    : '24px'};
  font-weight: bold;
  text-transform: uppercase;
  color: ${({theme}) => theme.color};
  font-family: ${({theme}) => theme.fontPrimary};
  margin-bottom: 10px;
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

export {ModalBoxFloor};
