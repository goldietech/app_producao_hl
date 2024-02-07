import React, {useState, useRef, useEffect} from 'react';
import {View, Dimensions, ActivityIndicator} from 'react-native';
import {ModalDefault} from './ModalDefault';
import styled from 'styled-components/native';
import {FontsDefault} from '../styles/fonts';
import {ButtonDefault} from './ButtonDefault';
const Sound = require('react-native-sound');

interface ModalBoxFinishedProps {
  visible: boolean;
  loading: boolean;
  change: (visible?: boolean) => void;
  cancel: () => void;
  confirm: () => void;
  finalWeight: number;
  weightToCompare: number;
  unitWeight: number;
  weightActual: number;
  max: number;
  min: number;
}

const ModalBoxFinished: React.FC<ModalBoxFinishedProps> = ({
  visible,
  loading,
  change,
  cancel,
  confirm,
  finalWeight,
  weightToCompare,
  unitWeight,
  weightActual,
  max,
  min,
}) => {
  useEffect(() => {
    if (visible) {
      Sound.setCategory('Playback');
      let whoosh = new Sound('active_sound.mp3', Sound.MAIN_BUNDLE, (error) => {
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

  const compareWeight = (weight) => {
    let sum = Number(Number(weightToCompare) + Number(unitWeight)).toFixed(3);

    if (weight >= Number(sum)) {
      return true;
    } else {
      return false;
    }
  };
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

          <View style={{alignItems: 'center'}}>
            <Text>Caixa pronta?</Text>
            <WeightActive active={weightActual >= min && weightActual <= max}>
              <WeightActiveText>{weightActual.toFixed(3)} Kg</WeightActiveText>
            </WeightActive>

            {!(weightActual >= min && weightActual <= max) && (
              <View>
                {Number(weightActual) > max ? (
                  <Text>
                    Peso em excesso{' '}
                    {Number(
                      Number(weightActual) - Number(weightToCompare),
                    ).toFixed(3)}
                  </Text>
                ) : (
                  <Text>
                    Peso faltante{' '}
                    {Number(
                      Number(weightToCompare) - Number(weightActual),
                    ).toFixed(3)}
                  </Text>
                )}

                {Number(weightActual) > max ? (
                  <Text>
                    Retirar:{' '}
                    {(
                      (Number(weightActual) - Number(weightToCompare)) /
                      unitWeight
                    ).toFixed(1)}{' '}
                    und(s)
                  </Text>
                ) : (
                  <Text>
                    Colocar:{' '}
                    {(
                      (Number(weightToCompare) - Number(weightActual)) /
                      unitWeight
                    ).toFixed(1)}{' '}
                    und(s)
                  </Text>
                )}
              </View>
            )}
          </View>

          <BtnWrapper
            style={{marginTop: compareWeight(finalWeight) ? 'auto' : 10}}>
            {loading ? (
              <ModalIndicator />
            ) : (
              <ButtonDefault
                disabled={!(weightActual >= min && weightActual <= max)}
                text="Confirmar"
                onPress={() => confirm()}
              />
            )}
          </BtnWrapper>
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
  margin-bottom: 16px;
`;

const IlustrationWrapper = styled.View`
  width: 300px;
  justify-content: center;
  align-items: center;
  background-color: ${({theme}) => theme.cardBackGround};
  padding: 2px;
`;

const Ilustration = styled.Image`
  width: 100%;
  height: 80px;
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

const WeightActive = styled.View<{active: boolean}>`
  padding: 10px;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  background-color: ${({theme, active}) => (active ? theme.green : theme.red)};
`;

const WeightActiveText = styled.Text`
  font-size: ${Dimensions.get('screen').width < 520
    ? FontsDefault.large
    : '32px'};
  font-weight: bold;
  text-transform: uppercase;
  color: ${({theme}) => theme.white};
`;

const RowBtns = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const BtnWrapper = styled.View`
  width: ${Dimensions.get('screen').width < 520 ? '50%' : '30%'};
`;

const ModalIndicator = styled(ActivityIndicator).attrs((props) => ({
  color: props.theme.primary,
  size: 30,
}))`
  align-self: center;
`;
export {ModalBoxFinished};
